import React, {useEffect, useRef, useState} from 'react';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Feature from 'ol/Feature.js';

import { Point} from 'ol/geom.js';
import Icon from 'ol/style/Icon';
import styles from './HomeMap.module.scss';

const DEFAULT_GEO = [108.21631446431337, 16.07401627168764]; // (long, lat) Da nang location

type MapProps = {
  width?: number | string;
  height: number | string;
};

export function HomeMap(props: MapProps) {
  const {width, height} = props;
  const mapRef = useRef(null);
  const [center, setCenter] = useState(DEFAULT_GEO);
  const [zoom, setZoom] = useState(15); // Initial zoom level

  const pointFeature = new Feature({
    type: 'icon',
    name: 'Location',
    geometry: new Point(fromLonLat(center)),
  });

  useEffect(() => {
    const map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),

      ],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom,
      }),
      controls: []
    });
    mapRef.current && map.setTarget(mapRef.current);
   

    const pointStyle = new Style({
      image: new Icon({
        height: 30,
        width: 30,
        anchor: [0.5, 1],
        src: "/static/icons/marker/location_marker.png",
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
      'icon': pointStyle
    }
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [pointFeature],
      }),
      style: function (feature) {
        return mapStyles[feature.get('type')];
      }
    })

    map.addLayer(vectorLayer);



    map.getView().on('change:resolution', () => {
      setZoom(map.getView().getZoom());
    });

    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel,
        (feature) => {
          return feature;
        });

        console.log("Feature: ", feature?.get("name"));
    
    });

    // on component unmount remove the map refrences to avoid unexpected behaviour
    return () => {
      map.setTarget(undefined);
    };
  }, []);
  console.log("Zoom: ", zoom);
  return (
    <div className={styles['home-map_container']}>
      <div ref={mapRef} style={{width, height}}/>
    </div>
  );
}
