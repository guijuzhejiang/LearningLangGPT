import 'server-only'
import {RunnableWithMessageHistory} from "@langchain/core/runnables";
import {
    createAI,
    createStreamableUI,
    getMutableAIState,
    getAIState,
} from 'ai/rsc'
import {
    spinner,
    BotCard,
    BotMessage,
    SystemMessage,
    Stock,
    Purchase
} from '@/components/stocks'
import {Events} from '@/components/stocks/events'
import {Stocks} from '@/components/stocks/stocks'
import {
    formatNumber,
    runAsyncFnWithoutBlocking,
    sleep,
    nanoid
} from '@/lib/utils'
import {getChat, saveChat, saveCountDown} from '@/app/actions'
import {UserMessage} from '@/components/stocks/message'
import {Chat} from '@/lib/types'
import {auth} from '@/auth'
import {ChatPromptTemplate, MessagesPlaceholder, PromptTemplate} from "@langchain/core/prompts";
import Groq from "groq-sdk";
import {ChatGroq} from "@langchain/groq";
import {BufferWindowMemory, ChatMessageHistory} from "langchain/memory";
import {ConversationChain, loadSummarizationChain} from "langchain/chains";
import {HumanMessage, AIMessage} from "@langchain/core/messages";
import {createStreamableValue} from "ai/rsc";
import console from "node:console";
import {Document} from "@langchain/core/documents";

const {HttpsProxyAgent} = process.env.GROQ_PROXY ? require('https-proxy-agent') : "";

const chatChainDB = {} as { [key: string]: any };
const abortSignal = {} as { [key: string]: any };
const langchainTools = {translator: null, prompter: {}, chatSummarizer: null};

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

// ;(async () => {
//
// })()

async function createSummarizerForGetBgUrl() {
    // const prompt = new PromptTemplate({
    //     inputVariables: ['text'],
    //     template: `
    //     Use the following step-by-step instructions to respond to user inputs.
    //     Step 1 - You will generate concise, entity-dense summaries for the following dialogues,paying particular attention to extracting keywords, names, verbs, and adjectives from them:
    //     "{text}"
    //     Step 2 - Your job is to generate English prompts for stable diffusion based on the highly dense summaries provided above.
    //     Prompt is used to describe an image, and consists of ordinary common words or phrases
    //     Example:girl,teacher,books,desk,store
    //     Respond only the prompt.Don't add extra words other than prompts.
    //     PROMPT:
    //     `
    // });
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `
            You are a helpful assistant. Answer all questions to the best of your ability. The provided chat history includes facts about the user you are speaking with.
            `,
        ],
        new MessagesPlaceholder("history"),
        ["human", `
        Use the following step-by-step instructions to respond.
        Step 1 - You will generate concise, entity-dense summaries for the above chat messages,paying particular attention to extracting keywords, names, verbs, and adjectives from them:
        Step 2 - Your job is to generate English prompts for stable diffusion based on the highly dense summaries provided above.
        Prompt is used to describe an image, and consists of ordinary common words or phrases
        Example:girl,teacher,books,desk,store
        Respond only the prompt.Don't add extra words other than prompts.
        `],
    ]);

    return prompt.pipe(model).withFallbacks({
        fallbacks: Array.from(fallbacksModels.map((v, i) => prompt.pipe(v)))
    });
}

