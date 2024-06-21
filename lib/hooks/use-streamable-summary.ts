import { StreamableValue, readStreamableValue } from 'ai/rsc'
import { useEffect, useState } from 'react'

export const useStreamableSummary = (
  content: string | StreamableValue<string>
) => {
  const [rawContent, setRawContent] = useState(
    typeof content === 'string' ? content : ''
  )
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    ;(async () => {

      if (typeof content === 'object') {
        let value = ''
        for await (const delta of readStreamableValue(content)) {
          if (typeof delta === 'string') {
            setRawContent((value = value + delta))
          }
        }
        setCompleted(true)
      }
    })()
  }, [content])

  // useEffect(() => {
  //   console.log(completed);
  // }, [completed])

  return [rawContent, completed]
}
