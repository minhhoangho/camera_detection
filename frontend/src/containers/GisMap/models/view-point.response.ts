import {PaginationMeta} from '../../../shared/models/responses';


export type ViewPointData = {
    id: string;
    lat: number;
    long: number
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export type ViewPointCameraData = {
    id: string;
    cameraSource: number;
    cameraUri: string;
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
