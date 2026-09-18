import os
import geopandas as gpd
import pandas as pd
import numpy as np
import rasterio
from rasterstats import zonal_stats

DEM_PATH = "data/raw/dem/output_SRTMGL3.tif"
RIVERS_PATH = "data/raw/rivers/HydroRIVERS_v10_as_shp/HydroRIVERS_v10_as_shp/HydroRIVERS_v10_as.shp"
INDIA_ADMIN_PATH = "data/raw/admin/gadm41_IND.gpkg"
NEPAL_ADMIN_PATH = "data/raw/admin/gadm41_NPL.gpkg"
LANDSLIDES_PATH = "data/raw/landslides/Global_Landslide_Catalog_Export_rows.csv"
GLACIERS_PATH = "data/raw/glaciers/himalaya_glaciers.gpkg"

OUTPUT_DIR = "data/processed"
OUTPUT_RISK_PATH = os.path.join(OUTPUT_DIR, "himalaya_risk.geojson")
OUTPUT_EVENTS_PATH = os.path.join(OUTPUT_DIR, "historical_landslides.geojson")
SLOPE_TEMP_PATH = os.path.join(OUTPUT_DIR, "_slope_temp.tif")

PROJECTED_CRS = "EPSG:32645"

HIMALAYAN_STATES = [
    "Himachal Pradesh",
    "Uttarakhand",
    "Sikkim",
    "Jammu and Kashmir",
    "Ladakh",
    "West Bengal",
]
DARJEELING_DISTRICTS = ["Darjiling", "Darjeeling", "Kalimpong"]

WEIGHTS = {
    "slope": 0.35,
    "river_proximity": 0.25,
    "glacier_proximity": 0.20,
    "landslide_density": 0.20,
}

def load_admin_boundaries():
    print("[1/6] Loading admin boundaries...")
    india = gpd.read_file(INDIA_ADMIN_PATH, layer="ADM_ADM_2")
    nepal = gpd.read_file(NEPAL_ADMIN_PATH, layer="ADM_ADM_3")

    india_him = india[india["NAME_1"].isin(HIMALAYAN_STATES)].copy()

    wb_mask = india_him["NAME_1"] == "West Bengal"
    keep_mask = (~wb_mask) | (india_him["NAME_2"].isin(DARJEELING_DISTRICTS))
    india_him = india_him[keep_mask].copy()

    india_him["country"] = "India"
    india_him["district_name"] = india_him["NAME_2"]
    india_him["region_id"] = "IND_" + india_him["GID_2"].astype(str)

    nepal = nepal.copy()
    nepal["country"] = "Nepal"
    nepal["district_name"] = nepal["NAME_3"]
    nepal["region_id"] = "NPL_" + nepal["GID_3"].astype(str)

    cols = ["region_id", "country", "district_name", "geometry"]
    combined = pd.concat([india_him[cols], nepal[cols]], ignore_index=True)
    combined = gpd.GeoDataFrame(combined, geometry="geometry", crs=india.crs)

    print(f"      {len(combined)} districts loaded "
          f"({len(india_him)} India, {len(nepal)} Nepal)")
    return combined

def compute_slope_stats(admin_gdf):
    print("[2/6] Computing slope from DEM...")
    with rasterio.open(DEM_PATH) as src:
        elevation = src.read(1).astype(float)
        transform = src.transform
        pixel_size_deg = transform[0]
        pixel_size_m = pixel_size_deg * 111320

        gy, gx = np.gradient(elevation, pixel_size_m)
        slope_deg = np.degrees(np.arctan(np.sqrt(gx ** 2 + gy ** 2)))

        profile = src.profile
        profile.update(dtype=rasterio.float32)
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        with rasterio.open(SLOPE_TEMP_PATH, "w", **profile) as dst:
            dst.write(slope_deg.astype(rasterio.float32), 1)

    print("Computing zonal mean slope per district...")
    stats = zonal_stats(admin_gdf, SLOPE_TEMP_PATH, stats=["mean"], nodata=-9999)
    admin_gdf["slope_mean"] = [s["mean"] if s["mean"] is not None else 0.0 for s in stats]
    return admin_gdf

