"use client";

import Image from "next/image";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import BottomRightLines from "./BottomRightLines";

type Cfg = { x: number; y: number; w: number };
type Piece = {
  label: string;
  /** which edge x is measured from */
  side: "left" | "right";
  /** which edge y is measured from */
  vert: "top" | "bottom";
  defaults: Cfg;
};

/**
 * x = distance from the left/right edge, y = distance from the top/bottom edge,
 * w = width. All in u (1u = 1% of the page width, capped at 11px on large screens). Negative = pushed past the edge.
 * Paste your copied values over these defaults to make a tweak permanent.
 */
export const PIECES = {
  lines: {
    label: "Bottom-right lines",
    side: "right",
    vert: "bottom",
    defaults: { x: -60, y: -40, w: 106.5 },
  },
  outer: {
    label: "Top-left outer arc",
    side: "left",
    vert: "top",
    defaults: { x: 0, y: 0, w: 55 },
  },
  inner: {
    label: "Top-left inner arc",
    side: "left",
    vert: "top",
    defaults: { x: 0, y: 0, w: 42 },
  },
  bottomLeft: {
    label: "Bottom-left arc",
    side: "left",
    vert: "bottom",
    defaults: { x: 0, y: 0, w: 30 },
  },
} satisfies Record<string, Piece>;

type Id = keyof typeof PIECES;
type All = Record<Id, Cfg>;
const IDS = Object.keys(PIECES) as Id[];

const defaults = (): All =>
  Object.fromEntries(IDS.map((k) => [k, { ...PIECES[k].defaults }])) as All;

const Ctx = createContext<All>(defaults());
const STORE = "nextframe-art-tuner";

export function TunerProvider({ children }: { children: ReactNode }) {
  const [cfg, setCfg] = useState<All>(defaults);

  // Restore saved tweaks after mount (avoids a hydration mismatch)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORE);
        if (saved) setCfg({ ...defaults(), ...JSON.parse(saved) });
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const update = (next: All) => {
    setCfg(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {}
  };

  return (
    <Ctx.Provider value={cfg}>
      {children}
      <Panel cfg={cfg} update={update} />
    </Ctx.Provider>
  );
}

/** A positionable decorative piece: a PNG (pass `src`) or the animated lines SVG (no `src`). */
export function Art({
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
  const { side, vert } = PIECES[id];
  const c = useContext(Ctx)[id];
  const style: CSSProperties = {
    [side]: `calc(var(--u) * ${c.x})`,
    [vert]: `calc(var(--u) * ${c.y})`,
    width: `calc(var(--u) * ${c.w})`,
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

const r1 = (n: number) => Math.round(n * 10) / 10;

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mt-2 grid grid-cols-[4.5rem_1fr_4rem] items-center gap-2 text-xs">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="accent-[#c8933f]"
      />
      <input
        type="number"
        step={0.1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded bg-white/10 px-1 py-0.5 text-right"
      />
    </label>
  );
}

function Panel({ cfg, update }: { cfg: All; update: (c: All) => void }) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState<Id>("lines");
  const [copied, setCopied] = useState(false);
  const p = PIECES[id];
  const c = cfg[id];

  const set = (patch: Partial<Cfg>) =>
    update({ ...cfg, [id]: { ...c, ...patch } });

  const output = () => {
    const rows = IDS.map((k) => {
      const { side, vert } = PIECES[k];
      const v = cfg[k];
      return `${k}: ${side}=${r1(v.x)}u ${vert}=${r1(v.y)}u width=${r1(v.w)}u`;
    });
    return `${rows.join("\n")}\n\n${JSON.stringify(cfg)}`;
  };

  const copy = async () => {
    const text = output();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed right-4 bottom-4 z-50 text-white"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {open && (
        <div className="mb-2 w-[19rem] rounded-lg border border-white/15 bg-black/85 p-4 shadow-2xl backdrop-blur">
          <div className="text-sm font-semibold">Artwork settings</div>
          <select
            value={id}
            onChange={(e) => setId(e.target.value as Id)}
            className="mt-2 w-full rounded bg-white/10 px-2 py-1 text-sm"
          >
            {IDS.map((k) => (
              <option key={k} value={k} className="text-black">
                {PIECES[k].label}
              </option>
            ))}
          </select>

          <Slider
            label={`${p.side} →`}
            value={r1(c.x)}
            min={-60}
            max={60}
            onChange={(x) => set({ x })}
          />
          <Slider
            label={`${p.vert} ↑`}
            value={r1(c.y)}
            min={-60}
            max={60}
            onChange={(y) => set({ y })}
          />
          <Slider
            label="Scale (w)"
            value={r1(c.w)}
            min={5}
            max={120}
            onChange={(w) => set({ w })}
          />
          <p className="mt-2 text-[0.65rem] text-white/50">
            Units are u (% of page width, capped on big screens). Negative
            offsets push the piece past the edge.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={copy}
              className="flex-1 rounded bg-[#c8933f] px-3 py-1.5 text-xs font-semibold text-black"
            >
              {copied ? "Copied ✓" : "Copy configuration"}
            </button>
            <button
              onClick={() => update({ ...cfg, [id]: { ...p.defaults } })}
              className="rounded border border-white/30 px-3 py-1.5 text-xs"
            >
              Reset
            </button>
          </div>
          <button
            onClick={() => update(defaults())}
            className="mt-2 w-full text-[0.7rem] text-white/50 underline"
          >
            Reset all
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle artwork settings"
        className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/80 text-xl shadow-lg"
      >
        ⚙
      </button>
    </div>
  );
}
