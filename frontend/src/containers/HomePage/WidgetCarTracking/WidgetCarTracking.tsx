import { Card, CardHeader, Box, Grid, ListItem, List } from '@mui/material';
import { useState } from "react";
import { API_BASE_URL } from '../../../constants';

type Props = {
  title: string;
  subheader: string;
};

const CLASS_NAME = {
  "person": 0,
  "bicycle": 0,
  "car": 0,
  "motorcycle": 0,
  "airplane": 0,
  "bus": 0,
  "train": 0,
  "truck": 0,
  "boat": 0,
  "traffic light": 0,
  "fire hydrant": 0,
  "stop sign": 0,
  "parking meter": 0,
  "bench": 0,
  "bird": 0,
  "cat": 0,
  "dog": 0,
  "horse": 0,
  "sheep": 0,
  "cow": 0,
  "elephant": 0,
  "bear": 0,
  "zebra": 0,
  "giraffe": 0,
  "backpack": 0,
  "umbrella": 0,
  "handbag": 0,
  "tie": 0,
  "suitcase": 0,
  "frisbee": 0,
  "skis": 0,
  "snowboard": 0,
  "sports ball": 0,
  "kite": 0,
  "baseball bat": 0,
  "baseball glove": 0,
  "skateboard": 0,
  "surfboard": 0,
  "tennis racket": 0,
  "bottle": 0,
  "wine glass": 0,
  "cup": 0,
  "fork": 0,
  "knife": 0,
  "spoon": 0,
  "bowl": 0,
  "banana": 0,
  "apple": 0,
  "sandwich": 0,
  "orange": 0,
  "broccoli": 0,
  "carrot": 0,
  "hot dog": 0,
  "pizza": 0,
  "donut": 0,
  "cake": 0,
  "chair": 0,
  "couch": 0,
  "potted plant": 0,
  "bed": 0,
  "dining table": 0,
  "toilet": 0,
  "tv": 0,
  "laptop": 0,
  "mouse": 0,
  "remote": 0,
  "keyboard": 0,
  "cell phone": 0,
  "microwave": 0,
  "oven": 0,
  "toaster": 0,
  "sink": 0,
  "refrigerator": 0,
  "book": 0,
  "clock": 0,
  "vase": 0,
  "scissors": 0,
  "teddy bear": 0,
  "hair drier": 0,
  "toothbrush": 0
}
export function WidgetCarTracking({ title, subheader }: Props) {
  const [objects, setObjects] = useState(CLASS_NAME)
  const [isLoadedVideo, setIsLoadedVideo] = useState(false)

  // useEffect(() => {
  //   const eventSource = new EventSource(`${API_BASE_URL}/sse`);
  //
  //   eventSource.addEventListener('video_tracking', event => {
  //     const eventData = JSON.parse(event.data);
  //     setIsLoadedVideo(true)
  //     setObjects(eventData.objects)
  //   });
  //
  //   return () => {
  //     eventSource.close();
  //   };
  // }, []);


  const renderListItem = (key, value) => {
    return (
      <ListItem disablePadding className='d-flex' key={key}>
        <div>
          <p>
            <span>{key}: {value}</span>
          </p>
        </div>
      </ListItem>
    )
  }

  const renderObjectCounting = () => {
    return <List >
      {Object.keys(objects).map(key => renderListItem(key, objects[key]))}
    </List>
  }



  return (
    <Grid container spacing={3}  alignItems="stretch">
      <Grid item xs={6}>
        <Card>
          <CardHeader title={title} subheader={subheader} />
          <Box sx={{ p: 3, pb: 1 }}>
            <img src={`${API_BASE_URL}/stream/video`} alt="video" />
          </Box>
        </Card>
      </Grid>
      <Grid item xs={6} className='h-auto'>
        <Card className='h-[100%]'>
          <CardHeader title="Counting" />
          <Box sx={{ p: 3, pb: 1 }} >
            {isLoadedVideo && renderObjectCounting()}
          </Box>
        </Card>
      </Grid>

    </Grid>
  );
}
