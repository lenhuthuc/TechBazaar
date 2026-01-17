from sqlalchemy import create_engine
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv

load_dotenv()

class Recommender:
    def __init__(self):
        user = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")
        host = os.getenv("DB_HOST")
        port = os.getenv("DB_PORT")
        db_name = os.getenv("DB_NAME")
        self.db_connection_str = f'mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db_name}'
        self.db_connection = create_engine(self.db_connection_str)
        self.load_data()
    
    def load_data(self):
        query = "SELECT id, product_name as name, category, description FROM product"
        self.df = pd.read_sql(query, self.db_connection)
        self.df['tags'] = (self.df['name'] + " " + self.df['category'] + " " + self.df['description']).fillna('')
        tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
        self.tfidf_matrix = tfidf.fit_transform(self.df['tags'])
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
    
    def get_simmilar_products(self, product_id, n_top = 10):
        try:
            idx = self.df.index[self.df['id'] == product_id].tolist()[0]
        except:
            return []
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:n_top+1]
        product_indices = [i[0] for i in sim_scores]
        return self.df['id'].iloc[product_indices].tolist()

    def recomment_for_user(self, view_ids, top_n = 10):
        valid_idices = self.df.index[self.df['id'].isin(view_ids)].tolist()
        if valid_idices == []:
            return []
        view_vectors = self.tfidf_matrix[valid_idices]
        user_profile = np.asarray(view_vectors.mean(axis=0))
        score = cosine_similarity(user_profile, self.tfidf_matrix).flatten()
        top_indices = np.argsort(score)[-(top_n + len(view_ids)):][::-1]
        product_ids = [pid for pid in top_indices if pid not in valid_idices][:top_n]
        return self.df['id'].iloc[product_ids].tolist()

    def refresh_model(self):
        self.load_data()