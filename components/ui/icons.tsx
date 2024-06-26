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
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M11 4.9099C11 4.47485 10.4828 4.24734 10.1621 4.54132L6.67572 7.7372C6.49129 7.90626 6.25019 8.00005 6 8.00005H4C3.44772 8.00005 3 8.44776 3 9.00005V15C3 15.5523 3.44772 16 4 16H6C6.25019 16 6.49129 16.0938 6.67572 16.2629L10.1621 19.4588C10.4828 19.7527 11 19.5252 11 19.0902V4.9099ZM8.81069 3.06701C10.4142 1.59714 13 2.73463 13 4.9099V19.0902C13 21.2655 10.4142 22.403 8.81069 20.9331L5.61102 18H4C2.34315 18 1 16.6569 1 15V9.00005C1 7.34319 2.34315 6.00005 4 6.00005H5.61102L8.81069 3.06701ZM20.3166 6.35665C20.8019 6.09313 21.409 6.27296 21.6725 6.75833C22.5191 8.3176 22.9996 10.1042 22.9996 12.0001C22.9996 13.8507 22.5418 15.5974 21.7323 17.1302C21.4744 17.6185 20.8695 17.8054 20.3811 17.5475C19.8927 17.2896 19.7059 16.6846 19.9638 16.1962C20.6249 14.9444 20.9996 13.5175 20.9996 12.0001C20.9996 10.4458 20.6064 8.98627 19.9149 7.71262C19.6514 7.22726 19.8312 6.62017 20.3166 6.35665ZM15.7994 7.90049C16.241 7.5688 16.8679 7.65789 17.1995 8.09947C18.0156 9.18593 18.4996 10.5379 18.4996 12.0001C18.4996 13.3127 18.1094 14.5372 17.4385 15.5604C17.1357 16.0222 16.5158 16.1511 16.0539 15.8483C15.5921 15.5455 15.4632 14.9255 15.766 14.4637C16.2298 13.7564 16.4996 12.9113 16.4996 12.0001C16.4996 10.9859 16.1653 10.0526 15.6004 9.30063C15.2687 8.85905 15.3578 8.23218 15.7994 7.90049Z"
                  fill="currentColor"></path>
        </svg>
    )
}

