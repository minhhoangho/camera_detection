import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { TablePaginationAction } from './TablePaginationAction';
import { PaginationMeta } from '../../shared/models/responses';
import { PaginationQueryParams } from '../../shared/models/requests';

type TableProps = {
  rows: Record<string, any>[];
  columns: GridColDef[];
  pagination: PaginationMeta;
  loading?: boolean;
  // Function
  onChangePage: (queryParams: PaginationQueryParams) => void;
};

export function Table({
  rows = [],
  columns,
  pagination,
  loading = false,
  onChangePage,
}: TableProps) {
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  useEffect(() => {
    if (rows.length) {
      setTableLoading(false);
    } else {
      setTableLoading(true);
    }
    return () => setTableLoading(false);
  }, [rows]);

  const handleChangePage = (payload: GridPaginationModel) => {
    if (payload.pageSize !== pagination.limit) {
      payload.page = 1;
      rows.splice(0, payload.pageSize);
    }
    const limit = payload.pageSize;
    const offset = (payload.page - 1) * payload.pageSize;
    onChangePage({ limit, offset });
  };
  return (
    <Box height={500}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading ?? tableLoading}
        rowCount={pagination.total}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pagination.limit,
              page: 1,
            },
          },
        }}
        paginationModel={{
          pageSize: pagination.limit,
          page: pagination.offset / pagination.limit + 1,
        }}
        onPaginationModelChange={handleChangePage}
        paginationMode="server"
        sortingMode="server"
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
          pagination: {
            ActionsComponent: TablePaginationAction,
          },
        }}
      />
    </Box>
  );
}
