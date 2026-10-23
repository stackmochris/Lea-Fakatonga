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
      </div>
    </article>
  );
}
