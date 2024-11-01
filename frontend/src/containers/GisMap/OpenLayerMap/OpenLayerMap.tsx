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
import styles from './OpenLayerMap.module.scss'
import { CenterProps } from '../types';
import { ViewPointData } from '../models';
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
  zoom
}: OpenLayerMapProps) {
  const mapRef = useRef<HTMLDivElement | null | undefined>(null);
  const [hoverPoint, setHoverPoint] = useState<ViewPointData | null>(null);

  useEffect(() => {
    const map = new Map({
      // target: mapRef.current,
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
    mapRef.current && map.setTarget(mapRef.current);

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
      }
    });
    return () => {
      map.setTarget(undefined);
    };
  }, [center, geoData, zoom]);

  return (
    <div className={styles['openlayer']}>
      <div ref={mapRef} style={{ width, height }} />;
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
