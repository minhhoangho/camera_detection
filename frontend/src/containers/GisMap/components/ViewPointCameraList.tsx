import { Box, Button } from '@mui/material';
import { useQuery } from 'react-query';
import React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { format } from 'date-fns';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'src/components/Toast';
import { Table } from 'src/components/Table';
import { deleteViewPointCamera, getListViewPointCameras } from 'src/api/view-point';
import { DEFAULT_PAGINATION_PARAMS } from 'src/constants';
import { PaginationQueryParams } from 'src/shared/models/requests';
import { UpsertCameraSourceModal } from './UpsertCameraSourceModal';
import {
  ListViewPointCameraPaginateResponse,
  ViewPointCameraData,
} from '../models';
import {
  VIEW_POINT_CAMERA_MANAGEMENT_COLUMNS_LABEL,
  VIEW_POINT_CAMERA_MANAGEMENT_KEY,
  VIEW_POINT_MANAGEMENT_COLUMNS_LABEL,
  VIEW_POINT_MANAGEMENT_KEY,
} from '../constants';
import useConfirm from '../../../shared/hooks/use-confirm';

type ViewPointCameraListProps = {
  viewPointId: number;
  setShowRealtimeCamera: (val: boolean, viewPointCamera: ViewPointCameraData) => void;
};

export function ViewPointCameraList({ viewPointId, setShowRealtimeCamera }: ViewPointCameraListProps) {
  const [paginationParams, setPaginationParams] = React.useState(
    DEFAULT_PAGINATION_PARAMS,
  );
  const confirmBox = useConfirm();

  const [isOpenUpsert, setIsOpenUpsert] = React.useState(false);
  const [selectedCameraViewPoint, setSelectedCameraViewPoint] =
    React.useState<ViewPointCameraData | null>(null);

  const {
    data: dataListResponse,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<ListViewPointCameraPaginateResponse>({
    queryKey: ['getListViewPointCameraPaginate', paginationParams],
    queryFn: () =>
      getListViewPointCameras(viewPointId, {
        offset: paginationParams.offset,
        limit: paginationParams.limit,
      }),
    onError: () => toast('error', 'Error'),
    // cacheTime: 0,
    enabled: !!viewPointId,
  });

  const handleNextPage = (query: PaginationQueryParams) => {
    setPaginationParams({ limit: query.limit, offset: query.offset });
  };

  const renderActionButton = (item: ViewPointCameraData) => {
    return (
      <div className="flex justify-end gap-x-3">
        <Tooltip
          title="Chỉnh sửa thông tin camera"
          className="cursor-pointer"
          onClick={() => handleUpdate(item)}
        >
          <EditIcon style={{ fontSize: '20px', outline: 'none' }} />
        </Tooltip>
         <Tooltip
          title="View viewpoint"
          className="cursor-pointer"
          onClick={() => handleUpdate(item)}
        >
          <VisibilityIcon style={{ fontSize: '20px', outline: 'none' }}
          onClick={() => setShowRealtimeCamera(true, item)}
          />
        </Tooltip>
        <Tooltip
          title="Xoá thông tin"
          className="cursor-pointer"
          onClick={() => handleDelete(item)}
        >
          <DeleteIcon style={{ fontSize: '20px', outline: 'none' }} />
        </Tooltip>
      </div>
    );
  };

  const columns: GridColDef[] = [
    {
      field: VIEW_POINT_CAMERA_MANAGEMENT_KEY.ID,
      headerName:
        VIEW_POINT_CAMERA_MANAGEMENT_COLUMNS_LABEL[
          VIEW_POINT_CAMERA_MANAGEMENT_KEY.ID
        ],
      sortable: false,
      filterable: false,
      width: 80,
    },
    {
      field: VIEW_POINT_CAMERA_MANAGEMENT_KEY.CAMERA_SOURCE,
      headerName:
        VIEW_POINT_CAMERA_MANAGEMENT_COLUMNS_LABEL[
          VIEW_POINT_CAMERA_MANAGEMENT_KEY.CAMERA_SOURCE
        ],
      sortable: false,
      filterable: false,
      width: 80,
      renderCell: (params: GridRenderCellParams<any, any>) => {
        const sourceEnum: Record<number, string> = {
          0: 'RTSP',
          1: 'Youtube',
        };
        return <span className="">{sourceEnum[params.row.cameraSource]}</span>;
      },
    },
    {
      field: VIEW_POINT_CAMERA_MANAGEMENT_KEY.CAMERA_URI,
      headerName:
        VIEW_POINT_CAMERA_MANAGEMENT_COLUMNS_LABEL[
          VIEW_POINT_CAMERA_MANAGEMENT_KEY.CAMERA_URI
        ],
      sortable: false,
      filterable: false,
      width: 200,
    },
    {
      field: VIEW_POINT_MANAGEMENT_KEY.UPDATED_AT,
      headerName:
        VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[
          VIEW_POINT_MANAGEMENT_KEY.UPDATED_AT
        ],
      sortable: false,
      filterable: false,
      width: 100,
      valueFormatter: (params) => {
        return `${format(
          new Date(params?.value || Date.now()),
          'dd/MM/yyyy HH:mm',
        )}`;
      },
    },
    {
      field: VIEW_POINT_MANAGEMENT_KEY.ACTION,
      headerName:
        VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.ACTION],
      sortable: false,
      filterable: false,
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        return renderActionButton(params.row as ViewPointCameraData);
      },
    },
  ];
  const handleCreate = () => {
    setIsOpenUpsert(true);
  };

  const handleDelete = async (cam: ViewPointCameraData) => {

    const result = await confirmBox.confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa?',
      confirmButtonLabel: 'Xóa',
    });
    if (result) {
      try {
        await deleteViewPointCamera(viewPointId, cam.id);
      } catch (error) {
        toast('error', 'Error');
      }
      await refetch();

    }
  }

  const handleUpdate = (viewPointCamera: ViewPointCameraData) => {
    setSelectedCameraViewPoint(viewPointCamera);
    setIsOpenUpsert(true);
  };

  const handleCloseModal = async () => {
    setIsOpenUpsert(false);
    await refetch();
  };

  return (
    <Box>
      <Button variant="contained" className="mt-2" onClick={handleCreate}>
        <span>Thêm nguồn camera</span>
      </Button>
      <Table
        rows={dataListResponse?.data ?? []}
        columns={columns}
        loading={isFetching || isLoading}
        pagination={
          dataListResponse?.pagination ?? {
            ...DEFAULT_PAGINATION_PARAMS,
            total: 0,
          }
        }
        onChangePage={handleNextPage}
      />

      <UpsertCameraSourceModal
        viewPointId={viewPointId}
        cameraViewPoint={selectedCameraViewPoint}
        isOpen={isOpenUpsert}
        onClose={handleCloseModal}
      />
    </Box>
  );
}
