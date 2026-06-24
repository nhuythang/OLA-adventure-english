"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

interface Pt {
  x: number;
  y: number;
}

const SAMPLES = 14; // waypoints along the path
const HIT_RADIUS = 10; // in viewBox units — generous for small fingers

// Trace the dashed letter guide: drag to light up the waypoints. When all are
// hit, the trace is complete. Forgiving by design (no "wrong"), per the no-fail
// rule — this is handwriting practice, not a quiz.
export function TracePad({ pathD, onComplete }: { pathD: string; onComplete: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const drawing = useRef(false);
  const done = useRef(false);
  const [waypoints, setWaypoints] = useState<Pt[]>([]);
  const [hit, setHit] = useState<boolean[]>([]);

  // Sample waypoints from the path on the client (getPointAtLength needs DOM).
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const pts: Pt[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const p = path.getPointAtLength((i / SAMPLES) * len);
      pts.push({ x: p.x, y: p.y });
    }
    done.current = false;
    setWaypoints(pts);
    setHit(new Array(pts.length).fill(false));
  }, [pathD]);

  // Fire completion once all waypoints are lit.
  useEffect(() => {
    if (!done.current && hit.length > 0 && hit.every(Boolean)) {
      done.current = true;
      onComplete();
    }
  }, [hit, onComplete]);

  function toViewBox(e: PointerEvent): Pt {
    const svg = svgRef.current;
    if (!svg) return { x: -99, y: -99 };
    const r = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  }

  function mark(p: Pt) {
    setHit((prev) => {
      let changed = false;
      const next = prev.slice();
      waypoints.forEach((wp, i) => {
        if (!next[i] && Math.hypot(wp.x - p.x, wp.y - p.y) <= HIT_RADIUS) {
          next[i] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      data-testid="trace-pad"
      data-waypoints={waypoints.length}
      data-hits={hit.filter(Boolean).length}
      className="mx-auto aspect-square w-full max-w-[320px] rounded-[28px] border-4 border-border-soft bg-card"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        drawing.current = true;
        svgRef.current?.setPointerCapture(e.pointerId);
        mark(toViewBox(e));
      }}
      onPointerMove={(e) => {
        if (drawing.current) mark(toViewBox(e));
      }}
      onPointerUp={() => (drawing.current = false)}
      onPointerCancel={() => (drawing.current = false)}
    >
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="var(--color-border-soft)"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 10"
      />
      {waypoints.map((wp, i) => (
        <circle
          key={i}
          cx={wp.x}
          cy={wp.y}
          r={5}
          fill={hit[i] ? "var(--color-coral)" : "var(--color-cream)"}
          stroke="var(--color-coral-dark)"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
