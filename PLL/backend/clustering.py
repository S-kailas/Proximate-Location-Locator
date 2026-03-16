import numpy as np
from sklearn.cluster import DBSCAN

EARTH_RADIUS_KM = 6371

def cluster_locations(coords, eps_km=3):

    coords_rad = np.radians(coords)

    eps = eps_km / EARTH_RADIUS_KM

    db = DBSCAN(
        eps=eps,
        min_samples=1,
        algorithm="ball_tree",
        metric="haversine"
    ).fit(coords_rad)

    return db.labels_
