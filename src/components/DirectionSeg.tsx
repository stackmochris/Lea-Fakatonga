import type { CSSProperties } from "react";
import type { Direction } from "../preferences";

type Option<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const style = {
    "--seg-n": options.length,
    "--seg-i": index,
    gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
  } as CSSProperties;

  return (
    <div className="seg" role="group" aria-label={label} style={style}>
      <span className="seg-thumb" aria-hidden="true" />
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

type Props = {
  direction: Direction;
  onChange: (direction: Direction) => void;
  label: string;
};

export default function DirectionSeg({ direction, onChange, label }: Props) {
  return (
    <Segmented
      label={label}
      value={direction}
      onChange={onChange}
      options={[
        { value: "en-to", label: "EN→TO" },
        { value: "to-en", label: "TO→EN" },
      ]}
    />
  );
}
