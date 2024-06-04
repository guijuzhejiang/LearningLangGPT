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
import {saveChat} from '@/app/actions'
import {SpinnerMessage, UserMessage} from '@/components/stocks/message'
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
const translator = [];

async function translate(content: string) {
    'use server'
    console.log(content);
    if (translator.length === 0) {
        translator.push(await createTranslator())
    }

    const textStream = createStreamableValue("<SpinnerMessage/>");

    runAsyncFnWithoutBlocking(async () => {
        let buf = "";
        try {
            let emojiFlag = false;
            const res = await translator[0].call({
                input: content,
                callbacks: [
                    {
                        handleLLMNewToken(token: any) {
                            console.log(token);
                            if (token) {
                                buf += token;
                                textStream.update(buf);
                            } else {
                                console.log('done11111 ' + token);
                                console.log(token);
                            }
                        },
                        handleLLMEnd(token: any) {
                            textStream.done(buf);
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

async function submitUserMessage(content: string) {
    'use server'
    console.error(content);
    const aiState = getMutableAIState<typeof AI>()

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

    runAsyncFnWithoutBlocking(async () => {
        let buf = "";

        console.log("id: " + chatId);

        if (!chatChainDB.hasOwnProperty(chatId)) {
            chatChainDB[chatId] = {
                createTime: new Date().getTime(),
                chatChain: await createChatChain(msgs)
            }
        }
        for (let [key, value] of Object.entries(chatChainDB)) {
            //24 * 60 * 60 * 1000
            if (new Date().getTime() - value.createTime >= 60 * 60 * 1000) {
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
                                                data: false
                                            }
                                        ]
                                    });

                                    delete abortSignal[msgID];
                                }
                                console.log(token);
                            } else {
                                console.log('done');
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
                                            data: false
                                        }
                                    ]
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
                                            data: false
                                        }
                                    ]
                                });

                                delete abortSignal[msgID];
                            }
                            console.log("stream:\n", token);

                        },
                    },
                ],
            });
        } catch (e) {
            console.error(e);
        } finally {
            // if (abortSignal.hasOwnProperty(msgID)) {
            //     textStream.done(<BotMessage content={buf} tts={false} msgID={msgID}/>);
            //
            //     aiState.done({
            //         ...aiState.get(),
            //         messages: [
            //             ...aiState.get().messages,
            //             {
            //                 id: nanoid(),
            //                 role: 'assistant',
            //                 content: buf,
            //                 data: false
            //             }
            //         ]
            //     });
            //
            //     delete abortSignal[msgID];
            //
            // }
        }
    });

    return {
        id: nanoid(),
        display: <BotMessage content={textStream.value} msgID={msgID} tts={false}/>
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

const createChatChain = async (msgs) => {
    'use server'
    const prompt = ChatPromptTemplate.fromTemplate(
        `
        You are an {language} teacher and improver.Your name is {name}.
        I am a beginner in {language}.
        I will communicate with you in my native language or in {language} and you have to answer me in {language} to practice my {language}.
        If I don't communicate in {language}, after you respond in {language},reassure and encourage me that I can say this in {language}.
        Please use {language} for all replies.Do not include any language other than {language} in your response!
        You are good at imagining fresh, interesting and exciting scenarios and guiding students to practice {language} dialogue in such scenarios.
        Don't speak more than two sentences at a time.
        Keep your replies neat and tidy and limit your replies to 24 words or less.
        If I speak {language}, you will strictly correct my grammatical errors, typos and factual errors.
        You are a gentle, funny and humorous {language} teacher and you ask me questions in your replies.
        Now we start practicing and you can ask me questions first.
        You can start practicing with simple {language} and adjust the difficulty of the {language} you reply to according to my {language} level.
        {history}
        Human:{input}
        AI:
      `
    );
    const partialPrompt = await prompt.partial({
        language: 'English',
        name: 'Mary'
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

export type AIState = {
    chatId: string
    messages: Message[],
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
        confirmPurchase
    },
    initialUIState: [],
    initialAIState: {chatId: nanoid(), messages: []},
    onGetUIState: async () => {
        'use server'

        const session = await auth()

        if (session && session.user) {
            const aiState = getAIState()

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
        console.log("onSetAIState");
        const session = await auth()

        if (session && session.user) {
            const {chatId, messages} = state

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
                path
            }

            await saveChat(chat)
        } else {
            return
        }
    }
})

export const getUIStateFromAIState = (aiState: Chat) => {
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
                    <BotMessage content={message.content} tts={false} msgID={message.id}/>
                )
        }))
}
