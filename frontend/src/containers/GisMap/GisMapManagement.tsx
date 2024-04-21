import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
// import {OpenLayerMap} from "./OpenLayerMap";
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import Tooltip from '@mui/material/Tooltip';
import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { ListViewPointPaginateResponse } from './models';
import {
  VIEW_POINT_MANAGEMENT_COLUMNS_LABEL,
  VIEW_POINT_MANAGEMENT_KEY,
} from './constants';
import styles from './GisMap.module.scss';
import { CreateViewPointModal } from './CreateViewPointModal';
import { BaseLayout, PrivateLayout } from '../../layouts';
import { Table } from '../../components/Table';
import { toast } from '../../components/Toast';
import { listViewPointsPaginate } from '../../api/view-point';
import { DEFAULT_PAGINATION_PARAMS } from '../../constants';
import { PaginationQueryParams } from '../../shared/models/requests';
import { PathName } from '../../constants/routes';
import { Iconify } from '../../components/Iconify';

export function GisMapViewPointManagement() {
  const router = useRouter();
  const [isOpenCreate, setIsOpenCreate] = React.useState(false);
  const [paginationParams, setPaginationParams] = React.useState(
    DEFAULT_PAGINATION_PARAMS,
  );
  const [keyword, setKeyword] = React.useState<string | null>('');

  const {
    data: dataListResponse,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<ListViewPointPaginateResponse>({
    queryKey: ['getListViewPointPaginate', paginationParams],
    queryFn: () =>
      listViewPointsPaginate({
        keyword: keyword ?? '',
        pagination: {
          offset: paginationParams.offset,
          limit: paginationParams.limit,
        },
      }),
    onError: () => toast('error', 'Error'),
    // cacheTime: 0,
  });

  // useEffect(() => {
  //   debouncedRefetch();
  //
  //   // Cleanup function
  //   return () => {
  //     debouncedRefetch.cancel();
  //   };
  //   //  eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [paginationParams.limit, paginationParams.offset]);


    const renderActionButton = (params) => {
    return (
      <div className="flex justify-end gap-x-6">
        <Tooltip title="Edit location">
          <Button
            onClick={() =>
              router.push(`${PathName.GisLocationManagement}/${params.row.id}`)
            }
            style={{ padding: 0 }}
          >
            <EditIcon style={{ fontSize: '20px', outline: 'none' }} />
          </Button>
        </Tooltip>
      </div>
    );
  };

  const columns: GridColDef[] = [
    {
      field: VIEW_POINT_MANAGEMENT_KEY.ID,
      headerName:
        VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.ID],
      sortable: false,
      filterable: false,
      width: 80,
    },
    {
      field: VIEW_POINT_MANAGEMENT_KEY.NAME,
      headerName:
        VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.NAME],
      sortable: false,
      filterable: false,
      width: 150,
      renderCell: (params: GridRenderCellParams<any, any>) => {
        return (
          <span
            onClick={() =>
              router.push(`${PathName.GisLocationManagement}/${params?.row.id}`)
            }
            className="cursor-pointer  hover:underline font-semibold"
          >
            {params.row.name}
          </span>
        );
      },
    },
    {
      field: VIEW_POINT_MANAGEMENT_KEY.DESCRIPTION,
      headerName:
        VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[
          VIEW_POINT_MANAGEMENT_KEY.DESCRIPTION
        ],
      sortable: false,
      filterable: false,
      width: 150,
    },
    {
      field: VIEW_POINT_MANAGEMENT_KEY.LAT,
      headerName:
        VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.LAT],
      sortable: false,
      filterable: false,
      width: 200,
    },
    {
      field: VIEW_POINT_MANAGEMENT_KEY.LONG,
      headerName:
        VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.LONG],
      sortable: false,
      filterable: false,
      width: 200,
    },
    {
      field: VIEW_POINT_MANAGEMENT_KEY.CREATED_AT,
      headerName:
        VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[
          VIEW_POINT_MANAGEMENT_KEY.CREATED_AT
        ],
      sortable: false,
      filterable: false,
      width: 150,
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
      renderCell: renderActionButton,
    },
  ];

  const handleNextPage = (query: PaginationQueryParams) => {
    setKeyword('');
    setPaginationParams({ limit: query.limit, offset: query.offset });
  };
  const handleCreate = () => {
    setIsOpenCreate(true);
  };

  const onFilterName = () => {};

  return (
    <BaseLayout>
      <PrivateLayout>
        <Container>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Location Management
          </Typography>

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} className="flex justify-between">
              <OutlinedInput
                className={styles['search-input']}
                value={keyword}
                onChange={onFilterName}
                placeholder="Search location..."
                fullWidth
                startAdornment={
                  <InputAdornment position="start">
                    <Iconify
                      icon="eva:search-fill"
                      sx={{ color: 'text.disabled', width: 20, height: 20 }}
                    />
                  </InputAdornment>
                }
              />
              <Button
                variant="contained"
                className="w-[200px]"
                onClick={handleCreate}
              >
                <span>Create Location</span>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Box>
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
              </Box>
            </Grid>
          </Grid>

          <CreateViewPointModal
            isOpen={isOpenCreate}
            onClose={() => setIsOpenCreate(!isOpenCreate)}
          />
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
