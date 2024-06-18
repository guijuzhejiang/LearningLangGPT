import { type Session } from '@/lib/types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/auth'
import {redirect} from "next/navigation";
import * as React from "react";

export interface SceneMenuProps {
}


export function SceneMenu({  }: SceneMenuProps) {



  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
              key={"choosingTeacher"}
              className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900`}
              // onClick={async () => {
              // }}
          >
            <div className="text-sm font-semibold mb-2">场景</div>
            <div className="text-sm text-zinc-600 items-center flex justify-center">
              结交新朋友（Making New Friends）
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-fit">
          {
            exampleMessages.map((example, index) => (
                <>
                  <DropdownMenuItem className="">
                    <div
                        key={example.heading}
                        className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                            index > 1 && 'hidden md:block'
                        }`}
                    >
                      <div className="text-sm font-semibold">{example.heading}</div>
                      <div className="text-sm text-zinc-600">
                        {example.subheading}
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator/>
                </>
            ))
          }

        </DropdownMenuContent>
      </DropdownMenu>
  )
}
