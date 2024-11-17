import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'react-query';
import { Box, Button, Container, Grid, Card } from '@mui/material';
import * as React from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRecoilValue } from 'recoil';
import { toast } from 'src/components/Toast';
import { FormInput } from 'src/components/Form';
import { Iconify } from 'src/components/Iconify';
import { FileUpload } from 'src/components/FileUpload';
import {
  getDetailViewPoint,
  getViewPointCameraDetail,
  saveBevImageAndHomographyMatrix,
  updateViewPoint,
} from 'src/api/view-point';
import { BaseLayout, PrivateLayout } from 'src/layouts';
import { getImageCoordinates } from 'src/utils/gis-map';
import { RealtimeCamera } from './components/RealtimeCamera';
import { OpenLayerMapManagement } from './OpenLayerMap';
import { ViewPointCameraList } from './components/ViewPointCameraList';
import {
  BEVAndHomoPayloadRequest,
  EditViewPointPayloadRequest,
  ViewPointCameraData,
  ViewPointData,
} from './models';
import { bevCoordinateState } from '../../app-recoil/atoms/map';

export function ViewPointDetail() {
  const bevCoordinate = useRecoilValue(bevCoordinateState);
  const [showRealtimeCamera, setShowRealtimeCamera] = React.useState(false);
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
    }
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
    mutationFn: (data: BEVAndHomoPayloadRequest): any =>
      saveBevImageAndHomographyMatrix(viewPointId, data),
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
    setShowRealtimeCamera(val);
    setSelectedViewPointCamera(viewPointCamera);
  };

  const handleSaveBEVImage = (fileUrl: string) => {
    const payload: BEVAndHomoPayloadRequest = {
      id: selectedViewPointCamera.id,
      bevImage: fileUrl,
      zoom: 19,
      imageCoordinates: bevCoordinate
    };
    uploadBevImage(payload);
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
              {showRealtimeCamera ? (
                <>
                  <RealtimeCamera
                    viewPoint={dataDetail as ViewPointData}
                    viewPointCamera={selectedViewPointCamera}
                    setShowRealtimeCamera={setShowRealtimeCamera}
                  />
                  <Card className="mt-3">
                    <Box sx={{ p: 3 }}>
                      <div>Ảnh</div>
                      <img
                        src={selectedViewPointCamera.capturedImage ?? ''}
                        alt={selectedViewPointCamera.capturedImage ?? 'none'}
                      ></img>
                    </Box>
                  </Card>
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

              {showRealtimeCamera && (
                <div className="mt-4">
                  <div>
                    <span>Ảnh BEV</span>
                  </div>
                  <div className="flex">
                    {selectedViewPointCamera?.bevImage ? (
                      <img
                        src={selectedViewPointCamera.bevImage}
                        alt="bev-image"
                        className="mr-2 max-w-xl"
                      />
                    ) : null}
                    <FileUpload uploadFileCallback={handleSaveBEVImage} />
                  </div>
                </div>
              )}
            </Grid>
          </Grid>
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
