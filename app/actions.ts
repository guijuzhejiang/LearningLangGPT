'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {kv} from '@vercel/kv'
import {z} from "zod";
import {auth} from '@/auth'
import {type Chat} from '@/lib/types'
import {PromptTemplate} from "@langchain/core/prompts";
import Groq from "groq-sdk";
import {ChatGroq} from "@langchain/groq";
import {loadSummarizationChain} from "langchain/chains";
import {Document} from "@langchain/core/documents";
import {createTranslator} from "@/lib/chat/actions"
import {createStreamableValue} from "ai/rsc";
import {isChinese, reloadGroqProxy, runAsyncFnWithoutBlocking, toHalfWidth} from "@/lib/utils";
import JSON5 from 'json5'
import moji from 'moji'


const {HttpsProxyAgent} = process.env.GROQ_PROXY ? require('https-proxy-agent') : "";

const langchainTools = {translator: null, prompter: {}, chatSummarizer: {"English":null,"Français":null,"Deutsch":null}};

const groqClient = process.env.GROQ_PROXY ? new Groq({httpAgent: new HttpsProxyAgent(process.env.GROQ_PROXY),}) : new Groq();
const model = new ChatGroq({
    modelName: "llama3-70b-8192",
    apiKey: process.env.GROQ_API_KEY,
    streaming: true,
    temperature: 0.8,
});
model.client = groqClient;

const fallbacksModels = Array.from(process.env.GROQ_API_KEY_ALTERNATIVE.split(',').map((v, i) => {
    let tmpModel = new ChatGroq({
        modelName: "llama3-70b-8192",
        apiKey: v,
        streaming: true,
        temperature: 0.8,
    });
    tmpModel.client = groqClient;
    return tmpModel;
}));


export async function getChats(userId?: string | null) {
    if (!userId) {
        return []
    }

    try {
        const pipeline = kv.pipeline()
        const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
            rev: true
        })

        for (const chat of chats) {
            pipeline.hgetall(chat)
        }

        const results = await pipeline.exec()

        return results as Chat[]
    } catch (error) {
        return []
    }
}

export async function getChat(id: string, userId: string) {
    const chat = await kv.hgetall<Chat>(`chat:${id}`)
    // console.log("$$$$$$$$$$$$$getChat")
    // console.log(chat)
    if (!chat || (userId && chat.userId !== userId)) {
        return null
    }

    return chat
}

export async function removeChat({id, path}: { id: string; path: string }) {
    const session = await auth()

    if (!session) {
        return {
            error: 'Unauthorized'
        }
    }

    //Convert uid to string for consistent comparison with session.user.id
    const uid = String(await kv.hget(`chat:${id}`, 'userId'))

    if (uid !== session?.user?.id) {
        return {
            error: 'Unauthorized'
        }
    }

    await kv.del(`chat:${id}`)
    await kv.del(`summary:${id}`)
    await kv.del(`count:${id}`)
    await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

    revalidatePath('/')
    return revalidatePath(path)
}

export async function clearChats() {
    const session = await auth()


    if (!session?.user?.id) {
        return {
            error: 'Unauthorized'
        }
    }

    const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
    // console.log(chats);
    if (!chats.length) {
        return redirect('/')
    }
    const pipeline = kv.pipeline()

    for (const chat of chats) {
        pipeline.del(chat)
        pipeline.del(chat.replace('chat', 'summary'))
        pipeline.del(chat.replace('chat', 'count'))
        pipeline.zrem(`user:chat:${session.user.id}`, chat)
    }

    await pipeline.exec()

    revalidatePath('/')
    return redirect('/')
}

export async function getSharedChat(id: string) {
    const chat = await kv.hgetall<Chat>(`chat:${id}`)

    if (!chat || !chat.sharePath) {
        return null
    }

    return chat
}

