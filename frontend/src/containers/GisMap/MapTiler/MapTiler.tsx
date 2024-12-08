import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { Feature } from 'geojson-vt';
import { Point } from 'geojson';
import { Box, Card, Skeleton, Typography } from '@mui/material';
import CardActionArea from '@mui/material/CardActionArea';
import Image from 'next/image';
import CardContent from '@mui/material/CardContent';
import { useRecoilValue } from 'recoil';
import _toNumber from 'lodash/toNumber';
import { mapFocusState } from 'src/app-recoil/atoms/map';
import {
  useWebsocket,
  WebsocketMessagePayload,
} from 'src/shared/hooks/use-websocket';
import { SOCKET_BASE_URL } from 'src/constants';
import styles from './MapTiler.module.scss';
import { ViewPointData } from '../models';
import { CenterProps } from '../types';

const MAP_TILER_API_KEY = 'h5Yr1c619LcnIrnipH10';
maptilersdk.config.apiKey = MAP_TILER_API_KEY;

type Props = {
  center: CenterProps;
  geoData: ViewPointData[];
  zoom: number;
};

export function MapTiler({ geoData, center, zoom }: Props) {
  const mapContainer = useRef<string>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const [hoverPoint, setHoverPoint] = useState<ViewPointData | null>(null);
  const [isConnected, message, _, _] = useWebsocket(`${SOCKET_BASE_URL}/ws/`);
  const mapFocus = useRecoilValue(mapFocusState);

  const handleControlRotate = useCallback((map: Map) => {
    const deltaDistance = 100;
    const deltaDegrees = 25;
    const easing = (t: number) => {
      return t * (2 - t);
    };
    map.getCanvas().addEventListener(
      'keydown',
      function (e) {
        e.preventDefault();
        if (e.which === 38) {
          // up
          map.panBy([0, -deltaDistance], {
            easing: easing,
          });
        } else if (e.which === 40) {
          // down
          map.panBy([0, deltaDistance], {
            easing: easing,
          });
        } else if (e.which === 37) {
          // eslint-disable-next-line no-console
          console.log(
            'map.getBearing() - deltaDegrees, ',
            map.getBearing() - deltaDegrees,
          );
          // left
          map.easeTo({
            bearing: map.getBearing() - deltaDegrees,
            easing: easing,
          });
        } else if (e.which === 39) {
          // right
          map.easeTo({
            bearing: map.getBearing() + deltaDegrees,
            easing: easing,
          });
        }
      },
      true,
    );
  }, []);

  const drawPoints = (points: Array<Record<string, number>>) => {
    if (!map?.current) return;
    const featureItems: Feature<Point, any>[] = points.map((point) => {
      const { lat, long } = point;
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [long, lat],
        },
        properties: point,
      };
    });

    map.current.getSource('points_source').setData({
      type: 'FeatureCollection',
      features: featureItems,
    });
  };

  const addViewPointLayers = async () => {
    if (!map.current) return;
    const image = await map.current.loadImage(
      '/static/icons/marker/location_marker.png',
    );
    map.current.addImage('custom-marker', image.data, {
      pixelRatio: 20,
    });
    const features: Feature<Point, ViewPointData>[] = geoData.map((item) => {
      return {
        type: 'Feature',
        properties: item,
        geometry: {
          type: 'Point',
          coordinates: [item.long, item.lat],
        },
      };
    });

    map.current.addSource('places', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    });

    // Add a layer showing the places.
    map.current.addLayer({
      id: 'places',
      type: 'symbol',
      source: 'places',
      layout: {
        'icon-image': 'custom-marker',
        'icon-overlap': 'always',
      },
    });
  };

  const addAnimatePointLayer = () => {
    map.current.addSource('points_source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    // Add a layer for the points
    map.current.addLayer({
      id: 'points_layer',
      type: 'circle',
      source: 'points_source',
      paint: {
        'circle-radius': 6,
        'circle-color': '#007cbf',
      },
    });
  };

  useEffect(() => {
    if (!mapContainer) return;
    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      // style: maptilersdk.MapStyle.STREETS,
      style: maptilersdk.MapStyle.TOPO,
      center: center,
      zoom: zoom,
      pitch: 60,
    });

    map.current.on('load', async () => {
      if (!map.current) return;
      map.current.getCanvas().focus();

      await addViewPointLayers();
      addAnimatePointLayer();

      map.current.on('mouseenter', 'places', function (e) {
        if (!map.current) return;
        // Change the cursor style as a UI indicator.
        map.current.getCanvas().style.cursor = 'pointer';
        // const coordinates = e.features[0].geometry.coordinates
        const data: ViewPointData | null = e?.features[0]
          .properties as ViewPointData;
        if (data) {
          const tooltip = document.getElementById('hover-information-id');
          if (tooltip) {
            setHoverPoint(data);
            tooltip.style.display = 'block';
            tooltip.style.position = 'absolute';
            tooltip.style.zIndex = '1000';
            tooltip.style.padding = '10px';
            tooltip.style.left = `${e.point.x + 10}px`;
            tooltip.style.top = `${e.point.y + 10 - 300}px`;
          }
        }
      });

      map.current.on('mouseleave', 'places', function () {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        setHoverPoint(null);
      });

      map.current.on('click', 'places', (e) => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';
        const data: ViewPointData | null = e?.features[0]
          .properties as ViewPointData;
        if (data) {
          map.current.flyTo({
            // These options control the ending camera position: centered at
            // the target, at zoom level 9, and north up.
            center: [data.long, data.lat],
            zoom: 20,
            bearing: 0,

            // These options control the flight curve, making it move
            // slowly and zoom out almost completely before starting
            // to pan.
            speed: 0.8, // make the flying slow
            curve: 1, // change the speed at which it zooms out

            // This can be any easing function: it takes a number between
            // 0 and 1 and returns another number between 0 and 1.
            easing: function (t) {
              return t;
            },

            // this animation is considered essential with respect to prefers-reduced-motion
            essential: true,
          });
        }
      });

      handleControlRotate(map.current);
    });
  }, [center, geoData, zoom]);

  useEffect(() => {
    if (isConnected) {
      // eslint-disable-next-line no-console
      console.info('[MapTiler] Connected to WebSocket');
    }
    if (message) {
      const messageJson: WebsocketMessagePayload = JSON.parse(message);
      if (messageJson.type === 'send_points') {
        // removePointLayer();
        if (_toNumber(map?.current?.getZoom()) >= 18) {
          // If zoom level is greater than 20, draw points
          drawPoints(
            messageJson.data.vehicle_points as Array<Record<string, number>>,
          );
        }
      }
    }
  }, [isConnected, message]);

  const zoomTo = (long: number, lat: number, zoom: number) => {
    map?.current?.flyTo({
      center: [long, lat],
      zoom: zoom - 1,
      bearing: 0,
      speed: 0.8,
      curve: 1,
      easing: function (t) {
        return t;
      },
      essential: true,
    });
    // map.current?.getView().animate({
    //   center: fromLonLat([long, lat]),
    //   duration: 1800,
    //   zoom,
    // });
  };

  useEffect(() => {
    if (mapFocus) {
      zoomTo(mapFocus.long, mapFocus.lat, mapFocus.zoom);
    }
  }, [mapFocus]);

  return (
    <div className={styles['map-wrap']}>
      <div ref={mapContainer} className={styles['map']} />
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
