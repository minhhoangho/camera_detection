import React from 'react';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { Table } from 'src/components/Table';
import { useGetListUser } from './hooks/use-get-list-user';
import {
  USER_MANAGEMENT_COLUMNS_LABEL,
  USER_MANAGEMENT_KEY,
} from './constants';
import { BaseLayout, PrivateLayout } from '../../layouts';
import { DEFAULT_PAGINATION_PARAMS } from '../../constants';
import { useDebouncedCallback } from '../../shared/hooks/use-debounce-callback';
import { PathName } from '../../constants/routes';
import { PaginationQueryParams } from '../../shared/models/requests';

export function UserManagement() {
  const router = useRouter();
  const [paginationParams, setPaginationParams] = React.useState(
    DEFAULT_PAGINATION_PARAMS,
  );
  const [keyword, setKeyword] = React.useState<string | null>(null);

  const renderActionButton = () => {
    return (
      <div className="flex justify-end gap-x-6">
        <Tooltip title="Edit user">
          <Button
            onClick={() => router.push(PathName.UserManagement)}
            style={{ padding: 0 }}
          >
            <EditIcon style={{ fontSize: '20px', outline: 'none' }} />
          </Button>
        </Tooltip>
      </div>
    );
  };

  const colums: GridColDef[] = [
    {
      field: USER_MANAGEMENT_KEY.ID,
      headerName: USER_MANAGEMENT_COLUMNS_LABEL[USER_MANAGEMENT_KEY.ID],
      sortable: false,
      filterable: false,
      width: 240,
    },
    {
      field: USER_MANAGEMENT_KEY.EMAIL,
      headerName: USER_MANAGEMENT_COLUMNS_LABEL[USER_MANAGEMENT_KEY.EMAIL],
      sortable: false,
      filterable: false,
      width: 180,
    },
    {
      field: USER_MANAGEMENT_KEY.USERNAME,
      headerName: USER_MANAGEMENT_COLUMNS_LABEL[USER_MANAGEMENT_KEY.USERNAME],
      sortable: false,
      filterable: false,
      width: 160,
    },
    {
      field: USER_MANAGEMENT_KEY.FULL_NAME,
      headerName: USER_MANAGEMENT_COLUMNS_LABEL[USER_MANAGEMENT_KEY.FULL_NAME],
      sortable: false,
      filterable: false,
      width: 200,
      valueGetter: (params: GridValueGetterParams) =>
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    },
    {
      field: USER_MANAGEMENT_KEY.REGISTER_AT,
      headerName:
        USER_MANAGEMENT_COLUMNS_LABEL[USER_MANAGEMENT_KEY.REGISTER_AT],
      sortable: false,
      filterable: false,
      width: 160,
      valueFormatter: (params) => {
        return `${format(new Date(params.value), 'dd/MM/yyyy HH:mm')}`;
      },
    },
    {
      field: USER_MANAGEMENT_KEY.ACTION,
      headerName: USER_MANAGEMENT_COLUMNS_LABEL[USER_MANAGEMENT_KEY.ACTION],
      sortable: false,
      filterable: false,
      width: 100,
      renderCell: () => {
        return renderActionButton();
      },
    },
  ];

  const {
    data: userListResponse,
    isLoading: isLoadingGetUserList,
    refetch: refetchUserList,
    isFetching: isFetchingUserList,
  } = useGetListUser({
    keyword: keyword ?? '',
    pagination: {
      offset: paginationParams.offset,
      limit: paginationParams.limit,
    },
  });

  const debouncedRefetchUser = useDebouncedCallback(
    () => refetchUserList(),
    300,
    [],
  );

  React.useEffect(() => {
    debouncedRefetchUser();
    //  eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationParams.limit, paginationParams.offset]);

  const handleNextPage = (query: PaginationQueryParams) => {
    setKeyword('');
    setPaginationParams({ limit: query.limit, offset: query.offset });
  };
  return (
    <BaseLayout>
      <PrivateLayout>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 5 }}>
            Hi, Welcome back 👋
          </Typography>
          <Grid container>
            <Grid item>
              <Box>
                <Table
                  rows={userListResponse?.data ?? []}
                  columns={colums}
                  loading={isLoadingGetUserList || isFetchingUserList}
                  pagination={
                    userListResponse?.pagination ?? {
                      ...DEFAULT_PAGINATION_PARAMS,
                      total: 0,
                    }
                  }
                  onChangePage={handleNextPage}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
