import { useEffect, useRef, useState } from 'react';

export type WebsocketMessagePayload = {
  data: any;
  type: string;
};

export const useWebsocket = (url: string) => {
  const [isReady, setIsReady] = useState(false);
  const [val, setVal] = useState(null);

  const ws = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => setIsReady(true);
    socket.onclose = () => setIsReady(false);
    socket.onmessage = (event) => setVal(event.data);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [url]);

  const disconnect = () => {
    try {
      /* eslint-disable-next-line  */
      console.info('Trying to disconnect websocket');
      // eslint-disable-next-line
      if (ws?.current) {
        ws.current.close();
      }
    } catch (error) {
      /* eslint-disable-next-line  */
      console.error('Error while disconnecting websocket', error);
    }
  };

  // bind is needed to make sure `send` references correct `this`
  return [isReady, val, (ws.current as any)?.send.bind(ws.current), disconnect];
};
