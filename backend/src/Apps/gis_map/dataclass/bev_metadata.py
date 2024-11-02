from dataclasses import dataclass, field


@dataclass
class BevImageMetaData:
    width: float = 0
    height: float = 0
    center_long_lat: list[float] = field(default_factory=list)


@dataclass
class BevHomography:
    matrix: list[list[float]] = field(default_factory=list)

