import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";

// Self-contained: no calendar library, no date-fns/jQuery version conflicts.
// Install: npm i react-icons

// ---------------------------------------------------------------------------
// date helpers
// ---------------------------------------------------------------------------

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function inRangeIncl(d, start, end) {
  if (!start || !end) return false;
  const t = d.getTime();
  return t >= start.getTime() && t <= end.getTime();
}
function formatShort(d) {
  if (!d) return "";
  return `${MONTH_LABELS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}
function dayCount(start, end) {
  if (!start || !end) return 0;
  return Math.round((startOfDay(end) - startOfDay(start)) / 86400000) + 1;
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const n = cells.length - (startWeekday + daysInMonth) + 1;
    cells.push({ date: new Date(year, month + 1, n), inMonth: false });
  }
  return cells;
}

function getPresets(today) {
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  return [
    { label: "Today", range: [today, today] },
    { label: "Yesterday", range: [addDays(today, -1), addDays(today, -1)] },
    { label: "Last 7 days", range: [addDays(today, -6), today] },
    { label: "Last 30 days", range: [addDays(today, -29), today] },
    { label: "This month", range: [thisMonthStart, today] },
    { label: "Last month", range: [lastMonthStart, lastMonthEnd] },
  ];
}

// ---------------------------------------------------------------------------
// single month
// ---------------------------------------------------------------------------

function Month({ year, month, onNavigate, showPrev, showNext, start, end, hover, onHover, onPick }) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const effectiveEnd = end || hover;

  return (
    <div className="drp-month">
      <div className="drp-month-head">
        <button
          type="button"
          className="drp-nav"
          style={{ visibility: showPrev ? "visible" : "hidden" }}
          onClick={() => onNavigate(-1)}
          aria-label="Previous month"
        >
          <FiChevronLeft size={16} />
        </button>
        <span className="drp-month-title">{MONTH_LABELS[month]} {year}</span>
        <button
          type="button"
          className="drp-nav"
          style={{ visibility: showNext ? "visible" : "hidden" }}
          onClick={() => onNavigate(1)}
          aria-label="Next month"
        >
          <FiChevronRight size={16} />
        </button>
      </div>

      <div className="drp-weekrow">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="drp-weekday">{d}</span>
        ))}
      </div>

      <div className="drp-grid">
        {cells.map(({ date, inMonth }, idx) => {
          const col = idx % 7;
          const isStart = start && isSameDay(date, start);
          const isEnd = end && isSameDay(date, end);
          const within =
            inMonth &&
            (inRangeIncl(date, start, effectiveEnd) || inRangeIncl(date, effectiveEnd, start));
          const isEdge = isStart || isEnd;
          const roundLeft = isStart || col === 0;
          const roundRight = isEnd || col === 6;

          return (
            <button
              type="button"
              key={idx}
              disabled={!inMonth}
              className="drp-cell"
              onClick={() => inMonth && onPick(date)}
              onMouseEnter={() => inMonth && onHover(date)}
            >
              {within && (
                <span
                  className="drp-bar"
                  style={{
                    borderTopLeftRadius: roundLeft ? 999 : 0,
                    borderBottomLeftRadius: roundLeft ? 999 : 0,
                    borderTopRightRadius: roundRight ? 999 : 0,
                    borderBottomRightRadius: roundRight ? 999 : 0,
                    left: roundLeft ? "8%" : 0,
                    right: roundRight ? "8%" : 0,
                  }}
                />
              )}
              <span
                className={[
                  "drp-num",
                  !inMonth ? "drp-num--muted" : "",
                  isEdge ? "drp-num--edge" : "",
                ].join(" ")}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// main component
// ---------------------------------------------------------------------------

export default function DateRangePicker({ onChange }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const presets = useMemo(() => getPresets(today), [today]);
  
  // rename state that's edited live in the panel:
  const [range, setRange] = useState([addDays(today, -6), today]);
  const [activeLabel, setActiveLabel] = useState("Last 7 days");
  
  const [pendingStart, setPendingStart] = useState(null);
  const [hover, setHover] = useState(null);
  const [leftMonth, setLeftMonth] = useState(new Date(today.getFullYear(), today.getMonth() - 1, 1));
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (onChange) onChange({ startDate: range[0], endDate: range[1], label: activeLabel });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, activeLabel]);

  const rightMonth = addMonths(leftMonth, 1);
  const [start, end] = range;

  function navigate(delta) {
    setLeftMonth((m) => addMonths(m, delta));
  }

  function pickPreset(preset) {
    setActiveLabel(preset.label);
    setRange(preset.range);
    setPendingStart(null);
    setLeftMonth(new Date(preset.range[0].getFullYear(), preset.range[0].getMonth(), 1));
  }

  function pickDate(date) {
    setActiveLabel("Custom range");
    if (!pendingStart) {
      setPendingStart(date);
      setRange([date, null]);
    } else {
      const s = pendingStart < date ? pendingStart : date;
      const e = pendingStart < date ? date : pendingStart;
      setRange([s, e]);
      setPendingStart(null);
    }
  }

  const days = dayCount(start, end);

  return (
    <div className="drp-root" ref={rootRef}>
      <button type="button" className="drp-trigger" onClick={() => setOpen((o) => !o)}>
        <FiCalendar size={15} className="drp-trigger-icon" />
        <span className="drp-trigger-text">
          {start ? formatShort(start) : "Start"} <span className="drp-dash">&rarr;</span>{" "}
          {end ? formatShort(end) : "End"}
        </span>
        <FiChevronDown size={13} className="drp-trigger-chevron" />
      </button>

      {open && (
        <div className="drp-panel">
          <aside className="drp-sidebar">
            <div className="drp-sidebar-label">Quick ranges</div>
            {presets.map((p) => (
              <button
                type="button"
                key={p.label}
                className={["drp-preset", activeLabel === p.label ? "drp-preset--active" : ""].join(" ")}
                onClick={() => pickPreset(p)}
              >
                {activeLabel === p.label && <span className="drp-preset-bar" />}
                {p.label}
              </button>
            ))}
          </aside>

          <section className="drp-body">
            <div className="drp-body-head">
              <div className="drp-range-readout">
                {start ? formatShort(start) : "Start date"}
                <span className="drp-dash">&rarr;</span>
                {end ? formatShort(end) : "End date"}
              </div>
              {days > 0 && (
                <div className="drp-badge">{days} {days === 1 ? "day" : "days"} selected</div>
              )}
            </div>

            <div className="drp-calendars">
              <Month
                year={leftMonth.getFullYear()}
                month={leftMonth.getMonth()}
                onNavigate={navigate}
                showPrev
                showNext={false}
                start={start}
                end={end}
                hover={hover}
                onHover={setHover}
                onPick={pickDate}
              />
              <Month
                year={rightMonth.getFullYear()}
                month={rightMonth.getMonth()}
                onNavigate={navigate}
                showPrev={false}
                showNext
                start={start}
                end={end}
                hover={hover}
                onHover={setHover}
                onPick={pickDate}
              />
            </div>

            <div className="drp-footer">
              <button type="button" className="drp-btn drp-btn--ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="drp-btn drp-btn--solid" onClick={() => setOpen(false)}>
                Apply
              </button>
            </div>
          </section>
        </div>
      )}

      <style>{`
        .drp-root {
          --ink: #151726;
          --slate: #68708A;
          --slate-soft: #9BA1B5;
          --canvas: #FFFFFF;
          --app-bg: #F5F6FA;
          --accent: #2d6fbf;
          --accent-dark: #1b559d;
          --accent-soft: #4279bd1c;
          --border: #E7E8F0;

          position: relative;
          display: inline-block;
          color: var(--ink);
        }

        .drp-trigger {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 14px;
          background: var(--canvas);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
        }
        .drp-trigger:hover { border-color: #D3D5E3; }
        .drp-trigger-icon { color: var(--accent); flex-shrink: 0; }
        .drp-trigger-text {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--ink);
          white-space: nowrap;
        }
        .drp-dash { color: var(--slate-soft); margin: 0 6px; }
        .drp-trigger-chevron { color: var(--slate-soft); margin-left: 2px; }

        .drp-panel {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          z-index: 50;
          display: flex;
          background: var(--canvas);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 20px 45px rgba(21, 23, 38, 0.14), 0 2px 6px rgba(21,23,38,0.06);
          overflow: hidden;
        }

        .drp-sidebar {
          width: 168px;
          padding: 16px 10px;
          background: var(--app-bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .drp-sidebar-label {
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--slate-soft);
          padding: 4px 10px 8px;
        }
        .drp-preset {
          position: relative;
          text-align: left;
          padding: 9px 10px 9px 14px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
        }
        .drp-preset:hover { background: #ECEDF6; }
        .drp-preset--active {
          background: var(--canvas);
          color: var(--accent-dark);
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(21,23,38,0.06);
        }
        .drp-preset-bar {
          position: absolute;
          left: 3px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 14px;
          border-radius: 2px;
          background: var(--accent);
        }

        .drp-body {
          padding: 18px 22px 16px;
        }
        .drp-body-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .drp-range-readout {
          font-weight: 600;
          font-size: 14.5px;
          color: var(--ink);
        }
        .drp-badge {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent-dark);
          background: var(--accent-soft);
          padding: 4px 10px;
          border-radius: 999px;
        }

        .drp-calendars {
          display: flex;
          gap: 28px;
        }

        .drp-month { width: 240px; }

        .drp-month-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .drp-month-title {
          font-weight: 600;
          font-size: 13.5px;
          color: var(--ink);
        }
        .drp-nav {
          border: none;
          background: transparent;
          color: var(--slate);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
        }
        .drp-nav:hover { background: var(--app-bg); color: var(--ink); }

        .drp-weekrow {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 2px;
        }
        .drp-weekday {
          text-align: center;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--slate-soft);
          padding: 4px 0 8px;
        }

        .drp-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .drp-cell {
          position: relative;
          height: 34px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }
        .drp-cell:disabled { cursor: default; }

        .drp-bar {
          position: absolute;
          top: 3px;
          bottom: 3px;
          background: var(--accent-soft);
          z-index: 0;
        }

        .drp-num {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          margin: 0 auto;
          border-radius: 999px;
          font-size: 12.5px;
          color: var(--ink);
        }
        .drp-cell:hover:not(:disabled) .drp-num:not(.drp-num--edge) {
          background: #E2E4FA;
        }
        .drp-num--muted { color: #D7D9E4; }
        .drp-num--edge {
          background: var(--accent);
          color: #fff;
          font-weight: 600;
        }

        .drp-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }
        .drp-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .drp-btn--ghost {
          background: transparent;
          color: var(--slate);
          border-color: var(--border);
        }
        .drp-btn--ghost:hover { background: var(--app-bg); }
        .drp-btn--solid {
          background: var(--accent);
          color: #fff;
        }
        .drp-btn--solid:hover { background: var(--accent-dark); }
      `}</style>
    </div>
  );
}