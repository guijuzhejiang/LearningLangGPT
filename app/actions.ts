'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {kv} from '@vercel/kv'

import {auth} from '@/auth'
import {type Chat} from '@/lib/types'
import {ChatPromptTemplate} from "@langchain/core/prompts";
import Groq from "groq-sdk";
import {ChatGroq} from "@langchain/groq";
import {ConversationChain} from "langchain/chains";
import {HttpsProxyAgent} from "https-proxy-agent";
import {BufferWindowMemory, ChatMessageHistory} from "langchain/memory";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {createStreamableValue} from "ai/rsc";
import {nanoid, runAsyncFnWithoutBlocking} from "@/lib/utils";


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
    if (!chats.length) {
        return redirect('/')
    }
    const pipeline = kv.pipeline()

    for (const chat of chats) {
        pipeline.del(chat)
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


export async function getScore(chat: Chat) {
    const textStream = createStreamableValue('')

    runAsyncFnWithoutBlocking(async () => {
        const prompt = ChatPromptTemplate.fromTemplate(
            `
        你是一个经验丰富的老师，善于总结。使用中文回答问题。
        {history}
        Human:{input}
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

        console.log("test");
        console.log(chat);

        const memory = new BufferWindowMemory({
            humanPrefix: "Human",
            aiPrefix: "AI",
            memoryKey: "history",
            k: 10
        });
        const chatHistory = new ChatMessageHistory();
        chat.messages.forEach(async function (value, index) {
            if (value.role === 'assistant') {
                await chatHistory.addMessage(new AIMessage(value.content));
            }
            if (value.role === 'user') {
                await chatHistory.addMessage(new HumanMessage(value.content));
            }
        });
        memory.chatHistory = chatHistory;

        const scoreC = new ConversationChain({llm: model, memory: memory, prompt: prompt});

        const res = await scoreC.call({
            input: "请你用中文回答我的问题。我想结束这次对话练习，针对本次对话练习，提炼关键单词并解释和造句，提供中文翻译。给我的这次学习一个概括总结，表扬我做的好的地方，提出不足的低分，并且打个分。根据我的回答内容表现，给予英文水平评价。",
            callbacks: [
                {
                    handleLLMNewToken(token: any) {
                        textStream.update(token);
                    },
                    handleLLMEnd(token: any) {
                        textStream.done();
                    },
                },
            ],

        });
    });

    return textStream.value;
}