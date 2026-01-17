from pydantic import BaseModel
from typing import List

class UserHistory(BaseModel):
    view_ids: List[int]

class RecommadationResponse(BaseModel):
    product_ids: List[int]