function IconHint({className, ...props}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-16 32 576 576"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}
        >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <g>
                    <path
                        d="M353.601,496.4c0,7.507-6.093,13.6-13.601,13.6H231.2c-7.507,0-13.6-6.093-13.6-13.6c0-7.508,6.093-13.601,13.6-13.601H340 C347.508,482.8,353.601,488.893,353.601,496.4z M340,516.8H231.2c-8.949,0-15.878,8.644-12.899,18.034 c1.795,5.664,7.527,9.166,13.471,9.166h0.204c7.854,0,15.035,4.44,18.55,11.465l0.143,0.286 c4.74,9.465,14.416,15.449,25.004,15.449h19.856c10.588,0,20.264-5.984,24.997-15.449l0.143-0.286 c3.516-7.024,10.696-11.465,18.55-11.465h0.204c5.943,0,11.676-3.502,13.471-9.166C355.878,525.443,348.949,516.8,340,516.8z M285.601,81.6c7.507,0,13.6-6.093,13.6-13.6V13.6c0-7.507-6.093-13.6-13.6-13.6C278.093,0,272,6.093,272,13.6V68 C272,75.507,278.093,81.6,285.601,81.6z M141.352,133.382c2.652,2.659,6.134,3.985,9.615,3.985c3.482,0,6.963-1.326,9.615-3.985 c5.311-5.311,5.311-13.92,0-19.23l-38.467-38.468c-5.304-5.311-13.927-5.311-19.23,0c-5.311,5.311-5.311,13.919,0,19.23 L141.352,133.382z M108.8,258.4c0-7.507-6.093-13.6-13.6-13.6H40.8c-7.507,0-13.6,6.093-13.6,13.6c0,7.507,6.093,13.6,13.6,13.6 h54.4C102.708,272,108.8,265.907,108.8,258.4z M141.352,383.418l-38.467,38.468c-5.311,5.311-5.311,13.92,0,19.23 c2.652,2.659,6.133,3.984,9.615,3.984c3.481,0,6.963-1.325,9.615-3.984l38.467-38.468c5.311-5.311,5.311-13.919,0-19.23 C155.278,378.107,146.656,378.107,141.352,383.418z M429.849,383.418c-5.311-5.311-13.92-5.311-19.23,0s-5.311,13.92,0,19.23 l38.468,38.468c2.658,2.659,6.134,3.984,9.615,3.984s6.956-1.325,9.615-3.984c5.311-5.311,5.311-13.92,0-19.23L429.849,383.418z M530.4,244.8H476c-7.507,0-13.6,6.093-13.6,13.6c0,7.507,6.093,13.6,13.6,13.6h54.4c7.507,0,13.6-6.093,13.6-13.6 C544,250.893,537.907,244.8,530.4,244.8z M420.233,137.367c3.481,0,6.956-1.326,9.615-3.985l38.468-38.468 c5.311-5.311,5.311-13.919,0-19.23c-5.311-5.311-13.92-5.311-19.23,0l-38.468,38.468c-5.311,5.311-5.311,13.919,0,19.23 C413.271,136.041,416.752,137.367,420.233,137.367z M353.601,462.4c0,7.507-6.093,13.6-13.601,13.6H231.2 c-7.507,0-13.6-6.093-13.6-13.6c0-7.242,5.678-13.11,12.818-13.519C221.952,372.354,142.8,355.307,142.8,265.2 c0-78.866,63.934-142.8,142.8-142.8c78.866,0,142.8,63.934,142.8,142.8c0,90.106-79.152,107.154-87.618,183.682 C347.922,449.29,353.601,455.158,353.601,462.4z M254.259,160.548c-2.115-5.216-8.051-7.725-13.287-5.624 c-34.755,14.083-61.104,44.186-70.482,80.525c-1.408,5.46,1.877,11.016,7.331,12.424c0.85,0.224,1.707,0.326,2.55,0.326 c4.542,0,8.684-3.053,9.874-7.65c7.766-30.11,29.594-55.053,58.385-66.715C253.851,171.721,256.367,165.777,254.259,160.548z"></path>
                </g>
            </g>
        </svg>
    )
}

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
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('size-4', className)}
            {...props}>
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM9.5 8.5C8.94772 8.5 8.5 8.94772 8.5 9.5V14.5C8.5 15.0523 8.94772 15.5 9.5 15.5H14.5C15.0523 15.5 15.5 15.0523 15.5 14.5V9.5C15.5 8.94772 15.0523 8.5 14.5 8.5H9.5Z"
                  fill="currentColor"></path>
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
             className={cn('size-4', className)}
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

