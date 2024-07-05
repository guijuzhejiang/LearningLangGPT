'use client'

import * as React from 'react'
import {type CollapsibleProps} from '@radix-ui/react-collapsible'
import {forwardRef, useEffect, useImperativeHandle} from "react";
import * as Accordion from '@radix-ui/react-accordion';
import {ChevronDownIcon} from '@radix-ui/react-icons';
import {cn} from "@/lib/utils";
import * as ScrollArea from '@radix-ui/react-scroll-area';
import {spinner} from "@/components/stocks";
import {Chat} from "@/lib/types";
import {TTSButton} from "@/components/tts-button";
import {Separator} from "@/components/ui/separator";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {readStreamableValue, useActions} from "ai/rsc";
import {IconTranslate} from "@/components/ui/icons";
import {getTranslate} from "@/app/actions";

interface ScoreSheetProps extends CollapsibleProps {
    summaryString: object | string
    chat: Chat
}


const AccordionItem = forwardRef(({children, className, ...props}, forwardedRef) => (
    <Accordion.Item
        className={cn(
            'focus-within:shadow-mauve12 mt-px overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10',
            className
        )}
        {...props}
        ref={forwardedRef}
    >
        {children}
    </Accordion.Item>
));

AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = forwardRef(({children, className,btn, ...props}, forwardedRef) => (
    <Accordion.Header className="flex">

        <Accordion.Trigger
            className={cn(
                'cursor-pointer text-violet11 shadow-mauve6 hover:bg-mauve2 group flex h-[45px] flex-1 items-center justify-between bg-white px-5 text-[15px] leading-none shadow-[0_1px_0] outline-none',
                className
            )}
            {...props}
            ref={forwardedRef}
        >
            <div className={"flex items-center"}>
                {children}
                {btn}
            </div>

            <ChevronDownIcon
                className="text-violet10 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
                aria-hidden
            />

        </Accordion.Trigger>
    </Accordion.Header>
));

AccordionTrigger.displayName = "AccordionTrigger";


const AccordionContent = forwardRef(({children, className, ...props}, forwardedRef) => (
    <Accordion.Content
        className={cn(
            'text-mauve11 bg-mauve2 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden text-[15px]',
            className
        )}
        {...props}
        ref={forwardedRef}
    >
        <div className="py-2.5 px-5">{children}</div>
    </Accordion.Content>
));

AccordionContent.displayName = "AccordionContent";


const WordItem = ({word,chat, ...props}:{word:{word:string, explanation:string, phonogram:string, category:string, sentence:string},chat:Chat}) => {
    const [transTexts, setTransTexts] = React.useState<string | undefined>('')
    const [showTranslate, setShowTranslate] = React.useState<boolean>(false)
    // const [refreshKey, setRefreshKey] = React.useState<number>(0)


    React.useEffect(() => {
        // console.log(words);
        // setRefreshKey(refreshKey + 1);
    }, [])

    return (
        <>
            <div className={"flex flex-shrink-0 max-w-64"}>
                <div>
                    <h3 className={"mt-0.5 mb-0.5 font-bold text-xl"}>
                        {word.word}
                    </h3>
                    <div className={"flex items-center"}>
                        {word.phonogram} <TTSButton text={word.word} chat={chat}/>
                    </div>

                    <div className={"flex items-center"}>
                                            <span
                                                className={"p-0.5 border-0 border-solid border-black rounded bg-amber-50 mr-2.5"}>{word.category}</span>
                        <span>{word.explanation}</span>
                    </div>

                    <div className={"mt-1.5"}>
                        <div>例句:</div>
                        <div>{word.sentence}</div>
                        <div
                            className={`${showTranslate ? '' : 'hidden'}`}>{transTexts?.length === 0 ? (
                            <>{spinner}</>
                        ) : (
                            <span className={`bg-green5 bg-opacity-40`}>
                                                    {transTexts}
                                                </span>
                        )}</div>
                        <div className={"items-center flex"}>
                            <TTSButton text={word.sentence} chat={chat}/>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={`bg-blue-50 hover:bg-blue-200 size-6 rounded-full p-0 mr-1`}
                                        onClick={async () => {
                                            setShowTranslate(true);
                                            const translatedText = await getTranslate(word.sentence);
                                            if (typeof translatedText === 'object') {
                                                let value = ''
                                                for await (const delta of readStreamableValue(translatedText)) {
                                                    if (typeof delta === 'string') {
                                                        setTransTexts((value = value + delta))
                                                    }
                                                }
                                            } else {
                                                setTransTexts(translatedText)
                                            }
                                        }}
                                    >
                                        <IconTranslate className="size-6"/>
                                        <span className="sr-only">翻译</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>翻译</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                </div>
                <Separator className={"mr-4 ml-4 pr-0.5"} orientation={'vertical'}/>
            </div>
        </>
    )
}