export async function shareChat(id: string) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: 'Unauthorized'
        }
    }

    const chat = await kv.hgetall<Chat>(`chat:${id}`)

    if (!chat || chat.userId !== session.user.id) {
        return {
            error: 'Something went wrong'
        }
    }

    const payload = {
        ...chat,
        sharePath: `/share/${chat.id}`
    }

    await kv.hmset(`chat:${chat.id}`, payload)

    return payload
}

export async function saveChat(chat: Chat) {
    const session = await auth()
    // console.log("$$sssssssssssssssssssssssschat")
    // console.log(chat)
    if (session && session.user) {
        const pipeline = kv.pipeline()
        pipeline.hmset(`chat:${chat.id}`, chat)
        pipeline.zadd(`user:chat:${chat.userId}`, {
            score: Date.now(),
            member: `chat:${chat.id}`
        })
        await pipeline.exec()
    } else {
        return
    }
}

export async function refreshHistory(path: string) {
    redirect(path)
}

export async function getMissingKeys() {
    const keysRequired = ['GROQ_API_KEY']
    return keysRequired
        .map(key => (process.env[key] ? '' : key))
        .filter(key => key !== '')
}

type Summary = {
    vocab: { word: string, explanation: string, phonogram: string, category: string, sentence: string },
    summary: { content: string, strengths: string[], weaknesses: string[] },
    evaluation: string,
    score: string,
    chatLength: number | string
}

export async function saveScore(summary: Summary, chat: Chat) {
    const session = await auth()
    if (session && session.user) {
        summary['chatLength'] = chat.messages.length;
        const pipeline = kv.pipeline();
        pipeline.hmset(`summary:${chat.id}`, summary)
        await pipeline.exec()
    }
}

export async function saveCountDown(chatId: string, count: number) {
    // console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
    // console.log(count)
    const session = await auth()
    if (session && session.user) {
        const pipeline = kv.pipeline();
        pipeline.set(`count:${chatId}`, count)
        await pipeline.exec()
    }
}

export async function getCountDown(chatId: string|undefined|null) {
    if (chatId) {
        const a = await kv.get<number>(`count:${chatId}`);
        // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        // console.log(a)
        return await kv.get<number>(`count:${chatId}`);
    } else {
        return null;
    }
}

const summarySchema = z.object({
    vocab: z.array(
        z.object(
            {
                word: z.string(),
                explanation: z.string(),
                phonogram: z.string(),
                category: z.string(),
                sentence: z.string()
            }
        )
    ),
    summary: z.object(
        {content: z.string(), strengths: z.array(z.string()), weaknesses: z.array(z.string())}
    ),
    evaluation: z.string(),
    score: z.string()
});