function IconTeacher({
                           className,
                           ...props
                       }: React.ComponentProps<'svg'>) {
    return (
        <svg
            viewBox="0 0 31.312 31.312"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={cn('size-4', className)}
            {...props}>
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> <g> <g> <path
                d="M23.098,8.079c0-0.898-0.633-1.42-2.224-1.42c-0.319,0-0.742,0.023-1.351,0.063c-0.141,0.007-0.141,0.07-0.141,0.405 c0,0.164-0.016,0.344-0.156,2.193c-0.117,1.498-0.147,1.904-0.147,2.099c0,0.616,0.312,0.92,1.537,0.92 c1.911,0,2.481-0.795,2.481-1.748c0-0.593-0.228-1.045-0.828-1.233C22.909,9.195,23.098,8.57,23.098,8.079z M21.014,11.324 c-0.148,0-0.328-0.031-0.508-0.085l0.086-1.272c0.18-0.031,0.352-0.046,0.469-0.046c0.522,0,0.709,0.296,0.709,0.686 C21.77,10.903,21.661,11.324,21.014,11.324z M21.115,8.905c-0.141,0-0.289-0.023-0.445-0.063c0.031-0.421,0.047-0.795,0.062-1.068 c0.147-0.023,0.297-0.039,0.406-0.039c0.522,0,0.709,0.273,0.709,0.593C21.848,8.578,21.73,8.905,21.115,8.905z"></path>
                <path
                    d="M26.959,3.924c0.468,0,0.468,0.313,0.484,1.03c0,0.109,0.029,0.141,0.257,0.141c0.709,0,1.124-0.296,1.124-0.96 c0-0.772-0.562-1.405-1.795-1.405c-2.293,0-2.629,2.193-2.629,3.231c0,1.919,1.14,2.465,2.209,2.465 c1.067,0,1.623-0.546,1.707-0.897c0.07-0.289,0.117-0.53,0.117-0.694c0-0.148-0.039-0.234-0.156-0.234 c-0.327,0-0.584,0.608-1.442,0.608c-0.664,0-0.976-0.367-0.976-1.327C25.857,5.29,25.977,3.924,26.959,3.924z"></path>
                <path
                    d="M14.698,17.064h0.414c0.086,0,0.156-0.047,0.18-0.125l0.257-1.077h1.358c0.086,0.75,0.171,1.202,1.069,1.202h0.397 c0.14,0,0.21-0.039,0.21-0.188c0-0.257-0.21-1.124-1.046-4.486c-0.108-0.444-0.25-0.866-0.772-0.866h-0.742 c-0.187,0-0.217,0-0.303,0.148c-0.328,0.586-1.763,4.174-1.763,4.877C13.958,16.924,14.363,17.064,14.698,17.064z M16.398,12.672 l0.328,2.06H15.83L16.398,12.672z"></path>
                <polygon
                    points="2.931,0.463 2.931,3.415 4.221,3.018 4.221,1.752 30.023,1.752 30.023,18.199 9.491,18.199 9.424,19.49 31.312,19.49 31.312,0.463 "></polygon>
                <circle cx="4.984" cy="7.526" r="3.821"></circle>
                <polygon
                    points="8.228,29.104 8.228,22.302 8.228,21.661 8.228,20.791 8.471,20.791 8.825,13.885 15.416,10.471 14.55,8.8 8.525,11.921 6.375,11.921 4.917,13.611 3.509,11.921 0.417,12.338 0.214,19.363 1.527,19.363 1.597,20.791 1.797,20.791 1.797,21.661 1.797,22.302 1.797,29.104 1.534,29.104 0,29.436 0,30.85 1.306,30.85 2.83,30.602 2.844,30.85 4.531,30.85 4.531,29.275 4.531,29.104 4.531,22.302 5.493,22.302 5.493,29.104 5.493,29.275 5.493,30.85 7.182,30.85 7.195,30.602 8.718,30.85 10.024,30.85 10.024,29.436 8.491,29.104 "></polygon>
                <rect x="23.611" y="14.943" width="5.051" height="1.879"></rect> </g> </g> </g>
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

function IconScoreSheet({
                                   className,
                                   ...props
                               }: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={cn('size-4', className)}
            viewBox="0 0 48 48"
            stroke-width="2.8"
            {...props}
        >
            <g id="SVGRepo_bgCarrier" stroke-width="2"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <defs>
                    <style>{".a{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;}"}</style>
                </defs>
                <path className="a"
                      d="M39.5,30.8668V6.5a2,2,0,0,0-2-2h-27a2,2,0,0,0-2,2v35a2,2,0,0,0,2,2h27a2,2,0,0,0,2-2V40.0311"></path>
                <path className="a" d="M37.1342,37.66,21.2877,21.7746V17.25H25.92L41.7049,33.0776"></path>
                <path className="a"
                      d="M44.3148,37.9846a1.6234,1.6234,0,0,0,0-2.2906l-2.61-2.6164L37.1342,37.66l2.61,2.6164a1.6136,1.6136,0,0,0,2.2849,0Z"></path>
                <line className="a" x1="13" y1="10.5" x2="35" y2="10.5"></line>
                <line className="a" x1="13" y1="17.25" x2="21.2877" y2="17.25"></line>
                <line className="a" x1="32.6516" y1="24" x2="35" y2="24"></line>
                <line className="a" x1="13" y1="24" x2="23.5077" y2="24"></line>
                <line className="a" x1="13" y1="30.75" x2="29.989" y2="30.75"></line>
                <line className="a" x1="13" y1="37.5" x2="35" y2="37.5"></line>
            </g>
        </svg>
    )
}

function IconGuideBook({
                                   className,
                                   ...props
                               }: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            stroke="currentColor"
            className={cn('size-4', className)}
            viewBox="0 0 1000 1000"
            {...props}
        >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M971 152L526 55q-20-5-41-2-29 6-49 28L73 471q-34 37-52.5 84.5T2 653v16q0 52 30 93.5t79 57.5l427 146q24 8 48.5 1t40.5-27l352-432q10-13 7-30-5-19-16-40-10-16-11-26.5t0-21.5q1-6 4-20l3-10q3-16-3.5-28T939 317q-13-3-23 5-8 6-19 22-8 14-10.5 39t3.5 47q4 11 10 30 4 11-4 20L583 864q-8 9-20.5 13t-24.5 0L143 753q-27-9-44-31.5T82 670v-32q-2-20 6-33t22-17.5 28-.5l392 118q7 2 14 2h1q21 0 36-17l408-478q9-10 9-23v-2q0-12-7.5-22T971 152zM424 493q-16 18-42 26.5t-47 4-24.5-20 12.5-33 42-26 47-3.5 24.5 20-12.5 32zm323-217q-24 26-56 41-36 17-106 31-44 9-64 19-14 7-43 35-8 8-19 5l-12-3q-3-1-4-4t1-5q22-24 37-35 17-14 57-34.5t59-34.5l12-8q26-17 36-28 16-17 22.5-29t4-21.5-13-17T636 178q-18-4-35 1-7 1-14.5 5t-11 8-5.5 14l-1 5q-3 11-4 15-3 8-8 13-15 16-29 20-18 6-34.5 2.5T474 245q-1-8 0-17 3-11 10-19 13-14 35-24 18-8 48-17 28-8 59.5-9t59.5 5q55 13 71 45 7 16 6 33-2 19-16 34z"></path>
            </g>
        </svg>
    )
}

