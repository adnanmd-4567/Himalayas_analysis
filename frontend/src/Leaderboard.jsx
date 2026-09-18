import { useState, useMemo } from "react";

export default function Leaderboard({ regions, onSelectDistrict }) {
  const [sortDesc, setSortDesc] = useState(true);
  const [countryFilter, setCountryFilter] = useState("all");

  const rows = useMemo(() => {
    if (!regions) return [];
    let features = regions.features.map((f) => f.properties);
    if (countryFilter !== "all") {
      features = features.filter((p) => p.country === countryFilter);
    }
    return [...features].sort((a, b) =>
      sortDesc ? b.risk_score - a.risk_score : a.risk_score - b.risk_score
    );
  }, [regions, sortDesc, countryFilter]);

  return (
    <div className="leaderboard">
      <div className="leaderboard__controls">
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="leaderboard__select"
        >
          <option value="all">All countries</option>
          <option value="India">India</option>
          <option value="Nepal">Nepal</option>
        </select>
        <button className="leaderboard__sort" onClick={() => setSortDesc((s) => !s)}>
          Sort: {sortDesc ? "Highest first" : "Lowest first"}
        </button>
      </div>

      <table className="leaderboard__table">
        <thead>
          <tr>
            <th>#</th>
            <th>District</th>
            <th>Country</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.region_id} onClick={() => onSelectDistrict(r)}>
              <td>{i + 1}</td>
              <td>{r.district_name}</td>
              <td>{r.country}</td>
              <td>{(r.risk_score * 100).toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
