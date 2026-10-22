import { strings } from "../i18n";
import type { Direction } from "../preferences";

type Props = {
  direction: Direction;
};

export default function About({ direction }: Props) {
  const copy = strings(direction);
  return (
    <article className="page-pane">
      <div className="page-wrap">
        <h1 id="page-title" tabIndex={-1} className="page-title">
          {copy.about}
        </h1>
        <p className="credit-line">{copy.aboutCredit}</p>
        <p>{copy.aboutSupport}</p>
        <ul className="credits">
          <li>
            <span lang="to" translate="no">
              ʻĀtolopolosia
            </span>{" "}
            by Tēvita O. Kaʻili
          </li>
          <li>
            <span lang="to" translate="no">
              Komipiuta
            </span>{" "}
            by Dr Veamoniti Lautaha
          </li>
        </ul>
      </div>
    </article>
  );
}