function IconExit({
                                   className,
                                   ...props
                               }: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            strokeWidth="5"
            stroke="#000000"
            fill="none"
            className={cn('size-4', className)}
            viewBox="-4 0 60 60"
            {...props}
        >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <polyline points="46.02 21.95 55.93 31.86 46.02 41.77"></polyline>
                <line x1="55.93" y1="31.86" x2="19.59" y2="31.86"></line>
                <path
                    d="M40,38.18V52a2.8,2.8,0,0,1-2.81,2.8H12A2.8,2.8,0,0,1,9.16,52V11.77A2.8,2.8,0,0,1,12,9H37.19A2.8,2.8,0,0,1,40,11.77V25"></path>
            </g>
        </svg>
    )
}

function IconContinue({
                                   className,
                                   ...props
                               }: React.ComponentProps<'svg'>) {
    return (
        <svg {...props} fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
             className={cn('size-4', className)}
             stroke="#000000" strokeWidth="0.744">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinecap="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M19.2928932,7 L17.1464466,4.85355339 C16.9511845,4.65829124 16.9511845,4.34170876 17.1464466,4.14644661 C17.3417088,3.95118446 17.6582912,3.95118446 17.8535534,4.14644661 L20.8535534,7.14644661 C21.0488155,7.34170876 21.0488155,7.65829124 20.8535534,7.85355339 L17.8535534,10.8535534 C17.6582912,11.0488155 17.3417088,11.0488155 17.1464466,10.8535534 C16.9511845,10.6582912 16.9511845,10.3417088 17.1464466,10.1464466 L19.2928932,8 L5.5,8 C4.67157288,8 4,8.67157288 4,9.5 L4,15.5 C4,16.3284271 4.67157288,17 5.5,17 L10.5,17 C10.7761424,17 11,17.2238576 11,17.5 C11,17.7761424 10.7761424,18 10.5,18 L5.5,18 C4.11928813,18 3,16.8807119 3,15.5 L3,9.5 C3,8.11928813 4.11928813,7 5.5,7 L19.2928932,7 Z"></path>
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
    IconHint,
    IconTeacher,
    IconGuideBook,
    IconScoreSheet,
    IconExit,
    IconContinue,
    IconChevronUpDown
}
