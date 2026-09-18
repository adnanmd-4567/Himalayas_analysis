import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { riskColor } from "./riskScale";

const HIMALAYA_CENTER = [30.5, 81.5];

function FlyToSelection({ regions, selectedId }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId || !regions) return;
    const feature = regions.features.find((f) => f.properties.region_id === selectedId);
    if (!feature) return;

    const layer = L.geoJSON(feature);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 10, duration: 0.6 });
    }
  }, [selectedId, regions, map]);

  return null;
}

export default function MapView({ regions, events, onSelectDistrict, selectedId, weights }) {
  if (!regions) return null;

  const style = (feature) => {
    const isSelected = feature.properties.region_id === selectedId;
    return {
      fillColor: riskColor(feature.properties.risk_score),
      weight: isSelected ? 3.5 : 0.6,
      color: isSelected ? "#F4C15B" : "#12181B",
      fillOpacity: 0.75,
      className: isSelected ? "district-selected" : "",
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on("click", () => onSelectDistrict(feature.properties));
  };

  const layerKey = `${selectedId}-${JSON.stringify(weights)}`;

  return (
    <MapContainer center={HIMALAYA_CENTER} zoom={6} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON data={regions} style={style} onEachFeature={onEachFeature} key={layerKey} />
      <FlyToSelection regions={regions} selectedId={selectedId} />
      {events &&
        events.features.map((f, i) => (
          <CircleMarker
            key={i}
            center={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
            radius={3}
            pathOptions={{ color: "#EDEDE3", fillColor: "#12181B", fillOpacity: 0.6, weight: 1 }}
          >
            <Popup>{f.properties.event_title || "Recorded landslide event"}</Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}