WordItem.displayName = "WordItem";

export const ScoreSheet = forwardRef(({
                                          summaryString,
                                          chat,
                                          ...props
                                      }: ScoreSheetProps, ref) => {


    return (
        <Accordion.Root
            className="border-1 p-0.5  bg-mauve6 rounded-md shadow-[0_2px_10px] shadow-black/5"
            type="multiple"
            defaultValue={["item-vocab", "item-review", "item-summary", "item-score", "item-evaluation",]}
            collapsible
        >
            <AccordionItem value="item-vocab">
                <AccordionTrigger>单词</AccordionTrigger>
                <AccordionContent>

                            <ScrollArea.Root className="">
                                <ScrollArea.Viewport className="w-full h-full rounded">
                                    <div className={"flex pb-3.5"}>
                                        <div className="flex flex-nowrap">
                                            {typeof summaryString === 'string' ? (spinner) : (
                                                summaryString.vocab.map((word, index) => (
                                                        <div
                                                            key={"wi"+index}
                                                            className="flex shrink-0 flex-col gap-1 rounded-lg p-4"
                                                        >
                                                            <WordItem word={word} chat={chat}/>
                                                        </div>
                                                ))
                                            )}

                                        </div>
                                    </div>
                                </ScrollArea.Viewport>
                                <ScrollArea.Scrollbar
                                    className="flex select-none touch-none p-0.5 bg-blackA3 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                                    orientation="vertical"
                                >
                                    <ScrollArea.Thumb className="flex-1 bg-mauve10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                                </ScrollArea.Scrollbar>
                                <ScrollArea.Scrollbar
                                    className="flex select-none touch-none p-0.5 bg-blackA3 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                                    orientation="horizontal"
                                >
                                    <ScrollArea.Thumb className="flex-1 bg-mauve10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                                </ScrollArea.Scrollbar>
                                <ScrollArea.Corner className="bg-blackA5" />
                            </ScrollArea.Root>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-review">
                <AccordionTrigger
                    // btn={
                    //     <TTSButton lang={"zh-cn"} text={summaryString ? `${summaryString['review']}`:''} chat={chat}/>
                    // }
                >
                    回顾
                </AccordionTrigger>
                <AccordionContent>
                    {typeof summaryString === 'string' ? (spinner) : (
                        <div className={"flex items-center"}>
                            <span>{summaryString['review']}</span>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-summary">
                <AccordionTrigger
                    // btn={
                    //     <TTSButton lang={"zh-cn"} text={summaryString ? `${summaryString['summary']['content']}优势:${summaryString['summary']['strengths']}劣势:${summaryString['summary']['weaknesses']}`:''} chat={chat}/>
                    // }
                >
                    总结
                </AccordionTrigger>
                <AccordionContent>
                    {typeof summaryString === 'string' ? (spinner) : (
                        <>
                            <div className={"py-1.5"}>
                                {summaryString['summary']['content']}
                            </div>
                            <Separator/>
                            <div className="mt-2 grid grid-cols-2 gap-1">
                                <div>
                                    <div className={"pb-1"}>优势:</div>
                                    <ul className={"pl-5 list-disc space-y-1"}>
                                        {summaryString['summary']['strengths'].map((s, index) => {
                                            return (
                                                <li key={`s${index}`}>{s}</li>
                                            )
                                        })}
                                    </ul>
                                </div>

                                <div className={"flex flex-col"}>
                                    <div className={"pb-1"}>劣势:</div>
                                    <ul className={"pl-5 list-disc space-y-1"}>
                                        {summaryString['summary']['weaknesses'].map((w, index) => {
                                            return (
                                                <li key={`w${index}`}>{w}</li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-evaluation">
                <AccordionTrigger
                    // btn={
                    //     <TTSButton lang={"zh-cn"} text={summaryString ? `${summaryString['evaluation']}分数:${summaryString['score']}`:''} chat={chat}/>
                    // }
                >
                    评价
                </AccordionTrigger>
                <AccordionContent>
                    {typeof summaryString === 'string' ? (spinner) : (
                        <div className={"flex items-center justify-between"}>
                            <span className={"flex flex-grow pr-4"}>{summaryString['evaluation']}</span>
                            <span className={"flex items-center w-fit flex-shrink-0"}>
                                <span className={"flex font-bold text-md"}>分数:</span>
                                <span className={"font-bold text-2xl text-red-500"}>{summaryString['score']}</span>
                            </span>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion.Root>
    )
});

ScoreSheet.displayName = "ScoreSheet";

