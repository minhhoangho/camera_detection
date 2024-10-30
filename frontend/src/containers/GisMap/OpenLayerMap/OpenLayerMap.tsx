import React, { useRef, useEffect } from 'react';
import View from 'ol/View';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import 'ol/ol.css';
import { toLonLat, fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
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

export function OpenLayerMap({
  width,
  height,
  onUpdateLatLong,
  center,
}: OpenLayerMapProps) {
  const mapRef = useRef<HTMLDivElement | null | undefined>(null);
  const vectorSourceRef = useRef(new VectorSource());

  // Generate random start and end points within the map bounds
  // const generateRandomPoint = (extent) => {
  //   const [minX, minY, maxX, maxY]: [number, number, number, number] = extent;
  //   const randomX: number = Math.random() * (maxX - minX) + minX;
  //   const randomY: number = Math.random() * (maxY - minY) + minY;
  //   return [randomX, randomY];
  // };

  const addCenterPoint = (map: Map, center: CenterProps) => {
    const centerLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({ color: 'blue' }),
          stroke: new Stroke({ color: 'blue', width: 1 }),
        }),
      }),
    });
    map.addLayer(centerLayer);
    // Create a feature for the center point and add it to the source
    const centerPoint = new Feature({
      geometry: new Point(fromLonLat(center)),
    });
    vectorSourceRef.current.addFeature(centerPoint);
  };

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
        zoom: 19, // Initial zoom level
      }),
    });
    mapRef.current && map.setTarget(mapRef.current);

    addCenterPoint(map, center);

    map.on('click', function (event) {
      const coordinates = event.coordinate; // Get clicked coordinates
      const lonLat = toLonLat(coordinates); // Transform coordinates to EPSG:4326
      const long: number = lonLat[0] as number;
      const lat: number = lonLat[1] as number;

      onUpdateLatLong?.(lat, long);

      const newPoint = new Feature({
        geometry: new Point(fromLonLat([long, lat])),
      });
      // Clear previous features
      vectorSourceRef.current.clear();
      vectorSourceRef.current.addFeature(newPoint);
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [center, onUpdateLatLong]);


  return <div ref={mapRef} style={{ width, height }} />;
}
