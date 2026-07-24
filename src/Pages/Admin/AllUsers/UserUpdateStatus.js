import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiX } from "react-icons/fi";
import { format } from "date-fns";

// ---- Date/time helpers ----
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

// Maps the target status (what we're about to set the user to) to copy shown in the modal
const ACTION_META = {
  SUSPENDED: {
    title: "Suspend User",
    confirmLabel: "suspend",
  },
  BANNED: {
    title: "Ban User",
    confirmLabel: "ban",
  },
  ACTIVE: {
    title: "Reinstate User",
    confirmLabel: "reinstate",
  },
  DEACTIVATED: {
    title: "Deactivate User",
    confirmLabel: "deactivate",
  },
};

/**
 * Props:
 * - isOpen: boolean — controls modal visibility
 * - onClose: () => void
 * - user: the row/user object the action applies to (used for display + id on submit)
 * - action: target status string — one of 'SUSPEND' | 'BANNED' | 'ACTIVE' | 'DEACTIVATED'
 * - onSubmit: (payload) => void — called with the API-ready payload after confirmation
 */
const UserUpdateStatus = ({ isOpen, onClose, user, action, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [suspendStart, setSuspendStart] = useState(null);
  const [suspendEnd, setSuspendEnd] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [pendingPayload, setPendingPayload] = useState(null);

  const meta = ACTION_META[action] || { title: "Update Status", confirmLabel: "update" };

  const resetActionState = () => {
    setReason("");
    setSuspendStart(null);
    setSuspendEnd(null);
    setValidationErrors({});
    setPendingPayload(null);
  };

  const handleClose = () => {
    resetActionState();
    onClose?.();
  };

  const clearError = (field) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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
    // snap forward to the next valid interval slot instead.
    if (isSameDay(date, now)) {
      const rounded = roundUpToInterval(now);
      if (date.getTime() < rounded.getTime()) {
        adjustedDate = rounded;
      }
    }

    setSuspendStart(adjustedDate);
    // Reset end date whenever start date changes
    setSuspendEnd(null);
  };

  const handleSuspendEndChange = (date) => {
    clearError("suspendEnd");
    setSuspendEnd(date);
  };

  // Field validation per action, with messages
  const validate = () => {
    const errors = {};

    switch (action) {
      case "SUSPENDED":
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

      case "BANNED":
        if (!reason.trim()) {
          errors.reason = "Reason for ban is required.";
        }
        break;

      default:
        // ACTIVE (reinstate/unban) and DEACTIVATED need no extra fields
        break;
    }

    return errors;
  };

  // Builds the exact payload shape the API expects
  const buildPayload = () => {
    const payload = { status: action };

    if (action === "SUSPENDED") {
      payload.effective_from = format(
        suspendStart,
        "yyyy-MM-dd HH:mm:ss",
      );
      payload.effective_to = format(suspendEnd, "yyyy-MM-dd HH:mm:ss");
      payload.reason = reason.trim();
    } else if (action === "BANNED") {
      payload.reason = reason.trim();
    }
    // ACTIVE / DEACTIVATED: status only, no reason/dates per the API contract

    return payload;
  };

  const handleSubmit = () => {
    const errors = validate();
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPendingPayload(buildPayload());
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (pendingPayload) {
      onSubmit?.(pendingPayload);
    }
    setConfirmOpen(false);
    resetActionState();
    onClose?.();
  };

  // ---- Suspend date/time boundaries ----
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
                    <Dialog.Title className="text-base font-semibold text-gray-800">
                      {meta.title}
                      {user?.name ? ` — ${user.name}` : ""}
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
                    <div className="">
                      {action === "SUSPENDED" && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-2 text-sm font-medium">
                                Suspend from<span className="text-red-600">*</span>
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
                                Suspend until<span className="text-red-600">*</span>
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
                              Reason for suspension<span className="text-red-600">*</span>
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

                      {action === "BANNED" && (
                        <div className="space-y-3">
                          <div>
                            <label className="block mb-2 text-sm font-medium">
                              Reason for ban<span className="text-red-600">*</span>
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

                      {(action === "ACTIVE" || action === "DEACTIVATED") && (
                        <p className="text-sm text-gray-600">
                          Are you sure you want to set this user's status to{" "}
                          <span className="font-medium">{action}</span>?
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
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
                      onClick={handleSubmit}
                      className="custom--btn disabled:opacity-60"
                    >
                      Submit
                    </button>
                  </div>
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
                    Confirm {meta.confirmLabel}?
                  </Dialog.Title>
                  <p className="text-xs text-gray-500 mb-5">
                    This will update the user's status and notify them. This
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

export default UserUpdateStatus;