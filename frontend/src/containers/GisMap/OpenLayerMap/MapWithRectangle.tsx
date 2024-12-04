// Disable eslint for this file
/* eslint-disable */
import React, { useCallback, useEffect, useRef } from 'react';
import View from 'ol/View';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import isEmpty from 'lodash/isEmpty';
import { defaults as defaultInteractions, Draw } from 'ol/interaction';
import { Polygon } from 'ol/geom';
import { Circle } from 'ol/style';
import { CenterProps } from '../types';

// Import OpenLayers CSS

// const DEFAULT_GEO = [12047000, 1812900]; // (long, lat) Da nang location
// const DEFAULT_GEO = [108224527.94 , 16577970.54] // (long, lat) Da nang location

type OpenLayerMapProps = {
  width?: number | string;
  height: number | string;
  center: CenterProps;
  rectangle: any;
};

export function MapWithRectangle({
  width,
  height,
  rectangle,
  center,
}: OpenLayerMapProps) {
  const mapRef = useRef<HTMLDivElement | null | undefined>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const drawVectorLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const vectorSourceDrawRef = useRef(new VectorSource());
  const drawInteractionRef = useRef<Draw | null>(null);

  const markPointLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const vectorSourceMarkerRef = useRef(new VectorSource());

  const markPointHandler = useCallback(
    (map: Map) => {
      if (!map) return;
      if (isEmpty(center)) return;
      markPointLayer.current = new VectorLayer({
        className: 'mark-point-layer',
        source: vectorSourceMarkerRef.current,
        style: new Style({
          image: new Circle({
            radius: 10,
            fill: new Fill({ color: 'blue' }),
            stroke: new Stroke({ color: 'blue', width: 1 }),
          }),
        }),
      });
      map.addLayer(markPointLayer.current);

      // Create a feature for the center point and add it to the source
      const centerPoint = new Feature({
        geometry: new Point(fromLonLat(center)),
      });
      vectorSourceMarkerRef.current.addFeature(centerPoint);
      return null;
    },
    [center],
  );

  const drawHandler = useCallback((map: Map) => {
    // Create a vector layer to hold the drawn features
    drawVectorLayer.current = new VectorLayer({
      className: 'draw-layer',
      source: vectorSourceDrawRef.current,
    });
    map.addLayer(drawVectorLayer.current);
    // Draw rectangle based on rectangle prop
    const topLeft = fromLonLat([
      rectangle.top_left.long,
      rectangle.top_left.lat,
    ]);
    const bottomRight = fromLonLat([
      rectangle.bottom_right.long,
      rectangle.bottom_right.lat,
    ]);
    const rectangleGeo = [
      topLeft,
      [topLeft[0], bottomRight[1]],
      bottomRight,
      [bottomRight[0], topLeft[1]],
    ];
    console.log('Rectangle Geo: ', rectangleGeo);
    // convert to long, lat

    if (rectangleGeo) {
      const rectangleFeature = new Feature({
        geometry: new Polygon([rectangleGeo]),
      });
      vectorSourceDrawRef.current.addFeature(rectangleFeature);
    }
  }, []);

  useEffect(() => {
    console.log('Rerender when center changed realtime >> ', center);
    mapInstanceRef.current = new Map({
      interactions: defaultInteractions({
        mouseWheelZoom: false,
        doubleClickZoom: false,
      }), // Disable zoom interactions
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat(center), // Center coordinates of New York in EPSG:3857 projection
        zoom: 20, // Initial zoom level
      }),
    });
    mapRef.current && mapInstanceRef.current.setTarget(mapRef.current);
    markPointHandler(mapInstanceRef.current);
    drawHandler(mapInstanceRef.current);
  }, []);
  //

  return <div ref={mapRef} style={{ width, height, position: 'relative' }} />;
}
