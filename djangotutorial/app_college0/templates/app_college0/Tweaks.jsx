// Tweaks panel

const Tweaks = ({ theme, setTheme, accent, setAccent, radius, setRadius, font, setFont, onClose }) => {
  return (
    <div className="tweaks">
      <div className="h">
        <span>Tweaks</span>
        <span className="x" onClick={onClose}>✕</span>
      </div>
      <div className="b">
        <div className="row">
          <div className="label">Theme</div>
        </div>
        <div className="segs">
          <button className={theme === "editorial" ? "on" : ""} onClick={() => setTheme("editorial")}>Editorial</button>
          <button className={theme === "modern" ? "on" : ""} onClick={() => setTheme("modern")}>Modern</button>
          <button className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>Scholar</button>
        </div>

        <div className="row">
          <div className="label">Accent</div>
        </div>
        <div className="swatches">
          {[
            { k: "crimson", v: "#8b2e2e" },
            { k: "teal", v: "#0d7a72" },
            { k: "amber", v: "#d9a441" },
            { k: "ink", v: "#1a1a1a" },
            { k: "indigo", v: "#3b4cca" },
            { k: "olive", v: "#5c6b2f" },
          ].map(s => (
            <span key={s.k}
              className={"sw " + (accent === s.k ? "on" : "")}
              style={{ background: s.v }}
              onClick={() => setAccent(s.k)} title={s.k}/>
          ))}
        </div>

        <div className="row">
          <div className="label">Corners</div>
        </div>
        <div className="segs">
          <button className={radius === "sharp" ? "on" : ""} onClick={() => setRadius("sharp")}>Sharp</button>
          <button className={radius === "normal" ? "on" : ""} onClick={() => setRadius("normal")}>Normal</button>
          <button className={radius === "soft" ? "on" : ""} onClick={() => setRadius("soft")}>Soft</button>
        </div>

        <div className="row">
          <div className="label">Type</div>
        </div>
        <div className="segs">
          <button className={font === "fraunces" ? "on" : ""} onClick={() => setFont("fraunces")}>Fraunces</button>
          <button className={font === "instrument" ? "on" : ""} onClick={() => setFont("instrument")}>Instrument</button>
          <button className={font === "dm" ? "on" : ""} onClick={() => setFont("dm")}>DM Serif</button>
        </div>
      </div>
    </div>
  );
};

window.TweaksPanel = Tweaks;
