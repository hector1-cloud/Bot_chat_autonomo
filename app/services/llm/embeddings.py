import hashlib


class EmbeddingProvider:
    def __init__(self, dim: int = 1536):
        self.dim = dim

    async def embed_text(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        vec = []
        for i in range(self.dim):
            b = digest[i % len(digest)]
            vec.append((b / 255.0) * 2.0 - 1.0)
        return vec
