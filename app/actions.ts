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
import {getMutableAIState} from "ai/rsc";
import {AI} from "@/lib/chat/actions";


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
    chat = await getChat(chat.id, chat.userId)
    const prompt = ChatPromptTemplate.fromTemplate(
        `
        你是一个经验丰富的老师，待人友好，善于总结，乐于激励学生。
        当收到'概括'的时候，用简体中文针对本次对话练习提炼关键单词并解释、显示音标、显示词性、造句。回顾一下这次对话练习的过程，给我的这次学习一个概括总结，表扬我做的好的地方，提出不足的地方，并且打个分。根据我的回答内容表现，给予英文水平评价。
        请综合上述信息，你给出的回复需要包含以下四个字段：
        1.vocab: 针对本次对话练习提炼关键单词并解释、显示音标、显示词性、造句。
        2.review: 回顾本次对话的聊天内容，做一个简洁的概括。
        3.summary: 针对本次对话，概括总结，表扬我做的好的地方，提出不足的地方。
        4.evaluation: 请根据以下标准评估我的英文水平：
            (1).**内容完整性**：评估我的回答是否全面且相关。
            (2).**句子复杂度**：评估我使用的句子结构的复杂性，包括从句和多样化的句型。
            (3).**词汇使用**：考虑我使用的词汇范围和复杂程度，包括习语表达和高级术语的使用。
            (4).**语法和句法**：审查我使用的语法结构的正确性和复杂性。
            (5).**连贯性和一致性**：评估我的回答的逻辑流畅性和连贯性，包括过渡短语和连贯装置的使用。
        5.score: 这次对练习的评分,按照ABCDF打分。
        请按照以下JSON格式来回答：
        {{
        "vocab":[
        {{"word":"单词1","explanation":“单词1的中文解释”, "phonogram":"单词1的音标", "category": "单词1的词性", "sentence":"单词1造句例子"}}}},
        {{"word":"单词2","explanation":“单词2的中文解释”, "phonogram":"单词2的音标", "category": "单词2的词性", "sentence":"单词2造句例子"}}}}
        ],
        "review":"这次对话练习的回顾",
        "summary":{{"content":"对于这次学习的概括总结","strengths":["做的好的地方1","做的好的地方2"],"weaknesses":["不足的地方1","不足的地方2"]}},
        “evaluation”:"根据我回答内容表现，给予的英文水平评价",
        "score":"这次对话练习的评分"
        }}
        最后强调一下：你的回复将直接用于javascript的JSON.parse解析，所以注意一定要以标准的JSON格式做回答，不要包含任何其他非JSON内容,不要包含换行符,必须一定用中文回复。
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

    // console.log("test");
    // console.log(chat);

    const memory = new BufferWindowMemory({
        humanPrefix: "Human",
        aiPrefix: "AI",
        memoryKey: "history",
        k: chat.messages.length+1
    });
    const chatHistory = new ChatMessageHistory();
    console.log(chat.messages);
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
        input: "概括",
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

    return JSON.parse(res.response);
}