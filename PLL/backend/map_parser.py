def extract_coordinates(link: str):
    try:
        coords = link.split("?q=")[1]
        lat, lng = coords.split(",")
        return float(lat), float(lng)
    except:
        return None, None
