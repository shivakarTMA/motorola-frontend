import React, { useState } from "react";
import {
  FiEye,
  FiX,
  FiCheck,
  FiShield,
  FiUserX,
  FiRotateCcw,
  FiClock,
  FiFlag,
  FiHash,
  FiUser,
  FiLayers,
  FiAlertTriangle,
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * NOTE ON @headlessui/react, react-icons, react-datepicker
 * ---------------------------------------------------------------------------
 * This canvas/artifact sandbox only ships a fixed set of packages and does
 * NOT include @headlessui/react, react-icons, or react-datepicker, so the
 * live preview here may not render. The code is written the way it should
 * look in your own project — after:
 *   npm install react-icons @headlessui/react react-datepicker
 * — it will work as-is, no changes needed.
 * ---------------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const initialReports = [
  {
    reportId: "Mod0001",
    reportedDate: "03/07/2026",
    reportedTime: "12:05",
    itemType: "Comment",
    reportedUser: "@user_x",
    tribe: "Gaming",
    postTitle: "bvghebqlijhq",
    source: "Keyword auto-flag",
    reason: "Abuse",
    action: "Removed",
    actionedBy: "@nikhil.tma",
    resolutionTime: "12:20",
    status: "Resolved",
  },
  {
    reportId: "Mod0002",
    reportedDate: "04/07/2026",
    reportedTime: "13:05",
    itemType: "Hot Take",
    reportedUser: "@nitin.tma",
    tribe: "Tech",
    postTitle: "bvghebqlijhq",
    source: "User report",
    reason: "Spam",
    action: "Approve",
    actionedBy: "@sara.tma",
    resolutionTime: "13:20",
    status: "Resolved",
  },
  {
    reportId: "Mod0003",
    reportedDate: "06/07/2026",
    reportedTime: "14:05",
    itemType: "Vibe Check",
    reportedUser: "@sara.tma",
    tribe: "Gaming",
    postTitle: "bvghebqlijhq",
    source: "Keyword auto-flag",
    reason: "Misinformation",
    action: "Warned",
    actionedBy: "@nikhil.tma",
    resolutionTime: "14:20",
    status: "Resolved",
  },
  {
    reportId: "Mod0004",
    reportedDate: "06/07/2026",
    reportedTime: "15:05",
    itemType: "Comment",
    reportedUser: "@user_y",
    tribe: "Tech",
    postTitle: "bvghebqlijhq",
    source: "User report",
    reason: "Abuse",
    action: "Suspended",
    actionedBy: "@sara.tma",
    resolutionTime: "15:20",
    status: "Pending",
  },
  {
    reportId: "Mod0005",
    reportedDate: "07/07/2026",
    reportedTime: "16:05",
    itemType: "Deep Dive",
    reportedUser: "@arjun.tma",
    tribe: "Tech",
    postTitle: "bvghebqlijhq",
    source: "User report",
    reason: "Spam",
    action: "Approve",
    actionedBy: "@sara.tma",
    resolutionTime: "16:20",
    status: "Resolved",
  },
];

// ---------------------------------------------------------------------------
// Action rules — each action name carries its own color ("tone")
// ---------------------------------------------------------------------------
const PENDING_ACTIONS = [
  {
    key: "remove",
    label: "Remove",
    icon: FiX,
    tone: "red",
    needsForm: false,
    resultStatus: "Resolved",
    resultAction: "Removed",
    note: "Notification will be sent to user: Automated",
  },
  {
    key: "approve",
    label: "Approve",
    icon: FiCheck,
    tone: "green",
    needsForm: false,
    resultStatus: "Resolved",
    resultAction: "Approve",
    note: "Notification will be sent to user: Automated",
  },
  {
    key: "warn",
    label: "Warn user",
    icon: FiAlertTriangle,
    tone: "yellow",
    needsForm: "warn",
    resultStatus: "Resolved",
    resultAction: "Warned",
    note: "A pre-set notification will be sent to the app.",
  },
  {
    key: "suspend",
    label: "Suspend user",
    icon: FiShield,
    tone: "orange",
    needsForm: "suspend",
    resultStatus: "Pending",
    resultAction: "Suspended",
    note: "A message will be sent to the user's registered phone number.",
  },
  {
    key: "ban",
    label: "Ban user",
    icon: FiUserX,
    tone: "rose",
    needsForm: "ban",
    resultStatus: "Resolved",
    resultAction: "Banned",
    note: "A message will be sent to the user's registered phone number.",
  },
];

const RESOLVED_ACTIONS = [
  {
    key: "reopen",
    label: "Reopen",
    icon: FiRotateCcw,
    tone: "blue",
    needsForm: false,
    resultStatus: "Pending",
    resultAction: "Reopened",
    note: "This report will be sent back to the moderation queue.",
  },
];

// Each action name gets its own distinct color.
const TONE_CLASSES = {
  red: "border-red-200 text-red-700 bg-red-50 hover:bg-red-100",
  green: "border-green-200 text-green-700 bg-green-50 hover:bg-green-100",
  yellow: "border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100",
  orange: "border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100",
  rose: "border-rose-300 text-rose-800 bg-rose-100 hover:bg-rose-200",
  blue: "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100",
};

// Solid variants used for the "Continue" / form submit buttons per action.
const TONE_SOLID_CLASSES = {
  red: "bg-red-600 hover:bg-red-700",
  green: "bg-green-600 hover:bg-green-700",
  yellow: "bg-yellow-500 hover:bg-yellow-600",
  orange: "bg-orange-600 hover:bg-orange-700",
  rose: "bg-rose-700 hover:bg-rose-800",
  blue: "bg-blue-600 hover:bg-blue-700",
};

const STATUS_BADGE = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const TRIBE_BADGE = {
  Gaming: "bg-violet-100 text-violet-800",
  Tech: "bg-sky-100 text-sky-800",
};

// ---------------------------------------------------------------------------
// Date/time helpers
// ---------------------------------------------------------------------------
// All the suspend-form date restrictions (requirements 2 & 3) are centralized
// here so the JSX below stays readable.

const isSameDay = (a, b) =>
  !!a && !!b && new Date(a).toDateString() === new Date(b).toDateString();

const startOfDay = (d) => {
  const x = new Date(d || new Date());
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d) => {
  const x = new Date(d || new Date());
  x.setHours(23, 59, 0, 0);
  return x;
};

// Earliest selectable time for the START field.
// - If the picked start date is today -> can't pick a time earlier than "now".
// - Otherwise (a future date) -> the whole day is open, so start-of-day.
const getStartMinTime = (startDate) => {
  const now = new Date();
  return isSameDay(startDate, now) ? now : startOfDay(startDate || now);
};

// Earliest selectable time for the END field.
// - If the end date is the same day as the start date -> can't pick a time
//   earlier than the chosen start time.
// - Otherwise -> start-of-day is fine, since the whole day is after start date.
const getEndMinTime = (startDate, endDate) => {
  if (isSameDay(endDate, startDate)) return startDate;
  const now = new Date();
  if (isSameDay(endDate, now)) return now;
  return startOfDay(endDate || startDate || now);
};

// react-datepicker fires onChange with the clicked day combined with
// whatever time was previously selected (or 00:00 if none was) — it does
// NOT consult minTime for that initial value, only for which times are
// shown in the time list afterwards. So a click on "today" can hand us a
// date sitting at midnight, which is already in the past. This clamps any
// date earlier than the computed minimum up to that minimum instead.
const clampToMin = (date, minTime) => {
  if (!date || !minTime) return date;
  return date < minTime ? new Date(minTime) : date;
};

// ---------------------------------------------------------------------------
// Modal (headlessui-shaped, dependency-free)
// ---------------------------------------------------------------------------
function Modal({ open, onClose, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-xl shadow-xl border border-slate-200 transform transition-all duration-200 scale-100 opacity-100 max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 last:border-b-0">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800 text-right">
        {value || "—"}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[status]}`}
    >
      {status}
    </span>
  );
}

// Single combined date + time field (used for both the suspend start and end
// pickers) so the "single date-time select" behaviour lives in one place.
function DateTimeField({
  label,
  selected,
  onChange,
  minDate,
  minTime,
  maxTime,
  placeholder,
  toneClass,
}) {
  return (
    <label className={`block text-xs font-medium ${toneClass}`}>
      {label}
      <DatePicker
        selected={selected}
        onChange={onChange}
        onKeyDown={(e) => e.preventDefault()}
        showTimeSelect
        timeIntervals={15}
        // readOnly
        dateFormat="dd/MM/yyyy h:mm aa"
        placeholderText={placeholder}
        className="mt-1 w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white"
        wrapperClassName="w-full mt-1"
        minDate={minDate}
        minTime={minTime}
        maxTime={maxTime}
      />
    </label>
  );
}

// ---------------------------------------------------------------------------
// Report Card
// ---------------------------------------------------------------------------
function ReportCard({ report, onView }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-slate-400">{report.reportId}</p>
          <h3 className="text-sm font-semibold text-slate-800 mt-0.5">
            {report.itemType}
          </h3>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-black">Tribe:</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${TRIBE_BADGE[report.tribe] || "bg-slate-100 text-slate-700"}`}
        >
          {report.tribe}
        </span>
        <span className="text-xs font-medium text-black">Reason:</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {report.reason}
        </span>
      </div>

      <div className="text-xs text-black flex flex-wrap lg:items-center gap-2">
        <p className="text-black">
          <span className="text-black font-semibold">Post:</span> {report.postTitle} /
        </p>
        <p className="text-black">
          <span className="text-black font-semibold">Source:</span> {report.source} /
        </p>
        <p className="flex items-center gap-1">
          <FiClock size={12} /> {report.reportedDate} · {report.reportedTime}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Action:{" "}
          <span className="font-medium text-slate-600">
            {report.action || "—"}
          </span>
        </span>
        <button
          onClick={() => onView(report)}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <FiEye size={14} /> View
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// API layer
// ---------------------------------------------------------------------------
// Requirement 4/5: submitting a status update calls an API. The real fetch
// call is commented out (no backend wired up in this sandbox) — the payload
// that WOULD be sent is logged to the console instead, so you can see
// exactly what each action produces once you plug in a real endpoint.
//
// Requirement 6: the payload builder below is the single source of truth
// for "what belongs to which action". Even if the form state (formValues)
// still has leftover values from a previously-opened form (e.g. the user
// opened the "Warn" form, typed remarks, then cancelled and clicked
// "Remove" instead), only the fields relevant to the action actually being
// submitted are included — nothing extra leaks into the payload.
function buildActionPayload(action, report, formValues) {
  const basePayload = {
    reportId: report.reportId,
    previousStatus: report.status,
    previousAction: report.action,
    newStatus: action.resultStatus,
    newAction: action.resultAction,
    actionedBy: report.actionedBy || "@current.moderator",
    submittedAt: new Date().toISOString(),
  };

  switch (action.key) {
    case "warn":
      return {
        ...basePayload,
        remarks: formValues.remarks || "",
      };

    case "suspend":
      return {
        ...basePayload,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        reason: formValues.reason || "",
      };

    case "ban":
      return {
        ...basePayload,
        remarks: formValues.remarks || "",
      };

    // "remove", "approve", "reopen" (and anything else without a form)
    // never carry remarks/dates/reason, regardless of what's left in
    // formValues from a previously opened form.
    case "remove":
    case "approve":
    case "reopen":
    default:
      return basePayload;
  }
}

async function submitModerationAction(payload) {
  // eslint-disable-next-line no-console
  console.log("[Moderation API] Submitting action payload:", payload);

  // ---------------------------------------------------------------------
  // Real API call — uncomment and point at your endpoint when ready.
  // ---------------------------------------------------------------------
  // const response = await fetch("/api/moderation/reports/action", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
  //
  // if (!response.ok) {
  //   throw new Error(`Moderation action failed with status ${response.status}`);
  // }
  //
  // return response.json();

  // Simulated network round-trip + success response so the UI flow can be
  // exercised without a live backend.
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { success: true, payload };
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------
export default function ModerationHistory() {
  const [reports, setReports] = useState(initialReports);
  const [viewing, setViewing] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Requirement 3: reports can come back from the API as a much longer
  // list (e.g. 50 items) — render a page at a time and let the user reveal
  // more instead of dumping everything on screen at once.
  const PAGE_SIZE = 3;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleReports = reports.slice(0, visibleCount);
  const hasMore = visibleCount < reports.length;

  const closeDetailModal = () => {
    setViewing(null);
    setActiveForm(null);
    setFormValues({});
  };

  const actionsForStatus = (status) =>
    status === "Pending" ? PENDING_ACTIONS : RESOLVED_ACTIONS;

  const handleActionClick = (action) => {
    if (action.needsForm) {
      setActiveForm(action.key);
      setFormValues(
        action.needsForm === "warn"
          ? { remarks: "" }
          : action.needsForm === "suspend"
            ? { startDate: null, endDate: null, reason: "" }
            : { remarks: "" },
      );
    } else {
      // Requirement 6: actions with no form (Remove / Approve / Reopen)
      // should not carry over remarks/dates typed into a previously opened
      // form, so clear form state before asking for confirmation.
      setActiveForm(null);
      setFormValues({});
      setPendingConfirm(action);
    }
  };

  const submitForm = (action) => {
    setPendingConfirm(action);
  };

  const applyAction = async () => {
    const action = pendingConfirm;
    if (!action || !viewing) return;

    const payload = buildActionPayload(action, viewing, formValues);

    try {
      setSubmitting(true);
      await submitModerationAction(payload);

      setReports((prev) =>
        prev.map((r) =>
          r.reportId === viewing.reportId
            ? { ...r, status: action.resultStatus, action: action.resultAction }
            : r,
        ),
      );
      setViewing((v) =>
        v
          ? { ...v, status: action.resultStatus, action: action.resultAction }
          : v,
      );
      setToast(`${viewing.reportId} updated — ${action.resultAction}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[Moderation API] Failed to submit action:", err);
      setToast("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
      setPendingConfirm(null);
      setActiveForm(null);
      setFormValues({});
      setTimeout(() => setToast(null), 2800);
    }
  };

  // Suspend form validation: both start and end must be picked, and end
  // can't be before start (belt-and-braces on top of the picker's own
  // minDate/minTime restrictions).
  const suspendFormValid =
    activeForm !== "suspend" ||
    (formValues.startDate &&
      formValues.endDate &&
      formValues.endDate > formValues.startDate);

  return (
    <>
      <div className="w-full mx-auto">
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> */}
        <div className="flex flex-col gap-2">
          {visibleReports.map((report) => (
            <ReportCard
              key={report.reportId}
              report={report}
              onView={setViewing}
            />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-5">
            <button
              onClick={() =>
                setVisibleCount((c) => Math.min(c + PAGE_SIZE, reports.length))
              }
              className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              Show more ({reports.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* View modal */}
      <Modal open={!!viewing} onClose={closeDetailModal} maxWidth="max-w-2xl">
        {viewing && (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="font-mono text-xs text-slate-400">
                  {viewing.reportId}
                </p>
                <h2 className="text-base font-semibold text-slate-900">
                  {viewing.itemType} report
                </h2>
              </div>
              <button
                onClick={closeDetailModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Report details
                </span>
                <StatusBadge status={viewing.status} />
              </div>

              <div className="bg-slate-50 rounded-lg px-3">
                <DetailRow
                  icon={FiHash}
                  label="Report ID"
                  value={viewing.reportId}
                />
                <DetailRow
                  icon={FiClock}
                  label="Reported"
                  value={`${viewing.reportedDate} · ${viewing.reportedTime}`}
                />
                <DetailRow
                  icon={FiUser}
                  label="Reported user"
                  value={viewing.reportedUser}
                />
                <DetailRow
                  icon={FiLayers}
                  label="Tribe"
                  value={viewing.tribe}
                />
                <DetailRow label="Post title" value={viewing.postTitle} />
                <DetailRow label="Source" value={viewing.source} />
                <DetailRow
                  icon={FiFlag}
                  label="Reason"
                  value={viewing.reason}
                />
                <DetailRow label="Action" value={viewing.action} />
                <DetailRow label="Actioned by" value={viewing.actionedBy} />
                <DetailRow
                  icon={FiClock}
                  label="Resolution time"
                  value={viewing.resolutionTime}
                />
              </div>

              {/* Status update actions, conditional on current status */}
              <div className="mt-5">
                <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Update status
                </span>

                <div className="flex flex-wrap gap-2 mt-2">
                  {actionsForStatus(viewing.status).map((action) => {
                    const Icon = action.icon;
                    const isActiveForm = activeForm === action.key;
                    return (
                      <button
                        key={action.key}
                        onClick={() => handleActionClick(action)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          TONE_CLASSES[action.tone]
                        } ${isActiveForm ? "ring-2 ring-offset-1 ring-indigo-300" : ""}`}
                      >
                        <Icon size={14} /> {action.label}
                      </button>
                    );
                  })}
                </div>

                {/* Inline form: warn */}
                {activeForm === "warn" && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    <label className="block text-xs font-medium text-gray-800">
                      Remarks
                      <textarea
                        className="mt-1 w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white"
                        rows={2}
                        value={formValues.remarks || ""}
                        onChange={(e) =>
                          setFormValues((f) => ({
                            ...f,
                            remarks: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <button
                      onClick={() =>
                        submitForm(
                          PENDING_ACTIONS.find((a) => a.key === "warn"),
                        )
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white ${TONE_SOLID_CLASSES.yellow}`}
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Inline form: suspend — single combined date+time field for
                    both start and end (requirement 1), with past dates/times
                    disabled (requirement 2) and end constrained to start
                    (requirement 3). */}
                {activeForm === "suspend" && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-2">
                      <DateTimeField
                        label="Start date & time"
                        toneClass="text-gray-800"
                        placeholder="Select start"
                        selected={formValues.startDate}
                        onChange={(date) => {
                          // Clamp so picking "today" doesn't silently land
                          // on 00:00 (a past time) — snap up to "now" (or
                          // start-of-day for a future date) instead.
                          const adjusted = clampToMin(
                            date,
                            getStartMinTime(date),
                          );
                          setFormValues((f) => ({
                            ...f,
                            startDate: adjusted,
                            // Changing the start always clears the end —
                            // it must be re-picked relative to the new start.
                            endDate: null,
                          }));
                        }}
                        minDate={new Date()}
                        minTime={getStartMinTime(formValues.startDate)}
                        maxTime={endOfDay(formValues.startDate)}
                      />
                      <DateTimeField
                        label="End date & time"
                        toneClass="text-gray-800"
                        placeholder="Select end"
                        selected={formValues.endDate}
                        // onChange={(date) => {
                        //   // Same clamp, this time relative to the start
                        //   // date/time (or "now" if end lands on today).
                        //   const adjusted = clampToMin(date, getEndMinTime(formValues.startDate, date));
                        //   setFormValues((f) => ({ ...f, endDate: adjusted }));
                        // }}
                        onChange={(date) => {
                          if (!date) return;

                          let selectedDate = new Date(date);

                          // If end date is empty and user selects only time,
                          // use start date instead of today's date.
                          if (!formValues.endDate && formValues.startDate) {
                            const start = new Date(formValues.startDate);

                            start.setHours(
                              selectedDate.getHours(),
                              selectedDate.getMinutes(),
                              0,
                              0,
                            );

                            selectedDate = start;
                          }

                          // Ensure end is never before start
                          if (
                            formValues.startDate &&
                            selectedDate < formValues.startDate
                          ) {
                            selectedDate = new Date(formValues.startDate);
                          }

                          setFormValues((previousValues) => ({
                            ...previousValues,
                            endDate: selectedDate,
                          }));
                        }}
                        minDate={formValues.startDate || new Date()}
                        minTime={getEndMinTime(
                          formValues.startDate,
                          formValues.endDate,
                        )}
                        maxTime={endOfDay(
                          formValues.endDate || formValues.startDate,
                        )}
                      />
                    </div>
                    <label className="block text-xs font-medium text-gray-800">
                      Reason for suspension
                      <textarea
                        className="mt-1 w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white"
                        rows={2}
                        value={formValues.reason || ""}
                        onChange={(e) =>
                          setFormValues((f) => ({
                            ...f,
                            reason: e.target.value,
                          }))
                        }
                      />
                    </label>
                    {!suspendFormValid && (
                      <p className="text-xs text-orange-700">
                        Pick a start and end date/time — end must be after
                        start.
                      </p>
                    )}
                    <button
                      disabled={!suspendFormValid}
                      onClick={() =>
                        submitForm(
                          PENDING_ACTIONS.find((a) => a.key === "suspend"),
                        )
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white ${TONE_SOLID_CLASSES.orange} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Inline form: ban */}
                {activeForm === "ban" && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    <label className="block text-xs font-medium text-gray-800">
                      Remarks
                      <textarea
                        className="mt-1 w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white"
                        rows={2}
                        value={formValues.remarks || ""}
                        onChange={(e) =>
                          setFormValues((f) => ({
                            ...f,
                            remarks: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <button
                      onClick={() =>
                        submitForm(PENDING_ACTIONS.find((a) => a.key === "ban"))
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white ${TONE_SOLID_CLASSES.rose}`}
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* Confirmation modal */}
      <Modal
        open={!!pendingConfirm}
        onClose={() => !submitting && setPendingConfirm(null)}
        maxWidth="max-w-sm"
      >
        {pendingConfirm && viewing && (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`p-2 rounded-full ${TONE_CLASSES[pendingConfirm.tone]}`}
              >
                <FiAlertTriangle size={18} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Confirm action
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-1">
              {pendingConfirm.label} for report{" "}
              <span className="font-mono">{viewing.reportId}</span>?
            </p>
            <p className="text-xs text-slate-400 mb-4">{pendingConfirm.note}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingConfirm(null)}
                disabled={submitting}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={applyAction}
                disabled={submitting}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white ${TONE_SOLID_CLASSES[pendingConfirm.tone]} disabled:opacity-50`}
              >
                {submitting ? "Submitting…" : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