async function getBgUrl(style: number | undefined) {
    'use server'
    try {
        // get info
        const aiState = getMutableAIState<typeof AI>()
        const session = await auth();
        //  判断有没有登录
        const userId = (session && session.user) ? session.user.id : "default";
        const msgs = aiState.get().messages;
        const chatId = aiState.get().chatId;

        const textStream = createStreamableValue('')

        runAsyncFnWithoutBlocking(async () => {
            try {
                if (!langchainTools.chatSummarizer) {
                    langchainTools.chatSummarizer = await createSummarizerForGetBgUrl();
                }

                console.log("msgs!!!!!!!!!!!");
                console.log(msgs);
                // const docs = [];
                // const slicedMsgs = msgs.slice(-4);
                // slicedMsgs.forEach(async function (value, index) {
                //     if (value.role === 'assistant') {
                //         docs.push(new Document({pageContent: `${value.content}`}))
                //     }
                //     if (value.role === 'user') {
                //         docs.push(new Document({pageContent: `${value.content}`}))
                //     }
                // });
                // console.log(slicedMsgs);
                const chatHistory = new ChatMessageHistory();

                if (msgs.length > 0) {
                    msgs.forEach(async function (value, index) {
                        if (value.role === 'assistant') {
                            await chatHistory.addMessage(new AIMessage(value.content));
                        }
                        if (value.role === 'user') {
                            await chatHistory.addMessage(new HumanMessage(value.content));
                        }
                    });
                }

                const res = (await langchainTools.chatSummarizer.invoke({
                    history: await chatHistory.getMessages()
                })).content;
                console.log("bg_summary prompt:");
                console.log(res);

                const formData = new FormData();
                formData.append('prompt', res);
                formData.append('user_id', userId);
                formData.append('mlen', msgs.length);
                formData.append('chat_id', chatId);
                formData.append('style', style ? style : 4);
                const response = await fetch(process.env.SD_URL + '/zs/bg/generate', {
                    method: 'POST',
                    body: formData,
                });

                const jsonRes = await response.json()
                console.log(jsonRes);

                textStream.update(JSON.stringify(jsonRes))
                textStream.done()
            } catch (e) {
                console.error(e);
            } finally {
            }
        });

        return textStream.value;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function translate(content: string) {
    'use server'

    const textStream = createStreamableValue("");

    runAsyncFnWithoutBlocking(async () => {
        if (!langchainTools.translator) {
            langchainTools.translator = await createTranslator();
        }

        let buf = "";
        try {
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

export async function createTranslator() {
    'use server'
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `
            下面我让你来充当翻译家，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式,不要添加原文没有的标点符号,只回复翻译的内容。
            `,
        ],
        ["human", "请翻译下面这句话：{input}"],
    ]);

    return prompt.pipe(model).withFallbacks({
        fallbacks: Array.from(fallbacksModels.map((v, i) => prompt.pipe(v)))
    });
}

async function getHint(msg: string, chatParams: ChatParams | undefined | null) {
    'use server'
    console.log("getHint:");
    console.log(msg);
    if (!chatParams) {
        const session = await auth();
        const userId = (session && session.user) ? session.user.id : "default";
        if (userId !== 'default') {
            const aiState = getMutableAIState<typeof AI>()
            const chatId = aiState.get().chatId;

            chatParams = (await getChat(chatId, userId))?.chatParams;
        }
    }

    const textStream = createStreamableValue("");

    runAsyncFnWithoutBlocking(async () => {
        if (!langchainTools.prompter.hasOwnProperty(chatParams.lang)) {
            langchainTools.prompter[chatParams.lang] = await createPrompter(chatParams.lang);
        }

        let buf = "";
        try {
            let emojiFlag = false;
            const res = await langchainTools.prompter[chatParams.lang].invoke(
                {input: msg},
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
                        },
                    ],
                }
            );
        } catch (e) {
            console.error(e);
        } finally {
        }
    });

    return textStream.value
}

async function delChat(userId: string, chatId: string | boolean) {
    'use server'

}

