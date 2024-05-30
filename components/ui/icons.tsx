'use client'

import * as React from 'react'

import {cn} from '@/lib/utils'

function IconNextChat({
                          className,
                          inverted,
                          ...props
                      }: React.ComponentProps<'svg'> & { inverted?: boolean }) {
    const id = React.useId()

    return (
        <svg
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('size-4', className)}
            {...props}
        >
            <defs>
                <linearGradient
                    id={`gradient-${id}-1`}
                    x1="10.6889"
                    y1="10.3556"
                    x2="13.8445"
                    y2="14.2667"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={inverted ? 'white' : 'black'}/>
                    <stop
                        offset={1}
                        stopColor={inverted ? 'white' : 'black'}
                        stopOpacity={0}
                    />
                </linearGradient>
                <linearGradient
                    id={`gradient-${id}-2`}
                    x1="11.7555"
                    y1="4.8"
                    x2="11.7376"
                    y2="9.50002"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={inverted ? 'white' : 'black'}/>
                    <stop
                        offset={1}
                        stopColor={inverted ? 'white' : 'black'}
                        stopOpacity={0}
                    />
                </linearGradient>
            </defs>
            <path
                d="M1 16L2.58314 11.2506C1.83084 9.74642 1.63835 8.02363 2.04013 6.39052C2.4419 4.75741 3.41171 3.32057 4.776 2.33712C6.1403 1.35367 7.81003 0.887808 9.4864 1.02289C11.1628 1.15798 12.7364 1.8852 13.9256 3.07442C15.1148 4.26363 15.842 5.83723 15.9771 7.5136C16.1122 9.18997 15.6463 10.8597 14.6629 12.224C13.6794 13.5883 12.2426 14.5581 10.6095 14.9599C8.97637 15.3616 7.25358 15.1692 5.74942 14.4169L1 16Z"
                fill={inverted ? 'black' : 'white'}
                stroke={inverted ? 'black' : 'white'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <mask
                id="mask0_91_2047"
                style={{maskType: 'alpha'}}
                maskUnits="userSpaceOnUse"
                x={1}
                y={0}
                width={16}
                height={16}
            >
                <circle cx={9} cy={8} r={8} fill={inverted ? 'black' : 'white'}/>
            </mask>
            <g mask="url(#mask0_91_2047)">
                <circle cx={9} cy={8} r={8} fill={inverted ? 'black' : 'white'}/>
                <path
                    d="M14.2896 14.0018L7.146 4.8H5.80005V11.1973H6.87681V6.16743L13.4444 14.6529C13.7407 14.4545 14.0231 14.2369 14.2896 14.0018Z"
                    fill={`url(#gradient-${id}-1)`}
                />
                <rect
                    x="11.2222"
                    y="4.8"
                    width="1.06667"
                    height="6.4"
                    fill={`url(#gradient-${id}-2)`}
                />
            </g>
        </svg>
    )
}

function IconOpenAI({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('size-4', className)}
            {...props}
        >
            <title>OpenAI icon</title>
            <path
                d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
        </svg>
    )
}

function IconVercel({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            aria-label="Vercel logomark"
            role="img"
            viewBox="0 0 74 64"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
                fill="currentColor"
            ></path>
        </svg>
    )
}

function IconGitHub({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <title>GitHub</title>
            <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
    )
}

function IconSeparator({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            fill="none"
            shapeRendering="geometricPrecision"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn('size-4', className)}
            {...props}
        >
            <path d="M16.88 3.549L7.12 20.451"></path>
        </svg>
    )
}

function IconArrowDown({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="m205.66 149.66-72 72a8 8 0 0 1-11.32 0l-72-72a8 8 0 0 1 11.32-11.32L120 196.69V40a8 8 0 0 1 16 0v156.69l58.34-58.35a8 8 0 0 1 11.32 11.32Z"/>
        </svg>
    )
}

function IconArrowRight({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="m221.66 133.66-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z"/>
        </svg>
    )
}

function IconUser({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8ZM72 96a56 56 0 1 1 56 56 56.06 56.06 0 0 1-56-56Z"/>
        </svg>
    )
}