const summarizer = {
    "English": `
        You are an experienced English teacher, good at summarizing and happy to motivate students.
        Use Simplified Chinese to refine key words for this conversation exercise and explain them, show phonetic symbols, show word properties, and make sentences. Review the process of this conversation exercise and give me a general summary of my learning, praising what I did well, suggesting what I didn't do well, and giving me a score. Give me an English level rating based on the content of my answers.
        Please synthesize the above information and the response you give needs to contain the following four fields:
        1.vocab: Refine key words for this conversation exercise and explain them, show phonetic symbols, show word properties, and make example sentences with the word.
        2.summary: In response to this conversation, summarize and conclude, praising what I did well and suggesting what I didn't do. Chinese is used here.
        3.evaluation: Please evaluate my English level according to the following criteria, Chinese is used here.
            (1).Content integrity：Evaluate whether my answer is comprehensive and relevant.
            (2).Sentence Complexity: assess the complexity of the sentence structures I use, including subordinate clauses and diverse sentence types.
            (3).Vocabulary Use: Consider the range and complexity of vocabulary I use, including idiomatic expressions and the use of advanced terminology.
            (4).Grammar and Syntax: review the correctness and complexity of the grammatical structures I use.
            (5).Coherence and Coherence: assess the logical flow and coherence of my responses, including the use of transitional phrases and cohesive devices.
        4.score: This exercise will be graded according to the ABCDF.
        Please answer in the following JSON format:
        {{
        "vocab":[
        {{"word":"word1","explanation":“Explanation of Word 1 in Chinese”, "phonogram":"Phonetic symbols for word 1", "category": "Lexical properties of word 1", "sentence":"Word 1 Sentence Examples"}}}},
        {{"word":"word2","explanation":“Explanation of Word 2 in Chinese”, "phonogram":"Phonetic symbols for word 2", "category": "Lexical properties of word 2", "sentence":"Word 2 Sentence Examples"}}}}
        ],
        "summary":{{"content":"General summary of the study","strengths":["What's working well1","What's working well2"],"weaknesses":["Deficiencies 1","Deficiencies 2"]}},
        “evaluation”:"The evaluation referred to above",
        "score":"Grading of this exercise"
        }}
        Finally, I would like to emphasize: your reply will be directly used in javascript's JSON.parse parsing, so be sure to answer in standard JSON format, don't include any other non-JSON content, and don't include line breaks.
        Respond only the valid JSON string without any Chinese symbols, such as Chinese quotation marks.
        Write a concise summary of the following conversation:
    "{text}"
    CONCISE SUMMARY:
    `,
    "Français":`
        Vous êtes professeur de français, doué pour les résumés et heureux de motiver les étudiants.
        Utilisez le chinois simplifié pour affiner les mots clés de cet exercice de conversation et expliquez-les, montrez les symboles phonétiques, montrez les propriétés des mots et faites des phrases. Passez en revue le processus de cet exercice de conversation et faites-moi un résumé général de mon apprentissage, en louant ce que j'ai bien fait, en suggérant ce que je n'ai pas bien fait et en me donnant une note. Attribuez-moi une note de niveau de français en fonction du contenu de mes réponses.
        Veuillez synthétiser les informations ci-dessus et la réponse que vous donnez doit contenir les quatre champs suivants :
        1.vocabulaire : Affinez les mots clés de cet exercice de conversation et expliquez-les, montrez les symboles phonétiques, montrez les propriétés du mot et faites des phrases d'exemple avec le mot.
        2.résumé : En réponse à cette conversation, résumez et concluez, en louant ce que j'ai bien fait et en suggérant ce que je n'ai pas fait. Le chinois est utilisé ici.
        3.évaluation : Veuillez évaluer mon niveau de français selon les critères suivants, le chinois est utilisé ici.
            (1).Intégrité du contenu：Evaluez si ma réponse est complète et pertinente.
            (2).Complexité de la phrase:évaluez la complexité des structures de phrases que j'utilise, y compris les clauses subordonnées et les divers types de phrases.
            (3).Utilisation du vocabulaire:Évaluer l'étendue et la complexité du vocabulaire que j'utilise, y compris les expressions idiomatiques et l'utilisation d'une terminologie avancée.
            (4).Grammaire et syntaxe:examinez l'exactitude et la complexité des structures grammaticales que j'utilise.
            (5).Cohérence et cohésion:évaluer le flux logique et la cohérence de mes réponses, y compris l'utilisation de phrases de transition et de dispositifs de cohésion.
        4.note : Cet exercice sera noté selon l'ABCDF.
        Veuillez répondre dans le format JSON suivant:
        {{
        "vocab":[
        {{"word":"mot1","explanation":“Explication du mot 1 en chinois”, "phonogram":"Symboles phonétiques pour le mot 1", "category": "Propriétés lexicales du mot 1", "sentence":"Mots 1 Exemples de phrases"}}}},
        {{"word":"mot2","explanation":“Explication du mot 2 en chinois”, "phonogram":"Symboles phonétiques pour le mot 2", "category": "Propriétés lexicales du mot 2", "sentence":"Mots 2 Exemples de phrases"}}}}
        ],
        "summary":{{"content":"Résumé général de l'étude","strengths":["Ce qui fonctionne bien1","Ce qui fonctionne bien2"],"weaknesses":["Déficiences 1","Déficiences 2"]}},
        “evaluation”:"L'évaluation mentionnée ci-dessus",
        "score":"Notation de cet exercice"
        }}
        Enfin, j'aimerais insister sur le fait que votre réponse sera directement utilisée dans l'analyse JSON.parse de javascript. Veillez donc à répondre dans un format JSON standard, à ne pas inclure de contenu autre que JSON et à ne pas inclure de sauts de ligne.
        Répondre uniquement à la chaîne JSON valide sans aucun symbole chinois, comme les guillemets chinois.
        Rédigez un résumé concis de la conversation suivante:
    "{text}"
    RÉSUMÉ CONCIS :
    `,
    "Deutsch":`
        Sie sind ein Deutschlehrer, können gut zusammenfassen und motivieren gerne Schüler.
        Verwenden Sie vereinfachtes Chinesisch, um die Schlüsselwörter für diese Konversationsübung zu verfeinern, und erklären Sie sie, zeigen Sie phonetische Symbole, zeigen Sie Worteigenschaften und bilden Sie Sätze. Lassen Sie den Ablauf dieser Konversationsübung Revue passieren und geben Sie mir eine allgemeine Zusammenfassung meines Lernens, loben Sie, was ich gut gemacht habe, weisen Sie darauf hin, was ich nicht gut gemacht habe, und geben Sie mir eine Punktzahl. Geben Sie mir eine Bewertung der deutschen Sprache auf der Grundlage des Inhalts meiner Antworten.
        Bitte fassen Sie die oben genannten Informationen zusammen, und Ihre Antwort muss die folgenden vier Felder enthalten:
        1.Vokabeln: Nennen Sie die Schlüsselwörter für diese Konversationsübung und erklären Sie sie, zeigen Sie die phonetischen Symbole, zeigen Sie die Eigenschaften des Wortes und bilden Sie Beispielsätze mit dem Wort.
        2.Zusammenfassung: Fassen Sie das Gespräch zusammen, loben Sie, was ich gut gemacht habe, und sagen Sie, was ich nicht gemacht habe. Hier wird Chinesisch verwendet.
        3.Bewertung: Bitte bewerten Sie mein Deutschniveau nach den folgenden Kriterien, hier wird Chinesisch verwendet.
            (1).Inhaltliche Integrität：Bewerten Sie, ob meine Antwort umfassend und relevant ist.
            (2).Satzkomplexität: Beurteilen Sie die Komplexität der von mir verwendeten Satzstrukturen, einschließlich Nebensätze und verschiedene Satzarten.
            (3).Wortschatzgebrauch: Beurteilen Sie den Umfang und die Komplexität des von mir verwendeten Wortschatzes, einschließlich idiomatischer Ausdrücke und der Verwendung fortgeschrittener Terminologie.
            (4).Grammatik und Syntax: Überprüfen Sie die Korrektheit und Komplexität der von mir verwendeten grammatikalischen Strukturen.
            (5).Kohärenz und Zusammenhalt: Bewertung des logischen Flusses und der Kohärenz meiner Antworten, einschließlich der Verwendung von Übergangsphrasen und kohäsiven Elementen.
        4.Punktzahl: Diese Übung wird nach dem ABCDF benotet.
        Bitte antworten Sie im folgenden JSON-Format:
        {{
        "vocab":[
        {{"word":"Wort1","explanation":“Erläuterung von Wort 1 auf Chinesisch”, "phonogram":"Phonetische Zeichen für Wort 1", "category": "Lexikalische Eigenschaften von Wort 1", "sentence":"Wort 1 Satzbeispiele"}}}},
        {{"word":"Wort2","explanation":“Erläuterung von Wort 2 auf Chinesisch”, "phonogram":"Phonetische Zeichen für Wort 2", "category": "Lexikalische Eigenschaften von Wort 2", "sentence":"Wort 2 Satzbeispiele"}}}}
        ],
        "summary":{{"content":"Allgemeine Zusammenfassung der Studie","strengths":["Was gut funktioniert1","Was gut funktioniert2"],"weaknesses":["Unzulänglichkeiten 1","Unzulänglichkeiten 2"]}},
        “evaluation”:"Die oben erwähnte Bewertung",
        "score":"Benotung dieser Übung"
        }}
        Abschließend möchte ich noch betonen, dass Ihre Antwort direkt in das JSON.parse-Parsing von Javascript einfließt. Achten Sie also darauf, dass Sie im Standard-JSON-Format antworten, keine anderen Inhalte als JSON enthalten und keine Zeilenumbrüche einfügen.
        Beantworten Sie nur die gültige JSON-Zeichenfolge ohne chinesische Symbole, wie z. B. chinesische Anführungszeichen.
        Schreiben Sie eine knappe Zusammenfassung der folgenden Konversation:
    "{text}"
    KNAPPE ZUSAMMENFASSUNG:
    `
}