def compute_river_proximity(admin_gdf):
    print("[3/6] Computing river proximity...")
    rivers = gpd.read_file(RIVERS_PATH)

    admin_proj = admin_gdf.to_crs(PROJECTED_CRS)
    rivers_proj = rivers.to_crs(PROJECTED_CRS)

    centroids = admin_proj.geometry.centroid
    centroid_gdf = gpd.GeoDataFrame(geometry=centroids, crs=PROJECTED_CRS)

    joined = gpd.sjoin_nearest(centroid_gdf, rivers_proj[["geometry"]], distance_col="dist_m")
    joined = joined[~joined.index.duplicated(keep="first")]
    admin_gdf["river_dist_km"] = joined["dist_m"].values / 1000
    return admin_gdf

def compute_glacier_proximity(admin_gdf):
    print("[4/6] Computing glacier proximity...")
    glaciers = gpd.read_file(GLACIERS_PATH)

    admin_proj = admin_gdf.to_crs(PROJECTED_CRS)
    glaciers_proj = glaciers.to_crs(PROJECTED_CRS)

    centroids = admin_proj.geometry.centroid
    centroid_gdf = gpd.GeoDataFrame(geometry=centroids, crs=PROJECTED_CRS)

    joined = gpd.sjoin_nearest(centroid_gdf, glaciers_proj[["geometry"]], distance_col="dist_m")
    joined = joined[~joined.index.duplicated(keep="first")]
    admin_gdf["glacier_dist_km"] = joined["dist_m"].values / 1000
    return admin_gdf

def compute_landslide_density(admin_gdf):
    print("[5/6] Computing historical landslide density per district...")
    df = pd.read_csv(LANDSLIDES_PATH)

    lat_col = "latitude"
    lon_col = "longitude"

    df = df.dropna(subset=[lat_col, lon_col])
    points = gpd.GeoDataFrame(
        df, geometry=gpd.points_from_xy(df[lon_col], df[lat_col]), crs="EPSG:4326"
    )
    points = points.to_crs(admin_gdf.crs)

    joined = gpd.sjoin(points, admin_gdf[["region_id", "geometry"]], how="inner", predicate="within")
    counts = joined.groupby("region_id").size().rename("landslide_count")

    admin_gdf = admin_gdf.merge(counts, on="region_id", how="left")
    admin_gdf["landslide_count"] = admin_gdf["landslide_count"].fillna(0)

    matched_points = points.loc[joined.index]
    matched_points.to_file(OUTPUT_EVENTS_PATH, driver="GeoJSON")

    return admin_gdf

def normalize(series):
    if series.max() == series.min():
        return series * 0
    return (series - series.min()) / (series.max() - series.min())

def compute_composite_risk(admin_gdf):
    print("[6/6] Computing composite risk score...")
    admin_gdf["slope_norm"] = normalize(admin_gdf["slope_mean"])
    admin_gdf["river_norm"] = 1 - normalize(admin_gdf["river_dist_km"])       
    admin_gdf["glacier_norm"] = 1 - normalize(admin_gdf["glacier_dist_km"])    
    admin_gdf["landslide_norm"] = normalize(admin_gdf["landslide_count"])

    admin_gdf["risk_score"] = (
        WEIGHTS["slope"] * admin_gdf["slope_norm"]
        + WEIGHTS["river_proximity"] * admin_gdf["river_norm"]
        + WEIGHTS["glacier_proximity"] * admin_gdf["glacier_norm"]
        + WEIGHTS["landslide_density"] * admin_gdf["landslide_norm"]
    )
    return admin_gdf

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    admin = load_admin_boundaries()
    admin = compute_slope_stats(admin)
    admin = compute_river_proximity(admin)
    admin = compute_glacier_proximity(admin)
    admin = compute_landslide_density(admin)
    admin = compute_composite_risk(admin)

    admin.to_file(OUTPUT_RISK_PATH, driver="GeoJSON")

    if os.path.exists(SLOPE_TEMP_PATH):
        os.remove(SLOPE_TEMP_PATH)

    print(f"\nDone. Wrote {len(admin)} districts to {OUTPUT_RISK_PATH}")
    print("\nTop 10 highest-risk districts:")
    print(
        admin[["district_name", "country", "risk_score"]]
        .sort_values("risk_score", ascending=False)
        .head(10)
        .to_string(index=False)
    )

if __name__ == "__main__":
    main()