function IconPlus({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8Z"/>
        </svg>
    )
}

function IconArrowElbow({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M200 32v144a8 8 0 0 1-8 8H67.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L67.31 168H184V32a8 8 0 0 1 16 0Z"/>
        </svg>
    )
}

function IconMicroPhone({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 384 512"
             fill="currentColor"
             className={cn('size-4', className)}
             {...props}
        >
            <path
                d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"/>
        </svg>
    )
}

function IconPlayMedia({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg viewBox="0 0 24 24"
             fill="currentColor"
             className={cn('size-8', className)}
             xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M11.0748 7.50835C9.74622 6.72395 8.25 7.79065 8.25 9.21316V14.7868C8.25 16.2093 9.74622 17.276 11.0748 16.4916L15.795 13.7048C17.0683 12.953 17.0683 11.047 15.795 10.2952L11.0748 7.50835ZM9.75 9.21316C9.75 9.01468 9.84615 8.87585 9.95947 8.80498C10.0691 8.73641 10.1919 8.72898 10.3122 8.80003L15.0324 11.5869C15.165 11.6652 15.25 11.8148 15.25 12C15.25 12.1852 15.165 12.3348 15.0324 12.4131L10.3122 15.2C10.1919 15.271 10.0691 15.2636 9.95947 15.195C9.84615 15.1242 9.75 14.9853 9.75 14.7868V9.21316Z"
                      fill="#1C274C"></path>
                <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
                      fill="#1C274C"></path>
            </g>
        </svg>
    )
}

// function IconStop({className, ...props}: React.ComponentProps<'svg'>) {
//     return (
//         <svg viewBox="0 0 24 24"
//              fill="currentColor"
//              className={cn('size-8', className)}
//              xmlns="http://www.w3.org/2000/svg"
//         >
//             <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
//             <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
//             <g id="SVGRepo_iconCarrier">
//                 <path fill-rule="evenodd" clip-rule="evenodd"
//                       d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75ZM1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12ZM11.948 7.25H12.052C12.9505 7.24997 13.6997 7.24995 14.2945 7.32991C14.9223 7.41432 15.4891 7.59999 15.9445 8.05546C16.4 8.51093 16.5857 9.07773 16.6701 9.70552C16.7501 10.3003 16.75 11.0495 16.75 11.948V12.052C16.75 12.9505 16.7501 13.6997 16.6701 14.2945C16.5857 14.9223 16.4 15.4891 15.9445 15.9445C15.4891 16.4 14.9223 16.5857 14.2945 16.6701C13.6997 16.7501 12.9505 16.75 12.052 16.75H11.948C11.0495 16.75 10.3003 16.7501 9.70552 16.6701C9.07773 16.5857 8.51093 16.4 8.05546 15.9445C7.59999 15.4891 7.41432 14.9223 7.32991 14.2945C7.24995 13.6997 7.24997 12.9505 7.25 12.052V11.948C7.24997 11.0495 7.24995 10.3003 7.32991 9.70552C7.41432 9.07773 7.59999 8.51093 8.05546 8.05546C8.51093 7.59999 9.07773 7.41432 9.70552 7.32991C10.3003 7.24995 11.0495 7.24997 11.948 7.25ZM9.90539 8.81654C9.44393 8.87858 9.24643 8.9858 9.11612 9.11612C8.9858 9.24643 8.87858 9.44393 8.81654 9.90539C8.75159 10.3884 8.75 11.036 8.75 12C8.75 12.964 8.75159 13.6116 8.81654 14.0946C8.87858 14.5561 8.9858 14.7536 9.11612 14.8839C9.24643 15.0142 9.44393 15.1214 9.90539 15.1835C10.3884 15.2484 11.036 15.25 12 15.25C12.964 15.25 13.6116 15.2484 14.0946 15.1835C14.5561 15.1214 14.7536 15.0142 14.8839 14.8839C15.0142 14.7536 15.1214 14.5561 15.1835 14.0946C15.2484 13.6116 15.25 12.964 15.25 12C15.25 11.036 15.2484 10.3884 15.1835 9.90539C15.1214 9.44393 15.0142 9.24643 14.8839 9.11612C14.7536 8.9858 14.5561 8.87858 14.0946 8.81654C13.6116 8.75159 12.964 8.75 12 8.75C11.036 8.75 10.3884 8.75159 9.90539 8.81654Z"
//                       fill="#1C274C"></path>
//             </g>
//         </svg>
//     )
// }

