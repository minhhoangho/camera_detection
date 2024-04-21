import { Box } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {cloneDeep} from "lodash";
import { TablePaginationAction } from './TablePaginationAction';
import { PaginationMeta } from '../../shared/models/responses';
import { PaginationQueryParams } from '../../shared/models/requests';
type TableProps = {
  rows: Record<string, any>[];
  columns: GridColDef[];
  pagination: PaginationMeta;
  loading?: boolean;
  reformatID?: boolean;
  // Function
  onChangePage: (queryParams: PaginationQueryParams) => void;
};

export function Table({
  rows = [],
  columns,
  pagination,
  loading = false,
  onChangePage,
  reformatID = true,
}: TableProps) {
  const handleChangePage = (payload: GridPaginationModel) => {
    if (payload.pageSize !== pagination.limit) {
      payload.page = 0;
      rows.splice(0, payload.pageSize);
    }
    const limit = payload.pageSize;
    const offset = payload.page * payload.pageSize;
    onChangePage({ limit, offset });
  };

  const reformatRows = (_rows: any[]) => {
    if (!reformatID) {
      return _rows;
    }
    // reorder column id to the first of array columns, if not exist -> add id to the first of array columns
    columns = columns.filter((column) => column.field !== 'id');
    columns.unshift({ field: 'rowId', headerName: 'ID', width: 50, sortable: false, filterable: false });

    return _rows.map((row, index) => {
      return {
        ...row,
        rowId: index + pagination.offset + 1,
      };
    });
  };

  return (
    <Box height={500}>
      <DataGrid
        rows={reformatRows(cloneDeep(rows))}
        columns={columns}
        loading={loading}
        rowCount={pagination.total}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pagination.limit,
            },
          },
        }}
        paginationModel={{
          pageSize: pagination?.limit,
          page: pagination?.offset / pagination?.limit, // Page default is from 0
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