const hintPrompts = {
    "English": `You are learning {language}.
        I am a {language} teacher and improver.
        We're doing English dialogue exercises.
        Please answer my question in {language}.
        Don't speak more than two sentences at a time.
        Keep your replies neat and tidy and limit your replies to 16 words or less.`,
    "Français": `Vous apprenez le {language}.
        Je suis professeur de {language} et un improvisateur.
        Nous faisons des exercices de dialogue en anglais.
        Veuillez répondre à ma question en {language}.
        Ne prononcez pas plus de deux phrases à la fois.
        Veillez à ce que vos réponses soient claires et soignées et limitez-les à 16 mots ou moins.`,
    "Deutsch": `Du lernst {language}.
        Ich bin ein {language} und Verbesserer.
        Wir machen englische Dialogübungen.
        Bitte beantworten Sie meine Frage in {language}.
        Sprechen Sie nicht mehr als zwei Sätze auf einmal.
        Halten Sie Ihre Antworten sauber und ordentlich und beschränken Sie sich auf 16 Wörter oder weniger.`,
}

async function createPrompter(lang: string) {
    'use server'
    const prompt = await ChatPromptTemplate.fromMessages([
        [
            "system",
            `
            ${hintPrompts[lang]}
            `,
        ],
        ["human", "{input}"],
    ]).partial({
        language: lang
    });

    return prompt.pipe(model).withFallbacks({
        fallbacks: Array.from(fallbacksModels.map((v, i) => prompt.pipe(v)))
    });
}

