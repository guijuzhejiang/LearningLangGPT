import 'server-only'

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
import {getChat, saveChat} from '@/app/actions'
import {UserMessage} from '@/components/stocks/message'
import {Chat} from '@/lib/types'
import {auth} from '@/auth'
import {ChatPromptTemplate} from "@langchain/core/prompts";
import Groq from "groq-sdk";
import {ChatGroq} from "@langchain/groq";
import {BufferWindowMemory, ChatMessageHistory} from "langchain/memory";
import {ConversationChain} from "langchain/chains";
import {HumanMessage, AIMessage} from "@langchain/core/messages";
import {createStreamableValue} from "ai/rsc";

const {HttpsProxyAgent} = process.env.GROQ_PROXY ? require('https-proxy-agent') : "";

const chatChainDB = {} as { [key: string]: any };
const abortSignal = {} as { [key: string]: any };
const langchainTools = {"translator": null, "prompter": {}};

async function translate(content: string) {
    'use server'
    // console.log(content);
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

async function createTranslator() {
    // 你是一个翻译英文的翻译器，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式,必须使用中文输出。

    const prompt = ChatPromptTemplate.fromTemplate(
        `
        下面我让你来充当翻译家，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式,不要添加原文没有的标点符号,只回复翻译的内容。
        Human:请翻译下面这句话：“{input}”
        AI:
      `
    );
    const groqClient = process.env.GROQ_PROXY ? new Groq({httpAgent: new HttpsProxyAgent(process.env.GROQ_PROXY),}) : new Groq();
    const model = new ChatGroq({
        modelName: "llama3-70b-8192",
        apiKey: process.env.GROQ_API_KEY,
        streaming: true,
        temperature: 0.8,
    });

    model.client = groqClient;

    return new ConversationChain({llm: model, prompt: prompt});
}

async function getHint(msg:string, chatParams: ChatParams | undefined | null) {
    'use server'
    // const msgs = JSON.parse(jmsg);
    // console.log("msxxxxgs[msgs.length-1]")
    // console.log(msg)
    // console.log(chatParams)

    if (!chatParams) {
        const session = await auth();
        const userId = (session && session.user) ? session.user.id : "default";
        if (userId !== 'default') {
            const aiState = getMutableAIState<typeof AI>()
            const chatId = aiState.get().chatId;

            chatParams = (await getChat(chatId, userId))?.chatParams;
        }
    }

    if (!langchainTools.prompter.hasOwnProperty(chatParams.lang)) {
        langchainTools.prompter[chatParams.lang] = await createPrompter(chatParams.lang);
    }

    const textStream = createStreamableValue("");

    runAsyncFnWithoutBlocking(async () => {
        let buf = "";
        try {
            let emojiFlag = false;
            const res = await langchainTools.prompter[chatParams.lang].call({
                input: msg,
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

async function delChat(userId:string, chatId:string|boolean) {
    'use server'

}

const hintPrompts = {
    "English": `You are a student studying {language}.
        I am a {language} teacher and improver.
        We're doing English dialogue exercises.
        Please answer my question in {language}.
        Don't speak more than two sentences at a time.
        Keep your replies neat and tidy and limit your replies to 16 words or less.`,
    "Français": `Vous êtes un étudiant qui étudie {language}.
        Je suis professeur de {language} et un improvisateur.
        Nous faisons des exercices de dialogue en anglais.
        Veuillez répondre à ma question en {language}.
        Ne prononcez pas plus de deux phrases à la fois.
        Veillez à ce que vos réponses soient claires et soignées et limitez-les à 16 mots ou moins.`,
    "Deutsch": `Sie sind ein Schüler, der {language} lernt.
        Ich bin ein {language} und Verbesserer.
        Wir machen englische Dialogübungen.
        Bitte beantworten Sie meine Frage in {language}.
        Sprechen Sie nicht mehr als zwei Sätze auf einmal.
        Halten Sie Ihre Antworten sauber und ordentlich und beschränken Sie sich auf 16 Wörter oder weniger.`,
}

async function createPrompter(lang:string) {
    'use server'
    const prompt = ChatPromptTemplate.fromTemplate(
        `
        ${hintPrompts[lang]}
        Human:{input}
        AI:
      `
    );
    // console.log("xxxxxxxxxxxxxxxxxxxxxxxxx");
    // console.log(lang);

    const partialPrompt = await prompt.partial({
        language: lang,
    });
    const groqClient = process.env.GROQ_PROXY ? new Groq({httpAgent: new HttpsProxyAgent(process.env.GROQ_PROXY),}) : new Groq();
    const model = new ChatGroq({
        modelName: "llama3-70b-8192",
        apiKey: process.env.GROQ_API_KEY,
        streaming: true,
        temperature: 0.8,
    });

    model.client = groqClient

// const chain = prompt.pipe(llm);
//     const memory = new BufferWindowMemory({
//         humanPrefix: "Human",
//         aiPrefix: "AI",
//         memoryKey: "history",
//         k: 10
//     });
    // memory.loadMemoryVariables()
    return new ConversationChain({llm: model, prompt: partialPrompt});
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

async function submitUserMessage(content: string, chatParams: ChatParams | undefined | null) {
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
            const res = await chatChainDB[chatId].chatChain.call({
                input: content,
                callbacks: [
                    {
                        handleLLMNewToken(token: any) {
                            // console.log(token);
                            // await new Promise(resolve => setTimeout(resolve, 250));
                            // const start = Date.now();
                            // 使用 while 循环阻塞一段时间
                            // while (Date.now() - start < 50) {
                            // 空循环，什么都不做
                            // }
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
                                        chatParams:chatParams
                                    });

                                    delete abortSignal[msgID];
                                }
                                // console.log(token);
                            } else {
                                // console.log('done');
                            }
                        },
                        handleLLMEnd(token: any) {
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
                                    chatParams:chatParams
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
            });
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
        You are a friendly {language} teacher helping children aged 4 to 10 learn {language}. 
        Please use simple words and short sentences, and make the lessons fun with interactive games and activities. 
        Focus on themes like colors, animals, numbers, and shapes to keep the learning engaging and enjoyable.
        Be sure to encourage and praise the students for their efforts.
      `,
            1: `
        You are an experienced {language} teacher helping students aged 11 to 18 improve their {language} skills. 
        Use simple sentences and vocabulary, covering topics like daily conversations, school life, and hobbies.
        Use questions and answers, role-playing, and situational dialogues to enhance listening and speaking skills.
        Correct students' mistakes and provide simple explanations and suggestions.
      `,
            2: `
        You are a professional {language} teacher helping students aged 18 and above to enhance their {language} proficiency.  
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
        Vous êtes un sympathique professeur de {language} qui aide les enfants de 4 à 10 ans à apprendre la {language}. 
        Utilisez des mots simples et des phrases courtes, et rendez les leçons amusantes grâce à des jeux et des activités interactives. 
        Concentrez-vous sur des thèmes tels que les couleurs, les animaux, les nombres et les formes pour que l'apprentissage reste attrayant et agréable.
        Veillez à encourager et à féliciter les élèves pour leurs efforts.
      `,
            1: `
       Vous êtes un professeur de {language} expérimenté qui aide les élèves âgés de 11 à 18 ans à améliorer leurs compétences en {language}. 
        Utilisez des phrases et un vocabulaire simples, en abordant des sujets tels que les conversations quotidiennes, la vie scolaire et les loisirs.
        Utilisez des questions et des réponses, des jeux de rôle et des dialogues en situation pour améliorer les compétences d'écoute et d'expression orale.
        Corriger les erreurs des élèves et leur fournir des explications et des suggestions simples.
      `,
            2: `
        Vous êtes un professeur de {language} professionnel qui aide les étudiants âgés de 18 ans et plus à améliorer leurs compétences en {language}.  
        Utilisez des phrases un peu plus complexes et un vocabulaire avancé, en discutant de sujets approfondis tels que l'actualité et l'évolution de carrière. 
        Mener des débats, des discussions et des analyses pour améliorer l'expression et l'esprit critique des étudiants. 
        Fournir un retour d'information simple et corriger les erreurs de grammaire et de vocabulaire.
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
        Sie sind ein freundlicher {language}, der Kindern im Alter von 4 bis 10 Jahren hilft, {language} zu lernen. 
        Bitte verwenden Sie einfache Wörter und kurze Sätze, und gestalten Sie den Unterricht mit interaktiven Spielen und Aktivitäten unterhaltsam. 
        Konzentrieren Sie sich auf Themen wie Farben, Tiere, Zahlen und Formen, damit das Lernen spannend und unterhaltsam bleibt.
        Ermutigen und loben Sie die Schüler für ihre Bemühungen.
      `,
            1: `
       Sie sind ein erfahrener {language} und helfen Schülern im Alter von 11 bis 18 Jahren, ihre {language} zu verbessern. 
        Verwenden Sie einfache Sätze und Vokabeln zu Themen wie Alltagsgespräche, Schulleben und Hobbys.
        Verwenden Sie Fragen und Antworten, Rollenspiele und situative Dialoge, um das Hörverständnis und die Sprechfertigkeit zu verbessern.
        Korrigieren Sie die Fehler der Schüler und geben Sie einfache Erklärungen und Vorschläge.
      `,
            2: `
        Sie sind ein professioneller {language} und helfen Schülern ab 18 Jahren, ihre {language} zu verbessern.  
        Verwenden Sie etwas komplexere Sätze und ein fortgeschrittenes Vokabular und diskutieren Sie tiefgründige Themen wie aktuelle Ereignisse und die berufliche Entwicklung. 
        Führen Sie Debatten, Diskussionen und Analysen durch, um die Ausdrucksfähigkeit und das kritische Denken der Schüler zu verbessern. 
        Geben Sie einfaches Feedback und korrigieren Sie Grammatik- und Vokabelfehler.
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


    const prompt = ChatPromptTemplate.fromTemplate(
        `
        ${chatPrompts[chatParams.lang].level[chatParams.level]}
        ${chatPrompts[chatParams.lang].prompt}
        {history}
        Human:{input}
        AI:
      `
    );
    const partialPrompt = await prompt.partial({
        language: chatParams.lang,
        name: chatParams.teacherName
    });


    const groqClient = process.env.GROQ_PROXY ? new Groq({httpAgent: new HttpsProxyAgent(process.env.GROQ_PROXY),}) : new Groq();
    const model = new ChatGroq({
        modelName: "llama3-70b-8192",
        apiKey: process.env.GROQ_API_KEY,
        streaming: true,
        temperature: 0.8,
    });

    model.client = groqClient

// const chain = prompt.pipe(llm);
    const memory = new BufferWindowMemory({
        humanPrefix: "Human",
        aiPrefix: "AI",
        memoryKey: "history",
        k: 10
    });
    if (msgs.length > 0) {
        const chatHistory = new ChatMessageHistory();
        msgs.forEach(async function (value, index) {
            if (value.role === 'assistant') {
                await chatHistory.addMessage(new AIMessage(value.content));
            }
            if (value.role === 'user') {
                await chatHistory.addMessage(new HumanMessage(value.content));
            }
        });
        memory.chatHistory = chatHistory;

    }
    // memory.loadMemoryVariables()
    return new ConversationChain({llm: model, memory: memory, prompt: partialPrompt});
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
                    <BotMessage content={message.content} userId={aiState.userId} chatId={aiState.chatId} chatParams={aiState.chatParams}/>
                )
        }))
}
