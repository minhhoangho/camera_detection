import React, { useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import Button from '@mui/material/Button';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import styles from './HomeMap.module.scss';
import { ListViewPointPaginateResponse } from '../../GisMap/models';
import { listViewPointsPaginate } from '../../../api/view-point';
import { DEFAULT_PAGINATION_PARAMS } from '../../../constants';
import { toast } from '../../../components/Toast';
import { MapTiler } from '../../GisMap/MapTiler/MapTiler';
import { CenterProps } from '../../GisMap/types';
import { OpenLayerMap } from '../../GisMap/OpenLayerMap';
const DEFAULT_GEO: CenterProps = [108.21631446431337, 16.07401627168764]; // (long, lat) Da nang location

type MapProps = {
  width?: number | string;
  height: number | string;
};

export function HomeMap(props: MapProps) {
  const { width, height } = props;
  // const mapRef = useRef<Map | null>(null);
  // const [center, setCenter] = useState(DEFAULT_GEO);
  // const center = DEFAULT_GEO;
  const [useMapTile, setUseMapTile] = useState(false);
  const [center, setCenter] = useState<CenterProps>(DEFAULT_GEO);
  const [currentTime, setCurrentTime] = useState(null);

  const { data: listResponse } = useQuery<ListViewPointPaginateResponse>({
    queryKey: ['getListViewPointPaginate'],
    queryFn: () =>
      listViewPointsPaginate({
        keyword: '',
        pagination: {
          offset: 0,
          limit: DEFAULT_PAGINATION_PARAMS.limit + 100,
        },
      }),
    cacheTime: 0,
    onError: () => {
      toast('error', 'Error f...');
    },
    retry: false,
  });

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTime(new Date().toLocaleTimeString());
  //   }, 1000);
  //
  //   return () => clearInterval(interval);
  // }, []);

  const renderMap = () => {
    if (useMapTile) {
      return (
        <MapTiler
          center={center}
          geoData={listResponse?.data ?? []}
          zoom={14}
        />
      );
    }
    return (
      <OpenLayerMap
        center={center}
        height={height}
        width={width}
        geoData={listResponse?.data ?? []}
        zoom={15}
      />
    );
  };

  return (
    <div className={styles['home-map_container']}>
      {renderMap()}
      {/*<div className={styles['show-time']}>*/}
      {/*    <AccessTimeIcon/>*/}
      {/*    <span className="ml-2">{currentTime}</span>*/}
      {/*</div>*/}
      <div className={styles['switch-mode']}>
        <Button variant="contained" onClick={() => setUseMapTile(!useMapTile)}>
          Switch
        </Button>
      </div>
      <div className={styles['page-loading']}></div>
    </div>
  );
}
