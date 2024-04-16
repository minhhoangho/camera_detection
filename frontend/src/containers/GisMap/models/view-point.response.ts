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


export type ListViewPointPaginateResponse = {
    data: ViewPointData[];
    pagination: PaginationMeta;
};
