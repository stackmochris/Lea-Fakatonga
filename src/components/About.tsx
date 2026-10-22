import { APP_NAME, APP_SUBTITLE } from "../brand";

export default function About() {
  return (
    <article className="page-pane">
      <div className="page-wrap">
        <h1 id="page-title" tabIndex={-1} className="page-title">
          About
        </h1>
        <p>
          Built from the spreadsheet <cite>{APP_NAME} {APP_SUBTITLE}</cite>.
        </p>
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
