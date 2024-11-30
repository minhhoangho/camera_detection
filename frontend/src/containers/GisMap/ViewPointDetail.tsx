import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'react-query';
import { Box, Button, Card, Container, Grid } from '@mui/material';
import * as React from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'src/components/Toast';
import { FormInput } from 'src/components/Form';
import { Iconify } from 'src/components/Iconify';
import { FileUpload } from 'src/components/FileUpload';
import {
  getDetailViewPoint,
  getViewPointCameraDetail,
  saveBevImage,
  updateViewPoint,
} from 'src/api/view-point';
import { BaseLayout, PrivateLayout } from 'src/layouts';
import { BevMetadata } from './components/BevMetadata';
import { RealtimeCamera } from './components/RealtimeCamera';
import { OpenLayerMapManagement } from './OpenLayerMap';
import { ViewPointCameraList } from './components/ViewPointCameraList';
import {
  BEVPayloadRequest,
  EditViewPointPayloadRequest,
  ViewPointCameraData,
  ViewPointData,
} from './models';
import { RealtimeCameraRaw } from './components/RealtimeCameraRaw';
import { RealTimeCameraMode } from './constants';

export function ViewPointDetail() {
  const [showRealtimeCamera, setShowRealtimeCamera] = React.useState(
    RealTimeCameraMode.NO_SHOW,
  );
  console.log('showRealtimeCamera >> ', showRealtimeCamera);
  const [selectedViewPointCamera, setSelectedViewPointCamera] = React.useState(
    {} as ViewPointCameraData,
  );
  const router = useRouter();
  const viewPointId = (router.query['id'] ?? 0) as number;
  const validationSchema = yup.object({
    name: yup.string().trim().required('Name is required'),
    description: yup.string().trim().default(''),
    lat: yup.number().required('Latitude is required'),
    long: yup.number().required('Longitude is required'),
    warningThreshold: yup.number().default(10),
  });
  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      warningThreshold: 10,
    },
  });
  // const [long, lat] = useWatch({control, name: ['long', 'lat']});

  const {
    data: dataDetail,
    isLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['getViewPointDetail', viewPointId],
    queryFn: () => {
      return getDetailViewPoint(viewPointId);
    },
    onSuccess: (data: ViewPointData) => {
      setValue('name', data?.name);
      setValue('description', data?.description);
      setValue('lat', data?.lat);
      setValue('long', data?.long);
    },
    onError: () => toast('error', 'Error'),
    enabled: !!viewPointId,
    // cacheTime: 0,
  });

  const { mutate: updateViewpointMutate } = useMutation({
    mutationFn: (data: EditViewPointPayloadRequest): any =>
      updateViewPoint(viewPointId, data),
    onSuccess: async () => {
      toast('success', 'Đã cập nhật thông tin địa điểm');
      await refetchDetail();
    },
    onError: () => {
      toast('error', 'Có lỗi xảy ra, vui lòng thử lại sau');
    },
  });

  const { mutate: uploadBevImage } = useMutation({
    mutationFn: (data: BEVPayloadRequest): any =>
      saveBevImage(viewPointId, data),
    onSuccess: () => {
      toast('success', 'Uploaded Bev image');
      getViewPointCameraDetail(viewPointId, selectedViewPointCamera.id).then(
        (data) => {
          setSelectedViewPointCamera(data);
        },
      );
    },
    onError: () => {
      toast('error', 'Uploading Bev image error');
      toast('error', 'Có lỗi xảy ra, vui lòng thử lại sau');
    },
  });

  const handleSubmitForm = (data: any) => {
    const submitData: EditViewPointPayloadRequest = {
      ...data,
      mapView: {
        zoom: 15,
        lat: data.lat,
        long: data.long,
      },
    };
    updateViewpointMutate(submitData);
  };
  const updateFormLatLong = (lat: number, long: number) => {
    setValue('lat', lat);
    setValue('long', long);
  };

  const handleSetShowRealtimeCamera = (
    val: boolean,
    viewPointCamera: ViewPointCameraData,
  ) => {
    if (val) {
      setShowRealtimeCamera(RealTimeCameraMode.RAW);
      setSelectedViewPointCamera(viewPointCamera);
    } else {
      setShowRealtimeCamera(RealTimeCameraMode.NO_SHOW);
      setSelectedViewPointCamera(null);
    }
  };

  const handleSaveBEVImage = (fileUrl: string) => {
    const payload: BEVPayloadRequest = {
      id: selectedViewPointCamera.id,
      bevImage: fileUrl,
    };
    uploadBevImage(payload);
  };
  const renderRealtimeCamera = () => {
    if (showRealtimeCamera === RealTimeCameraMode.NO_SHOW) {
      return null;
    }
    if (showRealtimeCamera === RealTimeCameraMode.RAW) {
      return (
        <RealtimeCameraRaw
          viewPoint={dataDetail as ViewPointData}
          viewPointCamera={selectedViewPointCamera}
        />
      );
    }
    return (
      <RealtimeCamera
        viewPoint={dataDetail as ViewPointData}
        viewPointCamera={selectedViewPointCamera}
      />
    );
  };

  const renderCaptureImageAndBev = () => {
    return (
      <Grid container>
        <Grid item>
          <Card className="mt-3">
            <Box sx={{ px: 3, py: 2 }}>
              <div>
                <h3>Ảnh</h3>
              </div>
              <img
                src={selectedViewPointCamera.capturedImage ?? ''}
                alt={selectedViewPointCamera.capturedImage ?? 'none'}
              ></img>
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
              <div className="mt-2">
                <div>
                  <h3>Ảnh BEV</h3>
                </div>
                <div className="flex">
                  {selectedViewPointCamera?.bevImage ? (
                    <div>
                      <img
                        src={selectedViewPointCamera.bevImage}
                        alt="bev-image"
                        className="mr-2"
                      />
                    </div>
                  ) : null}
                  <FileUpload uploadFileCallback={handleSaveBEVImage} />
                </div>
              </div>
            </Box>
          </Card>
        </Grid>
        <Grid item>
          <BevMetadata viewPointCamera={selectedViewPointCamera} />
        </Grid>
      </Grid>
    );
  };

  return (
    <BaseLayout>
      <PrivateLayout>
        <Container>
          <div>
            <Iconify
              icon="ic:baseline-arrow-back"
              color="text.disabled"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={() => router.back()}
            />
          </div>
          <h1>{dataDetail?.name ?? ''}</h1>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={6}>
              {showRealtimeCamera !== RealTimeCameraMode.NO_SHOW ? (
                <>
                  <div>
                    <ArrowBackIcon
                      className="cursor-pointer"
                      onClick={() => {
                        setShowRealtimeCamera(RealTimeCameraMode.NO_SHOW);
                      }}
                    />
                  </div>
                  {renderRealtimeCamera()}
                </>
              ) : (
                <>
                  <Box className="mb-2">
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                      <div className="flex justify-end">
                        <Button
                          variant="contained"
                          className="btn wd-140 btn-sm btn-primary"
                          type="submit"
                          disabled={isLoading}
                        >
                          Lưu
                        </Button>
                      </div>
                      <FormInput
                        control={control}
                        name="name"
                        inputElementClassName="form-control mr-sm-2"
                        placeholder="Tên địa điểm"
                        label="Tên địa điểm"
                        isRequired
                      />
                      <FormInput
                        control={control}
                        name="description"
                        isTextarea
                        inputElementClassName="form-control mr-sm-2 resize-none"
                        placeholder="Mô tả"
                        label="Mô tả"
                        labelClassName="mt-2"
                      />
                      <FormInput
                        control={control}
                        name="warningThreshold"
                        type="number"
                        inputElementClassName="form-control mr-sm-2 resize-none"
                        placeholder="Nhập số lượng xe"
                        label="Ngưỡng cảnh báo"
                        labelClassName="mt-2"
                      />
                      <div className="flex justify-between gap-3">
                        <FormInput
                          control={control}
                          name="lat"
                          type="number"
                          inputElementClassName="form-control mr-sm-2"
                          placeholder="Vĩ độ"
                          label="Vĩ độ"
                          labelClassName=""
                          isRequired
                        />

                        <FormInput
                          control={control}
                          name="long"
                          type="number"
                          inputElementClassName="form-control mr-sm-2"
                          placeholder="Kinh độ"
                          label="Kinh độ"
                          labelClassName=""
                          isRequired
                        />
                      </div>
                    </form>
                  </Box>
                  <ViewPointCameraList
                    viewPointId={viewPointId}
                    setShowRealtimeCamera={handleSetShowRealtimeCamera}
                  />
                </>
              )}
            </Grid>
            <Grid item xs={6}>
              {!isLoading && (
                <OpenLayerMapManagement
                  width={'--webkit-fill-available'}
                  height={500}
                  onUpdateLatLong={updateFormLatLong}
                  center={[dataDetail?.long ?? 0, dataDetail?.lat ?? 0]}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              {showRealtimeCamera != RealTimeCameraMode.NO_SHOW &&
                renderCaptureImageAndBev()}
            </Grid>
          </Grid>
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
