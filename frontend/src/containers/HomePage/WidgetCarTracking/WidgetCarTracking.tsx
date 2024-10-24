import { Card, CardHeader, Box, Grid, ListItem, List } from '@mui/material';
import { API_BASE_URL } from '../../../constants';

type Props = {
  title: string;
  subheader: string;
};

export function WidgetCarTracking({ title, subheader }: Props) {
  // const [objects, setObjects] = useState<Record<string, number>>({})
  // const [isLoadedVideo, setIsLoadedVideo] = useState(false)

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


  const renderListItem = (key: string, value: number) => {
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
      {Object.keys({}).map(key => renderListItem(key, objects[key]))}
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
            {renderObjectCounting()}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}
