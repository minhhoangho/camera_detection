import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Feature from 'ol/Feature.js';

import { Point } from 'ol/geom.js';
import Icon from 'ol/style/Icon';
import { useQuery } from 'react-query';
import styles from './HomeMap.module.scss';
import {
  ListViewPointPaginateResponse,
  ViewPointData,
} from '../../GisMap/models';
import { listViewPointsPaginate } from '../../../api/view-point';
import { DEFAULT_PAGINATION_PARAMS } from '../../../constants';
import { toast } from '../../../components/Toast';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Box, Card, Skeleton, Typography } from '@mui/material';
import Image from 'next/image';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import { useSelectLocation } from '../hooks/use-select-location';
import { useRecoilState } from 'recoil';
import { selectedLocationState } from '../recoil/locationState';
import Button from '@mui/material/Button';
import { MapTiler } from '../../GisMap/MapTiler/MapTiler';
import { CenterProps } from '../../GisMap/types';

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
  const [geoPoints, setGeoPoints] = useState<Feature[]>([]);
  const [hoverPoint, setHoverPoint] = useState<ViewPointData | null>(null);
  const [useMapTile, setUseMapTile] = useState(false);
  const [center, setCenter] = useState<CenterProps>(DEFAULT_GEO)
  // const [selectedSearchLocation, _] = useRecoilState(selectedLocationState);

  const { data: listResponse} = useQuery<ListViewPointPaginateResponse>({
    queryKey: ['getListViewPointPaginate'],
    queryFn: () =>
      listViewPointsPaginate({
        keyword: '',
        pagination: {
          offset: 0,
          limit: DEFAULT_PAGINATION_PARAMS.limit + 100,
        },
      }),
    onError: () => {
      toast('error', 'Error f...');
    },
    onSuccess: (paginationResponse) => {
      const features = paginationResponse.data.map((point) => {
        return new Feature({
          type: 'icon',
          name: point.name,
          data: point,
          geometry: new Point(fromLonLat([point.long, point.lat])),
        });
      });
      setGeoPoints(features);
    },
  });

  useEffect(() => {
    // mapRef.current && map.setTarget(mapRef.current);
  }, []);

  useEffect(() => {
    let map = null;
    if (!useMapTile) {
      map = new Map({
        target: 'map-id',
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat(DEFAULT_GEO),
          zoom: 15,
        }),
        controls: [],
      });
      const pointStyle = new Style({
        image: new Icon({
          height: 30,
          width: 30,
          anchor: [0.5, 1],
          src: '/static/icons/marker/location_marker.png',
          // src: '/static/icons/marker/cctv-camera.png',
          // img: (
          //   <Image
          //     src="/static/icons/marker/location_marker.png"
          //     alt=""
          //     height={30}
          //     width={30}
          //   />
          // ),
        }),
      });
      const mapStyles: { [key: string]: Style } = {
        icon: pointStyle,
      };
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: geoPoints,
        }),
        style: function(feature) {
          return mapStyles[feature.get('type')];
        },
      });
      console.log("vectorLayer before add layer ", vectorLayer)
      map.addLayer(vectorLayer);
      map.on('pointermove', (evt) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          return feature;
        });
        map.getTargetElement().style.cursor = feature ? 'pointer' : '';
        // Show the tooltip information of the feature
        if (feature) {
          const data: ViewPointData = feature.get('data');
          const tooltip = document.getElementById('hover-information-id');
          if (tooltip) {
            setHoverPoint(data);
            tooltip.style.display = 'block';
            tooltip.style.position = 'absolute';
            tooltip.style.zIndex = '1000';
            tooltip.style.padding = '10px';
            tooltip.style.left = `${evt.pixel[0] + 10}px`;
            tooltip.style.top = `${evt.pixel[1] + 10 - 300}px`;
          }
        } else {
          const tooltip = document.getElementById('hover-information-id');
          if (tooltip) {
            tooltip.style.display = 'none';
          }
        }
      });

      map.on('click', (evt) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
          return feature;
        });

        if (feature?.get('data')) {
          const data: ViewPointData = feature.get('data');
          map.getView().animate({
            center: fromLonLat([data.long, data.lat]),
            duration: 1800,
            zoom: 20,
          });
          setCenter([data.long, data.lat]);
        }
      });
    }
    // on component unmount remove the map refrences to avoid unexpected behaviour
    return () => {
      map?.setTarget(undefined);
    };
  }, [geoPoints, useMapTile]);

  const renderMap = () => {
    if (useMapTile) {
      return <MapTiler center={center} geoData={listResponse?.data ?? []} zoom={14}/>;
    } else {
      return (
        <div id="map-id" style={{ width, height, position: 'relative' }}></div>
      );
    }
  };

  return (
    <div className={styles['home-map_container']}>
      {renderMap()}
      <div className={styles['switch-mode']}>
        <Button variant="contained" onClick={() => setUseMapTile(!useMapTile)}>
          Switch
        </Button>
      </div>
      <div className={styles['page-loading']}></div>
      <div className={styles['hoverInformation']} id="hover-information-id">
        {hoverPoint ? (
          <Card className="mt-3">
            <Box sx={{ p: 3 }}>
              <CardActionArea className={styles['custom-card-border']}>
                {hoverPoint.thumbnail ? (
                  <div>
                    <Image
                      style={{ height: 140, width: '-webkit-fill-available' }}
                      width={210}
                      height={140}
                      alt={hoverPoint.name}
                      src={hoverPoint.thumbnail}
                    />
                  </div>
                ) : (
                  <Skeleton
                    variant="rectangular"
                    height={140}
                    animation={false}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {hoverPoint.name || 'Không có thông tin'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {hoverPoint.description || 'Không có mô tả'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Box>
          </Card>
        ) : (
          <Skeleton variant="rectangular" height={140} animation={false} />
        )}
      </div>
    </div>
  );
}
