export const RISK_TIERS = [
  { max: 0.35, label: "low", color: "#3F7C8A" },
  { max: 0.5, label: "low-to-moderate", color: "#6FA88A" },
  { max: 0.62, label: "moderate", color: "#E8A33D" },
  { max: 0.75, label: "high", color: "#D9722C" },
  { max: Infinity, label: "severe", color: "#B23A2F" },
];

export function riskColor(score) {
  return RISK_TIERS.find((t) => score < t.max).color;
}

export function riskTierLabel(score) {
  return RISK_TIERS.find((t) => score < t.max).label;
}

const FACTOR_NAMES = {
  slope_norm: "steep terrain",
  river_norm: "close river proximity",
  glacier_norm: "nearby glaciers",
  landslide_norm: "a history of recorded landslides",
};

export function generateNarrative(props) {
  const factors = Object.entries(FACTOR_NAMES)
    .map(([key, name]) => ({ name, value: props[key] }))
    .sort((a, b) => b.value - a.value);

  const top = factors.filter((f) => f.value > 0.35).slice(0, 2);
  const tier = riskTierLabel(props.risk_score);

  if (top.length === 0) {
    return `${props.district_name} falls in the ${tier} risk category, with no single dominant factor.`;
  }
  if (top.length === 1) {
    return `${props.district_name} falls in the ${tier} risk category, driven mainly by ${top[0].name}.`;
  }
  return `${props.district_name} falls in the ${tier} risk category, driven mainly by ${top[0].name} and ${top[1].name}.`;
}
