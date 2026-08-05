from dataclasses import dataclass


@dataclass
class PersonalityTraits:
    curiosity: float = 0.5
    warmth: float = 0.5
    initiative: float = 0.3
    patience: float = 0.6
    humor: float = 0.4
    detail_level: float = 0.5
