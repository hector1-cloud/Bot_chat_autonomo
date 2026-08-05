class AvatarAnimationEngine:
    def build_frame(self, text: str, emotion: str) -> dict:
        return {"emotion": emotion, "text": text}
