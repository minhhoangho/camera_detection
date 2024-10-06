import * as React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import {
  Box,
  Drawer,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import { useInfiniteQuery } from 'react-query';

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
import { Iconify } from 'src/components/Iconify';
import { Scrollbar } from 'src/components/Scrollbar';
import { PathName } from '../../../constants/routes';
import Spinner from 'src/components/Spinner';
import styles from './Sidebar.module.scss';
import { PublicCameraSidebar } from './PublicCameraSidebar/PublicCameraSidebar';
import classNames from "classnames";

type Props = {
  onClose: () => void;
  open: boolean;
};

export function Sidebar({ open, onClose }: Props): React.ReactElement {
  const router = useRouter();
  const pathname = router.pathname;
  const [keyword, setKeyword] = React.useState<string | null>('');
  const [activeViewPoint, setActiveViewPoint] =
    React.useState<ViewPointData | null>(null);


  const { data, fetchNextPage, isLoading, isFetching } =
    useInfiniteQuery<ListViewPointPaginateResponse>({
      queryKey: ['getListViewPointPaginate', keyword],
      queryFn: ({ pageParam }) =>
        listViewPointsPaginate({
          keyword: keyword ?? '',
          pagination: {
            offset: pageParam?.offset ?? 0,
            limit: DEFAULT_PAGINATION_PARAMS.limit,
          },
        }),
      enabled: open,
      getNextPageParam: (lastPage: ListViewPointPaginateResponse) => {
        const _offset =
          lastPage?.pagination.offset + DEFAULT_PAGINATION_PARAMS.limit;
        return _offset < lastPage?.pagination.total
          ? { offset: _offset }
          : undefined;
      },
    });

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleScroll = (event: any) => {
    if (event.target) {
      const {
        scrollTop,
        scrollHeight,
        clientHeight,
      }: {
        scrollTop: number;
        scrollHeight: number;
        clientHeight: number;
      } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 5 && !isFetching) {
        fetchNextPage();
      }
    }
  };

  const renderResultItem = (item: ViewPointData) => {
    return (
      <Card
        sx={{ maxWidth: 500, minWidth: 200 }}
        className="my-4 px-4"
        key={item.id}
        style={{
          background: 'transparent',
        }}
      >
        <CardActionArea className={styles['custom-card-border']} onClick={() => setActiveViewPoint(item)}>
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
      <div className={classNames("flex")}>
        <div className={styles['list-content']}>
          <div className="mt-2">
            <Box sx={{ my: 1.5, px: 2 }} className="flex">
              <Button
                onClick={() => router.push(PathName.GisLocationManagement)}
              >
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
          <div className="search-filter-box px-4">
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
            {!_isEmpty(data?.pages) &&
              data?.pages.map((page, _index) => {
                return (
                  <React.Fragment key={_index}>
                    {page.data.map((item) => renderResultItem(item))}
                  </React.Fragment>
                );
              })}
            {(isLoading || isFetching) && (
              <div className="w-100 flex justify-center">
                <Spinner />
              </div>
            )}
          </Scrollbar>
        </div>
        <div className={classNames(styles["camera-content"], !!activeViewPoint && styles["active-camera-wrapper"])}>
          <PublicCameraSidebar
            onClose={() => setActiveViewPoint(null)}
            open={!!activeViewPoint}
            viewPointId={activeViewPoint?.id ?? 0}
          />
        </div>
      </div>
    </>
  );


  return (
    <Box
      sx={{
        minWidth: { lg: 280 },
        position: 'absolute',
      }}
    >
      <Drawer
        open={open}
        onClose={() => {
          onClose();
          setActiveViewPoint(null);
        }}
        PaperProps={{
          sx: {
            minWidth: 280,
            maxWidth: '50vw'
          },
        }}
      >
        {renderContent}
      </Drawer>
    </Box>
  );
}
