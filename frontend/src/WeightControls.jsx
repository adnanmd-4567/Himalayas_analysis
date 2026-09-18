const FACTORS = [
  { key: "slope", label: "Slope steepness" },
  { key: "river_proximity", label: "River proximity" },
  { key: "glacier_proximity", label: "Glacier proximity" },
  { key: "landslide_density", label: "Landslide history" },
];

export default function WeightControls({ weights, onChange }) {
  return (
    <div className="weight-controls">
      <h3>Adjust what matters</h3>
      {FACTORS.map(({ key, label }) => (
        <label key={key} className="weight-controls__row">
          <span>{label}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={weights[key]}
            onChange={(e) => onChange(key, Number(e.target.value))}
          />
        </label>
      ))}
    </div>
  );
}