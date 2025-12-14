import React, { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type PartyHemicycle = {
  partyId: string;
  siglas: string;
  color: string;
  seats: number;
  name: string;
};

type Dot = {
  x: number;
  y: number;
  color: string;
  siglas: string;
  name: string;
  r: number;
};

// --- Configuration for the Hemiciclo ---
const R_INNER = 100; // Inner radius
const R_OUTER = 200; // Outer radius
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const START_ANGLE = Math.PI; // 180 degrees
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const END_ANGLE = 0; // 0 degrees
const CENTER_X = 0;
const CENTER_Y = 0;

export function Parliament({
  data,
  totalSeats,
  absoluteMajority,
}: {
  data: PartyHemicycle[];
  totalSeats?: number;
  absoluteMajority?: number;
}) {
  // Sort data by seats descending to ensure visually pleasing blocks
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.seats - a.seats);
  }, [data]);

  const displayTotal =
    totalSeats ?? sortedData.reduce((acc, p) => acc + p.seats, 0);

  const { dots, majPath, majLabelPos, majorityCount } = useMemo(() => {
    const totalSeatsRef = sortedData.reduce((acc, p) => acc + p.seats, 0);
    const majorityCount =
      totalSeatsRef % 2 === 0
        ? totalSeatsRef / 2 + 1
        : Math.ceil(totalSeatsRef / 2);

    if (totalSeatsRef === 0)
      return { dots: [], majPath: null, majLabelPos: null, majorityCount: 0 };

    // 1. Calculate how many rows we need
    const rowCount = 8;
    const rowThickness = (R_OUTER - R_INNER) / rowCount;

    // Distribute seats per row proportional to arc length
    const seatsPerRow: number[] = [];
    let seatsRemaining = totalSeatsRef;

    const rowRadii = Array.from(
      { length: rowCount },
      (_, i) => R_INNER + i * rowThickness + rowThickness / 2
    );
    const rowLengths = rowRadii.map((r) => r * Math.PI);
    const totalLength = rowLengths.reduce((a, b) => a + b, 0);

    for (let i = 0; i < rowCount; i++) {
      if (i === rowCount - 1) {
        seatsPerRow.push(seatsRemaining);
      } else {
        const count = Math.round(totalSeatsRef * (rowLengths[i] / totalLength));
        seatsPerRow.push(count);
        seatsRemaining -= count;
      }
    }

    const allSeats: { color: string; siglas: string; name: string }[] = [];
    sortedData.forEach((p) => {
      for (let k = 0; k < p.seats; k++)
        allSeats.push({ color: p.color, siglas: p.siglas, name: p.name });
    });

    const slots: {
      x: number;
      y: number;
      angle: number;
      r: number;
      rowId: number;
    }[] = [];

    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
      const r = rowRadii[rIdx];
      const nSeats = seatsPerRow[rIdx];
      const rowAngleStep = nSeats > 1 ? Math.PI / (nSeats - 1) : 0;

      for (let s = 0; s < nSeats; s++) {
        let theta;
        if (nSeats === 1) {
          theta = Math.PI / 2;
        } else {
          theta = Math.PI - s * rowAngleStep;
        }

        slots.push({
          x: r * Math.cos(theta) + CENTER_X,
          y: r * Math.sin(theta) + CENTER_Y,
          angle: theta,
          r: 0,
          rowId: rIdx,
        });
      }
    }

    // Sort slots by Angle Descending (PI -> 0)
    // NOTE: We must capture the original indices relative to the sorted list
    // to map to "Left" vs "Right".
    const sortedSlots = [...slots].sort((a, b) => b.angle - a.angle);

    // Generate Dots
    const finalDots: Dot[] = [];
    const dotRadius = (R_OUTER - R_INNER) / rowCount / 2.4;

    for (let i = 0; i < Math.min(allSeats.length, sortedSlots.length); i++) {
      const slot = sortedSlots[i];
      const seat = allSeats[i];
      finalDots.push({
        x: slot.x,
        y: -slot.y,
        r: dotRadius,
        color: seat.color,
        siglas: seat.siglas,
        name: seat.name,
      });
    }

    // Generate Adaptive Line Path
    // We want a line causing a split at `majorityCount`.
    // The Left side is indices 0 .. majorityCount-1
    // The Right side is indices majorityCount .. end
    // Boundary is between index (majorityCount-1) and (majorityCount).

    // We construct points row by row (Inner to Outer)
    const pathPoints: { x: number; y: number }[] = [];

    for (let rIdx = 0; rIdx < rowCount; rIdx++) {
      // Get slots for this row
      // Note: we need to find where the split happens WITHIN this row.
      // We look at the 'sortedSlots' list.
      // Find adjacent items in 'sortedSlots' that both belong to 'rIdx' ??
      // No. We need to look at the 'sortedSlots' around the split point.
      // Actually, simpler: For this row, find the two slots that straddle the angle cutoff?
      // But the cutoff is defined by INDEX in the global sorted list.

      // Let's filter sortedSlots for this row to see their order.
      // But their relative order is consistent with global angle sort.
      // We just need to find: What is the last slot in this row with globalIndex < majorityCount?
      // And the first slot in this row with globalIndex >= majorityCount?

      const slotsInRowWithIndex = sortedSlots
        .map((s, idx) => ({ ...s, globalIdx: idx }))
        .filter((s) => s.rowId === rIdx);

      // Find separation
      const lefts = slotsInRowWithIndex.filter(
        (s) => s.globalIdx < majorityCount
      );
      const rights = slotsInRowWithIndex.filter(
        (s) => s.globalIdx >= majorityCount
      );

      let pointAngle = Math.PI / 2;
      const r = rowRadii[rIdx];

      if (lefts.length > 0 && rights.length > 0) {
        // Split is between last left and first right
        const l = lefts[lefts.length - 1]; // closest to gap (smallest angle of lefts)
        const rSlot = rights[0]; // closest to gap (largest angle of rights)
        pointAngle = (l.angle + rSlot.angle) / 2;
      } else if (lefts.length > 0) {
        // All slots are on the left. Gap is to the right (smaller angle).
        // Maybe between last slot and... 0?
        // Take the last slot's angle minus half a step?
        // Or just extrapolate.
        pointAngle = lefts[lefts.length - 1].angle - 0.05; // small intuitive offset
      } else if (rights.length > 0) {
        // All slots on right. Gap is to the left (larger angle).
        pointAngle = rights[0].angle + 0.05;
      }

      pathPoints.push({
        x: r * Math.cos(pointAngle) + CENTER_X,
        y: r * Math.sin(pointAngle) + CENTER_Y,
      });
    }

    // Construct SVG Path Props
    if (pathPoints.length === 0)
      return {
        dots: finalDots,
        majPath: null,
        majLabelPos: null,
        majorityCount,
      };

    // Extend start (Inner)
    const pStart = pathPoints[0];
    const angleStart = Math.atan2(pStart.y - CENTER_Y, pStart.x - CENTER_X);
    const pStartExt = {
      x: (R_INNER - 15) * Math.cos(angleStart) + CENTER_X,
      y: (R_INNER - 15) * Math.sin(angleStart) + CENTER_Y,
    };

    // Extend end (Outer)
    const pEnd = pathPoints[pathPoints.length - 1];
    const angleEnd = Math.atan2(pEnd.y - CENTER_Y, pEnd.x - CENTER_X);
    const pEndExt = {
      x: (R_OUTER + 5) * Math.cos(angleEnd) + CENTER_X,
      y: (R_OUTER + 5) * Math.sin(angleEnd) + CENTER_Y,
    };

    // Combine
    const allPoints = [pStartExt, ...pathPoints, pEndExt];

    // SVG Path Command (remember y flip for rendering: -y)
    const dPath =
      `M ${allPoints[0].x} ${-allPoints[0].y} ` +
      allPoints
        .slice(1)
        .map((p) => `L ${p.x} ${-p.y}`)
        .join(" ");

    const labelPos = {
      x: (R_OUTER + 15) * Math.cos(angleEnd) + CENTER_X,
      y: -((R_OUTER + 15) * Math.sin(angleEnd) + CENTER_Y),
    };

    return {
      dots: finalDots,
      majPath: dPath,
      majLabelPos: labelPos,
      majorityCount,
    };
  }, [sortedData]);

  // Calculate Map for quick total seats lookup per sigla
  const seatsByParty = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((p) => map.set(p.siglas, p.seats));
    return map;
  }, [data]);

  return (
    <div className="w-full mx-auto aspect-[2/1]">
      <style>{`
        @keyframes flipReveal {
          0% { transform: scaleX(1); fill: #e5e7eb; }
          40% { transform: scaleX(0.1); fill: #e5e7eb; }
          60% { transform: scaleX(0.1); fill: var(--target-color); }
          100% { transform: scaleX(1); fill: var(--target-color); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <TooltipProvider>
        <svg
          viewBox={`-${R_OUTER + 10} -${R_OUTER + 25} ${2 * (R_OUTER + 10)} ${
            R_OUTER + 35
          }`}
          className="w-full h-full"
          role="img"
          aria-label="Parliament Hemicycle"
        >
          <text
            x="0"
            y="-30"
            textAnchor="middle"
            className="fill-foreground text-5xl font-bold"
            style={{
              fontSize: "40px",
              opacity: 0,
              animation: "fadeIn 0.8s ease-out forwards",
              animationDelay: "0.8s",
            }}
          >
            {displayTotal}
          </text>

          {majPath && majLabelPos && (
            <g
              style={{
                opacity: 0,
                animation: "fadeIn 0.8s ease-out forwards",
                animationDelay: "1.2s",
              }}
            >
              <path
                d={majPath}
                stroke="#9ca3af" // gray-400
                strokeWidth="1"
                strokeDasharray="2 2"
                fill="none"
              />
              <text
                x={majLabelPos.x}
                y={majLabelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px] font-medium"
                fill="#9ca3af"
              >
                Mayoría absoluta: {majorityCount}
              </text>
            </g>
          )}

          {dots.map((d, i) => (
            <Tooltip key={i} delayDuration={100}>
              <TooltipTrigger asChild>
                <g style={{ transform: `translate(${d.x}px, ${d.y}px)` }}>
                  <circle
                    r={d.r}
                    fill="#e5e7eb"
                    className="hover:opacity-80"
                    style={{
                      // @ts-ignore
                      "--target-color": d.color || "#ccc",
                      animation: "flipReveal 0.8s ease-in-out both",
                      animationDelay: `${i * 3}ms`,
                    }}
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-white text-black p-3 rounded-xl border-2 shadow-lg"
                style={{ borderColor: d.color }}
              >
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg">{d.siglas}</span>
                  <span className="text-sm text-gray-600 mb-1">{d.name}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">
                    {seatsByParty.get(d.siglas)} escaños
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </svg>
      </TooltipProvider>
    </div>
  );
}
