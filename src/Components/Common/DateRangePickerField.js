import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiX,
} from "react-icons/fi";

// Self-contained: no calendar library, no date-fns/jQuery version conflicts.
// Install: npm i react-icons

// ---------------------------------------------------------------------------
// date helpers
// ---------------------------------------------------------------------------

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
    cells.push({
      date: new Date(year, month - 1, daysInPrev - i),
      inMonth: false,
    });
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

function Month({
  year,
  month,
  onNavigate,
  showPrev,
  showNext,
  start,
  end,
  hover,
  onHover,
  onPick,
}) {
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
        <span className="drp-month-title">
          {MONTH_LABELS[month]} {year}
        </span>
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
          <span key={i} className="drp-weekday">
            {d}
          </span>
        ))}
      </div>

      <div className="drp-grid">
        {cells.map(({ date, inMonth }, idx) => {
          const col = idx % 7;
          const isStart = start && isSameDay(date, start);
          const isEnd = end && isSameDay(date, end);
          const within =
            inMonth &&
            (inRangeIncl(date, start, effectiveEnd) ||
              inRangeIncl(date, effectiveEnd, start));
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

// onChange fires ONLY when the user clicks Apply or Clear — never mid-selection.
// Payload: { startDate: Date|null, endDate: Date|null, label: string|null }
export default function DateRangePicker({
  onChange,
  defaultPreset = "Last 7 days",
  align = "left", // "left" | "right" — which side of the trigger the panel hangs from
  panelOffsetTop = 10, // gap between trigger and panel, in px
  panelOffsetLeft = 0, // extra horizontal nudge, in px (added to left, or subtracted on the right side)
  panelOffsetRight = 0,
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const presets = useMemo(() => getPresets(today), [today]);
  const defaultRange = useMemo(
    () =>
      presets.find((p) => p.label === defaultPreset)?.range || presets[2].range,
    [presets, defaultPreset],
  );

  // Draft state: what the user is actively selecting inside the open panel.
  const [range, setRange] = useState(defaultRange);
  const [activeLabel, setActiveLabel] = useState(defaultPreset);
  const [pendingStart, setPendingStart] = useState(null);
  const [hover, setHover] = useState(null);
  const [leftMonth, setLeftMonth] = useState(
    new Date(defaultRange[0].getFullYear(), defaultRange[0].getMonth() - 1, 1),
  );

  // Committed state: only updated on Apply/Clear. This is what the trigger
  // button displays and what onChange reports to the parent.
  const [committedRange, setCommittedRange] = useState([null, null]);
  const [committedLabel, setCommittedLabel] = useState(null);

  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const rightMonth = addMonths(leftMonth, 1);
  const [start, end] = range;
  const [committedStart, committedEnd] = committedRange;

  function navigate(delta) {
    setLeftMonth((m) => addMonths(m, delta));
  }

  function pickPreset(preset) {
    setActiveLabel(preset.label);
    setRange(preset.range);
    setPendingStart(null);
    setLeftMonth(
      new Date(preset.range[0].getFullYear(), preset.range[0].getMonth(), 1),
    );
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

  function openPanel() {
    // Sync the draft to whatever was last applied, so reopening shows
    // the real current filter rather than a stale in-progress selection.
    if (committedStart && committedEnd) {
      setRange(committedRange);
      setActiveLabel(committedLabel);
      setLeftMonth(
        new Date(committedStart.getFullYear(), committedStart.getMonth(), 1),
      );
    }
    setPendingStart(null);
    setOpen(true);
  }

  function handleCancel() {
    if (committedStart && committedEnd) {
      setRange(committedRange);
      setActiveLabel(committedLabel);
    } else {
      setRange(defaultRange);
      setActiveLabel(defaultPreset);
    }
    setPendingStart(null);
    setOpen(false);
  }

  function handleApply() {
    setCommittedRange(range);
    setCommittedLabel(activeLabel);
    if (onChange)
      onChange({ startDate: range[0], endDate: range[1], label: activeLabel });
    setOpen(false);
  }

  function handleClear() {
    setCommittedRange([null, null]);
    setCommittedLabel(null);
    setRange(defaultRange);
    setActiveLabel(defaultPreset);
    setPendingStart(null);
    if (onChange) onChange({ startDate: null, endDate: null, label: null });
    setOpen(false);
  }

  const days = dayCount(start, end);
  const isApplied = Boolean(committedStart && committedEnd);

  // React allows numeric style values for top/left/right and appends "px"
  // automatically, so plain numbers here are fine.
  const panelStyle =
    align === "right"
      ? {
          top: `${panelOffsetTop}%`,
          right: `${panelOffsetRight}%`,
          // left: `${panelOffsetLeft}%`,
        }
      : { top: `${panelOffsetTop}%`, left: `${panelOffsetLeft}%` };

  return (
    <div className="drp-root" ref={rootRef}>
      <button
        type="button"
        className="drp-trigger"
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        <FiCalendar size={15} className="drp-trigger-icon" />
        <span className="drp-trigger-text">
          {isApplied ? (
            <>
              {formatShort(committedStart)}{" "}
              <span className="drp-dash">&rarr;</span>{" "}
              {formatShort(committedEnd)}
            </>
          ) : (
            "Select date range"
          )}
        </span>
        <FiChevronDown size={13} className="drp-trigger-chevron" />
      </button>

      {isApplied && (
        <button
          type="button"
          className="drp-clear-x"
          aria-label="Clear date range"
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
        >
          <FiX size={14} />
        </button>
      )}

      {open && (
        <div className="drp-panel" style={panelStyle}>
          <aside className="drp-sidebar">
            <div className="drp-sidebar-label">Quick ranges</div>
            {presets.map((p) => (
              <button
                type="button"
                key={p.label}
                className={[
                  "drp-preset",
                  activeLabel === p.label ? "drp-preset--active" : "",
                ].join(" ")}
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
                <div className="drp-badge">
                  {days} {days === 1 ? "day" : "days"} selected
                </div>
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
              {isApplied && (
                <button
                  type="button"
                  className="drp-btn drp-btn--ghost"
                  style={{ marginRight: "auto" }}
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                className="drp-btn drp-btn--ghost"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="drp-btn drp-btn--solid"
                disabled={!start || !end}
                onClick={handleApply}
              >
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
          --border: #ccc;

          // position: relative;
          display: inline-flex;
          align-items: center;
          color: var(--ink);
          width:100%;
        }

        .drp-trigger {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 13px;
          background: var(--canvas);
          border: 1px solid var(--border);
          border-radius: 5px;
          cursor: pointer;
          height: 40px;
          box-sizing: border-box;
          flex:1;
          position:relative;
          padding-right: 33px;
        }
        .drp-trigger:hover { border-color: #D3D5E3; }
        .drp-trigger-icon { color: var(--accent); flex-shrink: 0; }
        .drp-trigger-text {
          font-size: 14px;
          color: var(--ink);
          white-space: nowrap;
        }
        .drp-dash { color: var(--slate-soft); margin: 0 6px; }
        .drp-trigger-chevron { 
          color:#6b7280; 
          margin-left: 2px;
          position:absolute;
          right:15px;
          transform: scale(1.5);
         }

        .drp-clear-x {
          margin-left: 6px;
          border: none;
          background: transparent;
          color: var(--slate-soft);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .drp-clear-x:hover { background: var(--app-bg); color: var(--ink); }

        .drp-panel {
          position: absolute;
          top: calc(100% + 10px);
          // left: 0;
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

        // .drp-month { width: 240px; }

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
        .drp-btn--solid:disabled {
          background: var(--slate-soft);
          cursor: not-allowed;
        }

        @media(max-width:992px){
          .drp-panel, .drp-body{
            width:100%
          }
            .drp-panel{
            flex-direction:column;
            }
            .drp-month{
            flex:1
            }
            .drp-sidebar {
                width: 100%;
                display: grid;
                grid-template-columns: repeat(2,1fr);
            }

            .drp-sidebar .drp-sidebar-label {grid-column: 1 / 3;}

            .drp-calendars {
                flex-direction: column;
                gap: 15px;
            }

            .drp-body {
                padding: 15px;
            }

            .drp-weekday {
                font-size: 10px;
                padding: 3px 0 5px;
            }

            .drp-num {
                width: 20px;
                height: 20px;
                font-size: 10px;
            }

            .drp-grid {
                grid-template-columns: repeat(8, 1fr);
            }

            .drp-preset {
                padding: 5px 10px;
                font-size: 12px;
                border-radius: 5px;
            }

            .drp-cell {
                height: 28px;
            }
            .drp-trigger-text {
                font-size: 12px;
            }

            .drp-trigger {
                padding: 7px 10px;
                height: auto;
            }
        }
      `}</style>
    </div>
  );
}
