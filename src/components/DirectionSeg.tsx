import type { Direction } from "../preferences";

type Props = {
  direction: Direction;
  onChange: (direction: Direction) => void;
  label?: string;
};

export default function DirectionSeg({ direction, onChange, label = "Direction" }: Props) {
  const tonganFirst = direction === "to-en";
  return (
    <div className="seg" role="group" aria-label={label}>
      <span className={tonganFirst ? "seg-thumb is-end" : "seg-thumb"} aria-hidden="true" />
      <button type="button" aria-pressed={!tonganFirst} onClick={() => onChange("en-to")}>
        EN→TO
      </button>
      <button type="button" aria-pressed={tonganFirst} onClick={() => onChange("to-en")}>
        TO→EN
      </button>
    </div>
  );
}
