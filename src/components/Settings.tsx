import { strings } from "../i18n";
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
  const copy = strings(direction);
  return (
    <article className="page-pane">
      <div className="page-wrap">
        <h1 id="page-title" tabIndex={-1} className="page-title">
          {copy.settings}
        </h1>
        <section className="setting">
          <h2 className="section-label">{copy.direction}</h2>
          <p className="setting-help">{copy.directionHelp}</p>
          <DirectionSeg direction={direction} onChange={onDirection} label={copy.direction} />
        </section>
        <fieldset className="setting">
          <legend className="section-label">{copy.textSize}</legend>
          <label className="option">
            <input type="radio" name="text-size" checked={textSize === "normal"} onChange={() => onTextSize("normal")} />
            <span>{copy.normal}</span>
          </label>
          <label className="option">
            <input type="radio" name="text-size" checked={textSize === "large"} onChange={() => onTextSize("large")} />
            <span>{copy.large}</span>
          </label>
        </fieldset>
        <fieldset className="setting">
          <legend className="section-label">{copy.theme}</legend>
          <label className="option">
            <input type="radio" name="theme" checked={theme === "light"} onChange={() => onTheme("light")} />
            <span>{copy.light}</span>
          </label>
          <label className="option">
            <input type="radio" name="theme" checked={theme === "dark"} onChange={() => onTheme("dark")} />
            <span>{copy.dark}</span>
          </label>
          <label className="option">
            <input type="radio" name="theme" checked={theme === "system"} onChange={() => onTheme("system")} />
            <span>{copy.system}</span>
          </label>
        </fieldset>
      </div>
    </article>
  );
}
