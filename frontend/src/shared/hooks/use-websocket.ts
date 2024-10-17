import { useEffect, useRef, useState } from 'react';

export const useWebsocket = (url: string) => {
  const [isReady, setIsReady] = useState(false)
  const [val, setVal] = useState(null)

  const ws = useRef(null)

  useEffect(() => {
    const socket = new WebSocket(url)

    socket.onopen = () =>  setIsReady(true)
    socket.onclose = () => setIsReady(false)
    socket.onmessage = (event) => setVal(event.data)

    // @ts-ignore
    ws.current = socket

    return () => {
      socket.close()
    }
  }, [url])

  // bind is needed to make sure `send` references correct `this`
  return [isReady, val, (ws.current as any)?.send.bind(ws.current)]
}
