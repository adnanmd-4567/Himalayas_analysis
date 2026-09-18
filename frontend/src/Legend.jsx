import { useState } from "react";
import { RISK_TIERS } from "./riskScale";

const BUCKET_LABELS = ["Low", "Low-moderate", "Moderate", "High", "Severe"];

export default function Legend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="legend">
      <div className="legend__header" onClick={() => setCollapsed((c) => !c)}>
        <span>Composite risk</span>
        <span className="legend__arrow">{collapsed ? "▸" : "▾"}</span>
      </div>
      {!collapsed && (
        <div className="legend__body">
          {RISK_TIERS.map((tier, i) => (
            <div className="legend__row" key={tier.label}>
              <span className="legend__swatch" style={{ background: tier.color }} />
              <span>{BUCKET_LABELS[i]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}