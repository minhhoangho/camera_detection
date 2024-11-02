// Function to calculate the resolution at a given zoom level
export function getResolution(zoom: number, latitude: number): number {
  const earthCircumference = 40075016.686; // in meters
  const mapWidth = 256 * Math.pow(2, zoom); // in pixels
  const latitudeRad = (latitude * Math.PI) / 180;
  const metersPerPixel = earthCircumference * Math.cos(latitudeRad) / mapWidth;
  return metersPerPixel;
}

// Function to convert pixel coordinates to real-world coordinates
export function pixelToCoordinates(
  pixelX: number,
  pixelY: number,
  centerX: number,
  centerY: number,
  resolution: number
): { long: number; lat: number } {
  const deltaX = (pixelX - centerX) * resolution;
  const deltaY = (pixelY - centerY) * resolution;
  const long = centerX + deltaX;
  const lat = centerY - deltaY;
  return { long, lat };
}

// Function to get the coordinates of each side of the image
export function getImageCoordinates(
  center: { long: number; lat: number },
  zoom: number,
  imageWidth: number,
  imageHeight: number
): {
  topLeft: { long: number; lat: number };
  topRight: { long: number; lat: number };
  bottomLeft: { long: number; lat: number };
  bottomRight: { long: number; lat: number };
} {
  const resolution = getResolution(zoom, center.lat);
  const halfWidth = imageWidth / 2;
  const halfHeight = imageHeight / 2;

  const topLeft = pixelToCoordinates(-halfWidth, -halfHeight, 0, 0, resolution);
  const topRight = pixelToCoordinates(halfWidth, -halfHeight, 0, 0, resolution);
  const bottomLeft = pixelToCoordinates(-halfWidth, halfHeight, 0, 0, resolution);
  const bottomRight = pixelToCoordinates(halfWidth, halfHeight, 0, 0, resolution);

  return {
    topLeft: { long: center.long + topLeft.long, lat: center.lat + topLeft.lat },
    topRight: { long: center.long + topRight.long, lat: center.lat + topRight.lat },
    bottomLeft: { long: center.long + bottomLeft.long, lat: center.lat + bottomLeft.lat },
    bottomRight: { long: center.long + bottomRight.long, lat: center.lat + bottomRight.lat },
  };
}
//
// // Example usage
// const center = { long: 108.21631446431337, lat: 16.07401627168764 };
// const zoom = 19;
// const imageWidth = 800; // Example image width in pixels
// const imageHeight = 600; // Example image height in pixels
//
// const coordinates = getImageCoordinates(center, zoom, imageWidth, imageHeight);
// console.log(coordinates);
