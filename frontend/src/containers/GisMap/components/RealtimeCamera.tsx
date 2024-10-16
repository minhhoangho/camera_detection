import { Box, Card } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../../constants';
import { ViewPointCameraData, ViewPointData } from '../models';
import { DETECTION_CLASS_NAME } from '../../../constants/detection';
import { socketClient } from '../../../utils/socket';

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
    // Connection opened
    socketClient.on('connect', () => {
      console.log("Socket onnn ")
    })

    // Cleanup on component unmount
    return () => {
      socketClient.close();
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
