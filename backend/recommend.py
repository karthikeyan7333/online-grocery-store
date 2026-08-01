import sys
import json
import joblib
import pandas as pd
import os

# Set paths to the trained models
ML_DIR = r"d:\onlinegrocery\Grocery Product Recommendation System"
SIMILARITY_PATH = os.path.join(ML_DIR, "item_similarity.pkl")
ITEM_LIST_PATH = os.path.join(ML_DIR, "item_list.pkl")
CONFIG_PATH = os.path.join(ML_DIR, "item_cf_config.pkl")
POPULAR_ITEMS_PATH = os.path.join(ML_DIR, "popular_items.pkl")

def get_recommendations(target_product, top_n=5):
    try:
        # Load models
        if not os.path.exists(SIMILARITY_PATH):
            return {"error": "Similarity model not found at " + SIMILARITY_PATH}
        
        item_similarity = joblib.load(SIMILARITY_PATH)
        
        # 1. Try exact match
        lookup_name = target_product
        if lookup_name not in item_similarity.index:
            # 2. Try partial match (e.g., "Red Apples" -> "Apples")
            found = False
            for trained_item in item_similarity.index:
                if trained_item.lower() in target_product.lower():
                    lookup_name = trained_item
                    found = True
                    break
            
            # 3. Last resort: Return popular items if no match
            if not found:
                if os.path.exists(POPULAR_ITEMS_PATH):
                    popular_items = joblib.load(POPULAR_ITEMS_PATH)
                    return popular_items[:top_n]
                else:
                    return []
        
        # Load config safely
        try:
            config = joblib.load(CONFIG_PATH)
        except:
            config = {"top_n": 5, "top_k_items": 5, "rating_weight": 0.7, "sentiment_weight": 0.3}

        # Use 5 as default rating for the added item
        rating = 5
        sentiment = 1 # positive
        weight = config.get("rating_weight", 0.7) * rating + config.get("sentiment_weight", 0.3) * sentiment

        similar_items = (
            item_similarity[lookup_name]
            .sort_values(ascending=False)
            .iloc[1:config.get("top_k_items", 5) + 1]
        )

        scores = {}
        for sim_item, sim_score in similar_items.items():
            scores[sim_item] = sim_score * weight

        recommendations = sorted(scores, key=scores.get, reverse=True)[:top_n]
        return recommendations
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(0)
    
    product_name = sys.argv[1]
    recs = get_recommendations(product_name)
    print(json.dumps(recs))
