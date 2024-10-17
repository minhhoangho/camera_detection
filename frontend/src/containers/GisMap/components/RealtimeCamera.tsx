import { Box, Card } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL, SOCKET_BASE_URL } from '../../../constants';
import { ViewPointCameraData, ViewPointData } from '../models';
import { DETECTION_CLASS_NAME } from '../../../constants/detection';
// import { socketClient } from '../../../utils/socket';
import { useWebsocket } from '../../../shared/hooks/use-websocket';

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
  const [total, setTotal] = useState(0);
  const [isConnected, message, send] = useWebsocket(`${SOCKET_BASE_URL}/ws/`);

  useEffect(() => {
    if (isConnected) {
      console.log('Connected to WebSocket');
    }

    if (message) {
      const messageJson = JSON.parse(message);
      const objectCount: Record<string, number> = messageJson?.event?.count;
      setObjects(objectCount as any);
      if (typeof objectCount === 'object') {
        const _total = Object.values(objectCount).reduce(
          (a: number, b: number) => a + b,
          0,
        );
        setTotal(_total);
      }
    }
  }, [isConnected, send, message, objects]);

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
          <div>
            <p>Tổng phương tiện: {total}</p>
          </div>
          <div>
            {showCamImgTag && (
              <img
                src={`${API_BASE_URL}/detector/video/realtime?type=${viewPointCamera.cameraSource}&uri=${viewPointCamera.cameraUri}&cam_id=${viewPointCamera.id}`}
                alt="video"
              />
            )}
          </div>

        </Box>
      </Card>
    </Box>
  );
}
