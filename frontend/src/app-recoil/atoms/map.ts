import { atom } from 'recoil';

const mapFocusStateKey = 'mapFocusState';

export type MapFocusPros = {
  lat: number;
  long: number;
  zoom: number;
};

export const mapFocusState = atom<MapFocusPros | null>({
  key: mapFocusStateKey,
  default: null,
});
