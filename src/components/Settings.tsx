import type { Direction, TextSize, ThemePreference } from "../preferences";
import DirectionSeg from "./DirectionSeg";

type Props = {
  direction: Direction;
  textSize: TextSize;
  theme: ThemePreference;
  onDirection: (direction: Direction) => void;
  onTextSize: (size: TextSize) => void;
  onTheme: (theme: ThemePreference) => void;
};

export default function Settings({ direction, textSize, theme, onDirection, onTextSize, onTheme }: Props) {
  return (
    <article className="page-pane">
      <div className="page-wrap">
        <h1 id="page-title" tabIndex={-1} className="page-title">
          Settings
        </h1>
        <section className="setting">
          <h2 className="section-label">Direction</h2>
          <p className="setting-help">The headword is shown first in the list and in search.</p>
          <DirectionSeg direction={direction} onChange={onDirection} />
        </section>
        <fieldset className="setting">
          <legend className="section-label">Text size</legend>
          <label className="option">
            <input type="radio" name="text-size" checked={textSize === "normal"} onChange={() => onTextSize("normal")} />
            <span>Normal</span>
          </label>
          <label className="option">
            <input type="radio" name="text-size" checked={textSize === "large"} onChange={() => onTextSize("large")} />
            <span>Large</span>
          </label>
        </fieldset>
        <fieldset className="setting">
          <legend className="section-label">Theme</legend>
          <label className="option">
            <input type="radio" name="theme" checked={theme === "light"} onChange={() => onTheme("light")} />
            <span>Light</span>
          </label>
          <label className="option">
            <input type="radio" name="theme" checked={theme === "dark"} onChange={() => onTheme("dark")} />
            <span>Dark</span>
          </label>
          <label className="option">
            <input type="radio" name="theme" checked={theme === "system"} onChange={() => onTheme("system")} />
            <span>System</span>
          </label>
        </fieldset>
      </div>
    </article>
  );
}
