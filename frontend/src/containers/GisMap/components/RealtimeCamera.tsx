import { Box, Card } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { API_BASE_URL, SOCKET_BASE_URL } from '../../../constants';
import { ViewPointCameraData, ViewPointData } from '../models';
// import { DETECTION_CLASS_NAME } from '../../../constants/detection';
// import { socketClient } from '../../../utils/socket';
import {
  useWebsocket,
  WebsocketMessagePayload,
} from '../../../shared/hooks/use-websocket';
import { useQuery } from 'react-query';
import { getDetailViewPoint } from '../../../api/view-point';
import { toast } from '../../../components/Toast';

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
  const uuid = React.useRef(new Date().getTime());
  const [showCamImgTag, setShowCamImgTag] = React.useState(true);
  // const [objects, setObjects] =
  //   useState<Record<string, number>>(DETECTION_CLASS_NAME);
  const [total, setTotal] = useState(0);
  const [isConnected, message, _] = useWebsocket(`${SOCKET_BASE_URL}/ws/`);
  const { data: dataDetail } = useQuery({
    queryKey: ['getViewPointDetail', viewPointCamera.viewPointId],
    queryFn: () => {
      return getDetailViewPoint(viewPointCamera.viewPointId);
    },
    onError: () => toast('error', 'Error'),
    enabled: !!viewPointCamera.viewPointId,
    // cacheTime: 0,
  });

  const handleCountObjects = (data: Record<string, any>) => {
    const objectCount: Record<string, number> = data?.object_count_map;
    const cameraId = data?.camera_id;
    if (Number(cameraId) === viewPointCamera.id) {
      // setObjects(objectCount);
      if (typeof objectCount === 'object') {
        const _total = Object.values(objectCount).reduce(
          (a: number, b: number) => a + b,
          0,
        );
        setTotal(_total);
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      console.log('Connected to WebSocket');
    }

    if (message) {
      const messageJson: WebsocketMessagePayload = JSON.parse(message);
      if (messageJson.type === 'send_event') {
        handleCountObjects(messageJson.data);
      }
    }
  }, [isConnected, message]);

  const renderWarning = () => {
    if (!dataDetail) {
      return null;
    }
    console.log('dataDetail warningThreshold', dataDetail.warningThreshold);
    console.log('dataDetail > total', total);
    if (dataDetail.warningThreshold < total) {
      return (
        <p
          style={{
            backgroundColor: 'green',
            padding: '5px',
            color: 'white',
            borderRadius: '5px',
            width: 'fit-content',
          }}
        >
          Bình thường
        </p>)
    }
    return (
      <p
        style={{
          backgroundColor: 'red',
          padding: '5px',
          color: 'white',
          borderRadius: '5px',
          width: 'fit-content',
        }}
      >
        Có dấu hiệu đông đúc
      </p>
    );
  };

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
            {renderWarning()}
          </div>
          <div>
            {showCamImgTag && (
              <img
                src={`${API_BASE_URL}/detector/video/realtime?type=${viewPointCamera.cameraSource}&uri=${viewPointCamera.cameraUri}&cam_id=${viewPointCamera.id}&uuid=${uuid.current}`}
                alt="video"
              />
            )}
          </div>
        </Box>
      </Card>
    </Box>
  );
}
