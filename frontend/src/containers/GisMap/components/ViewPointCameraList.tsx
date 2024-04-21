import { Box, Button } from '@mui/material';
import { useQuery } from 'react-query';
import {
  ListViewPointCameraPaginateResponse,
  ListViewPointPaginateResponse,
} from '../models';
import {
  getListViewPointCameras,
  listViewPointsPaginate,
} from '../../../api/view-point';
import { toast } from '../../../components/Toast';
import React from 'react';
import { DEFAULT_PAGINATION_PARAMS } from '../../../constants';
import { Table } from '../../../components/Table';
import { PaginationQueryParams } from '../../../shared/models/requests';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  VIEW_POINT_CAMERA_MANAGEMENT_COLUMNS_LABEL,
  VIEW_POINT_CAMERA_MANAGEMENT_KEY,
  VIEW_POINT_MANAGEMENT_COLUMNS_LABEL,
  VIEW_POINT_MANAGEMENT_KEY,
} from '../constants';
import { PathName } from '../../../constants/routes';
import { format } from 'date-fns';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import { UpsertCameraSourceModal } from './UpsertCameraSourceModal';

type ViewPointCameraListProps = {
  viewPointId: number;
};
export function ViewPointCameraList({ viewPointId }: ViewPointCameraListProps) {
  const [paginationParams, setPaginationParams] = React.useState(
    DEFAULT_PAGINATION_PARAMS,
  );
  const [isOpenUpsert, setIsOpenUpsert] = React.useState(false);

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

  const renderActionButton = (params) => {
    return (
      <div className="flex justify-end gap-x-6">
        <Tooltip title="Edit camera viewpoint">
          <Button style={{ padding: 0 }}>
            <EditIcon style={{ fontSize: '20px', outline: 'none' }} />
          </Button>
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
      width: 150,
      renderCell: (params: GridRenderCellParams<any, any>) => {
        return (
          <span className="cursor-pointer  hover:underline font-semibold">
            {params.row.cameraSource}
          </span>
        );
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
      width: 100,
    },
    {
      field: VIEW_POINT_MANAGEMENT_KEY.CREATED_AT,
      headerName:
        VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[
          VIEW_POINT_MANAGEMENT_KEY.CREATED_AT
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
      width: 80,
      renderCell: renderActionButton,
    },
  ];
  const handleCreate = () => {
    setIsOpenUpsert(true);
  };

  return (
    <Box>
      <Button variant="contained" className="mt-2" onClick={handleCreate}>
        <span>Add camera source</span>
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
        isOpen={isOpenUpsert}
        onClose={() => setIsOpenUpsert(!isOpenUpsert)}
      />
    </Box>
  );
}