async function confirmPurchase(symbol: string, price: number, amount: number) {
    'use server'

    const aiState = getMutableAIState<typeof AI>()

    const purchasing = createStreamableUI(
        <div className="inline-flex items-start gap-1 md:items-center">
            {spinner}
            <p className="mb-2">
                Purchasing {amount} ${symbol}...
            </p>
        </div>
    )

    const systemMessage = createStreamableUI(null)

    runAsyncFnWithoutBlocking(async () => {
        await sleep(1000)

        purchasing.update(
            <div className="inline-flex items-start gap-1 md:items-center">
                {spinner}
                <p className="mb-2">
                    Purchasing {amount} ${symbol}... working on it...
                </p>
            </div>
        )

        await sleep(1000)

        purchasing.done(
            <div>
                <p className="mb-2">
                    You have successfully purchased {amount} ${symbol}. Total cost:{' '}
                    {formatNumber(amount * price)}
                </p>
            </div>
        )

        systemMessage.done(
            <SystemMessage>
                You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
                {formatNumber(amount * price)}.
            </SystemMessage>
        )

        aiState.done({
            ...aiState.get(),
            messages: [
                ...aiState.get().messages.slice(0, -1),
                {
                    id: nanoid(),
                    role: 'function',
                    name: 'showStockPurchase',
                    content: JSON.stringify({
                        symbol,
                        price,
                        defaultAmount: amount,
                        status: 'completed'
                    })
                },
                {
                    id: nanoid(),
                    role: 'system',
                    content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
                        amount * price
                    }]`
                }
            ]
        })
    })

    return {
        purchasingUI: purchasing.value,
        newMessage: {
            id: nanoid(),
            display: systemMessage.value
        }
    }
}

async function submitUserMessage(content: string, chatParams: ChatParams | undefined | null, remainingSecs: number) {
    'use server'
    console.error(content);
    // console.error(chatParams);
    const aiState = getMutableAIState<typeof AI>()
    const session = await auth();
    //  判断有没有登录
    const userId = (session && session.user) ? session.user.id : "default";
//     const chain = await initChatModel();
    const msgID = nanoid();
    aiState.update({
        ...aiState.get(),
        messages: [
            ...aiState.get().messages,
            {
                id: msgID,
                role: 'user',
                content
            }
        ]
    })

    const msgs = aiState.get().messages;
    const chatId = aiState.get().chatId;
    const textStream = createStreamableValue('')
    if (!chatParams && userId !== 'default') {
        chatParams = (await getChat(chatId, userId))?.chatParams
    }

    runAsyncFnWithoutBlocking(async () => {
        let buf = "";
        await saveCountDown(chatId, remainingSecs);
        if (!chatChainDB.hasOwnProperty(chatId)) {
            chatChainDB[chatId] = {
                createTime: new Date().getTime(),
                chatChain: await createChatChain(msgs, chatParams)
            };
        }
        for (let [key, value] of Object.entries(chatChainDB)) {
            //24 * 60 * 60 * 1000
            if (new Date().getTime() - value.createTime >= 30 * 60 * 1000) {
                delete chatChainDB[key]
            }
        }

        try {
            let emojiFlag = false;

            const res = await chatChainDB[chatId].chatChain.invoke(
                {input: content},
                {
                    configurable: {
                        sessionId: chatId,
                    },
                    callbacks: [
                        {
                            handleLLMNewToken(token: any) {
                                if (token) {
                                    if (token.includes('*')) {
                                        emojiFlag = !emojiFlag;
                                    }
                                    if (!emojiFlag) {
                                        buf += token;
                                    }

                                    if (!abortSignal.hasOwnProperty(msgID)) {
                                        textStream.update(token);
                                    } else {
                                        textStream.done();

                                        aiState.done({
                                            ...aiState.get(),
                                            messages: [
                                                ...aiState.get().messages,
                                                {
                                                    id: nanoid(),
                                                    role: 'assistant',
                                                    content: buf,
                                                }
                                            ],
                                            chatParams: chatParams
                                        });

                                        delete abortSignal[msgID];
                                    }
                                    // console.log(token);
                                } else {
                                    // console.log('done');
                                }
                            },
                            handleLLMEnd(token: any) {
                                console.log("----handleLLMEnd")
                                if (!abortSignal.hasOwnProperty(msgID)) {
                                    textStream.done();

                                    aiState.done({
                                        ...aiState.get(),
                                        messages: [
                                            ...aiState.get().messages,
                                            {
                                                id: nanoid(),
                                                role: 'assistant',
                                                content: buf,
                                            }
                                        ],
                                        chatParams: chatParams
                                    });
                                } else {
                                    textStream.done();

                                    aiState.done({
                                        ...aiState.get(),
                                        messages: [
                                            ...aiState.get().messages,
                                            {
                                                id: nanoid(),
                                                role: 'assistant',
                                                content: buf,
                                            }
                                        ]
                                    });

                                    delete abortSignal[msgID];
                                }
                                // console.log("stream:\n", token);

                            },
                        },
                    ],
                }
            );
        } catch (e) {
            console.error(e);
        } finally {
        }
    });

    return {
        id: nanoid(),
        display: <BotMessage content={textStream.value} userId={userId} chatId={chatId} chatParams={chatParams}/>
    }
}

async function abortStreaming(id: string, msg: string = "@save") {
    'use server'
    abortSignal[id] = true;
    const aiState = getMutableAIState<typeof AI>()
    if (msg !== '@save') {
        aiState.done({
            ...aiState.get(),
            messages: [
                ...aiState.get().messages.filter(item => item.id !== id),
            ]
        });

        const msgs = aiState.get().messages;
        const chatId = aiState.get().chatId;
        chatChainDB[chatId] = {
            createTime: new Date().getTime(),
            chatChain: await createChatChain(msgs)
        }
    }

}

const chatPrompts = {
    "English": {
        'prompt': `
        Your name is {name}.
        I will communicate with you in my native language or in {language} and you have to answer me in {language} to practice my {language}.
        If I don't communicate in {language}, after you respond in {language},reassure and encourage me that I can say this in {language}.
        Please use {language} for all replies.Do not include any language other than {language} in your response!
        You are good at imagining fresh, interesting and exciting scenarios and guiding students to practice {language} dialogue in such scenarios.
        Don't speak more than two sentences at a time.
        Keep your replies neat and tidy and limit your replies to 20 words or less.
        You are a gentle, funny and humorous {language} teacher and you ask me questions in your replies.
        Now we start practicing and you can ask me questions first.
      `,
        'level': {
            0: `
        You are a friendly and patient English teacher.
        Your students do not know any English at all.
        Please start teaching them very basic English words and phrases.
        Please use simple words and short sentences, and make the lessons fun with interactive games and activities. 
        Focus on topics such as colours, animals, numbers, shapes, and various scenarios presented by your students to keep learning engaging and fun.
        Be sure to encourage and praise the students for their efforts.
      `,
            1: `
        You are an encouraging and supportive English teacher. 
        Your student knows a few basic English words and phrases but wants to learn more.
        Use simple sentences and vocabulary, covering topics like daily conversations, school life, and hobbies.
        Use questions and answers, role-playing, and situational dialogues to enhance listening and speaking skills.
        Correct students' mistakes and provide simple explanations and suggestions.
      `,
            2: `
        You are a knowledgeable and professional English teacher.
        Your student is familiar with English and can hold basic conversations. 
        Use slightly more complex sentences and advanced vocabulary, discussing in-depth topics such as current events, and career development. 
        Conduct debates, discussions, and analyses to improve students' expression and critical thinking skills. 
        Provide simple feedback and correct grammar and vocabulary errors.
      `,
        }
    },
    "Français": {
        'prompt': `
        Votre nom est {name}.
        Je vais communiquer avec vous dans ma langue maternelle ou en {language} et vous devez me répondre en {language} pour pratiquer ma {language}.
        Si je ne peux pas communiquer en {language}, après votre réponse en {language}, rassurez-moi et encouragez-moi pour que je puisse le dire en {language}.
        Veuillez utiliser {language} pour toutes vos réponses et n'inclure aucune autre langue que {language} dans votre réponse !
        Vous êtes doué pour imaginer des scénarios nouveaux, intéressants et passionnants et pour guider les étudiants afin qu'ils pratiquent le dialogue {language} dans ces scénarios.
        Ne prononcez pas plus de deux phrases à la fois.
        Veillez à ce que vos réponses soient claires et nettes et limitez-les à 20 mots ou moins.
        Vous êtes un professeur de {language} gentil, drôle et plein d'humour et vous me posez des questions dans vos réponses.
        Maintenant, nous commençons à pratiquer et vous pouvez me poser des questions en premier.
      `,
        'level': {
            0: `
        Vous êtes un professeur de français sympathique et patient.
        Vos élèves ne connaissent pas du tout le français.
        Commencez à leur enseigner les mots et les phrases les plus élémentaires.
        Utilisez des mots et des phrases simples et rendez les leçons amusantes grâce à des jeux et des activités interactives.
        Veuillez vous concentrer sur des sujets tels que les couleurs, les animaux, les nombres, les formes, etc., ainsi que sur divers scénarios suggérés par les élèves afin de rendre l'apprentissage attrayant et amusant.
        Veillez à encourager et à féliciter les élèves pour leurs efforts.
      `,
            1: `
        Vous êtes un professeur de français qui encourage et soutient ses élèves.
        Votre élève connaît quelques mots et expressions de base en français mais souhaite en apprendre davantage.
        Utilisez des phrases et un vocabulaire simples pour aborder des sujets tels que la conversation quotidienne, la vie scolaire et les loisirs.
        Utilisez des quiz, des jeux de rôle et des dialogues en situation pour améliorer les compétences d'écoute et d'expression orale.
        Corriger les erreurs des élèves et leur fournir des explications et des conseils simples.
      `,
            2: `
        Vous êtes un professeur de français compétent et professionnel.
        Vos élèves sont familiers avec le français et peuvent tenir une conversation de base.
        Utilisez des phrases un peu plus complexes et un vocabulaire avancé pour discuter de sujets approfondis tels que l'actualité et l'évolution professionnelle.
        Menez des débats, des discussions et des analyses pour améliorer les capacités d'expression et de réflexion critique de vos étudiants.
        Fournir un feedback simple pour corriger les erreurs de grammaire et de vocabulaire.
      `
        }
    },
    "Deutsch": {
        'prompt': `
        Dein Name ist {name}.
        Ich werde mit dir in meiner Muttersprache oder in {language} kommunizieren und du musst mir in {language} antworten, um meine {language} zu üben.
        Wenn ich nicht in {language} kommuniziere, nachdem du in {language} geantwortet hast, versichere und ermutige mich, dass ich das in {language} sagen kann.
        Bitte verwenden Sie {language} für alle Antworten und verwenden Sie keine andere Sprache als {language} in Ihrer Antwort!
        Sie sind gut darin, sich neue, interessante und aufregende Szenarien auszudenken und die Schüler dazu anzuleiten, den Dialog in {language} in solchen Szenarien zu üben.
        Sprechen Sie nicht mehr als zwei Sätze auf einmal.
        Halten Sie Ihre Antworten sauber und ordentlich und beschränken Sie sich auf 20 Wörter oder weniger.
        Sie sind eine sanfte, lustige und humorvolle {language} Lehrerin und Sie stellen mir Fragen in Ihren Antworten.
        Jetzt fangen wir an zu üben und du kannst mir zuerst Fragen stellen.
      `,
        'level': {
            0: `
        Sie sind ein freundlicher und geduldiger Deutschlehrer.
        Ihre Schüler können überhaupt kein Deutsch.
        Bitte fangen Sie an, ihnen die grundlegendsten englischen Wörter und Redewendungen beizubringen.
        Bitte verwenden Sie einfache Wörter und Sätze und gestalten Sie den Unterricht mit interaktiven Spielen und Aktivitäten unterhaltsam.
        Bitte konzentrieren Sie sich auf Themen wie Farben, Tiere, Zahlen, Formen usw. sowie auf verschiedene von den Schülern vorgeschlagene Szenarien, damit das Lernen spannend bleibt und Spaß macht.
        Ermutigen und loben Sie Ihre Schülerinnen und Schüler für ihre Bemühungen.
      `,
            1: `
        Sie sind ein Deutschlehrer, der seine Schüler ermutigt und unterstützt.
        Ihre Schüler kennen einige grundlegende deutsche Wörter und Sätze, wollen aber mehr lernen.
        Verwenden Sie einfache Sätze und Vokabeln, um Themen wie Alltagsgespräche, Schulleben und Hobbys zu behandeln.
        Verwenden Sie Quizfragen, Rollenspiele und situative Dialoge, um das Hörverständnis und die Sprechfertigkeit zu verbessern.
        Korrigieren Sie die Fehler der Schüler und geben Sie einfache Erklärungen und Ratschläge.
      `,
            2: `
        Sie sind ein kompetenter und professioneller Deutschlehrer.
        Ihre Schüler sind mit der deutschen Sprache vertraut und können ein einfaches Gespräch führen.
        Sie verwenden etwas komplexere Sätze und ein fortgeschrittenes Vokabular, um vertiefte Themen wie aktuelle Themen und berufliche Entwicklung zu besprechen.
        Führen Sie Debatten, Diskussionen und Analysen durch, um die Ausdrucksfähigkeit und das kritische Denken Ihrer Schüler zu verbessern.
        Geben Sie einfaches Feedback, um Grammatik- und Vokabelfehler zu korrigieren.
      `
        }
    }
}


const createChatChain = async (msgs, chatParams) => {
    'use server'
    if (!chatParams) {
        chatParams = {
            teacherName: 'Mary',
            teacherGender: 'female',
            scene: 0,
            lang: 'English',
            level: 0
        }
    }

    console.log(new Date() + "createChatChain")
    console.log(chatParams)
    // console.log("prompt:" + chatPrompts[chatParams.lang].prompt)
    // console.log("level:" + chatPrompts[chatParams.lang].level[chatParams.level])
    console.log(`
        ${chatPrompts[chatParams.lang].level[chatParams.level]}
        ${chatPrompts[chatParams.lang].prompt}
        {history}
        Human:{input}
        AI:
    `)

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `
            ${chatPrompts[chatParams.lang].level[chatParams.level]}
            ${chatPrompts[chatParams.lang].prompt}
            `,
        ],
        new MessagesPlaceholder("history"),
        ["human", "{input}"],
    ]);

    const partialPrompt = await prompt.partial({
        language: chatParams.lang,
        name: chatParams.teacherName
    });

    const chatHistory = new ChatMessageHistory();

    if (msgs.length > 0) {
        msgs.forEach(async function (value, index) {
            if (value.role === 'assistant') {
                await chatHistory.addMessage(new AIMessage(value.content));
            }
            if (value.role === 'user') {
                await chatHistory.addMessage(new HumanMessage(value.content));
            }
        });
    }

    const chain = partialPrompt.pipe(model).withFallbacks({
        fallbacks: fallbacksModels
    })

    if (msgs.length > 0) {
        msgs.forEach(async function (value, index) {
            if (value.role === 'assistant') {
                await chatHistory.addMessage(new AIMessage(value.content));
            }
            if (value.role === 'user') {
                await chatHistory.addMessage(new HumanMessage(value.content));
            }
        });
    }
    return new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: (sessionId) => {
            return chatHistory
        },
        inputMessagesKey: "input",
        historyMessagesKey: "history",
    });
}

export type Message = {
    role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
    content: string
    id: string
    name?: string
}

export type ChatParams = {
    teacherName: string
    teacherGender: string
    scene: number
    lang: string
    level: number

}

export type AIState = {
    chatId: string
    userId: string
    messages: Message[]
    chatParams: ChatParams | undefined | null
}

export type UIState = {
    id: string
    display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
    actions: {
        submitUserMessage,
        abortStreaming,
        translate,
        getHint,
        delChat,
        getBgUrl,
        confirmPurchase
    },
    initialUIState: [],
    initialAIState: {chatId: nanoid(), messages: []},
    onGetUIState: async () => {
        'use server'
        console.log("onGetUIState");
        const session = await auth()

        if (session && session.user) {
            const aiState =
                getAIState()
            aiState.userId = session.user.id;
            if (aiState) {
                const uiState = getUIStateFromAIState(aiState)
                return uiState
            }
        } else {
            return
        }
    },
    onSetAIState: async ({state, done}) => {
        'use server'
        // console.log("onSetAIState");
        // console.log(state);
        const session = await auth()

        if (session && session.user) {
            const {chatId, messages, chatParams} = state

            const createdAt = new Date()
            const userId = session.user.id as string
            const path = process.env.NODE_ENV === "development" ? `/chat/${chatId}` : `/chat/${chatId}`
            const title = messages[0].content.substring(0, 100)

            const chat: Chat = {
                id: chatId,
                title,
                userId,
                createdAt,
                messages,
                path,
                chatParams
            }

            await saveChat(chat)
        } else {
            return
        }
    }
})

export const getUIStateFromAIState = (aiState: Chat) => {
    // console.log("xxxx!!!!!!getUIStateFromAIState!!!!xxxxxxxxxxx")
    // console.log(aiState)
    return aiState.messages
        .filter(message => message.role !== 'system')
        .map((message, index) => ({
            id: `${aiState.chatId}-${index}`,
            display:
                message.role === 'function' ? (
                    message.name === 'listStocks' ? (
                        <BotCard>
                            <Stocks props={JSON.parse(message.content)}/>
                        </BotCard>
                    ) : message.name === 'showStockPrice' ? (
                        <BotCard>
                            <Stock props={JSON.parse(message.content)}/>
                        </BotCard>
                    ) : message.name === 'showStockPurchase' ? (
                        <BotCard>
                            <Purchase props={JSON.parse(message.content)}/>
                        </BotCard>
                    ) : message.name === 'getEvents' ? (
                        <BotCard>
                            <Events props={JSON.parse(message.content)}/>
                        </BotCard>
                    ) : null
                ) : message.role === 'user' ? (
                    <UserMessage>{message.content}</UserMessage>
                ) : (
                    <BotMessage content={message.content} userId={aiState.userId} chatId={aiState.chatId}
                                chatParams={aiState.chatParams}/>
                )
        }))
}
