import requests

OSRM_BASE_URL = "https://router.project-osrm.org"


def get_distance_matrix(coords):
    coord_str = ";".join([f"{lng},{lat}" for lat, lng in coords])

    url = f"{OSRM_BASE_URL}/table/v1/driving/{coord_str}?annotations=distance"

    res = requests.get(url)
    if res.status_code != 200:
        return None

    return res.json().get("distances")


def get_route_geometry(coords):
    coord_str = ";".join([f"{lng},{lat}" for lat, lng in coords])

    url = f"{OSRM_BASE_URL}/route/v1/driving/{coord_str}?overview=full&geometries=geojson"

    res = requests.get(url)
    if res.status_code != 200:
        return None

    routes = res.json().get("routes")
    if not routes:
        return None

    geometry = routes[0]["geometry"]["coordinates"]

    return [[lat, lng] for lng, lat in geometry]
