import geopandas as gpd
import rasterio
import pandas as pd

with rasterio.open("data/raw/dem/output_SRTMGL3.tif") as src:
    print("DEM:", src.shape, src.crs)

rivers = gpd.read_file("data/raw/rivers/HydroRIVERS_v10_as_shp/HydroRIVERS_v10_as_shp/HydroRIVERS_v10_as.shp")
print("Rivers:", rivers.shape, rivers.crs)

india = gpd.read_file("data/raw/admin/gadm41_IND.gpkg", layer="ADM_ADM_2")
nepal = gpd.read_file("data/raw/admin/gadm41_NPL.gpkg", layer="ADM_ADM_3")
print("India admin:", india.shape)
print("Nepal admin:", nepal.shape)

landslides = pd.read_csv("data/raw/landslides/Global_Landslide_Catalog_Export_rows.csv")
print("Landslides:", landslides.shape)

glaciers = gpd.read_file("data/raw/glaciers/himalaya_glaciers.gpkg")
print("Glaciers:", glaciers.shape)

print("\nAll files loaded successfully.")