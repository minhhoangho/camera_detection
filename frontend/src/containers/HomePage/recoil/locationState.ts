import { atom } from 'recoil';
export type GeoProperty = {
  long: number;
  lat: number;
  country: string;
  state: string;
  region: string;
  addressLine1: string;
  addressLine2: string;
  addressFormated: string;
  geoapifyID: string;
};

export const selectedLocationState = atom<GeoProperty | null>({
  key: 'selectedLocationState',
  default: null,
})