async function createSummarizerForScore(lang:string) {
    const prompt = new PromptTemplate({
        inputVariables: ['text'],
        template: summarizer[lang]
    });
    return loadSummarizationChain(model.withFallbacks(fallbacksModels), {
        type: 'map_reduce',
        combineMapPrompt: prompt,
        combinePrompt: prompt,
    });
}

export async function getScore(chat: Chat) {
    const summary = await kv.hgetall<Summary>(`summary:${chat.id}`)
    chat = await getChat(chat.id, chat.userId);
    // // console.log("get sum");
    console.log(summarizer[chat.chatParams.lang]);
    // // console.log(summary);
    if (!summary || summary.chatLength + '' !== chat.messages.length + '') {
        if (!langchainTools.chatSummarizer[chat.chatParams.lang]) {
            langchainTools.chatSummarizer[chat.chatParams.lang] = await createSummarizerForScore(chat.chatParams.lang);
        }
        // load chat history
        const docs = [];
        chat.messages.forEach(async function (value, index) {
            if (value.role === 'assistant') {
                docs.push(new Document({pageContent: `You:${value.content}`}))
            }
            if (value.role === 'user') {
                docs.push(new Document({pageContent: `Student:${value.content}`}))
            }
        });

        let res = null;
        const maxRetries = 3;
        let retries = 0;
        const proceed = async ()=>{
            try {
                res = await langchainTools.chatSummarizer[chat.chatParams.lang].invoke(
                    {input_documents: docs},
                );
            } catch (e) {
                retries++;
                if (retries < maxRetries) {
                    await reloadGroqProxy(model, fallbacksModels);
                    await proceed();
                }
            }
        }

        await proceed();

        console.log(res);
        res = res.text;
        let fixedMsg = res;

        const startIndex = res.indexOf('{');
        const endIndex = res.lastIndexOf('}');

        if (startIndex !== -1) {
            // 使用 slice 方法获取从 startIndex 开始到末尾的子字符串
            fixedMsg = res.slice(startIndex, endIndex+1);
        }

        // console.log(fixedMsg);
        try {
            fixedMsg = moji(fixedMsg).convert('ZE', 'HE').toString();
            fixedMsg = fixedMsg.replaceAll('\n', '')
        } catch (e) {
            console.error(e);
        }

        try {
            const jsonRes = JSON5.parse(fixedMsg);
            if(jsonRes.evaluation === 'object'){
                let evalStr = JSON.stringify(jsonRes.evaluation)
                const sIndex = res.indexOf('{');
                const eIndex = res.lastIndexOf('}');
                jsonRes.evaluation = evalStr.slice(sIndex-1, eIndex);
            }
            try {
                let needTransString = [];
                let needTransIndex = [];
                Object.keys(jsonRes).forEach((key) => {
                    // console.log(`${key}: ${jsonRes[key]}`);
                    if (key === 'vocab') {
                        jsonRes[key].forEach(function (value, index) {
                            if (!isChinese(value.explanation)) {
                                needTransString.push(value.explanation);
                                needTransIndex.push(`${key}-${index}`);
                            }
                        });
                    } else if (key === 'summary') {
                        if (!isChinese(jsonRes[key].content)) {
                            needTransString.push(jsonRes[key].content);
                            needTransIndex.push(`${key}-content`);
                        }
                        jsonRes[key].strengths.forEach(function (value, index) {
                            if (!isChinese(value)) {
                                needTransString.push(value);
                                needTransIndex.push(`${key}-strengths-${index}`);
                            }
                        });
                        jsonRes[key].weaknesses.forEach(function (value, index) {
                            if (!isChinese(value)) {
                                needTransString.push(value);
                                needTransIndex.push(`${key}-weaknesses-${index}`);
                            }
                        });
                    } else if (key === 'evaluation') {
                        if (!isChinese(jsonRes[key])) {
                            needTransString.push(jsonRes[key]);
                            needTransIndex.push(`${key}`);
                        }
                    } else if (key === 'score') {
                        if (!isChinese(jsonRes[key])) {
                            needTransString.push(jsonRes[key]);
                            needTransIndex.push(`${key}`);
                        }
                    }
                });
                const translatedStrings = (await syncTranslate(needTransString.join('|'))).split('|')

                translatedStrings.forEach(function (value, index) {
                    if (needTransIndex[index].includes("vocab")) {
                        const parts = needTransIndex[index].split('-');
                        jsonRes["vocab"][parts[1]]["explanation"] = value;

                    }else if (needTransIndex[index].includes("summary")) {
                        const parts = needTransIndex[index].split('-');
                        if (parts[1] === 'content') {
                            jsonRes["summary"]["content"] = value;
                        } else if (parts[1] === 'strengths') {
                            jsonRes["summary"]["strengths"][parts[2]] = value;
                        } else if (parts[1] === 'weaknesses') {
                            jsonRes["summary"]["weaknesses"][parts[2]] = value;
                        }

                    } else if (needTransIndex[index].includes("evaluation")) {
                        jsonRes["evaluation"] = value;

                    } else if (needTransIndex[index].includes("score")) {
                        jsonRes["score"] = value;

                    }
                });
            } catch (e) {
                console.error(e);
            }

            await saveScore(jsonRes, chat);
            return jsonRes;
        } catch (e) {
            console.error(e);
            return fixedMsg
        }
    } else {
        return summary;
    }

}


