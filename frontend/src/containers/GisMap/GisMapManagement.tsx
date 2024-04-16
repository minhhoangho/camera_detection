import {
    Button,
    Card,
    Container,
    Grid,
    Typography,
} from '@mui/material';
import React from 'react';
// import {OpenLayerMap} from "./OpenLayerMap";
import {useQuery} from "react-query";
import {useRouter} from "next/router";
import Tooltip from "@mui/material/Tooltip";
import {GridColDef} from "@mui/x-data-grid";
import {format} from "date-fns";
import EditIcon from "@mui/icons-material/Edit";
import {ListViewPointPaginateResponse} from "./models";
import {VIEW_POINT_MANAGEMENT_COLUMNS_LABEL, VIEW_POINT_MANAGEMENT_KEY} from "./constants";
import {BaseLayout, PrivateLayout} from '../../layouts';
import {Table} from "../../components/Table";
import {toast} from "../../components/Toast";
import {listViewPointsPaginate} from "../../api/view-point";
import {DEFAULT_PAGINATION_PARAMS} from "../../constants";
import {PaginationQueryParams} from "../../shared/models/requests";
import {PathName} from "../../constants/routes";
import {useDebouncedCallback} from "../../shared/hooks/use-debounce-callback";

export function GisMapViewPointManagement() {
    const router = useRouter();
    const [paginationParams, setPaginationParams] = React.useState(
        DEFAULT_PAGINATION_PARAMS,
    );
    console.log("paginationParams", paginationParams)
    const [keyword, setKeyword] = React.useState<string | null>(null);

    const {data: dataListResponse, isFetching, refetch, isLoading} = useQuery<ListViewPointPaginateResponse>({
        queryKey: ['getListViewPointPaginate'],
        queryFn: () => listViewPointsPaginate({
            keyword: keyword ?? '',
            pagination: {
                offset: paginationParams.offset,
                limit: paginationParams.limit,
            },
        }),
        onError: () => toast('error', "Error"),
        staleTime: 0,
        cacheTime: 0,
        enabled: false,
    });

    const debouncedRefetch = useDebouncedCallback(
        () => refetch(),
        300,
        [],
    );

    React.useEffect(() => {
        debouncedRefetch();
        //  eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationParams.limit, paginationParams.offset]);
    const renderActionButton = () => {
        return (
            <div className="flex justify-end gap-x-6">
                <Tooltip title="Edit user">
                    <Button
                        onClick={() => router.push(PathName.UserManagement)}
                        style={{padding: 0}}
                    >
                        <EditIcon style={{fontSize: '20px', outline: 'none'}}/>
                    </Button>
                </Tooltip>
            </div>
        );
    };

    const columns: GridColDef[] = [
        {
            field: VIEW_POINT_MANAGEMENT_KEY.ID,
            headerName: VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.ID],
            sortable: false,
            filterable: false,
            width: 240,
        },
        {
            field: VIEW_POINT_MANAGEMENT_KEY.NAME,
            headerName: VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.NAME],
            sortable: false,
            filterable: false,
            width: 180,
        },
        {
            field: VIEW_POINT_MANAGEMENT_KEY.DESCRIPTION,
            headerName: VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.DESCRIPTION],
            sortable: false,
            filterable: false,
            width: 160,
        },
        {
            field: VIEW_POINT_MANAGEMENT_KEY.LAT,
            headerName: VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.LAT],
            sortable: false,
            filterable: false,
            width: 100,
        },
        {
            field: VIEW_POINT_MANAGEMENT_KEY.LONG,
            headerName: VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.LONG],
            sortable: false,
            filterable: false,
            width: 100,
        },
        {
            field: VIEW_POINT_MANAGEMENT_KEY.CREATED_AT,
            headerName:
                VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.CREATED_AT],
            sortable: false,
            filterable: false,
            width: 160,
            // valueFormatter: (params) => {
            //     return `${format(new Date(params.value), 'dd/MM/yyyy HH:mm')}`;
            // },
        },
        {
            field: VIEW_POINT_MANAGEMENT_KEY.ACTION,
            headerName: VIEW_POINT_MANAGEMENT_COLUMNS_LABEL[VIEW_POINT_MANAGEMENT_KEY.ACTION],
            sortable: false,
            filterable: false,
            width: 100,
            renderCell: () => {
                return renderActionButton();
            },
        },
    ];

    const handleNextPage = (query: PaginationQueryParams) => {
        setKeyword('');
        setPaginationParams({limit: query.limit, offset: query.offset});
    };
    return (
        <BaseLayout>
            <PrivateLayout>
                <Container>
                    <Typography variant="h4" sx={{mb: 5}}>
                        Hi, Gis Map 👋
                    </Typography>
                    <Grid container spacing={3} alignItems="stretch">
                        <Grid item xs={12}>
                            <Card>
                                <Table
                                    rows={dataListResponse?.data ?? []}
                                    columns={columns}
                                    loading={isFetching || isLoading}
                                    pagination={
                                        dataListResponse?.pagination ?? {
                                            ...DEFAULT_PAGINATION_PARAMS,
                                            total: 0,
                                        }
                                    } onChangePage={
                                    handleNextPage
                                }/>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </PrivateLayout>
        </BaseLayout>
    );
}
