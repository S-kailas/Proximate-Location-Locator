from fastapi import FastAPI, UploadFile, File
import shutil
import os

from database import SessionLocal, engine
from models import Base, Location
from excel_parser import read_excel
from map_parser import extract_coordinates
from clustering import cluster_locations

Base.metadata.create_all(bind=engine)

app = FastAPI()

UPLOAD_FOLDER = "uploads"


@app.post("/upload")
async def upload_excel(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    rows = read_excel(file_path)

    coords = []
    parsed_data = []

    for row in rows:

        lat, lng = extract_coordinates(row["map_link"])

        if lat is None:
            continue

        coords.append([lat, lng])

        parsed_data.append({
            "excel_id": row["excel_id"],
            "map_link": row["map_link"],
            "lat": lat,
            "lng": lng
        })

    labels = cluster_locations(coords)

    db = SessionLocal()

    results = []

    for i, data in enumerate(parsed_data):

        cluster_id = int(labels[i])

        loc = Location(
            excel_id=data["excel_id"],
            map_link=data["map_link"],
            latitude=data["lat"],
            longitude=data["lng"],
            cluster_id=cluster_id
        )

        db.add(loc)

        results.append({
            "id": data["excel_id"],
            "cluster": cluster_id,
            "lat": data["lat"],
            "lng": data["lng"]
        })

    db.commit()
    db.close()

    return {
        "clusters": results
    }
from fastapi.responses import FileResponse
import pandas as pd


@app.get("/download")
def download_results():

    db = SessionLocal()

    rows = db.query(Location).all()

    data = []

    for r in rows:
        data.append({
            "excel_id": r.excel_id,
            "map_link": r.map_link,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "cluster": r.cluster_id
        })

    df = pd.DataFrame(data)

    file_path = "cluster_result.xlsx"

    df.to_excel(file_path, index=False)

    db.close()

    return FileResponse(file_path, filename="cluster_result.xlsx")
