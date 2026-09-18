import { generateNarrative } from "./riskScale";

export default function DistrictPanel({ district }) {
  if (!district) {
    return (
      <div className="panel panel--empty">
        <p>Select a district to see its risk breakdown.</p>
      </div>
    );
  }

  const {
    district_name,
    country,
    risk_score,
    slope_norm,
    river_norm,
    glacier_norm,
    landslide_norm,
    landslide_count,
  } = district;

  return (
    <div className="panel">
      <h2>{district_name}</h2>
      <p className="panel__subtitle">{country}</p>

      <div className="risk-score">
        <span className="risk-score__value">{(risk_score * 100).toFixed(0)}</span>
        <span className="risk-score__label">composite risk</span>
      </div>

      <p className="panel__narrative">{generateNarrative(district)}</p>

      <div className="factor-list">
        <FactorRow label="Slope steepness" value={slope_norm} />
        <FactorRow label="River proximity" value={river_norm} />
        <FactorRow label="Glacier proximity" value={glacier_norm} />
        <FactorRow label="Landslide history" value={landslide_norm} />
      </div>

      <p className="panel__note">
        {landslide_count} recorded landslide event{landslide_count === 1 ? "" : "s"} since 2007.
      </p>
    </div>
  );
}

function FactorRow({ label, value }) {
  return (
    <div className="factor-row">
      <div className="factor-row__top">
        <span className="factor-row__label">{label}</span>
        <span className="factor-row__value">{(value * 100).toFixed(0)}</span>
      </div>
      <div className="factor-row__track">
        <div className="factor-row__fill" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}