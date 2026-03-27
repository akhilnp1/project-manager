from pydantic import BaseModel
import math


class PaginationParams(BaseModel):
    page: int = 1
    size: int = 10

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.size

    @staticmethod
    def total_pages(total: int, size: int) -> int:
        return math.ceil(total / size) if total > 0 else 0
