import { useState, useMemo, useRef, useEffect } from "react";

export default function SearchBar({ regions, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const matches = useMemo(() => {
    if (!query || !regions) return [];
    const q = query.toLowerCase();
    return regions.features
      .filter((f) => f.properties.district_name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, regions]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="search" ref={containerRef}>
      <input
        type="text"
        placeholder="Search a district…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="search__input"
      />
      {open && matches.length > 0 && (
        <ul className="search__results">
          {matches.map((f) => (
            <li
              key={f.properties.region_id}
              onClick={() => {
                onSelect(f.properties);
                setQuery("");
                setOpen(false);
              }}
            >
              <span>{f.properties.district_name}</span>
              <span className="search__result-country">{f.properties.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
