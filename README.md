# Himalaya Flood & Landslide Risk Analysis

An interactive risk-mapping tool covering the Himalayan arc (Nepal and the northern Indian states of Himachal Pradesh, Uttarakhand, Sikkim, and Darjeeling/Kalimpong). As glaciers across the Himalaya retreat under a warming climate, downstream communities face rising flood and landslide risk. This project scores every district in the region on a composite risk index built from real terrain, hydrology, and historical disaster data — not just a static map, but a tool you can interrogate under different real-world scenarios.

## What it does

- Scores 133 districts across Nepal and northern India on a composite flood/landslide risk index
- Lets you switch between named risk scenarios (Balanced, River-flood emphasis, Post-earthquake, Glacier melt emphasis, Historical hotspots) and watch the ranking update live
- Shows a plain-language explanation of *why* each district ranks where it does, not just a bare number
- Full sortable/filterable rankings table alongside the map view
- Plots 1,300+ historical landslide events from the NASA Global Landslide Catalog

## How the risk score works

Each district gets a composite score built from four normalized factors:

| Factor | Weight (default) | Source |
|---|---|---|
| Slope steepness | 35% | SRTM DEM (elevation → computed slope) |
| River proximity | 25% | HydroRIVERS |
| Glacier proximity | 20% | Randolph Glacier Inventory (RGI v6.2) |
| Historical landslide density | 20% | NASA Global Landslide Catalog |

Scenario presets simply reweight these same four factors differently (for example, "Post-earthquake" weights slope much higher) — they are a sensitivity-analysis tool, not a separate predictive model.

## Architecture

The project is built around a "download once" principle: every raw geospatial dataset (DEM, rivers, admin boundaries, glaciers, landslide records) is fetched exactly once during an offline preprocessing step, never re-queried at runtime.

```
Raw data (one-time download)
    -> preprocessing/build_risk_data.py
    -> data/processed/himalaya_risk.geojson + historical_landslides.geojson
    -> backend/ (FastAPI, serves precomputed data only)
    -> frontend/ (React + Leaflet)
```

## Tech stack

- **Preprocessing:** Python, geopandas, rasterio, rasterstats, shapely
- **Backend:** FastAPI
- **Frontend:** React (Vite), Leaflet / react-leaflet
- **Deployment:** Render (backend), Vercel (frontend)

## Data sources

- Elevation: [SRTM GL3 (90m), via OpenTopography](https://opentopography.org)
- Rivers: [HydroRIVERS](https://www.hydrosheds.org/products/hydrorivers) (Asia region)
- Administrative boundaries: [GADM v4.1](https://gadm.org)
- Historical landslides: [NASA Global Landslide Catalog](https://data.nasa.gov/dataset/global-landslide-catalog-export-f07b6)
- Historical floods: [ReliefWeb API](https://apidoc.reliefweb.int)
- Glaciers: [Randolph Glacier Inventory v6.2](https://www.glims.org/rgi_user_guide), via [OGGM](https://oggm.org)

Full attribution and license terms for each dataset are documented at their respective source links above. HydroRIVERS in particular requires attribution for any use under the HydroSHEDS core license, which this section fulfills.

## Running locally

**Backend:**
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```
cd frontend
npm install
npm run dev
```

By default the frontend calls `http://localhost:8000`. To point it at a deployed backend instead, set `VITE_API_BASE` in a `.env` file inside `frontend/`.

**Regenerating the data from scratch:**
```
cd preprocessing
pip install -r requirements.txt
python fetch_reliefweb_floods.py
python build_risk_data.py
```

## Future work

- Rainfall factor (CHIRPS) integration into the composite score
- Historical flood overlay on the map
- Watershed-level context (HydroBASINS) as an alternative unit to administrative districts