import React, { useRef, useEffect, useState } from 'react';
import View from 'ol/View';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import { Box, Card, Skeleton, Typography } from '@mui/material';
import CardActionArea from '@mui/material/CardActionArea';
import Image from 'next/image';
import CardContent from '@mui/material/CardContent';
import { useRecoilValue } from 'recoil';
import { Circle } from 'ol/style';
import Fill from 'ol/style/Fill';
import styles from './OpenLayerMap.module.scss';
import { CenterProps } from '../types';
import { ViewPointData } from '../models';
import { mapFocusState } from '../../../app-recoil/atoms/map';
import { useWebsocket, WebsocketMessagePayload } from '../../../shared/hooks/use-websocket';
import { SOCKET_BASE_URL } from '../../../constants';
// Import OpenLayers CSS

// const DEFAULT_GEO = [12047000, 1812900]; // (long, lat) Da nang location
// const DEFAULT_GEO = [108224527.94 , 16577970.54] // (long, lat) Da nang location

type OpenLayerMapProps = {
  width?: number | string;
  height: number | string;
  center: CenterProps;
  geoData: ViewPointData[];
  zoom: number;
  // Function
};

export function OpenLayerMap({
  width,
  height,
  center,
  geoData,
  zoom,
}: OpenLayerMapProps) {
  const mapContainer = useRef<HTMLDivElement | null | undefined>(null);
  const mapRef = useRef<Map | null>(null);
  const [hoverPoint, setHoverPoint] = useState<ViewPointData | null>(null);
  const mapFocus = useRecoilValue(mapFocusState);
  const [isConnected, message, _] = useWebsocket(`${SOCKET_BASE_URL}/ws/`);


  const handleDrawPoints = (points: Array<any>)=> {
    // remove existing point layer
    // console.log("mapRef?.current.getLayers() ", mapRef?.current.getLayers())
    mapRef?.current.getLayers().forEach((layer:VectorLayer) => {
      if (layer.getClassName() === 'point-layer') {
        mapRef?.current.removeLayer(layer);
      }
      // if (layer.get('className_') === 'point-layer') {
      //   console.log("Point layer found")
      //   // layer.clear()
      //   mapRef?.current.removeLayer(layer);
      // }
    });

    const pointVectorSource = new VectorSource();

    points.forEach((point) => {
      const {lat, long} = point
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat([long, lat])),
      });

      pointVectorSource.addFeature(pointFeature);
      // mapRef.current.addFeature(pointFeature);
    })

    mapRef.current?.addLayer(new VectorLayer({
      className: 'point-layer',
      source: pointVectorSource,
      style: new Style({
        image: new Circle({
          radius: 7,
          fill: new Fill({color: 'red'}),
        }),
      }),
    }));

    // Draw points


  }
  useEffect(() => {
    if (isConnected) {
      // eslint-disable-next-line no-console
      console.log('[OpenLayerMap] Connected to WebSocket');
    }

    if (message) {
      const messageJson: WebsocketMessagePayload = JSON.parse(message);
      if (messageJson.type === 'send_points') {
        handleDrawPoints(messageJson.data.vehicle_points)
      }
    }
  }, [isConnected, message]);

  useEffect(() => {
    mapRef.current = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        // new TileLayer({
        //   // extent: [-13884991, 2870341, -7455066, 6338219],
        //   source: new TileWMS({
        //     url: 'http://localhost:8089/geoserver/my_workspace/wms',
        //     params: { LAYERS: 'my_workspace:VNM_adm2', TILED: true },
        //     serverType: 'geoserver',
        //     // Countries have transparency, so do not fade tiles:
        //     transition: 0,
        //   }),
        // }),
      ],
      view: new View({
        center: fromLonLat(center), // Center coordinates of New York in EPSG:3857 projection
        zoom: zoom, // Initial zoom level
      }),
    });
    mapContainer.current && mapRef.current.setTarget(mapContainer.current);

    const pointStyle = new Style({
      image: new Icon({
        height: 30,
        width: 30,
        anchor: [0.5, 1],
        src: '/static/icons/marker/location_marker.png',
      }),
    });
    const mapStyles: { [key: string]: Style } = {
      icon: pointStyle,
    };
    const features = geoData.map((point) => {
      return new Feature({
        type: 'icon',
        name: point.name,
        data: point,
        geometry: new Point(fromLonLat([point.long, point.lat])),
      });
    });
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features,
      }),
      style: function (feature) {
        return mapStyles[feature.get('type')];
      },
    });
    mapRef.current.addLayer(vectorLayer);
    mapRef.current.on('pointermove', (evt) => {
      const feature = mapRef.current?.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => {
          return feature;
        },
      );
      if (mapRef.current) {
        mapRef.current.getTargetElement().style.cursor = feature ? 'pointer' : '';
      }
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
    mapRef.current.on('click', (evt) => {
      const feature = mapRef.current?.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => {
          return feature;
        },
      );

      if (feature?.get('data')) {
        const data: ViewPointData = feature.get('data');
        zoomTo(data.long, data.lat, 20);
      }
    });
    return () => {
      mapRef.current.setTarget(undefined);
    };
  }, [center, geoData, zoom]);

  const zoomTo = (long: number, lat: number, zoom: number) => {
    mapRef.current?.getView().animate({
      center: fromLonLat([long, lat]),
      duration: 1800,
      zoom,
    });
  }


  useEffect(() => {
    if (mapFocus) {
      zoomTo(mapFocus.long, mapFocus.lat, mapFocus.zoom);
    }
  }, [mapFocus]);


  return (
    <div className={styles['openlayer']}>
      <div ref={mapContainer} style={{ width, height }} />;
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
