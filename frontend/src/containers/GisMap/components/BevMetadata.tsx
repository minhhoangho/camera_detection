import { Box, Button, Card, CardHeader, Grid, Modal } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import * as React from 'react';
import { useMutation } from 'react-query';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import _snakeCase from 'lodash/snakeCase';
import _isEmpty from 'lodash/isEmpty';
import { FormInput } from '../../../components/Form';
import {
  BEVMetadataPayloadRequest,
  ViewPointCameraData,
  ViewPointData,
} from '../models';
import { saveBevMetadata } from '../../../api/view-point';
import { toast } from '../../../components/Toast';
import { isEmptyMatrix } from '../../../utils';
import { MapWithRectangle } from '../OpenLayerMap';

export function BevMetadata({
  viewPointCamera,
  viewPoint,
}: {
  viewPointCamera: ViewPointCameraData;
  viewPoint: ViewPointData;
}) {
  const [showPreview, setShowPreview] = React.useState(false);

  const formatMetadata = () => {
    if (viewPointCamera?.bevImageMetadata) {
      return JSON.parse(viewPointCamera.bevImageMetadata);
    }
    return null;
  };
  const validationSchema = yup.object({
    homographyMatrix: yup
      .array()
      .of(
        yup
          .array()
          .of(yup.number().required('This field is required'))
          .length(3, 'Each row must have exactly 3 elements'),
      )
      .length(3, 'There must be exactly 3 rows'),

    rectangle_coordinates: yup.object({
      top_left: yup.object({
        lat: yup.number().required('Latitude is required'),
        long: yup.number().required('Longitude is required'),
      }),
      top_right: yup.object({
        lat: yup.number().required('Latitude is required'),
        long: yup.number().required('Longitude is required'),
      }),
      bottom_left: yup.object({
        lat: yup.number().required('Latitude is required'),
        long: yup.number().required('Longitude is required'),
      }),
      bottom_right: yup.object({
        lat: yup.number().required('Latitude is required'),
        long: yup.number().required('Longitude is required'),
      }),
    }),
  });
  const { control, handleSubmit, getValues } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      homographyMatrix: viewPointCamera?.homographyMatrix,
      image_coordinates: formatMetadata()?.image_coordinates,
    },
  });
  const isEmptyCoordinates = (coordinates: any) => {
    if (_isEmpty(coordinates)) {
      return true;
    }
    const isEmptyLatLong = ({ lat, long }: { lat: number; long: number }) => {
      return !lat && !long;
    };
    const top_left = coordinates.top_left || {};
    const top_right = coordinates.top_right || {};
    const bottom_left = coordinates.bottom_left || {};
    const bottom_right = coordinates.bottom_right || {};
    return (
      isEmptyLatLong(top_left) ??
      isEmptyLatLong(top_right) ??
      isEmptyLatLong(bottom_left) ??
      isEmptyLatLong(bottom_right)
    );
  };

  const handleSubmitForm = ({
    homographyMatrix,
    image_coordinates,
  }: {
    homographyMatrix: any;
    image_coordinates: any;
  }) => {
    console.info('handleSubmitForm ', homographyMatrix, image_coordinates);
    const isEmptyPayload = () => {
      return (
        isEmptyMatrix(homographyMatrix) || isEmptyCoordinates(image_coordinates)
      );
    };
    if (isEmptyPayload()) {
      console.error('Payload is empty');
      // toast('error', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
  };
  const { mutate: saveBevInfo } = useMutation({
    mutationFn: (data: BEVMetadataPayloadRequest): any =>
      saveBevMetadata(viewPointCamera?.viewPointId ?? 0, data),
    onSuccess: () => {
      toast('success', 'Đã cập nhật Bev metadata');
    },
    onError: () => {
      toast('error', 'Update bev meta error');
      toast('error', 'Có lỗi xảy ra, vui lòng thử lại sau');
    },
  });

  const handlePreviewRectangle = () => {
    if (isEmptyCoordinates(getValues().image_coordinates)) {
      toast('error', 'Vui lòng nhập đầy đủ thông tin trước khi preview');
      return;
    }
    setShowPreview(true);
  };

  const renderHomoMatrixBoxInput = () => {
    return (
      <Box className="mt-3">
        <Box sx={{ px: 3, py: 2 }}>
          <div>
            <h3>Homography Matrix</h3>
          </div>
          <Grid container spacing={2}>
            {[0, 1, 2].map((row) => (
              <Grid item xs={12} key={row}>
                <Grid container spacing={2}>
                  {[0, 1, 2].map((col) => (
                    <Grid item xs={4} key={col}>
                      <FormInput
                        className="mt-2"
                        control={control}
                        name={`homographyMatrix[${row}][${col}]`}
                        type="number"
                        inputElementClassName="form-control mr-sm-2"
                        placeholder={`m${row}${col}`}
                        label={`m${row}${col}`}
                        labelClassName=""
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  };
  const renderCoordinateBoxInput = () => {
    return (
      <Box className="mt-3">
        <Box sx={{ px: 3, py: 2 }}>
          <div>
            <div className="flex items-center">
              <h3 className="leading-normal">Rectangle Coordinates</h3>
              <div className="ml-4 leading-1 cursor-pointer">
                <VisibilityIcon onClick={handlePreviewRectangle} />
              </div>
            </div>
          </div>
          <Grid container spacing={2}>
            {['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'].map(
              (position, index) => (
                <Grid item xs={6} key={index}>
                  <h4>{position}</h4>
                  <FormInput
                    className="mt-2"
                    control={control}
                    name={`image_coordinates[${_snakeCase(
                      position.toLowerCase(),
                    )}].lat`}
                    type="number"
                    inputElementClassName="form-control mr-sm-2"
                    placeholder="Latitude"
                    label="Latitude"
                    labelClassName=""
                  />
                  <FormInput
                    className="mt-2"
                    control={control}
                    name={`image_coordinates[${_snakeCase(
                      position.toLowerCase(),
                    )}].long`}
                    type="number"
                    inputElementClassName="form-control mr-sm-2"
                    placeholder="Longitude"
                    label="Longitude"
                    labelClassName=""
                  />
                </Grid>
              ),
            )}
          </Grid>
        </Box>
      </Box>
    );
  };

  const renderPreview = () => {
    return (
      <Box
        className="mt-3"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 1,
          p: 3,
        }}
      >
        <Box sx={{ px: 3, py: 2 }}>
          <Grid container spacing={2}>
            <MapWithRectangle
              width={'-webkit-fill-available'}
              height={400}
              rectangle={getValues().image_coordinates}
              center={[viewPoint.long, viewPoint.lat]}
            />
          </Grid>
        </Box>
      </Box>
    );
  };

  return (
    <Grid container>
      <Grid item xs={12} my={2}>
        <Card>
          <CardHeader title="Metadata của ảnh BEV" />
          <Grid container>
            <Grid item xs={6}>
              <Modal open={showPreview} onClose={() => setShowPreview(false)}>
                {renderPreview()}
              </Modal>
              {renderCoordinateBoxInput()}
            </Grid>
            <Grid item xs={6}>
              {renderHomoMatrixBoxInput()}
              <div className="flex justify-end mx-5">
                <form onSubmit={handleSubmit(handleSubmitForm)}>
                  <Button
                    variant="contained"
                    className="btn wd-140 btn-sm btn-primary"
                    type="submit"
                  >
                    Lưu
                  </Button>
                </form>
              </div>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}
