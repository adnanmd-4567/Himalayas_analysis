import json
import geopandas as gpd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

RISK_PATH = "data/himalaya_risk.geojson"
EVENTS_PATH = "data/historical_landslides.geojson"

DEFAULT_WEIGHTS = {
    "slope": 0.35,
    "river_proximity": 0.25,
    "glacier_proximity": 0.20,
    "landslide_density": 0.20,
}

app = FastAPI(title="Himalaya Flood & Landslide Risk Atlas API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_gdf = gpd.read_file(RISK_PATH)
events_gdf = gpd.read_file(EVENTS_PATH)

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "status": "ok",
        "districts_loaded": len(risk_gdf),
        "landslide_events_loaded": len(events_gdf),
    }

@app.get("/regions")
def get_regions():
    """All districts with their composite risk score, as GeoJSON."""
    return json.loads(risk_gdf.to_json())


@app.get("/regions/{region_id}")
def get_region(region_id: str):
    """Single district detail, including the risk factor breakdown."""
    row = risk_gdf[risk_gdf["region_id"] == region_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Region not found")
    return json.loads(row.to_json())["features"][0]


@app.get("/events/landslides")
def get_landslide_events():
    """Historical landslide event points (NASA Global Landslide Catalog), as GeoJSON."""
    return json.loads(events_gdf.to_json())


@app.get("/risk/recompute")
def recompute_risk(
    slope: float = DEFAULT_WEIGHTS["slope"],
    river_proximity: float = DEFAULT_WEIGHTS["river_proximity"],
    glacier_proximity: float = DEFAULT_WEIGHTS["glacier_proximity"],
    landslide_density: float = DEFAULT_WEIGHTS["landslide_density"],
):
    total = slope + river_proximity + glacier_proximity + landslide_density
    if total <= 0:
        raise HTTPException(status_code=400, detail="Weights cannot all be zero")

    w_slope = slope / total
    w_river = river_proximity / total
    w_glacier = glacier_proximity / total
    w_landslide = landslide_density / total

    gdf = risk_gdf.copy()
    gdf["risk_score"] = (
        w_slope * gdf["slope_norm"]
        + w_river * gdf["river_norm"]
        + w_glacier * gdf["glacier_norm"]
        + w_landslide * gdf["landslide_norm"]
    )
    return json.loads(gdf.to_json())