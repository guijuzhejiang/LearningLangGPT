'use client'

import * as React from 'react'
import {type DialogProps} from '@radix-ui/react-dialog'
import {IconTeacher, IconPlayMedia, IconStop} from '@/components/ui/icons'
import * as Dialog from '@radix-ui/react-dialog';
import {Cross2Icon} from '@radix-ui/react-icons';
import Cookies from 'js-cookie';
import {usePathname} from "next/navigation";
import {updateUserCookies, loadUserCookies, stopAllAudio} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {BotMessage, spinner} from "@/components/stocks";
import {toast} from "sonner";
import {forwardRef, useImperativeHandle} from "react";
interface ChatShareDialogProps extends DialogProps {
    userId: string
    lang: string
}

export const SceneDialog = forwardRef(({userId,
                                           lang,
                                       ...props
                                   }: ChatShareDialogProps,ref) => {

    useImperativeHandle(ref, () => ({
        scene,
        exampleMessages,
        ChineseLangs,
    }))

    const path = usePathname();
    const [scene, setScene] = React.useState(0)
    const ChineseLangs = {
        "English": "英语",
        "Français": "法语",
        "Deutsch": "德语",
    }

    const exampleMessages = [
        {
            heading: '无',
            subheading: '',
            message: `Hi`
        },
        {
            heading: '旅行和住宿',
            subheading: '旅游',
            message: {
                "English": `Help me practice my {lang} by role-playing travel and accommodation scenarios. You will play the role of a hotel receptionist and I will play the role of a guest. Guide me through checking in, asking about hotel services and dealing with common travel situations.`,
                "Français": "Aidez-moi à pratiquer mon {lang} en jouant des scénarios de voyage et d'hébergement. Vous jouerez le rôle d'un réceptionniste d'hôtel et moi celui d'un client. Guidez-moi pour m'enregistrer, poser des questions sur les services de l'hôtel et faire face aux situations de voyage les plus courantes.",
                "Deutsch": "Helfen Sie mir, mein {lang} zu üben, indem Sie Rollenspiele zu Reise- und Unterkunftsszenarien durchführen. Sie spielen die Rolle einer Hotelrezeptionistin und ich spiele die Rolle eines Gastes. Führen Sie mich durch das Einchecken, fragen Sie nach Hoteldienstleistungen und bewältigen Sie gängige Reisesituationen."
            }
            // message: `通过角色扮演旅行和住宿场景来帮助我练习{lang}。你将扮演酒店前台，而我将扮演客人。引导我经历办理入住、询问酒店服务和处理常见旅行情况。`
        },
        {
            heading: '学习方法',
            subheading: '学习',
            message: {
                "English": `Help me practise {lang} by discussing {lang} study methods. Discuss with me effective study methods, difficulties encountered and successes. Provide some effective study suggestions and tips.`,
                "Français": "Aidez-moi à pratiquer {lang} en discutant des méthodes d'étude {lang}. Discutez avec moi des méthodes d'étude efficaces, des difficultés rencontrées et des réussites. Me donner des suggestions et des conseils pour étudier efficacement.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie {lang} Lernmethoden besprechen. Diskutieren Sie mit mir über effektive Lernmethoden, aufgetretene Schwierigkeiten und Erfolge. Geben Sie mir einige effektive Lernvorschläge und Tipps."
            }
            // message: '通过讨论{lang}学习方法来帮助我练习{lang}。与我讨论有效的学习方法、遇到的困难和成功的经验。提供一些有效的学习建议和技巧。'
        },
        {
            heading: '自我介绍',
            subheading: '介绍',
            message: {
                "English": `Please teach me how to introduce myself using {lang} and help me practice {lang} by practising introducing myself. Guide me to introduce information such as my name, age, interests, family and occupation. Provide feedback and suggestions for improvement.`,
                "Français": "Apprenez-moi à me présenter en utilisant {lang} et aidez-moi à pratiquer {lang} en m'entraînant à me présenter. Guidez-moi pour présenter des informations telles que mon nom, mon âge, mes centres d'intérêt, ma famille et ma profession. Faites-moi part de vos commentaires et de vos suggestions pour que je m'améliore.",
                "Deutsch": "Bringen Sie mir bei, wie ich mich in {lang} vorstellen kann, und helfen Sie mir, {lang} zu üben, indem ich mich vorstelle. Leiten Sie mich an, Informationen wie meinen Namen, mein Alter, meine Interessen, meine Familie und meinen Beruf vorzustellen. Geben Sie mir Feedback und Verbesserungsvorschläge."
            }
            // message: `请教我如何使用{lang}自我介绍,通过练习自我介绍来帮助我练习{lang}。引导我介绍自己的姓名、年龄、兴趣爱好、家庭和职业等信息。提供反馈和改进建议。`
        },
        {
            heading: '工作面试',
            subheading: '面试',
            message: {
                "English": `Help me practice {lang} by role-playing a job interview scenario. You will play the role of the interviewer and I will play the role of the job seeker. Guide me through typical interview questions, provide feedback and suggestions for improvement.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant un scénario d'entretien d'embauche. Vous jouerez le rôle de l'intervieweur et moi celui du demandeur d'emploi. Guidez-moi à travers les questions typiques d'un entretien, donnez votre avis et suggérez des améliorations.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie ein Rollenspiel zu einem Vorstellungsgespräch machen. Sie spielen die Rolle des Interviewers und ich spiele die Rolle des Arbeitssuchenden. Führen Sie mich durch typische Vorstellungsgesprächsfragen, geben Sie mir Feedback und Verbesserungsvorschläge."
            }
            // message: `通过角色扮演工作面试场景来帮助我练习{lang}。你将扮演面试官，而我将扮演求职者。引导我回答典型的面试问题，提供反馈和改进建议。`
        },
        {
            heading: '安排会议',
            subheading: '安排会议',
            message: {
                "English": `Help me practice {lang} by role-playing scenarios for arranging meetings. Lead me to discuss the time, place and agenda of the meeting.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant des scénarios pour organiser des réunions. Amenez-moi à discuter de l'heure, du lieu et de l'ordre du jour de la réunion.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie Szenarien für die Organisation von Besprechungen in Rollenspielen durchspielen. Leiten Sie mich an, Zeit, Ort und Tagesordnung des Treffens zu besprechen."
            }
            // message: `通过角色扮演安排会议的场景来帮助我练习{lang}。引导我讨论会议时间、地点和议程。`
        },
        {
            heading: '参加会议',
            subheading: '会议',
            message: {
                "English": `Help me practice {lang} by role-playing in a {lang} meeting. You will play the role of a meeting facilitator or participant and I will play the role of another participant. Guide me through the discussion, expressing opinions and asking questions in the meeting.`,
                "Français": "Aidez-moi à pratiquer le {lang} en jouant un rôle dans une réunion {lang}. Vous jouerez le rôle d'un animateur ou d'un participant à la réunion et je jouerai le rôle d'un autre participant. Guidez-moi tout au long de la discussion, en exprimant des opinions et en posant des questions au cours de la réunion.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie ein Rollenspiel in einer {lang} Sitzung spielen. Sie spielen die Rolle eines Sitzungsleiters oder Teilnehmers und ich spiele die Rolle eines anderen Teilnehmers. Führen Sie mich durch die Diskussion, äußern Sie Ihre Meinung und stellen Sie Fragen in der Besprechung."
            }
            // message: `通过角色扮演参加{lang}会议来帮助我练习{lang}。你将扮演会议主持人或参与者，而我将扮演另一个参与者。引导我进行会议中的讨论、表达意见和提出问题。`
        },
        {
            heading: '购物',
            subheading: '购物',
            message: {
                "English": `Help me practice {lang} by role-playing shopping scenarios. You will play the role of the shop assistant and I will play the role of the customer. Guide me through a typical shopping experience including greeting, looking for items, making decisions and paying.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant des scénarios d'achat. Vous jouerez le rôle du vendeur et moi celui du client. Guidez-moi tout au long d'une expérience d'achat typique, y compris l'accueil, la recherche d'articles, la prise de décision et le paiement.",
                "Deutsch": "Helfen Sie mir beim Üben von {lang} durch Rollenspiele beim Einkaufen. Sie spielen die Rolle des Verkäufers und ich spiele die Rolle des Kunden. Führen Sie mich durch ein typisches Einkaufserlebnis, einschließlich Begrüßung, Suche nach Artikeln, Entscheidungen treffen und Bezahlen."
            }
            // message: `通过角色扮演购物场景来帮助我练习{lang}。你将扮演店员，而我将扮演顾客。引导我经历典型的购物体验，包括问候、寻找商品、做决定和付款。`
        },
        {
            heading: '邀约',
            subheading: '约会',
            message: {
                "English": `Help me practice {lang} by role-playing an invite-the-person-out scenario. You will play the person being invited and I will play the inviter. Guide me to make the invitation in a polite and assertive way and deal with possible responses.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant un scénario d'invitation à sortir. Vous jouerez le rôle de la personne invitée et moi celui de l'invitant. Guidez-moi pour faire l'invitation de manière polie et assurée et pour faire face aux réponses possibles.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie ein Rollenspiel zu einem Einladungs-Szenario machen. Sie spielen die Person, die eingeladen wird, und ich spiele den Einladenden. Leiten Sie mich an, die Einladung auf höfliche und selbstbewusste Weise auszusprechen und auf mögliche Reaktionen einzugehen."
            }
            // message: `通过角色扮演邀约对方外出场景来帮助我练习{lang}。你将扮演被邀约的人，而我将扮演邀约者。引导我用礼貌和自信的方式进行邀请，并处理可能的回应。`
        },
        {
            heading: '餐馆点餐',
            subheading: '点餐',
            message: {
                "English": `Help me practice {lang} by role-playing a restaurant scene. You will play the role of a waiter and I will play the role of a customer. Guide me through a typical dining experience including greeting, ordering, asking for the menu and paying.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant une scène de restaurant. Vous jouerez le rôle d'un serveur et moi celui d'un client. Guidez-moi tout au long d'un repas typique, y compris l'accueil, la commande, la demande du menu et le paiement.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie ein Rollenspiel in einem Restaurant machen. Sie spielen die Rolle eines Kellners und ich spiele die Rolle eines Kunden. Führen Sie mich durch einen typischen Restaurantbesuch, einschließlich Begrüßung, Bestellung, Frage nach der Speisekarte und Bezahlung."
            }
            // message: `通过角色扮演餐馆场景来帮助我练习{lang}。你将扮演服务员，而我将扮演顾客。引导我经历典型的用餐体验，包括问候、点餐、询问菜单和付款。`
        },
        {
            heading: '医院就诊',
            subheading: '就诊',
            message: {
                "English": `Help me practice {lang} by role-playing a hospital visit scenario. You will play the doctor and I will play the patient. Guide me in explaining symptoms, asking questions and understanding medical advice.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant un scénario de visite à l'hôpital. Vous jouerez le rôle du médecin et moi celui du patient. Guidez-moi pour expliquer les symptômes, poser des questions et comprendre les conseils médicaux.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie ein Rollenspiel zu einem Krankenhausbesuch machen. Sie spielen den Arzt und ich spiele den Patienten. Hilf mir, Symptome zu erklären, Fragen zu stellen und medizinische Ratschläge zu verstehen."
            }
            // message: `通过角色扮演医院就诊场景来帮助我练习{lang}。你将扮演医生，而我将扮演病人。引导我解释症状、询问问题和理解医疗建议。`
        },
        {
            heading: '兴趣爱好',
            subheading: '兴趣',
            message: {
                "English": `Help me practice {lang} by discussing interests. Engage in dialogue with me about preferred hobbies, activities I enjoy and why. Encourage me to ask you about your hobbies as well.`,
                "Français": "Aidez-moi à pratiquer le {lang} en discutant de mes centres d'intérêt. Engagez un dialogue avec moi sur mes passe-temps préférés, les activités que j'aime et pourquoi. Encouragez-moi à vous poser des questions sur vos passe-temps également.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie über meine Interessen sprechen. Führen Sie einen Dialog mit mir über bevorzugte Hobbys, Aktivitäten, die mir Spaß machen und warum. Ermutigen Sie mich, Sie auch nach Ihren Hobbys zu fragen."
            }
            // message: `通过讨论兴趣爱好来帮助我练习{lang}。与我进行关于喜欢的兴趣爱好、喜欢的活动及其原因的对话。鼓励我也询问你的兴趣爱好。`
        },
        {
            heading: '朋友聚会',
            subheading: '聚会',
            message: {
                "English": `Help me practice {lang} by role-playing a friend's party scenario. Engage me in conversations about common topics such as recent activities, common interests, and making plans.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant le scénario de la fête d'un ami. Engagez la conversation sur des sujets communs tels que les activités récentes, les intérêts communs et les projets.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie das Szenario der Party eines Freundes im Rollenspiel nachspielen. Verwickeln Sie mich in Gespräche über gemeinsame Themen wie aktuelle Aktivitäten, gemeinsame Interessen und Pläne machen."
            }
            // message: `通过角色扮演朋友聚会场景来帮助我练习{lang}。与我进行关于最近的活动、共同兴趣和制定计划等常见话题的对话。`
        },
        {
            heading: '预订',
            subheading: '预订',
            message: {
                "English": `Help me practice {lang} by role-playing a booking scenario. You will play the role of a receptionist at a hotel or restaurant and I will play the role of the booker. Guide me through the dialogue of making a room or table reservation, including confirming the date, time and number of people.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant un scénario de réservation. Vous jouerez le rôle d'un réceptionniste dans un hôtel ou un restaurant et je jouerai le rôle du réservataire. Guidez-moi dans le dialogue de la réservation d'une chambre ou d'une table, y compris la confirmation de la date, de l'heure et du nombre de personnes.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie ein Rollenspiel zu einem Buchungsszenario machen. Sie spielen die Rolle eines Rezeptionisten in einem Hotel oder Restaurant und ich spiele die Rolle des Buchenden. Führen Sie mich durch den Dialog einer Zimmer- oder Tischreservierung, einschließlich der Bestätigung von Datum, Uhrzeit und Anzahl der Personen."
            }
            // message: `通过角色扮演预订场景来帮助我练习{lang}。你将扮演酒店或餐馆的接待员，而我将扮演预订者。引导我进行房间或餐桌预订的对话，包括确认日期、时间和人数。`
        },
        {
            heading: '打电话',
            subheading: '打电话',
            message: {
                "English": `Help me practice {lang} by role-playing a phone call scenario. You will play the role of the person answering the phone and I will play the role of the person making the call. Guide me through greetings, expressing needs, and problem solving.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant le scénario d'un appel téléphonique. Vous jouerez le rôle de la personne qui répond au téléphone et je jouerai le rôle de la personne qui appelle. Guidez-moi pour les salutations, l'expression des besoins et la résolution des problèmes.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie ein Rollenspiel zu einem Telefonanruf machen. Sie spielen die Rolle der Person, die den Anruf entgegennimmt, und ich spiele die Rolle der Person, die anruft. Leiten Sie mich durch die Begrüßung, das Äußern von Bedürfnissen und das Lösen von Problemen."
            }
            // message: `通过角色扮演打电话场景来帮助我练习{lang}。你将扮演接电话的人，而我将扮演打电话的人。引导我进行问候、表达需求和解决问题。`
        },
        {
            heading: '交通问路',
            subheading: '问路',
            message: {
                "English": `Help me practice {lang} by role-playing a wayfinding scenario. You will play the role of the passerby and I will play the role of the direction asker. Guide me in asking and understanding directions.`,
                "Français": "Aidez-moi à pratiquer le {lang} en jouant un scénario d'orientation. Vous jouerez le rôle du passant et moi celui du demandeur d'orientation. Guidez-moi pour demander et comprendre les directions.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie ein Rollenspiel zur Wegfindung durchführen. Sie spielen die Rolle des Passanten und ich spiele die Rolle des Fragenden. Leiten Sie mich an, nach dem Weg zu fragen und ihn zu verstehen."
            }
            // message: `通过角色扮演问路场景来帮助我练习{lang}。你将扮演路人，而我将扮演问路者。引导我询问和理解方向。`
        },
        {
            heading: '职场沟通',
            subheading: '职场沟通',
            message: {
                "English": `Help me practice {lang} by role-playing workplace communication scenarios. Guide me through a dialogue with a colleague, supervisor or client, including discussing projects, giving feedback and dealing with problems.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant des scénarios de communication sur le lieu de travail. Guidez-moi dans un dialogue avec un collègue, un superviseur ou un client, notamment en discutant de projets, en donnant un retour d'information et en traitant des problèmes.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie Kommunikationsszenarien am Arbeitsplatz in Rollenspielen durchspielen. Führen Sie mich durch einen Dialog mit einem Kollegen, Vorgesetzten oder Kunden, in dem Sie Projekte besprechen, Feedback geben und mit Problemen umgehen."
            }
            // message: `通过角色扮演职场沟通的场景来帮助我练习{lang}。引导我进行与同事、上司或客户的对话，包括讨论项目、反馈意见和处理问题。`
        },
        {
            heading: '休闲娱乐',
            subheading: '休闲娱乐',
            message: {
                "English": `Help me practice {lang} by discussing leisure and recreational activities. Lead me to talk about favourite leisure activities, plans and past experiences.`,
                "Français": "Aidez-moi à pratiquer le {lang} en discutant des loisirs et des activités récréatives. Amenez-moi à parler de mes loisirs préférés, de mes projets et de mes expériences passées.",
                "Deutsch": "Helfen Sie mir, {lang} zu üben, indem Sie über Freizeit- und Erholungsaktivitäten sprechen. Bringen Sie mich dazu, über Lieblingsfreizeitaktivitäten, Pläne und vergangene Erfahrungen zu sprechen."
            }
            // message: `通过讨论休闲娱乐活动来帮助我练习{lang}。引导我谈论喜欢的休闲活动、计划和过去的经历。`
        },
        {
            heading: '结交新朋友',
            subheading: '新朋友',
            message: {
                "English": `Help me practice {lang} by role-playing scenarios of making new friends. Guide me to introduce myself, ask about the person's interests and share some personal information.`,
                "Français": "Aidez-moi à pratiquer {lang} en jouant des scénarios pour me faire de nouveaux amis. Guidez-moi pour me présenter, m'enquérir des centres d'intérêt de la personne et partager quelques informations personnelles.",
                "Deutsch": "Helfen Sie mir, {lang} in Rollenspielen zu üben, in denen ich neue Freunde kennenlerne. Leiten Sie mich an, mich vorzustellen, nach den Interessen der Person zu fragen und einige persönliche Informationen zu teilen."
            }
            // message: `通过角色扮演结交新朋友的场景来帮助我练习{lang}。引导我进行自我介绍、询问对方的兴趣爱好和分享一些个人信息。`
        },
    ]

    React.useEffect(() => {
        ;(async () => {
            // const chatId = path.includes('chat') ? path.split('/').pop() : 'default';
            const userData = loadUserCookies(userId);
            console.log("sssssssssssss");
            console.log(userData);
            if (userData) {
                if (userData.hasOwnProperty("scene")) {
                    setScene(userData["scene"]);
                }
            }
        })()
    }, [])

    return (
        <>
            <Dialog.Root {...props}>
                <Dialog.Trigger asChild>
                    <div
                        key={"choosingTeacher"}
                        className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}
                        // onClick={async () => {
                        // }}
                    >
                        <div className="text-sm font-semibold mb-2">场景</div>
                        <div className="text-sm text-zinc-600 items-center flex flex-col">
                            {exampleMessages[scene].heading.replaceAll('{lang}', ChineseLangs[lang])}
                        </div>
                    </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className="z-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%] w-full h-full bg-blackA6 fixed inset-0"/>
                    <Dialog.Content
                        className="z-50 max-md:w-[85vw] min-w-[60vw] max-w-[95vw] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                            场景
                        </Dialog.Title>
                        <Dialog.Description className="text-mauve11 mt-[10px] mb-1 text-[15px] leading-normal">
                            <span className={"flex items-center"}>
                                {"请选择场景。"}
                            </span>
                        </Dialog.Description>

                        <div className="grid grid-cols-5 gap-2 max-md:grid-cols-2">
                            {
                                exampleMessages.map((example, index) => (
                                    <Dialog.Close asChild key={example.heading}>
                                        <div
                                            className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                                                index > 1 && 'md:block'
                                            }`}
                                            onClick={async () => {
                                                setScene(index);
                                                updateUserCookies(userId, "scene", index)
                                            }}
                                        >
                                            <div className="text-sm font-semibold">{example.heading.replaceAll('{lang}', ChineseLangs[lang])}</div>
                                            <div className="text-sm text-zinc-600">
                                                {/*{example.subheading}*/}
                                            </div>
                                        </div>
                                    </Dialog.Close>
                                ))
                            }
                        </div>
                        <Dialog.Close asChild>
                            <button
                                className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                                aria-label="Close"
                            >
                                <Cross2Icon/>
                            </button>
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    )
});

SceneDialog.displayName = "SceneDialog";