function IconSpinner({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4 animate-spin', className)}
            {...props}
        >
            <path
                d="M232 128a104 104 0 0 1-208 0c0-41 23.81-78.36 60.66-95.27a8 8 0 0 1 6.68 14.54C60.15 61.59 40 93.27 40 128a88 88 0 0 0 176 0c0-34.73-20.15-66.41-51.34-80.73a8 8 0 0 1 6.68-14.54C208.19 49.64 232 87 232 128Z"/>
        </svg>
    )
}

function IconMessage({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M216 48H40a16 16 0 0 0-16 16v160a15.84 15.84 0 0 0 9.25 14.5A16.05 16.05 0 0 0 40 240a15.89 15.89 0 0 0 10.25-3.78.69.69 0 0 0 .13-.11L82.5 208H216a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16ZM40 224Zm176-32H82.5a16 16 0 0 0-10.3 3.75l-.12.11L40 224V64h176Z"/>
        </svg>
    )
}

function IconTrash({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16ZM96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Zm48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0Z"/>
        </svg>
    )
}

function IconRefresh({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M197.67 186.37a8 8 0 0 1 0 11.29C196.58 198.73 170.82 224 128 224c-37.39 0-64.53-22.4-80-39.85V208a8 8 0 0 1-16 0v-48a8 8 0 0 1 8-8h48a8 8 0 0 1 0 16H55.44C67.76 183.35 93 208 128 208c36 0 58.14-21.46 58.36-21.68a8 8 0 0 1 11.31.05ZM216 40a8 8 0 0 0-8 8v23.85C192.53 54.4 165.39 32 128 32c-42.82 0-68.58 25.27-69.66 26.34a8 8 0 0 0 11.3 11.34C69.86 69.46 92 48 128 48c35 0 60.24 24.65 72.56 40H168a8 8 0 0 0 0 16h48a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8Z"/>
        </svg>
    )
}

function IconStop({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Zm24-120h-48a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h48a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8Zm-8 48h-32v-32h32Z"/>
        </svg>
    )
}

function IconSidebar({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16ZM40 56h40v144H40Zm176 144H96V56h120v144Z"/>
        </svg>
    )
}

function IconMoon({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M233.54 142.23a8 8 0 0 0-8-2 88.08 88.08 0 0 1-109.8-109.8 8 8 0 0 0-10-10 104.84 104.84 0 0 0-52.91 37A104 104 0 0 0 136 224a103.09 103.09 0 0 0 62.52-20.88 104.84 104.84 0 0 0 37-52.91 8 8 0 0 0-1.98-7.98Zm-44.64 48.11A88 88 0 0 1 65.66 67.11a89 89 0 0 1 31.4-26A106 106 0 0 0 96 56a104.11 104.11 0 0 0 104 104 106 106 0 0 0 14.92-1.06 89 89 0 0 1-26.02 31.4Z"/>
        </svg>
    )
}

function IconSun({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0Zm72 88a64 64 0 1 1-64-64 64.07 64.07 0 0 1 64 64Zm-16 0a48 48 0 1 0-48 48 48.05 48.05 0 0 0 48-48ZM58.34 69.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32ZM192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72Zm5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8Zm80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8Zm112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16Z"/>
        </svg>
    )
}

function IconCopy({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8Zm-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"/>
        </svg>
    )
}

function IconCheck({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z"/>
        </svg>
    )
}

function IconDownload({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0Zm-101.66 5.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0-11.32-11.32L136 132.69V40a8 8 0 0 0-16 0v92.69l-26.34-26.35a8 8 0 0 0-11.32 11.32Z"/>
        </svg>
    )
}

function IconClose({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128 50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"/>
        </svg>
    )
}

function IconEdit({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
        </svg>
    )
}

