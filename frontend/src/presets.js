export const PRESETS = [
  {
    id: "default",
    label: "Balanced",
    weights: { slope: 35, river_proximity: 25, glacier_proximity: 20, landslide_density: 20 },
  },
  {
    id: "monsoon",
    label: "River-flood emphasis",
    weights: { slope: 20, river_proximity: 45, glacier_proximity: 15, landslide_density: 20 },
  },
  {
    id: "earthquake",
    label: "Post-earthquake",
    weights: { slope: 55, river_proximity: 15, glacier_proximity: 10, landslide_density: 20 },
  },
  {
    id: "glacier",
    label: "Glacier melt emphasis",
    weights: { slope: 20, river_proximity: 20, glacier_proximity: 45, landslide_density: 15 },
  },
  {
    id: "historical",
    label: "Historical hotspots",
    weights: { slope: 20, river_proximity: 20, glacier_proximity: 15, landslide_density: 45 },
  },
];