async function syncTranslate(content: string) {
    'use server'

    if (!langchainTools.translator) {
        langchainTools.translator = await createTranslator();
    }

    const maxRetries = 3;
    let retries = 0;
    let res = '';
    const proceed = async ()=>{
        res = await langchainTools.translator.invoke(
            {input: content},
        );
    }
    try {
        await proceed();
    } catch (e) {
        console.error(e);
        retries++;
        if (retries < maxRetries) {
            await reloadGroqProxy(model, fallbacksModels);
            await proceed();
        }
    } finally {
    }
    return res.content;
}



export async function getTranslate(content: string) {
    'use server'

    const textStream = createStreamableValue("");

    runAsyncFnWithoutBlocking(async () => {
        if (!langchainTools.translator) {
            langchainTools.translator = await createTranslator();
        }



        const maxRetries = 3;
        let retries = 0;
        const proceed = async ()=>{
            let buf = "";
            const res = await langchainTools.translator.invoke(
                {input: content},
                {
                    callbacks: [
                        {
                            handleLLMNewToken(token: any) {
                                // console.log(token);
                                if (token) {
                                    buf += token;
                                    textStream.update(token);
                                } else {
                                    // console.log('done11111 ' + token);
                                    // console.log(token);
                                }
                            },
                            handleLLMEnd(token: any) {
                                textStream.done();
                            },
                            // async handleLLMError(e:any) {
                            //     retries++;
                            //     if (retries < maxRetries) {
                            //         await reloadGroqProxy(model, fallbacksModels);
                            //         await proceed();
                            //     }
                            // },
                        },
                    ],
                }
            );
        }
        try {
            await proceed();
        } catch (e) {
            console.error(e);
            retries++;
            if (retries < maxRetries) {
                await reloadGroqProxy(model, fallbacksModels);
                await proceed();
            }
        } finally {
        }
    });

    return textStream.value
}

