import {PaginationMeta} from '../../../shared/models/responses';


export type ViewPointData = {
    id: number;
    lat: number;
    long: number
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export type ViewPointCameraData = {
    id: number;
    cameraSource: number;
    cameraUri: string;
    capturedImage?: string;
    createdAt: string;
    updatedAt: string;
}


export type ListViewPointPaginateResponse = {
    data: ViewPointData[];
    pagination: PaginationMeta;
};

export type ListViewPointCameraPaginateResponse = {
    data: ViewPointCameraData[];
    pagination: PaginationMeta;
};
