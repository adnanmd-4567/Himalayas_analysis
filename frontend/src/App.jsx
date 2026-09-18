import { useEffect, useState, useCallback } from "react";
import MapView from "./MapView";
import Legend from "./Legend";
import DistrictPanel from "./DistrictPanel";
import ScenarioPresets from "./ScenarioPresets";
import HelpPopover from "./HelpPopover";
import SearchBar from "./SearchBar";
import Leaderboard from "./Leaderboard";
import { PRESETS } from "./presets";
import { fetchRegions, fetchLandslideEvents, recomputeRisk } from "./api";
import "./App.css";

export default function App() {
  const [regions, setRegions] = useState(null);
  const [events, setEvents] = useState(null);
  const [selected, setSelected] = useState(null);
  const [weights, setWeights] = useState(PRESETS[0].weights);
  const [activePreset, setActivePreset] = useState(PRESETS[0].id);
  const [view, setView] = useState("map"); // "map" | "rankings"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchRegions(), fetchLandslideEvents()])
      .then(([r, e]) => {
        setRegions(r);
        setEvents(e);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleApplyPreset = useCallback((preset) => {
    setActivePreset(preset.id);
    setWeights(preset.weights);
    recomputeRisk(preset.weights).then(setRegions).catch(console.error);
  }, []);

  const handleWeightChange = useCallback((key, value) => {
    setActivePreset("custom");
    setWeights((prev) => {
      const next = { ...prev, [key]: value };
      recomputeRisk(next).then(setRegions).catch(console.error);
      return next;
    });
  }, []);

  const handleSelectDistrict = (properties) => {
    setSelected(properties.region_id);
    setView("map");
  };

  const selectedDistrict = regions?.features.find(
    (f) => f.properties.region_id === selected
  )?.properties;

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-text">
          <h1>Himalaya Flood & Landslide Risk Analysis</h1>
          <p>Flood &amp; landslide risk across the Himalayan arc as glaciers retreat.</p>
        </div>

        <div className="app__header-controls">
          <SearchBar regions={regions} onSelect={handleSelectDistrict} />
          <div className="app__tabs">
            <button
              className={"app__tab" + (view === "map" ? " app__tab--active" : "")}
              onClick={() => setView("map")}
            >
              Map
            </button>
            <button
              className={"app__tab" + (view === "rankings" ? " app__tab--active" : "")}
              onClick={() => setView("rankings")}
            >
              Rankings
            </button>
          </div>
          <HelpPopover />
        </div>
      </header>

      {!loading && view === "map" && (
        <div className="app__toolbar">
          <ScenarioPresets
            activePreset={activePreset}
            weights={weights}
            onApplyPreset={handleApplyPreset}
            onChangeWeight={handleWeightChange}
          />
        </div>
      )}

      <div className="app__body">
        <div className="app__main">
          {loading ? (
            <div className="loading">Loading risk data…</div>
          ) : view === "map" ? (
            <>
              <MapView
                regions={regions}
                events={events}
                onSelectDistrict={handleSelectDistrict}
                selectedId={selected}
                weights={weights}
              />
              <Legend />
            </>
          ) : (
            <Leaderboard regions={regions} onSelectDistrict={handleSelectDistrict} />
          )}
        </div>

        <aside className={"side-panel" + (selectedDistrict && view === "map" ? " side-panel--open" : "")}>
          <button
            className="side-panel__close"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            ×
          </button>
          <DistrictPanel district={selectedDistrict} />
        </aside>
      </div>
    </div>
  );
}
