import { Box, Card } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL, SOCKET_BASE_URL } from '../../../constants';
import { ViewPointCameraData, ViewPointData } from '../models';
import { DETECTION_CLASS_NAME } from '../../../constants/detection';

type RealtimeCameraProps = {
  viewPoint?: ViewPointData;
  viewPointCamera: ViewPointCameraData;
  setShowRealtimeCamera?: (val: boolean) => void;
};

export function RealtimeCamera({
  viewPointCamera,
  setShowRealtimeCamera,
}: RealtimeCameraProps) {
  const title = 'Realtime Camera';
  const [showCamImgTag, setShowCamImgTag] = React.useState(true);
  const [objects, setObjects] = useState(DETECTION_CLASS_NAME);

  const socketRef = useRef(null);
  //
  useEffect(() => {
    // Create WebSocket connection.
    socketRef.current = new WebSocket(`${SOCKET_BASE_URL}/sse/vehicle_count/`);

    // Connection opened
    socketRef.current.onopen = (e) => {
      console.log("[open] Connection established");
    };

    // Listen for messages
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(`[message] Data received from server: ${data}`);
    };

    // Connection closed
    socketRef.current.onclose = (event) => {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        console.error('[close] Connection died');
      }
    };

    // Handle errors
    socketRef.current.onerror = (error) => {
      console.error(`[error] ${error.message}`);
    };

    // Cleanup on component unmount
    return () => {
      socketRef.current.close();
    };
  }, []);

  // useEffect(() => {
  //   const eventSource = new EventSource(`${SOCKET_BASE_URL}/sse`);
  //
  //   eventSource.addEventListener('video_tracking', event => {
  //     const eventData = JSON.parse(event.data);
  //     console.log("Event data: ", eventData)
  //     setObjects(eventData.objects)
  //   });
  //
  //   return () => {
  //     eventSource.close();
  //   };
  // }, []);

  return (
    <Box>
      <div>
        {setShowRealtimeCamera && (
          <ArrowBackIcon
            className="cursor-pointer"
            onClick={() => {
              setShowRealtimeCamera(false);
              setShowCamImgTag(false);
            }}
          />
        )}
      </div>
      <Card>
        <div className="px-5 py-1">
          <Typography variant="h6">{title}</Typography>
        </div>
        {/*<CardHeader title={title} subheader={viewPoint?.name} />*/}
        <Box sx={{ p: 2 }}>
          {showCamImgTag && (
            <img
              src={`${API_BASE_URL}/detector/video/realtime?type=${viewPointCamera.cameraSource}&uri=${viewPointCamera.cameraUri}&cam_id=${viewPointCamera.id}`}
              alt="video"
            />
          )}
        </Box>
      </Card>
    </Box>
  );
}