function IconShare({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={cn('size-4', className)}
            viewBox="0 0 256 256"
            {...props}
        >
            <path
                d="m237.66 106.35-80-80A8 8 0 0 0 144 32v40.35c-25.94 2.22-54.59 14.92-78.16 34.91-28.38 24.08-46.05 55.11-49.76 87.37a12 12 0 0 0 20.68 9.58c11-11.71 50.14-48.74 107.24-52V192a8 8 0 0 0 13.66 5.65l80-80a8 8 0 0 0 0-11.3ZM160 172.69V144a8 8 0 0 0-8-8c-28.08 0-55.43 7.33-81.29 21.8a196.17 196.17 0 0 0-36.57 26.52c5.8-23.84 20.42-46.51 42.05-64.86C99.41 99.77 127.75 88 152 88a8 8 0 0 0 8-8V51.32L220.69 112Z"/>
        </svg>
    )
}

function IconUsers({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={cn('size-4', className)}
            viewBox="0 0 256 256"
            {...props}
        >
            <path
                d="M117.25 157.92a60 60 0 1 0-66.5 0 95.83 95.83 0 0 0-47.22 37.71 8 8 0 1 0 13.4 8.74 80 80 0 0 1 134.14 0 8 8 0 0 0 13.4-8.74 95.83 95.83 0 0 0-47.22-37.71ZM40 108a44 44 0 1 1 44 44 44.05 44.05 0 0 1-44-44Zm210.14 98.7a8 8 0 0 1-11.07-2.33A79.83 79.83 0 0 0 172 168a8 8 0 0 1 0-16 44 44 0 1 0-16.34-84.87 8 8 0 1 1-5.94-14.85 60 60 0 0 1 55.53 105.64 95.83 95.83 0 0 1 47.22 37.71 8 8 0 0 1-2.33 11.07Z"/>
        </svg>
    )
}

function IconExternalLink({
                              className,
                              ...props
                          }: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={cn('size-4', className)}
            viewBox="0 0 256 256"
            {...props}
        >
            <path
                d="M224 104a8 8 0 0 1-16 0V59.32l-66.33 66.34a8 8 0 0 1-11.32-11.32L196.68 48H152a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Zm-40 24a8 8 0 0 0-8 8v72H48V80h72a8 8 0 0 0 0-16H48a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-72a8 8 0 0 0-8-8Z"/>
        </svg>
    )
}

function IconChevronUpDown({
                               className,
                               ...props
                           }: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={cn('size-4', className)}
            viewBox="0 0 256 256"
            {...props}
        >
            <path
                d="M181.66 170.34a8 8 0 0 1 0 11.32l-48 48a8 8 0 0 1-11.32 0l-48-48a8 8 0 0 1 11.32-11.32L128 212.69l42.34-42.35a8 8 0 0 1 11.32 0Zm-96-84.68L128 43.31l42.34 42.35a8 8 0 0 0 11.32-11.32l-48-48a8 8 0 0 0-11.32 0l-48 48a8 8 0 0 0 11.32 11.32Z"/>
        </svg>
    )
}

