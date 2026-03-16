from sqlalchemy import Column, Integer, String, Float
from database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    excel_id = Column(Integer)
    map_link = Column(String(500))
    latitude = Column(Float)
    longitude = Column(Float)
    cluster_id = Column(Integer)
