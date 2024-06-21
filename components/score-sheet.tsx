'use client'

import * as React from 'react'
import {type CollapsibleProps} from '@radix-ui/react-collapsible'
import {forwardRef, useImperativeHandle} from "react";
import {useStreamableText} from "@/lib/hooks/use-streamable-text";
import * as Accordion from '@radix-ui/react-accordion';
import {ChevronDownIcon} from '@radix-ui/react-icons';
import {cn} from "@/lib/utils";
import {readStreamableValue} from "ai/rsc";
import {spinner} from "@/components/stocks";
import {Chat} from "@/lib/types";
import {TTSButton} from "@/components/tts-button";
import {Separator} from "@/components/ui/separator";

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

const AccordionTrigger = forwardRef(({children, className, ...props}, forwardedRef) => (
    <Accordion.Header  className="flex">
        <Accordion.Trigger
            className={cn(
                'cursor-pointer text-violet11 shadow-mauve6 hover:bg-mauve2 group flex h-[45px] flex-1 items-center justify-between bg-white px-5 text-[15px] leading-none shadow-[0_1px_0] outline-none',
                className
            )}
            {...props}
            ref={forwardedRef}
        >
            {children}
            <ChevronDownIcon
                className="text-violet10 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
                aria-hidden
            />
        </Accordion.Trigger>
    </Accordion.Header>
));

const AccordionContent = forwardRef(({children, className, ...props}, forwardedRef) => (
    <Accordion.Content
        className={cn(
            'text-mauve11 bg-mauve2 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden text-[15px]',
            className
        )}
        {...props}
        ref={forwardedRef}
    >
        <div className="py-[15px] px-5">{children}</div>
    </Accordion.Content>
));

export const ScoreSheet = forwardRef(({
                                          summaryString,
                                          chat,
                                          ...props
                                      }: ScoreSheetProps, ref) => {

    // React.useEffect(() => {
    //     ;(async () => {
    //     })()
    //
    // }, [summaryString])

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
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-1">
                        {typeof summaryString === 'string' ? (spinner) : (
                            <>
                                {summaryString['vocab'].map((word, index) => {
                                    return (
                                        <div className={"flex"}>
                                            <div key={index}>
                                                <h1>
                                                    {word.word}
                                                </h1>
                                                <div className={"flex items-center"}>
                                                    {word.phonogram} <TTSButton text={word.word} chat={chat}/>
                                                </div>

                                                <div className={"flex items-center"}>
                                                    <span className={"border-1 bg-amber-50 mr-2.5"}>{word.category}</span>
                                                    <span>{word.explanation}</span>
                                                </div>

                                                <div className={"mt-1.5"}>
                                                    <div>例句:</div>
                                                    <div>{word.sentence}</div>
                                                </div>

                                            </div>
                                            <Separator className={"ml-1.5 pr-0.5"} orientation={'vertical'}/>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-review">
                <AccordionTrigger>回顾</AccordionTrigger>
                <AccordionContent>
                    {typeof summaryString === 'string' ? (spinner) : (
                        <>{summaryString['review']}</>
                    )}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-summary">
                <AccordionTrigger>总结</AccordionTrigger>
                <AccordionContent>
                    {typeof summaryString === 'string' ? (spinner) : (
                        <>
                            <div>
                                {summaryString['summary']['content']}
                            </div>
                            <Separator/>
                            <div className="mt-1 grid grid-cols-2 gap-1">
                                <div className={"flex flex-col"}>
                                    <div>优势:</div>
                                    {summaryString['summary']['strengths'].map((s, index) => {
                                        return (
                                            <div key={`s${index}`}>{s}</div>
                                        )
                                    })}
                                </div>

                                <div className={"flex flex-col"}>
                                    <div>劣势:</div>
                                    {summaryString['summary']['weaknesses'].map((w, index) => {
                                        return (
                                            <div key={`w${index}`}>{w}</div>
                                        )
                                    })}

                                </div>
                            </div>
                        </>
                    )}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-evaluation">
                <AccordionTrigger>评价</AccordionTrigger>
                <AccordionContent>
                    {typeof summaryString === 'string' ? (spinner) : (
                        <div>
                            <span>{summaryString['evaluation']}</span>
                            <span className={"float-right"}>分数: {summaryString['score']}</span>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion.Root>
    )
});

ScoreSheet.displayName = "ScoreSheet";