function IconTranslate({
                          className,
                          ...props
                      }: React.ComponentProps<'svg'>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg"
             fill="currentColor"
             className={cn('size-8', className)}
             viewBox="0 0 24 24"
             {...props}>
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier"><title>translate_line</title>
                <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="Editor" transform="translate(-192.000000, -96.000000)" fill-rule="nonzero">
                        <g id="translate_line" transform="translate(192.000000, 96.000000)">
                            <path
                                d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z"
                                id="MingCute" fill-rule="nonzero"></path>
                            <path
                                d="M17,11 C17.5523,11 18,11.4477 18,12 L18,13 L19.5,13 C20.3284,13 21,13.6716 21,14.5 L21,17.5 C21,18.3284 20.3284,19 19.5,19 L18,19 L18,20 C18,20.5523 17.5523,21 17,21 C16.4477,21 16,20.5523 16,20 L16,19 L14.5,19 C13.6716,19 13,18.3284 13,17.5 L13,14.5 C13,13.6716 13.6716,13 14.5,13 L16,13 L16,12 C16,11.4477 16.4477,11 17,11 Z M5,15 C5.55228,15 6,15.4477 6,16 L6,17 C6,17.5523 6.44772,18 7,18 L10,18 C10.5523,18 11,18.4477 11,19 C11,19.5523 10.5523,20 10,20 L7,20 C5.34315,20 4,18.6569 4,17 L4,16 C4,15.4477 4.44772,15 5,15 Z M19,15 L18,15 L18,17 L19,17 L19,15 Z M16,15 L15,15 L15,17 L16,17 L16,15 Z M9.5,3 C10.0523,3 10.5,3.44772 10.5,4 C10.5,4.55228 10.0523,5 9.5,5 L9.5,5 L5,5 L5,7 L9,7 C9.55228,7 10,7.44772 10,8 C10,8.55228 9.55228,9 9,9 L9,9 L5,9 L5,11 L10,11 C10.5523,11 11,11.4477 11,12 C11,12.5523 10.5523,13 10,13 L10,13 L4.1,13 C3.49249,13 3,12.5075 3,11.9 L3,11.9 L3,4.1 C3,3.49249 3.49249,3 4.1,3 L4.1,3 Z M17,4 C18.6569,4 20,5.34315 20,7 L20,7 L20,9 C20,9.55228 19.5523,10 19,10 C18.4477,10 18,9.55228 18,9 L18,9 L18,7 C18,6.44772 17.5523,6 17,6 L17,6 L14,6 C13.4477,6 13,5.55228 13,5 C13,4.44772 13.4477,4 14,4 L14,4 Z"
                                id="形状结合" fill="#09244B"></path>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}

function IconVoiceContinuation({
                                   className,
                                   ...props
                               }: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={cn('size-4', className)}
            viewBox="0 0 24 24"
            {...props}
        >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <g id="cycle">
                    <g>
                        <path
                            d="M17.1,23.8L12.4,21l2.7-4.8l1.7,1l-1.7,3.1l3,1.8L17.1,23.8z M5.7,11L4,8L1.1,9.7L0.1,8l4.7-2.8L7.5,10L5.7,11z"></path>
                    </g>
                    <g>
                        <polygon points="22,6 16.5,6 16.5,4 20,4 20,0.5 22,0.5 "></polygon>
                    </g>
                    <
                        g>
                        <path
                            d="M15.4,21.5l-0.4-2c4-0.9,6.9-4.5,6.9-8.6c0-0.6-0.1-1.3-0.2-1.9l2-0.4c0.2,0.8,0.3,1.6,0.3,2.3 C24,16.1,20.4,20.5,15.4,21.5z"></path>
                    </g>
                    <g>
                        <path
                            d="M9.8,21.3C5.3,19.9,2.2,15.8,2.2,11c0-1.3,0.2-2.6,0.7-3.8l1.9,0.7c-0.4,1-0.6,2-0.6,3.1c0,3.9,2.5,7.2,6.1,8.4L9.8,21.3z "></path>
                    </g>
                    <g>
                        <path
                            d="M19.6,5c-1.7-1.9-4.1-3-6.6-3c-2.1,0-4.1,0.8-5.7,2.1L6,2.6C7.9,0.9,10.4,0,13,0c3.1,0,6,1.3,8.1,3.6L19.6,5z"></path>
                    </g>
                </g>
            </g>
        </svg>
    )
}

export {
    IconEdit,
    IconNextChat,
    IconOpenAI,
    IconVercel,
    IconGitHub,
    IconSeparator,
    IconArrowDown,
    IconArrowRight,
    IconUser,
    IconPlus,
    IconArrowElbow,
    IconSpinner,
    IconMessage,
    IconTrash,
    IconRefresh,
    IconStop,
    IconSidebar,
    IconMoon,
    IconSun,
    IconCopy,
    IconCheck,
    IconDownload,
    IconClose,
    IconShare,
    IconUsers,
    IconExternalLink,
    IconMicroPhone,
    IconPlayMedia,
    IconTranslate,
    IconVoiceContinuation,
    IconChevronUpDown
}
