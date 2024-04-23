import { Box, Card, CardHeader } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_BASE_URL } from '../../../constants';
import { ViewPointCameraData, ViewPointData } from '../models';

type RealtimeCameraProps = {
  viewPoint: ViewPointData;
  viewPointCamera: ViewPointCameraData;
  setShowRealtimeCamera: (val: boolean) => void;
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
        <ArrowBackIcon
          className="cursor-pointer"
          onClick={() => setShowRealtimeCamera(false)}
        />
      </div>
      <Card>
        <CardHeader title={title} subheader={viewPoint?.name} />
        <Box sx={{ p: 3, pb: 1 }}>
          <img
            src={`${API_BASE_URL}/detector/video/realtime?type=${viewPointCamera.cameraSource}&uri=${viewPointCamera.cameraUri}`}
            alt="video"
          />
        </Box>
      </Card>
    </Box>
  );
}
