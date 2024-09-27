'use client'

import React, {useState, useTransition} from 'react'
import {Locale} from "@/config";
import {setUserLocale} from "@/services/locale";
import * as Select from "@radix-ui/react-select";
import {cn} from "@/lib/utils";
import {CheckIcon, LanguageIcon} from "@heroicons/react/24/solid";
import {Button} from "@/components/ui/button";
import {IconLang} from "@/components/ui/icons";
import Cookies from "js-cookie";

export async function LocaleSwitcherSelect({
                                        defaultValue,
                                        items,
                                        label
                                    }: {
    defaultValue: string;
    items: Array<{ value: string; label: string }>;
    label: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [selectedLocale, setSelectedLocale] = useState(items.findIndex(lang => lang.value === defaultValue));

    React.useEffect(() => {
        let browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.includes('zh')) {
          browserLang = 'zh-cn'
        } else {
            browserLang = 'en'
        }

        if (!Cookies.get('NEXT_LOCALE')) {
            setUserLocale(browserLang);

        }
        // const browserLang = navigator.language.toLowerCase();
        // if (locales.includes(browserLang)) {
        //   location.href = `${baseUrl + browserLang}`;
        // } else if (langs.includes(browserLang.split("-")[0])) {
        //   location.href = `${baseUrl + browserLang.split("-")[0]}`;
        // } else {
        //   location.href = `${baseUrl + defaultLocale}`;
        // }
    }, [])

    function onChange(value: string) {
        const locale = value as Locale;
        setSelectedLocale(items.findIndex(lang => lang.value === locale));
        startTransition(() => {
            setUserLocale(locale);
        });
    }

    return (
        // <Button className="relative">
        <Button
            variant="outline"
            className={"flex px-1"}
        >
            <Select.Root defaultValue={defaultValue} onValueChange={onChange}>
                <Select.Trigger
                    aria-label={label}
                    className={cn(
                        'rounded-sm p-2 transition-colors hover:bg-slate-200',
                        isPending && 'pointer-events-none opacity-60'
                    )}
                >
                    <div className={"flex text-primary items-center"}>
                        <IconLang/>
                        {items[selectedLocale].label}
                    </div>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content
                        align="end"
                        className="min-w-[8rem] overflow-hidden rounded-sm bg-white py-1 shadow-md"
                        position="popper"
                    >
                        <Select.Viewport>
                            {items.map((item) => (
                                <Select.Item
                                    key={item.value}
                                    className="flex cursor-default items-center px-3 py-2 text-base data-[highlighted]:bg-slate-100"
                                    value={item.value}
                                >
                                    <div className="mr-2 w-[1rem]">
                                        {item.value === defaultValue && (
                                            <CheckIcon className="h-5 w-5 text-slate-600"/>
                                        )}
                                    </div>
                                    <span className="text-slate-900">{item.label}</span>
                                </Select.Item>
                            ))}
                        </Select.Viewport>
                        <Select.Arrow className="fill-white text-white"/>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>
        </Button>
    );
}
