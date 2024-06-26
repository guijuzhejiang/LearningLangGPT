'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {kv} from '@vercel/kv'
import {z} from "zod";
import {auth} from '@/auth'
import {type Chat, User} from '@/lib/types'
import {ChatPromptTemplate, PromptTemplate} from "@langchain/core/prompts";
import Groq from "groq-sdk";
import {ChatGroq} from "@langchain/groq";
import {ConversationChain, loadSummarizationChain} from "langchain/chains";
import {HttpsProxyAgent} from "https-proxy-agent";
import {Document} from "@langchain/core/documents";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {createTranslator} from "@/lib/chat/actions"
import {createStreamableValue} from "ai/rsc";
import {runAsyncFnWithoutBlocking, toHalfWidth} from "@/lib/utils";
import JSON5 from 'json5'
import moji from 'moji'
import * as console from "node:console";


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
    console.log(chats);
    if (!chats.length) {
        return redirect('/')
    }
    const pipeline = kv.pipeline()

    for (const chat of chats) {
        pipeline.del(chat)
        pipeline.del(chat.replace('chat', 'summary'))
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
    console.log("$$sssssssssssssssssssssssschat")
    console.log(chat)
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
    review: string,
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
    review: z.string(),
    summary: z.object(
        {content: z.string(), strengths: z.array(z.string()), weaknesses: z.array(z.string())}
    ),
    evaluation: z.string(),
    score: z.string()
});

