import { Box, Card, CardHeader } from '@mui/material';
import { API_BASE_URL } from '../../../constants';
import { ViewPointCameraData, ViewPointData } from '../models';
import * as React from 'react';

type RealtimeCameraProps = {
  viewPoint: ViewPointData;
  viewPointCamera: ViewPointCameraData;
};
export function RealtimeCameraRaw({
  viewPointCamera,
  viewPoint,
}: RealtimeCameraProps) {
  const title = 'Camera raw';
  const uuid = React.useRef(new Date().getTime());

  return (
    <Box>
      <Card>
        <CardHeader title={title} subheader={viewPoint?.name} />
        <Box sx={{ p: 3, pb: 1 }}>
          <img
            src={`${API_BASE_URL}/detector/video/realtime/raw?type=${viewPointCamera.cameraSource}&uri=${viewPointCamera.cameraUri}&uuid=${uuid.current}`}
            alt="video"
          />
        </Box>
      </Card>
    </Box>
  );
}
