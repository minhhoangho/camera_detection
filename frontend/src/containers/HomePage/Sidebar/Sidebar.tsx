import * as React from 'react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import _debounce from 'lodash/debounce';
import { useQuery } from 'react-query';

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import SearchIcon from '@mui/icons-material/Search';
import _isEmpty from 'lodash/isEmpty';
import {
  ListViewPointPaginateResponse,
  ViewPointData,
} from '../../GisMap/models';
import { DEFAULT_PAGINATION_PARAMS } from '../../../constants';
import { listViewPointsPaginate } from '../../../api/view-point';
import { toast } from '../../../components/Toast';
import { Iconify } from '../../../components/Iconify';
import { Scrollbar } from '../../../components/Scrollbar';
import { PathName } from '../../../constants/routes';

type Props = {
  onClose: () => void;
  open: boolean;
};

export function Sidebar({ open, onClose }: Props): React.ReactElement {
  const router = useRouter();
  const pathname = router.pathname;
  const [keyword, setKeyword] = React.useState<string | null>('');
  const [dataRender, setDataRender] = React.useState<ViewPointData[]>([]);
  const [paginationParams, setPaginationParams] = React.useState(
    DEFAULT_PAGINATION_PARAMS,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    data: dataListResponse,
    // isFetching,
    refetch,
    // isLoading,
  } = useQuery<ListViewPointPaginateResponse>({
    queryKey: ['getListViewPointPaginate'],
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

  console.log("DataRender ", dataRender)

  useEffect(() => {
    if (dataListResponse?.data) {
      setDataRender((prevData) => [...prevData, ...dataListResponse.data]);
    }
  }, [dataListResponse]);

  const debouncedKeywordRefetch = useCallback(
    _debounce(() => {
      if(!keyword) {
        refetch()
        return
      }
      // For this refetch, keyword is changed, so we need to reset the data
      setDataRender([]);
      setPaginationParams(DEFAULT_PAGINATION_PARAMS);
      refetch()
    }, 300),
    [refetch],
  );
  useEffect(() => {
    debouncedKeywordRefetch();
  }, [keyword, debouncedKeywordRefetch]);


  useEffect(() => {
    if (dataListResponse) {
      if (dataListResponse.pagination.total <= paginationParams.offset) {
        return;
      }
    }
    refetch();
  }, [paginationParams, refetch, dataListResponse]);


  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleScroll = (event: any) => {
    if (event.target) {
      const { scrollTop, scrollHeight, clientHeight } = event.target
      console.log("Debug", scrollTop, scrollHeight, clientHeight)
      console.log("Number(scrollTop) + clientHeight - scrollHeight ", Number(scrollTop) + clientHeight - scrollHeight)
      if (Number(scrollTop) + clientHeight >= scrollHeight - 5) {
        setPaginationParams((prev) => ({
          ...prev,
          offset: prev.offset + prev.limit,
        }));
      }
    }
  };





  const renderResultItem = (item: ViewPointData) => {
    return (
      <Card sx={{ maxWidth: 500 }} className="mt-2" key={item.id}>
        <CardActionArea>
          <Skeleton variant="rectangular" height={140} animation={false} />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {item.name || 'Không có thông tin'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description || 'Không có mô tả'}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  const renderContent = (
    <>
      <div className="mt-2">
        <Box sx={{ my: 1.5, px: 2 }} className="flex">
          <Button onClick={() => router.push(PathName.GisLocationManagement)}>
            <Iconify
              icon="mdi:user"
              color="text.disabled"
              width={20}
              height={20}
            />
            <Typography variant="subtitle2" noWrap>
              Admin
            </Typography>
          </Button>
        </Box>
      </div>
      <div className="search-filter-box">
        <TextField
          fullWidth
          placeholder="Search camera location"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 0,
          }}
        />
      </div>

        <Scrollbar
          style={{
            overflowY: 'auto',
            height: 'calc(100vh - 100px)',
          }}
          onScroll={handleScroll}

        >
          {!_isEmpty(dataRender) &&
            dataRender.map((item) => renderResultItem(item))}
        </Scrollbar>
    </>
  );
  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: 280 },
        position: 'absolute',
      }}
    >
      <Drawer
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 280,
          },
        }}
      >
        {renderContent}
      </Drawer>
    </Box>
  );
}
