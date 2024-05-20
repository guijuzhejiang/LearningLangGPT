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
import { HumanMessage, AIMessage } from "@langchain/core/messages";
const { HttpsProxyAgent } = process.env.NODE_ENV === "development"? require('https-proxy-agent'):"";

const chatChainDB = {} as { [key: string]: any };
const abortSignal = {} as { [key: string]: any };

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
    const textStream = createStreamableUI(<SpinnerMessage/>)

    runAsyncFnWithoutBlocking(async () => {
        let buf = "";

        console.log("id: "+ chatId);

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
                                    textStream.update(<BotMessage content={buf} tts={false} msgID={msgID}/>);
                                }
                                console.log(token);
                            }else{
                                console.log('done');
                            }
                        },
                        handleLLMEnd(token:any) {
                            if (!abortSignal.hasOwnProperty(msgID)) {
                                textStream.done(<BotMessage content={buf} tts={true} msgID={msgID}/>);
                            }

                            // emitter.emit("data", { event: "end" });
                          console.log("stream:\n", token);
                            aiState.done({
                                ...aiState.get(),
                                messages: [
                                    ...aiState.get().messages,
                                    {
                                        id: nanoid(),
                                        role: 'assistant',
                                        content: buf,
                                        data:false
                                    }
                                ]
                            });
                        },
                    },
                ],
            });
        } catch (e) {
            console.error(e);
        } finally {
            if (abortSignal.hasOwnProperty(msgID)) {
                textStream.done();
                delete abortSignal[msgID];
            }
        }
    });

    return {
        id: nanoid(),
        display: textStream.value
    }
}

async function abortStreaming(id: string, msg:string) {
    'use server'
    abortSignal[id] = true;
    const aiState = getMutableAIState<typeof AI>()
    aiState.done({
        ...aiState.get(),
        messages: [
            ...aiState.get().messages.filter(item => item.id !== id),
        ]
    });
}

const createChatChain = async (msgs)=>{
    'use server'
    const prompt = ChatPromptTemplate.fromTemplate(
        `
        You are an {language} teacher and improver.Your name is {name}.
        I am an elementary school student.
        I will communicate with you in my native language or in {language} and you have to answer me in {language} to practice my {language}.
        If I don't communicate in {language}, after you respond in {language},repeat what I said in {language}, and reassure and encourage me that I can say this in {language}.
        Don't use English unless you're an English teacher.
        Do not notes, annotate, or comment in English other than the foreign language being taught.
        Please use {language} for all replies.Do not include any language other than {language} in your response!
        I want you to keep your replies neat and tidy and limit your replies to 40 words or less.
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


    const groqClient = process.env.NODE_ENV === "development"? new Groq({httpAgent: new HttpsProxyAgent('http://127.0.0.1:7891'),}): new Groq();
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
        msgs.forEach(async function(value, index) {
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
            const path = `/chat/${chatId}`
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
                    <BotMessage content={message.content} tts={message.data} msgID={message.id}/>
                )
        }))
}
