import React from 'react';
import styles from './MapMarker.module.scss';



type MapMarkerProps = React.ImgHTMLAttributes<HTMLImageElement>

export const MapMarker: React.FC<MapMarkerProps> = (props) => {

  console.log("MapMarker props: ", props);
  return (
      <img className={styles["marker"]} {...props}/>
  );
}
