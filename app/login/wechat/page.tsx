'use client'

import './loading.css'
import {useEffect} from "react";

export default function WechatLogining() {
    useEffect(() => {
        ;(async () => {

            const divElement = document.querySelector('.globalHeader');
            console.log(divElement)
            if (divElement) {
                divElement.style.display = 'none';
            }
        })()
    }, [])
  return (
      <div className={"bg-white h-full w-full"}>
        <svg className="loading">
          <circle className="circle" cx="60" cy="60" r="55" fill="white" stroke="#6DDBFE" stroke-linecap="round"
                  stroke-width="10"></circle>
        </svg>
      </div>
  )
}