import { Card, CardHeader, Box } from '@mui/material';
import { API_BASE_URL } from '../../../constants';
import {useEffect} from "react";

type Props = {
  title: string;
  subheader: string;
};
export function WidgetCarTracking({ title, subheader }: Props) {
     useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/sse`);

    eventSource.addEventListener('video_tracking', event => {
      const eventData = JSON.parse(event.data);
      // Process the received event data
      console.log(eventData);
    });

    return () => {
      eventSource.close();
    };
  }, []);


  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ p: 3, pb: 1 }}>
        <img src={`${API_BASE_URL}/stream/video`} alt="video" />
      </Box>
    </Card>
  );
}
