import React, { useRef, useEffect } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import styles from  './MapTiler.module.scss'
import { CenterProps } from '../types';
import { ViewPointData } from '../models';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
const MAP_TILER_API_KEY = 'h5Yr1c619LcnIrnipH10';
maptilersdk.config.apiKey = MAP_TILER_API_KEY;


type Props = {
  center: CenterProps
  geoData: ViewPointData[]
  zoom: number
}

export function MapTiler(props: Props) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: props.center,
      zoom: props.zoom,
    });

    props.geoData.forEach((geoData) => {
      new maptilersdk.Marker({color: "#FF0000"})
        .setLngLat([geoData.long, geoData.lat])
        .addTo(map.current)
    })

    map.current.on('pointermove',  (event) => {
      console.log('pointermove', event)
    })
  }, [props.center, props.geoData, props.zoom]);

  return (
    <div className={styles["map-wrap"]}>
      <div ref={mapContainer} className={styles["map"]} />
    </div>
  );
}
