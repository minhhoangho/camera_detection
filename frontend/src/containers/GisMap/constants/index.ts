export const VIEW_POINT_MANAGEMENT_KEY = {
    ID: 'id',
    NAME: 'name',
    LAT: 'lat',
    LONG: 'long',
    DESCRIPTION: 'description',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    ACTION: 'action',
};

export const VIEW_POINT_MANAGEMENT_COLUMNS_LABEL = {
    [VIEW_POINT_MANAGEMENT_KEY.ID]: 'ID',
    [VIEW_POINT_MANAGEMENT_KEY.NAME]: 'Tên địa điểm',
    [VIEW_POINT_MANAGEMENT_KEY.LAT]: 'Vĩ độ',
    [VIEW_POINT_MANAGEMENT_KEY.LONG]: 'Kinh độ',
    [VIEW_POINT_MANAGEMENT_KEY.DESCRIPTION]: 'Mô tả',
    [VIEW_POINT_MANAGEMENT_KEY.CREATED_AT]: 'Thời gian tạo',
    [VIEW_POINT_MANAGEMENT_KEY.UPDATED_AT]: 'Thời gian cập nhật',
    [VIEW_POINT_MANAGEMENT_KEY.ACTION]: 'Thao tác',
};



export const VIEW_POINT_CAMERA_MANAGEMENT_KEY = {
    ID: 'id',
    CAMERA_SOURCE: 'cameraSource',
    CAMERA_URI: 'cameraUri',
    CREATED_AT: 'createdAt',
    ACTION: 'action',
};

export const VIEW_POINT_CAMERA_MANAGEMENT_COLUMNS_LABEL = {
    [VIEW_POINT_CAMERA_MANAGEMENT_KEY.ID]: 'ID',
    [VIEW_POINT_CAMERA_MANAGEMENT_KEY.CAMERA_SOURCE]: 'Source',
    [VIEW_POINT_CAMERA_MANAGEMENT_KEY.CAMERA_URI]: 'Camera URI',
    [VIEW_POINT_CAMERA_MANAGEMENT_KEY.CREATED_AT]: 'Thời gian tạo',
    [VIEW_POINT_CAMERA_MANAGEMENT_KEY.ACTION]: 'Thao tác',
};

export const RealTimeCameraMode = {
    NO_SHOW: 'no_show',
    RAW: 'raw',
    DETECTION: 'detection',
};
