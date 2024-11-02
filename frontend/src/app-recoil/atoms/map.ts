import { atom } from 'recoil';


export type MapFocusPros = {
  lat: number;
  long: number;
  zoom: number;
};

export const mapFocusState = atom<MapFocusPros | null>({
  key: 'mapFocusState',
  default: null,
});



export const bevCoordinateState = atom<any> ({
  key: 'bevCoordinateState',
  default: null,
})
