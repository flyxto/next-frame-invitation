import Image from "next/image";
import BottomRightLines from "./BottomRightLines";

type Placement = {
  /** which edge `x` is measured from */
  side: "left" | "right";
  /** which edge `y` is measured from */
  vert: "top" | "bottom";
  /** distance from that left/right edge, in u (negative = pushed past the edge) */
  x: number;
  /** distance from that top/bottom edge, in u */
  y: number;
  /** width, in u */
  w: number;
};

/**
 * Fixed artwork placement. 1u = 1% of the page width, capped at 11px on large
 * screens (see --u in globals.css).
 */
const PLACEMENT = {
  lines: { side: "right", vert: "bottom", x: -60, y: -40, w: 106.5 },
  outer: { side: "left", vert: "top", x: 0, y: 0, w: 55 },
  inner: { side: "left", vert: "top", x: 0, y: 0, w: 42 },
  bottomLeft: { side: "left", vert: "bottom", x: 0, y: 0, w: 30 },
} satisfies Record<string, Placement>;

type Id = keyof typeof PLACEMENT;

/** A decorative corner piece: a PNG (pass `src`) or the animated lines SVG (no `src`). */
export default function Art({
  id,
  src,
  width,
  height,
  className = "",
}: {
  id: Id;
  src?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const { side, vert, x, y, w } = PLACEMENT[id];
  const style = {
    [side]: `calc(var(--u) * ${x})`,
    [vert]: `calc(var(--u) * ${y})`,
    width: `calc(var(--u) * ${w})`,
    height: "auto",
  };
  const cls = `pointer-events-none absolute select-none ${className}`;

  return src ? (
    <Image
      src={src}
      alt=""
      width={width!}
      height={height!}
      priority
      style={style}
      className={cls}
    />
  ) : (
    <BottomRightLines className={cls} style={style} />
  );
}
