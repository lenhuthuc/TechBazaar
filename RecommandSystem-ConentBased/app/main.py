from fastapi import FastAPI
from app.recommender import Recommender
from app.schemas import UserHistory

app = FastAPI()
rec_engine = Recommender()
@app.get("/")
def health():
    return {
        "status" : "oke",
        "products" : len(rec_engine.df)
    }

@app.get("/recommend/{product_id}")
def get_similar(product_id: int):
    return rec_engine.get_simmilar_products(product_id)

@app.post("/recommend_user")
def get_user_recs(history: UserHistory):
    return rec_engine.recomment_for_user(history.view_ids)