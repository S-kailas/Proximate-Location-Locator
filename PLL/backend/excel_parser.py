import pandas as pd

def read_excel(file_path):
    df = pd.read_excel(file_path)

    locations = []

    for _, row in df.iterrows():
        locations.append({
            "excel_id": row["id"],
            "map_link": row["location_link"]
        })

    return locations
