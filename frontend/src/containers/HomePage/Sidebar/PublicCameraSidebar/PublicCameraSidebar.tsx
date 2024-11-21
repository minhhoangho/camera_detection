import * as React from 'react';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useQuery } from 'react-query';
import classNames from 'classnames';
import Image from 'next/image';
import { toast } from 'src/components/Toast';
import Spinner from 'src/components/Spinner';

import { getListViewPointCameras } from 'src/api/view-point';
import styles from './PublicCameraSidebar.module.scss';
import {
  ListViewPointCameraPaginateResponse,
  ViewPointCameraData, ViewPointData,
} from '../../../GisMap/models';
import { RealtimeCamera } from '../../../GisMap/components/RealtimeCamera';
import { Iconify } from '../../../../components/Iconify';

type Props = {
  onClose: () => void;
  open: boolean;
  activeViewPoint: ViewPointData;
  viewPointId: number;
};

export function PublicCameraSidebar({
  open,
  onClose,
  viewPointId,
                                      activeViewPoint,
}: Props): React.ReactElement {
  const [listCameraViewPoints, setListCameraViewPoints] = React.useState<
    ViewPointCameraData[]
  >([]);
  const [activeCamera, setActiveCamera] =
    React.useState<ViewPointCameraData | null>(null);

  const { isLoading } = useQuery<ListViewPointCameraPaginateResponse>({
    queryKey: ['getListViewPointCameraPaginate', viewPointId],
    queryFn: () =>
      getListViewPointCameras(viewPointId, {
        offset: 0,
        limit: 100,
      }),
    onSuccess: (res: ListViewPointCameraPaginateResponse) => {
      setListCameraViewPoints(res.data);
      if (res.data.length > 0 && res.data[0]) {
        setActiveCamera(res.data[0]); // Default active camera
      }
    },
    onError: () => toast('error', 'Error'),
    // cacheTime: 0,
    enabled: !!viewPointId,
  });

  const renderCameraItemCard = (camera: ViewPointCameraData) => {
    const isActive = activeCamera?.id === camera.id;
    const sourceEnum: Record<number, React.ReactElement> = {
      0: (
        <span className="flex">
          <span className="mr-1">RTSP</span>
          <Iconify icon="icon-park:camera-one" width={20} height={20} />
        </span>
      ),
      1: (
        <span className="flex">
          <span className="mr-1">Youtube</span>{' '}
          <Iconify icon="logos:youtube-icon" width={20} height={20} />
        </span>
      ),
    };
    return (
      <Card
        key={camera.id}
        className={classNames(
          'w-[200px]',
          'h-[160px]',
          'mx-2',
          isActive ? styles['active-camera-card'] : styles['camera-card'],
        )}
        onClick={() => setActiveCamera(camera)}
      >
        <CardActionArea>
          <CardContent>
            <Typography variant="body2" className="mb-2">
              {sourceEnum[camera.cameraSource]}
            </Typography>
            {camera.capturedImage && (
              <Image
                src={camera.capturedImage}
                alt={camera.cameraUri}
                placeholder="blur"
                sizes="100vw"
                width={200}
                height={200}
                style={{
                  width: '100%',
                  height: 'auto',
                }}
                blurDataURL="data:..."
                quality={100}
              />
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  const renderActiveCamera = () => {
    return (
      <Box>
        {activeCamera && <RealtimeCamera viewPointCamera={activeCamera} />}
      </Box>
    );
  };

  if (!open) {
    return <div></div>;
  }

  return (
    <Box className="w-full h-full">
      {isLoading ? (
        <div className="w-full h-full flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="mt-3">
            <Button onClick={onClose}>Back</Button>
          </div>
          <div>
            <Box className="flex">
              {listCameraViewPoints.map((camera) =>
                renderCameraItemCard(camera),
              )}
            </Box>
          </div>
          <div>
            <div className="my-3">
              <Typography variant="h6" className="text-center">
                {activeViewPoint?.name}
              </Typography>
            </div>
            <div>
              {renderActiveCamera()}
            </div>
          </div>
          {!activeCamera?.homographyMatrix && (
            <div className="px-4 w-full">
              <img
                src={activeCamera?.bevImage}
                alt="captured-img"
                width="100%"
              />
            </div>
          )}
        </>
      )}
    </Box>
  );
}
