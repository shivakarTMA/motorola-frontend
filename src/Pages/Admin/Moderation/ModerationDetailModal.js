import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FiX,
  FiUser,
  FiUsers,
  FiCalendar,
  FiClock,
  FiImage,
} from "react-icons/fi";
import { customStyles } from "../../../Helper/helper";

const STATUS_LABELS = {
  PENDING: "Pending",
  ACTIONED: "Resolved",
  DISMISSED: "Dismissed",
};

const statusBadgeClasses = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  ACTIONED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  DISMISSED: "bg-gray-100 text-gray-600 border border-gray-200",
};

// Options for the "Action" select shown when a report is Pending
const actionOptions = [
    { value: "APPROVE", label: "Approve" },
    { value: "WARNING", label: "Warn user" },
    { value: "SUSPEND_USER", label: "Suspend user" },
    { value: "BAN_USER", label: "Ban user" },
    { value: "REMOVE", label: "Hide" },
];

const AUTOMATED_MESSAGES = {
  REMOVE:
    "Your content was removed for violating community guidelines. This notification was sent automatically.",
  APPROVE:
    "This report was reviewed and dismissed — no violation was found. This notification was sent automatically.",
};

// ---- Date/time helpers (requirements 3-7) ----
const TIME_INTERVAL = 15; // minutes — matches timeIntervals on the DatePickers

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

// Rounds a date's time UP to the next valid interval slot (e.g. 16:02 -> 16:15)
const roundUpToInterval = (date, interval = TIME_INTERVAL) => {
  const ms = interval * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
};

