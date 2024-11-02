from dataclasses import dataclass, field


@dataclass
class Coordinate:
    lat: float
    long: float


@dataclass
class ImageCoordinate:
    top_left: Coordinate
    top_right: Coordinate
    bottom_left: Coordinate
    bottom_right: Coordinate


@dataclass
class BevHomography:
    matrix: list[list[float]] = field(default_factory=list)


@dataclass
class BevImageMetaData:
    width: float = 0
    height: float = 0
    center_long_lat: list[float] = field(default_factory=list)
    image_coordinates: ImageCoordinate = None
