import { Box, Card, CardHeader } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as React from 'react';
import { API_BASE_URL } from '../../../constants';
import { ViewPointCameraData, ViewPointData } from '../models';
import Typography from '@mui/material/Typography';

type RealtimeCameraProps = {
  viewPoint?: ViewPointData;
  viewPointCamera: ViewPointCameraData;
  setShowRealtimeCamera?: (val: boolean) => void;
};
export function RealtimeCamera({
  viewPointCamera,
  viewPoint,
  setShowRealtimeCamera,
}: RealtimeCameraProps) {
  const title = 'Realtime Camera';
  return (
    <Box>
      <div>
        {
          setShowRealtimeCamera && <ArrowBackIcon
            className="cursor-pointer"
            onClick={() => setShowRealtimeCamera(false)}
          />
        }
      </div>
      <Card>
        <div className="px-5 py-1">
          <Typography variant="h6" >{title}</Typography>
        </div>
        {/*<CardHeader title={title} subheader={viewPoint?.name} />*/}
        <Box sx={{ p: 2 }}>
          <img
            src={`${API_BASE_URL}/detector/video/realtime?type=${viewPointCamera.cameraSource}&uri=${viewPointCamera.cameraUri}`}
            alt="video"
          />
        </Box>
      </Card>
    </Box>
  );
}
