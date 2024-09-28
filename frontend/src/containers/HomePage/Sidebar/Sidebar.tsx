import * as React from 'react';
import { useRouter } from 'next/router';
import { useResponsive } from '../../../shared/hooks/use-responsive';
import { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  InputAdornment, Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { Scrollbar } from '../../../components/Scrollbar';
import Link from 'next/link';
import Image from 'next/image';
import {
  ListViewPointPaginateResponse,
  ViewPointData,
} from '../../GisMap/models';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import SearchIcon from '@mui/icons-material/Search';
import _isEmpty from 'lodash/isEmpty';
import { DEFAULT_PAGINATION_PARAMS } from '../../../constants';
import { useQuery } from 'react-query';
import { listViewPointsPaginate } from '../../../api/view-point';
import { toast } from '../../../components/Toast';
import _debounce from 'lodash/debounce';
import { account } from '../../../mocks/account';
import { Iconify } from '../../../components/Iconify';
import Button from '@mui/material/Button';
import { PathName } from '../../../constants/routes';

type Props = {
  onClose: () => void;
  open: boolean;
};

export function Sidebar({ open, onClose }: Props): React.ReactElement {
  const router = useRouter();
  const pathname = router.pathname;
  const [keyword, setKeyword] = React.useState<string | null>('');
  const [paginationParams, setPaginationParams] = React.useState(
    DEFAULT_PAGINATION_PARAMS,
  );
  const {
    data: dataListResponse,
    isFetching,
    // refetch,
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

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);


  const handleSearchByText = async (text: string) => {};

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    _debounce((query: string) => {
      handleSearchByText(query).then((res: ViewPointData[]) => {
        setKeyword(res);
      });
    }, 300),
    [],
  );



  const renderResultItem = (item: ViewPointData) => {
    return (
      <Card sx={{ maxWidth: 500 }} className="mt-2">
        <CardActionArea>
          <Skeleton variant="rectangular"  height={140} animation={false} />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {item.name || "Không có thông tin"}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description || "Không có mô tả"}
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
      <div className="results flex-col w-100"
        style={{
          overflowY: 'auto',
          height: 'calc(100vh - 100px)',
        }}
      >
        <Scrollbar>
          {!_isEmpty(dataListResponse?.data) &&
            dataListResponse?.data.map((item) => renderResultItem(item))}
        </Scrollbar>
      </div>
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
