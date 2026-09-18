import { useState } from "react";
import WeightControls from "./WeightControls";
import { PRESETS } from "./presets";

export default function ScenarioPresets({ activePreset, weights, onApplyPreset, onChangeWeight }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="scenarios">
      <span className="scenarios__label">Scenario:</span>

      <div className="scenarios__list">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className={
              "scenarios__button" +
              (activePreset === p.id ? " scenarios__button--active" : "")
            }
            onClick={() => onApplyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button className="scenarios__advanced-toggle" onClick={() => setAdvancedOpen((o) => !o)}>
        {advancedOpen ? "Hide custom weights" : "Custom weights"}
      </button>

      {advancedOpen && (
        <div className="scenarios__advanced-panel">
          <WeightControls weights={weights} onChange={onChangeWeight} />
        </div>
      )}
    </div>
  );
}
