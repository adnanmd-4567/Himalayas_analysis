import { useState, useRef, useEffect } from "react";

export default function HelpPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="help" ref={ref}>
      <button className="help__button" onClick={() => setOpen((o) => !o)} aria-label="How this works">
        ?
      </button>
      {open && (
        <div className="help__popover">
          <p><strong>Click a district</strong> on the map or in Rankings to see its risk score.</p>
          <p><strong>Scenario chips</strong> reweight the risk formula and recolor the map instantly.</p>
          <p><strong>Custom weights</strong> lets you set your own factor weights manually.</p>
          <p><strong>Rankings tab</strong> lists every district sorted by risk, under the active scenario.</p>
        </div>
      )}
    </div>
  );
}
