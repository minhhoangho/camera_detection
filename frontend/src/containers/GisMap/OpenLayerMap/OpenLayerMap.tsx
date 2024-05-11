import React, { useRef, useEffect, useState } from 'react';
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

// Import OpenLayers CSS

// const DEFAULT_GEO = [12047000, 1812900]; // (long, lat) Da nang location
// const DEFAULT_GEO = [108224527.94 , 16577970.54] // (long, lat) Da nang location

type CenterProps = [number, number];

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
  const mapRef = useRef(null);
  // Generate random start and end points within the map bounds
  // const generateRandomPoint = (extent) => {
  //   const [minX, minY, maxX, maxY]: [number, number, number, number] = extent;
  //   const randomX: number = Math.random() * (maxX - minX) + minX;
  //   const randomY: number = Math.random() * (maxY - minY) + minY;
  //   return [randomX, randomY];
  // };

  const addCenterPoint = (map: Map, center: CenterProps) => {
    const centerSource = new VectorSource();
    const centerLayer = new VectorLayer({
      source: centerSource,
      style: new Style({
        image: new Circle({
          radius: 20,
          fill: new Fill({ color: 'blue' }),
          stroke: new Stroke({ color: 'black', width: 1 }),
        }),
      }),
    });
    map.addLayer(centerLayer);
    // Create a feature for the center point and add it to the source
    const centerFeature = new Feature({
      geometry: new Point(fromLonLat(center)),
    });
    centerSource.addFeature(centerFeature);
  };

  useEffect(() => {
    const map = new Map({
      target: mapRef.current,
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

    addCenterPoint(map, center);

    // Generate random traffic flows
    const numberOfFlows = 100; // Number of traffic flows to generate

    // Create a vector source and layer to display traffic flow points
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Circle({
          radius: 3,
          fill: new Fill({ color: 'red' }),
        }),
      }),
    });
    map.addLayer(vectorLayer);

    map.on('click', function (event) {
      const coordinates = event.coordinate; // Get clicked coordinates
      const lonLat = toLonLat(coordinates); // Transform coordinates to EPSG:4326

      onUpdateLatLong?.(lonLat[1] as number, lonLat[0] as number);
    });

    // Generate random traffic flows and add them to the vector source
    const mapExtent = map.getView().calculateExtent();
    // console.log("mapExtent >> ", mapExtent )
    // for (let i = 0; i < numberOfFlows; i++) {
    //   const startPoint = generateRandomPoint(mapExtent);
    //   const endPoint = generateRandomPoint(mapExtent);
    //   const flow = new Feature({
    //     geometry: new Point(startPoint),
    //   });
    //   flow.setProperties({ endPoint });
    //   vectorSource.addFeature(flow);
    // }

    return () => {
      map.setTarget(null);
    };
  }, [center, onUpdateLatLong]);

  return <div ref={mapRef} style={{ width, height }} />;
}
