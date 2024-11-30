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
  warningThreshold?: number;
  mapView: MapViewData;
};


export type EditViewPointPayloadRequest = {
  name: string;
  description: string;
  lat: number;
  long: number;
  warningThreshold?: number;
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

export type BEVPayloadRequest = {
  id: number;
  bevImage: string;
};

export type BEVMetadataPayloadRequest = {
  id: number;
  homographyMatrix?: any;
  imageCoordinates?: any;
};
