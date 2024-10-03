import { PaginationQueryParams } from '../../../shared/models/requests';

export type ViewPointPaginateRequest = {
  keyword?: string;
  pagination?: PaginationQueryParams;
};


export type CreateViewPointPayloadRequest = {
  name: string;
  description: string;
  lat: number;
  long: number;
  mapView: MapViewData;
};


export type EditViewPointPayloadRequest = {
  name: string;
  description: string;
  lat: number;
  long: number;
  mapView: MapViewData;
};

export type MapViewData = {
  zoom: number;
  lat: number;
  long: number;
}

export type UpsertCameraSourcePayloadRequest = {
  id?: string;
  cameraSource: number;
  cameraUri: string;
};