const setTimeOnDate = (date, hours, minutes) => {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const ModerationDetailModal = ({ isOpen, onClose, report, onStatusUpdate }) => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [reason, setReason] = useState("");
  const [suspendStart, setSuspendStart] = useState(null);
  const [suspendEnd, setSuspendEnd] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  if (!report) return null;

  const isPending = report.status === "PENDING";

  const resetActionState = () => {
    setSelectedAction(null);
    setRemarks("");
    setReason("");
    setSuspendStart(null);
    setSuspendEnd(null);
    setValidationErrors({});
  };

  const handleClose = () => {
    resetActionState();
    onClose();
  };

  // Pre-fill fields depending on which action is chosen
  const handleActionSelect = (option) => {
    setSelectedAction(option);
    setRemarks("");
    setReason("");
    setSuspendStart(null);
    setSuspendEnd(null);
    setValidationErrors({});
  };

  const clearError = (field) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Requirements 3, 4, 5, 6, 7
  const handleSuspendStartChange = (date) => {
    clearError("suspendStart");
    clearError("suspendEnd");

    if (!date) {
      setSuspendStart(null);
      setSuspendEnd(null);
      return;
    }

    const now = new Date();
    let adjustedDate = date;

    // If the picked day is today, never allow a time earlier than now —
    // snap forward to the next valid interval slot instead (req. 4, 5, 6).
    if (isSameDay(date, now)) {
      const rounded = roundUpToInterval(now);
      if (date.getTime() < rounded.getTime()) {
        adjustedDate = rounded;
      }
    }

    setSuspendStart(adjustedDate);
    // Requirement 7: reset end date whenever start date changes
    setSuspendEnd(null);
  };

  const handleSuspendEndChange = (date) => {
    clearError("suspendEnd");
    setSuspendEnd(date);
  };

  const buildPayload = () => {
    const base = {
      report_id: report.report_id,
      action: selectedAction?.value,
    };

    switch (selectedAction?.value) {
      case "REMOVE":
      case "APPROVE":
        return {
          ...base,
          notification: AUTOMATED_MESSAGES[selectedAction.value],
        };
      case "WARNING":
        return { ...base, remarks };
      case "SUSPEND_USER":
        return {
          ...base,
          suspend_from: suspendStart,
          suspend_to: suspendEnd,
          reason,
        };
      case "BAN_USER":
        return { ...base, reason, remarks };
      default:
        return base;
    }
  };

  // Requirement 2: field validation per action, with messages
  const validate = () => {
    const errors = {};

    if (!selectedAction) {
      errors.action = "Please select an action.";
      return errors;
    }

    switch (selectedAction.value) {
      case "WARNING":
        if (!remarks.trim()) {
          errors.remarks = "Remarks are required.";
        }
        break;

      case "SUSPEND_USER":
        if (!suspendStart) {
          errors.suspendStart = "Start date & time is required.";
        }
        if (!suspendEnd) {
          errors.suspendEnd = "End date & time is required.";
        } else if (
          suspendStart &&
          suspendEnd.getTime() <= suspendStart.getTime()
        ) {
          errors.suspendEnd =
            "End date & time must be after the start date & time.";
        }
        if (!reason.trim()) {
          errors.reason = "Reason for suspension is required.";
        }
        break;

      case "BAN_USER":
        if (!reason.trim()) {
          errors.reason = "Reason for ban is required.";
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validate();
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPendingPayload(buildPayload());
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    // eslint-disable-next-line no-console
    console.log("Moderation status updated:", pendingPayload);
    onStatusUpdate?.(pendingPayload);
    setConfirmOpen(false);
    resetActionState();
    onClose();
  };

  // ---- Suspend date/time boundaries (requirements 3, 4, 6) ----
  const now = new Date();

  const startCompareDate = suspendStart || now;
  const startIsToday = isSameDay(startCompareDate, now);
  const startMinTime = startIsToday
    ? roundUpToInterval(now)
    : setTimeOnDate(startCompareDate, 0, 0);
  const startMaxTime = setTimeOnDate(startCompareDate, 23, 45);

  const endCompareDate = suspendEnd || suspendStart || now;
  const endSameDayAsStart =
    suspendStart && isSameDay(endCompareDate, suspendStart);
  const endMinTime = endSameDayAsStart
    ? roundUpToInterval(suspendStart)
    : setTimeOnDate(endCompareDate, 0, 0);
  const endMaxTime = setTimeOnDate(endCompareDate, 23, 45);

  const selectStyles = {
    ...customStyles,
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <Dialog.Title className="text-sm font-semibold text-gray-800">
                      Report ID: {report.report_id}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-5">
                    {/* Media + Post */}
                    <div className="flex gap-4">
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {report.photos?.[0] ? (
                          <img
                            src={report.photos[0]}
                            alt="reported content"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiImage className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {report.post_title || "--"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {report.post_description || "--"}
                        </p>
                      </div>
                    </div>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        Reported Date:{" "}
                        <span className="font-medium text-gray-700">
                          {report.reported_date || "--"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        Reported Time:{" "}
                        <span className="font-medium text-gray-700">
                          {report.reported_time || "--"}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        Item type:{" "}
                        <span className="font-medium text-gray-700">
                          {report.item_type || "--"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        Reported (user):{" "}
                        <span className="font-medium text-gray-700">
                          {report.reported_user || "--"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        Tribe:{" "}
                        <span className="font-medium text-gray-700">
                          {report.tribe || "--"}
                        </span>
                      </div>

                      <div className="text-gray-500">
                        Moderator Name:{" "}
                        <span className="font-medium text-gray-700">
                          {report.moderator_name || "--"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        Updated Time:{" "}
                        <span className="font-medium text-gray-700">
                          {report.reported_time || "--"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-gray-400 mb-1">
                        Status
                      </p>
                      <span
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                          statusBadgeClasses[report.status] ||
                          statusBadgeClasses.DISMISSED
                        }`}
                      >
                        {STATUS_LABELS[report.status] || report.status}
                      </span>
                    </div>

                    {isPending ? (
                      <div className="border-t border-gray-100 pt-4 space-y-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Action
                          </label>
                          <Select
                            options={actionOptions}
                            value={selectedAction}
                            onChange={handleActionSelect}
                            placeholder="Choose an action..."
                            classNamePrefix="react-select"
                            styles={selectStyles}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                          />
                          {validationErrors.action && (
                            <p className="text-[11px] text-red-500 mt-1">
                              {validationErrors.action}
                            </p>
                          )}
                        </div>

                        {(selectedAction?.value === "REMOVE" ||
                          selectedAction?.value === "APPROVE") && (
                          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                            {AUTOMATED_MESSAGES[selectedAction.value]}
                          </p>
                        )}

                        {selectedAction?.value === "WARNING" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block mb-2 text-sm font-medium">
                                Remarks (sent to user)
                              </label>
                              <textarea
                                rows={3}
                                value={remarks}
                                onChange={(e) => {
                                  setRemarks(e.target.value);
                                  clearError("remarks");
                                }}
                                className="custom--input w-full"
                              />
                              {validationErrors.remarks && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {validationErrors.remarks}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedAction?.value === "SUSPEND_USER" && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block mb-2 text-sm font-medium">
                                  Suspend from
                                </label>
                                <div className="custom--date w-full">
                                  <DatePicker
                                    selected={suspendStart}
                                    onChange={handleSuspendStartChange}
                                    showTimeSelect
                                    timeIntervals={TIME_INTERVAL}
                                    minDate={now}
                                    minTime={startMinTime}
                                    maxTime={startMaxTime}
                                    dateFormat="MMM d, yyyy h:mm aa"
                                    placeholderText="Start date & time"
                                    className="custom--input w-full"
                                  />
                                </div>
                                {validationErrors.suspendStart && (
                                  <p className="text-[11px] text-red-500 mt-1">
                                    {validationErrors.suspendStart}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block mb-2 text-sm font-medium">
                                  Suspend until
                                </label>
                                <div className="custom--date w-full">
                                  <DatePicker
                                    selected={suspendEnd}
                                    onChange={handleSuspendEndChange}
                                    showTimeSelect
                                    timeIntervals={TIME_INTERVAL}
                                    disabled={!suspendStart}
                                    minDate={suspendStart || now}
                                    minTime={endMinTime}
                                    maxTime={endMaxTime}
                                    dateFormat="MMM d, yyyy h:mm aa"
                                    placeholderText={
                                      suspendStart
                                        ? "End date & time"
                                        : "Pick a start date first"
                                    }
                                    className="custom--input w-full"
                                  />
                                </div>
                                {validationErrors.suspendEnd && (
                                  <p className="text-[11px] text-red-500 mt-1">
                                    {validationErrors.suspendEnd}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block mb-2 text-sm font-medium">
                                Reason for suspension
                              </label>
                              <textarea
                                rows={2}
                                value={reason}
                                onChange={(e) => {
                                  setReason(e.target.value);
                                  clearError("reason");
                                }}
                                placeholder="Explain why the user is being suspended..."
                                className="custom--input w-full"
                              />
                              {validationErrors.reason && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {validationErrors.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedAction?.value === "BAN_USER" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block mb-2 text-sm font-medium">
                                Reason for ban
                              </label>
                              <textarea
                                rows={2}
                                value={reason}
                                onChange={(e) => {
                                  setReason(e.target.value);
                                  clearError("reason");
                                }}
                                placeholder="Explain why the user is being banned..."
                                className="custom--input w-full"
                              />
                              {validationErrors.reason && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {validationErrors.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-t border-gray-100 pt-4 text-xs text-gray-500">
                        This report has already been actioned by{" "}
                        <span className="font-medium text-gray-700">
                          {report.moderator_name || "a moderator"}
                        </span>{" "}
                        on {report.updated_time || "--"}.
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {isPending && (
                    <div className="flex justify-end gap-3 p-4 border-t">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="custom--btn !bg-white !text-black border !border-black"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={!selectedAction}
                        onClick={handleSubmit}
                        className="custom--btn disabled:opacity-60"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Confirmation modal */}
      <Transition appear show={confirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setConfirmOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-gray-800 mb-2">
                    Confirm {selectedAction?.label?.toLowerCase()}?
                  </Dialog.Title>
                  <p className="text-xs text-gray-500 mb-5">
                    This will update the report status and notify the user. This
                    action can't be undone.
                  </p>
                  <div className="flex justify-end gap-3 ">
                    <button
                      type="button"
                      onClick={() => setConfirmOpen(false)}
                      className="custom--btn !bg-white !text-black border !border-black"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="custom--btn disabled:opacity-60"
                    >
                      Confirm
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ModerationDetailModal;
