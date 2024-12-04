// Disable eslint for this file
/* eslint-disable */
import React, { useRef, useEffect, useCallback } from 'react';
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
import { toLonLat, fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import isEmpty from 'lodash/isEmpty';
import { Draw } from 'ol/interaction';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { defaults as defaultInteractions } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import { useSetRecoilState } from 'recoil';
import { Polygon } from 'ol/geom';
import {Circle} from 'ol/style'
import { Coordinate } from 'ol/coordinate';
import { bevCoordinateState } from '../../../app-recoil/atoms/map';
import { CenterProps } from '../types';

// Import OpenLayers CSS

// const DEFAULT_GEO = [12047000, 1812900]; // (long, lat) Da nang location
// const DEFAULT_GEO = [108224527.94 , 16577970.54] // (long, lat) Da nang location

type OpenLayerMapProps = {
  width?: number | string;
  height: number | string;
  center: CenterProps;
  // Function
  onUpdateLatLong?: (lat: number, long: number) => void;
};

const MODE = {
  DRAW: 'draw',
  MARK_POINT: 'mark_point',
};

export function OpenLayerMapManagement({
                                         width,
                                         height,
                                         onUpdateLatLong,
                                         center,
                                       }: OpenLayerMapProps) {
  const [mode, setMode] = React.useState(MODE.MARK_POINT);

  const mapRef = useRef<HTMLDivElement | null | undefined>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const drawVectorLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const vectorSourceDrawRef = useRef(new VectorSource());
  const drawInteractionRef = useRef<Draw | null>(null);

  const markPointLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const vectorSourceMarkerRef = useRef(new VectorSource());
  const setBevCoordinate = useSetRecoilState(bevCoordinateState);


  const handleMapOnClick = useCallback((event)  =>{
    const coordinates = event.coordinate; // Get clicked coordinates
    const lonLat = toLonLat(coordinates); // Transform coordinates to EPSG:4326
    const long: number = lonLat[0] as number;
    const lat: number = lonLat[1] as number;

    onUpdateLatLong?.(lat, long);

    const newPoint = new Feature({
      geometry: new Point(fromLonLat([long, lat])),
    });
    // Clear previous features
    vectorSourceMarkerRef.current.clear();
    vectorSourceMarkerRef.current.addFeature(newPoint);
  }, [mode])


  const markPointHandler = useCallback(
    (map: Map, _mode) => {
      if (!map) return;
      if (isEmpty(center)) return;
      if (_mode !== MODE.MARK_POINT) return null;
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
      map.on('click', handleMapOnClick);
      return null;
    },
    [center, mode, onUpdateLatLong],
  );

  const drawHandler = useCallback(
    (map: Map, _mode) => {
      if (_mode !== MODE.DRAW) return null;
      console.log("Inner drawHandler ", _mode)
      // Create a vector layer to hold the drawn features
      drawVectorLayer.current = new VectorLayer({
        className: 'draw-layer',
        source: vectorSourceDrawRef.current,
      });
      map.addLayer(drawVectorLayer.current);

      // Create a draw interaction
      drawInteractionRef.current = new Draw({
        source: vectorSourceDrawRef.current,
        type: 'Circle',
        geometryFunction: createBox(),
      });

      // Add the draw interaction to the map
      map.addInteraction(drawInteractionRef.current);

      // Optional: handle the draw event to do something with the drawn feature
      drawInteractionRef.current.on('drawend', function (event) {
        console.log("drawInteraction drawend ", mode)

        // Clear previous features
        // drawVectorSource.clear();
        const feature = event.feature;
        // Get all coordinates of the drawn feature
        const coordinates: Array<Array<Coordinate>> = (
          feature?.getGeometry() as Polygon
        )?.getCoordinates();
        if (coordinates.length) {
          const rec = coordinates[0];
          if (!rec || rec.length === 0) return;
          const topLeft = toLonLat(rec[0] as Coordinate);
          const topRight = toLonLat(rec[1] as Coordinate);
          const bottomRight = toLonLat(rec[2] as Coordinate);
          const bottomLeft = toLonLat(rec[3] as Coordinate);
          setBevCoordinate({
            topLeft: {
              lat: topLeft[1],
              long: topLeft[0],
            },
            topRight: {
              lat: topRight[1],
              long: topRight[0],
            },
            bottomRight: {
              lat: bottomRight[1],
              long: bottomRight[0],
            },
            bottomLeft: {
              lat: bottomLeft[1],
              long: bottomLeft[0],
            },
          });
        }
      });
      return null;
    },
    [mode],
  );



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

    if (mode === MODE.MARK_POINT) {
      markPointHandler(mapInstanceRef.current, mode);
    }
    if (mode === MODE.DRAW) {
      drawHandler(mapInstanceRef.current, mode);
    }
  }, []);
  //

  const handleChangeMode = (_e: React.MouseEvent, value: string) => {
    mapInstanceRef.current?.removeEventListener('click', handleMapOnClick)
    value && setMode(value);
    vectorSourceMarkerRef.current.clear();
    vectorSourceDrawRef.current.clear();

    drawInteractionRef.current && mapInstanceRef.current.removeInteraction(drawInteractionRef.current)
    drawVectorLayer?.current && mapInstanceRef.current.removeLayer(drawVectorLayer.current);
    markPointLayer?.current && mapInstanceRef.current.removeLayer(markPointLayer.current);

    drawVectorLayer.current = null
    drawInteractionRef.current = null
    markPointLayer.current = null


    if (value === MODE.MARK_POINT) {
      console.log("Value is mark point ", value)
      markPointHandler(mapInstanceRef.current, value);
    }
    if (value === MODE.DRAW) {
      console.log("Value is draw ", value)
      drawHandler(mapInstanceRef.current, value);
    }
  };

  return (
    <div>
      <ToggleButtonGroup
        className="mb-2"
        color="primary"
        value={mode}
        exclusive
        onChange={handleChangeMode}
        aria-label="Platform"
      >
        <ToggleButton value={MODE.DRAW}>Draw</ToggleButton>
        {/*<ToggleButton value={MODE.MARK_POINT}>Mark location</ToggleButton>*/}
      </ToggleButtonGroup>
      <div ref={mapRef} style={{ width, height, position: 'relative' }} />
    </div>
  );
}
