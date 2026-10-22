import type { Direction, TextSize, ThemePreference } from "../preferences";

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
        <h2 id="page-title" tabIndex={-1} className="page-title">
          Settings
        </h2>
        <fieldset className="setting">
          <legend>Translation direction</legend>
          <p className="setting-help">The headword is shown first in lists, term details, and search results.</p>
          <label className="option">
            <input
              type="radio"
              name="direction"
              checked={direction === "en-to"}
              onChange={() => onDirection("en-to")}
            />
            <span>English → Tongan</span>
          </label>
          <label className="option">
            <input
              type="radio"
              name="direction"
              checked={direction === "to-en"}
              onChange={() => onDirection("to-en")}
            />
            <span>Tongan → English</span>
          </label>
        </fieldset>
        <fieldset className="setting">
          <legend>Text size</legend>
          <label className="option">
            <input
              type="radio"
              name="text-size"
              checked={textSize === "normal"}
              onChange={() => onTextSize("normal")}
            />
            <span>Normal</span>
          </label>
          <label className="option">
            <input
              type="radio"
              name="text-size"
              checked={textSize === "large"}
              onChange={() => onTextSize("large")}
            />
            <span>Large</span>
          </label>
        </fieldset>
        <fieldset className="setting">
          <legend>Theme</legend>
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