export async function getScore(chat: Chat) {
    const summary = await kv.hgetall<Summary>(`summary:${chat.id}`)
    chat = await getChat(chat.id, chat.userId);
    // // console.log("get sum");
    // // console.log(chat);
    // // console.log(summary);
    if (!summary || summary.chatLength + '' !== chat.messages.length + '') {
        const groqClient = process.env.GROQ_PROXY ? new Groq({httpAgent: new HttpsProxyAgent(process.env.GROQ_PROXY),}) : new Groq();
        const model = new ChatGroq({
            modelName: "llama3-70b-8192",
            apiKey: process.env.GROQ_API_KEY,
            streaming: true,
            temperature: 0.8,
        });
        model.client = groqClient;

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

        // `
        // Please answer in the following JSON format：
        //     {{
        //     "vocab":[
        //     {{"word":"word1","explanation":“Explanation of Word 1 in Chinese”, "phonogram":"Phonetic symbols for word 1", "category": "Lexical properties of word 1", "sentence":"Word 1 Sentence Examples"}}}},
        //     {{"word":"word2","explanation":“Explanation of Word 2 in Chinese”, "phonogram":"Phonetic symbols for word 2", "category": "Lexical properties of word 2", "sentence":"Word 2 Sentence Examples"}}}}
        //     ],
        //     "review":"The review mentioned above",
        //     "summary":{{"content":"General summary of the study","strengths":["What's working well1","What's working well2"],"weaknesses":["Deficiencies 1","Deficiencies 2"]}},
        //     “evaluation”:"The evaluation referred to above",
        //     "score":"Grading of this exercise"
        //     }}
        //     Finally, I would like to emphasize: your reply will be directly used in javascript's JSON.parse parsing, so be sure to answer in standard JSON format, don't include any other non-JSON content, and don't include line breaks.
        //     Respond only in valid JSON without any Chinese symbols, such as Chinese quotation marks.
        // `
        const prompt = new PromptTemplate({
            inputVariables: ['text'],
            template: `
        You are an experienced teacher, friendly, good at summarizing and happy to motivate students. I will pay you a $100 tip if you give a very accurate summary.
        Use Simplified Chinese to refine key words for this conversation exercise and explain them, show phonetic symbols, show word properties, and make sentences. Review the process of this conversation exercise and give me a general summary of my learning, praising what I did well, suggesting what I didn't do well, and giving me a score. Give me an English level rating based on the content of my answers.
        Please synthesize the above information and the response you give needs to contain the following four fields:
        1.vocab: Refine key words for this conversation exercise and explain them, show phonetic symbols, show word properties, and make example sentences with the word.
        2.review: Review the chat of this conversation and make a concise summary. Chinese is used here.
        3.summary: In response to this conversation, summarize and conclude, praising what I did well and suggesting what I didn't do. Chinese is used here.
        4.evaluation: Please evaluate my English level according to the following criteria, Chinese is used here.
            (1).**Content integrity**：Evaluate whether my answer is comprehensive and relevant.
            (2).**Sentence Complexity**: assess the complexity of the sentence structures I use, including subordinate clauses and diverse sentence types.
            (3).**Vocabulary Use**: Consider the range and complexity of vocabulary I use, including idiomatic expressions and the use of advanced terminology.
            (4).**Grammar and Syntax**: review the correctness and complexity of the grammatical structures I use.
            (5).**Coherence and Coherence**: assess the logical flow and coherence of my responses, including the use of transitional phrases and cohesive devices.
        5.score: This exercise will be graded according to the ABCDF.
        Please answer in the following JSON format：
        {{
        "vocab":[
        {{"word":"word1","explanation":“Explanation of Word 1 in Chinese”, "phonogram":"Phonetic symbols for word 1", "category": "Lexical properties of word 1", "sentence":"Word 1 Sentence Examples"}}}},
        {{"word":"word2","explanation":“Explanation of Word 2 in Chinese”, "phonogram":"Phonetic symbols for word 2", "category": "Lexical properties of word 2", "sentence":"Word 2 Sentence Examples"}}}}
        ],
        "review":"The review mentioned above",
        "summary":{{"content":"General summary of the study","strengths":["What's working well1","What's working well2"],"weaknesses":["Deficiencies 1","Deficiencies 2"]}},
        “evaluation”:"The evaluation referred to above",
        "score":"Grading of this exercise"
        }}
        Finally, I would like to emphasize: your reply will be directly used in javascript's JSON.parse parsing, so be sure to answer in standard JSON format, don't include any other non-JSON content, and don't include line breaks.
        Respond only in valid JSON without any Chinese symbols, such as Chinese quotation marks.
        Write a concise summary of the following conversation:
    "{text}"
    CONCISE SUMMARY:
    `
        });
        const chain = loadSummarizationChain(model, {
            type: 'map_reduce',
            combineMapPrompt: prompt,
            combinePrompt: prompt,
        })
        // const prompt = ChatPromptTemplate.fromTemplate(
        //     `
        // You are an experienced teacher, friendly, good at summarizing and happy to motivate students. I will pay you a $100 tip if you give a very accurate summary.
        // Use Simplified Chinese to refine key words for this conversation exercise and explain them, show phonetic symbols, show word properties, and make sentences. Review the process of this conversation exercise and give me a general summary of my learning, praising what I did well, suggesting what I didn't do well, and giving me a score. Give me an English level rating based on the content of my answers.
        // Please synthesize the above information and the response you give needs to contain the following four fields:
        // 1.vocab: Refine key words for this conversation exercise and explain them, show phonetic symbols, show word properties, and make sentences. English is used here。
        // 2.review: Review the chat of this conversation and make a concise summary. Chinese is used here.
        // 3.summary: In response to this conversation, summarize and conclude, praising what I did well and suggesting what I didn't do. Chinese is used here.
        // 4.evaluation: Please evaluate my English level according to the following criteria, Chinese is used here.
        //     (1).**Content integrity**：Evaluate whether my answer is comprehensive and relevant.
        //     (2).**Sentence Complexity**: assess the complexity of the sentence structures I use, including subordinate clauses and diverse sentence types.
        //     (3).**Vocabulary Use**: Consider the range and complexity of vocabulary I use, including idiomatic expressions and the use of advanced terminology.
        //     (4).**Grammar and Syntax**: review the correctness and complexity of the grammatical structures I use.
        //     (5).**Coherence and Coherence**: assess the logical flow and coherence of my responses, including the use of transitional phrases and cohesive devices.
        // 5.score: This exercise will be graded according to the ABCDF.
        // {history}
        // Human:{input}
        // AI:`
        // );

        // const chain = new ConversationChain({llm: modelWithStructuredOutput, prompt: prompt,memory:memory});

        const res = (await chain.invoke({
            input_documents: docs
        })).text;
        console.log(res);

        //     const SYSTEM_PROMPT_TEMPLATE = `You are an expert extraction algorithm.
        // Only extract relevant information from the text.
        // If you do not know the value of an attribute asked to extract, you may omit the attribute's value.`;
        //
        //     const parsePrompt = ChatPromptTemplate.fromMessages([
        //         ["system", SYSTEM_PROMPT_TEMPLATE],
        //         // Please see the how-to about improving performance with
        //         // reference examples.
        //         // new MessagesPlaceholder("examples"),
        //         ["human", "{text}"]
        //     ]);
        //     const extractionRunnable = prompt.pipe(model.withStructuredOutput(summarySchema));
        //     const res =await extractionRunnable.invoke(rawRes);
        //     console.log(res);
        // res.vocab
        // console.log(res.response);
        //
        let fixedMsg = res;

        const startIndex = res.indexOf('{');

        if (startIndex !== -1) {
            // 使用 slice 方法获取从 startIndex 开始到末尾的子字符串
            fixedMsg = res.slice(startIndex);
        }
        try {
            fixedMsg = moji(fixedMsg).convert('ZE', 'HE').toString();
        } catch (e) {
            console.error(e);
        }

        try {
            const jsonRes = JSON5.parse(fixedMsg);
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


const langchainTools = {"translator": null, "prompter": {}}

export async function getTranslate(content: string) {
    if (!langchainTools.translator) {
        langchainTools.translator = await createTranslator();
    }

    const textStream = createStreamableValue("");

    runAsyncFnWithoutBlocking(async () => {
        let buf = "";
        try {
            let emojiFlag = false;
            const res = await langchainTools.translator.call({
                input: content,
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
                    },
                ],
            });
        } catch (e) {
            console.error(e);
        } finally {
        }
    });

    return textStream.value
}
