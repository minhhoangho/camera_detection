import {PaginationMeta} from '../../../shared/models/responses';


export type ViewPointData = {
    id: string;
    lat: number;
    long: number
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}


export type ListViewPointPaginateResponse = {
    data: ViewPointData[];
    pagination: PaginationMeta;
};
