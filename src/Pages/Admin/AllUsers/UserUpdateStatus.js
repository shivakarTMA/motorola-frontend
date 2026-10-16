import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { format } from "date-fns";
import { authAxios } from "../../../Config/config";
import { customStyles } from "../../../Helper/helper";

// Date/time helpers
const TIME_INTERVAL = 15;

const isSameDay = (a, b) => {
  if (!a || !b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const roundUpToInterval = (date, interval = TIME_INTERVAL) => {
  const ms = interval * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
};

const setTimeOnDate = (date, hours, minutes) => {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// Supports common API response shapes: arrays, data arrays, and nested data arrays.
const getItems = (response, keys = []) => {
  const body = response?.data ?? response;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  for (const key of keys) {
    if (Array.isArray(body?.[key])) return body[key];
    if (Array.isArray(body?.data?.[key])) return body.data[key];
  }
  return [];
};

const toLocationOption = (item) => {
  if (typeof item === "string") return { value: item, label: item };
  const value = item?.value ?? item?.location ?? item?.name ?? item?.city;
  if (value == null) return null;
  return { value: String(value), label: String(item?.label ?? item?.name ?? item?.location ?? value) };
};

const toCampusOption = (item) => {
  if (typeof item === "string") return { value: item, label: item };
  const value = item?.value ?? item?.id ?? item?.campus_id;
  if (value == null) return null;
  return { value, label: String(item?.label ?? item?.campus_name ?? item?.name ?? item?.campus ?? value) };
};

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
  ASSIGN: {
    title: "Assign Campus Ambassador",
    confirmLabel: "assign",
  },
  Remove: {
    title: "Remove Campus Ambassador",
    confirmLabel: "remove",
  },
  Change: {
    title: "Change Campus Ambassador",
    confirmLabel: "change",
  },
};

const isCampusAction = (action) =>
  ["ASSIGN", "Remove", "Change"].includes(action);

const findOption = (options, value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const actualValue =
    typeof value === "object" ? (value.value ?? value.id) : value;

  return (
    options.find((option) => String(option.value) === String(actualValue)) ||
    null
  );
};

const UserUpdateStatus = ({
  isOpen,
  onClose,
  user,
  action,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");
  const [suspendStart, setSuspendStart] = useState(null);
  const [suspendEnd, setSuspendEnd] = useState(null);

  const [location, setLocation] = useState("");
  const [campus, setCampus] = useState("");
  const [locationOptions, setLocationOptions] = useState([]);
  const [campusOptions, setCampusOptions] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [campusesLoading, setCampusesLoading] = useState(false);
  const [locationsError, setLocationsError] = useState("");
  const [campusesError, setCampusesError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [pendingPayload, setPendingPayload] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const meta = ACTION_META[action] || {
    title: "Update Status",
    confirmLabel: "update",
  };

  const isAssignOrChange = action === "ASSIGN" || action === "Change";

  const resetActionState = () => {
    setReason("");
    setSuspendStart(null);
    setSuspendEnd(null);
    setLocation("");
    setCampus("");
    setCampusOptions([]);
    setValidationErrors({});
    setPendingPayload(null);
    setConfirmOpen(false);
  };

  // Prefill location and campus when changing assignment.
  useEffect(() => {
  if (!isOpen) return;

  setReason("");
  setSuspendStart(null);
  setSuspendEnd(null);
  setValidationErrors({});
  setPendingPayload(null);
  setConfirmOpen(false);

  if (action === "Change") {
    setLocation(user?.campus?.location ?? "");
    setCampus(user?.campus?.id ?? "");
  } else {
    setLocation("");
    setCampus("");
  }
}, [isOpen, action, user]);

  // Load locations only for Assign / Change actions.
  useEffect(() => {
    if (!isOpen || !isAssignOrChange) return;
    let active = true;
    const loadLocations = async () => {
      setLocationsLoading(true);
      setLocationsError("");
      setLocationOptions([]);
      try {
        const response = await authAxios().get("/campus/locations");
        const options = getItems(response, ["locations", "results"])
          .map(toLocationOption).filter(Boolean);
        if (active) setLocationOptions(options);
      } catch (error) {
        console.error("Failed to load locations:", error);
        if (active) setLocationsError("Unable to load locations. Please try again.");
      } finally {
        if (active) setLocationsLoading(false);
      }
    };
    loadLocations();
    return () => { active = false; };
  }, [isOpen, isAssignOrChange]);

  // Fetch campuses whenever the location changes. Cleanup prevents stale results.
  useEffect(() => {
    if (!isOpen || !isAssignOrChange || !location) {
      setCampusOptions([]);
      setCampusesLoading(false);
      return;
    }
    let active = true;
    const loadCampuses = async () => {
      setCampusesLoading(true);
      setCampusesError("");
      setCampusOptions([]);
      try {
        const response = await authAxios().get("/campus/by-location", {
          params: { location },
        });
        const options = getItems(response, ["campuses", "results"])
          .map(toCampusOption).filter(Boolean);
        if (active) setCampusOptions(options);
      } catch (error) {
        console.error("Failed to load campuses:", error);
        if (active) setCampusesError("Unable to load campuses. Please try again.");
      } finally {
        if (active) setCampusesLoading(false);
      }
    };
    loadCampuses();
    return () => { active = false; };
  }, [isOpen, isAssignOrChange, location]);

  const handleClose = () => {
    if (submitting) return;
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

    if (isSameDay(date, now)) {
      const rounded = roundUpToInterval(now);

      if (date.getTime() < rounded.getTime()) {
        adjustedDate = rounded;
      }
    }

    setSuspendStart(adjustedDate);
    setSuspendEnd(null);
  };

  const handleSuspendEndChange = (date) => {
    clearError("suspendEnd");
    setSuspendEnd(date);
  };

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

      case "ASSIGN":
      case "Change":
        if (!findOption(locationOptions, location)) {
          errors.location = "Please select a location.";
        }

        if (!findOption(campusOptions, campus)) {
          errors.campus = "Please select a campus.";
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const buildPayload = () => {
    if (action === "ASSIGN" || action === "Change") {
      return {
        // action,
        // user_id: user?.id,
        // location: findOption(locationOptions, location)?.value,
           campus_id: findOption(campusOptions, campus)?.value,
      };
    }

    if (action === "Remove") {
      return {
        campus_id: null,
      };
    }

    const payload = { status: action };

    if (action === "SUSPENDED") {
      payload.effective_from = format(suspendStart, "yyyy-MM-dd HH:mm:ss");

      payload.effective_to = format(suspendEnd, "yyyy-MM-dd HH:mm:ss");

      payload.reason = reason.trim();
    } else if (action === "BANNED") {
      payload.reason = reason.trim();
    }

    return payload;
  };

  const handleSubmit = () => {
    if (isAssignOrChange && (locationsLoading || campusesLoading)) return;
    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setPendingPayload(buildPayload());

    if (action === "Remove") {
      // Removal is itself a confirmation-only modal.
      handleDirectRemove();
      return;
    }

    setConfirmOpen(true);
  };

  const handleDirectRemove = async () => {
    if (!onSubmit) return;

    try {
      setSubmitting(true);
      await onSubmit({
        campus_id: null,
      });
      handleSuccessfulClose();
    } catch (error) {
      // Parent callback should display the API error.
      console.error("Remove campus ambassador failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessfulClose = () => {
    resetActionState();
    onClose?.();
  };

  const handleConfirm = async () => {
    if (!pendingPayload || !onSubmit) return;

    try {
      setSubmitting(true);
      await onSubmit(pendingPayload);
      handleSuccessfulClose();
    } catch (error) {
      // Keep the modal open when the API fails.
      console.error("Action failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Suspend date/time boundaries
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

  const renderError = (field) =>
    validationErrors[field] ? (
      <p className="text-[11px] text-red-500 mt-1">{validationErrors[field]}</p>
    ) : null;

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
                leaveFrom="opacity-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform rounded-2xl bg-white shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <Dialog.Title className="text-base font-semibold text-gray-800">
                      {meta.title}
                      {user?.name ? ` — ${user.name}` : ""}
                    </Dialog.Title>

                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-5">
                    {/* Suspend */}
                    {action === "SUSPENDED" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-2 text-sm font-medium">
                              Suspend from
                              <span className="text-red-600">*</span>
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

                            {renderError("suspendStart")}
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium">
                              Suspend until
                              <span className="text-red-600">*</span>
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

                            {renderError("suspendEnd")}
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Reason for suspension
                            <span className="text-red-600">*</span>
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

                          {renderError("reason")}
                        </div>
                      </div>
                    )}

                    {/* Ban */}
                    {action === "BANNED" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Reason for ban
                            <span className="text-red-600">*</span>
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

                          {renderError("reason")}
                        </div>
                      </div>
                    )}

                    {/* Assign / Change */}
                    {isAssignOrChange && (
                      <div className="space-y-4">
                        {/* <div>
                          <label className="block mb-2 text-sm font-medium">
                            User Name
                          </label>

                          <input
                            type="text"
                            value={user?.name || ""}
                            readOnly
                            className="custom--input w-full bg-gray-100 cursor-not-allowed"
                          />
                        </div> */}

                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Location
                            <span className="text-red-600">*</span>
                          </label>

                          <Select
                            name="location"
                            styles={{
                              ...customStyles,
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                              }),
                            }}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            options={locationOptions}
                            placeholder="Select Location"
                            value={
  findOption(locationOptions, location) ||
  (action === "Change" && location
    ? {
        value: String(location),
        label: String(location),
      }
    : null)
}
                            onChange={(option) => {
                              setLocation(option?.value ?? "");
                              clearError("location");

                              // A new location clears the campus
                              // selection to prevent stale assignments.
                              setCampus("");
                              clearError("campus");
                            }}
                            onBlur={() => {}}
                            isClearable
                            isLoading={locationsLoading}
                            isDisabled={locationsLoading || !!locationsError}
                            noOptionsMessage={() => locationsLoading ? "Loading locations..." : "No locations found"}
                          />
                          {locationsError && <p className="text-xs text-red-500 mt-1">{locationsError}</p>}

                          {renderError("location")}
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Campus Ambassador
                            <span className="text-red-600">*</span>
                          </label>

                          <Select
                            name="campus"
                            styles={{
                              ...customStyles,
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                              }),
                            }}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            options={campusOptions}
                            placeholder={!location ? "Select location first" : campusesLoading ? "Loading campuses..." : "Select Campus Ambassador"}
                            isLoading={campusesLoading}
                            isDisabled={!location || campusesLoading || !!campusesError}
                            noOptionsMessage={() => "No campuses found"}
                            value={
  findOption(campusOptions, campus) ||
  (action === "Change" &&
  user?.campus?.id != null &&
  String(campus) === String(user.campus.id)
    ? {
        value: user.campus.id,
        label: user.campus.name,
      }
    : null)
}
                            onChange={(option) => {
                              setCampus(option?.value ?? "");
                              clearError("campus");
                            }}
                            isClearable
                          />

                          {campusesError && <p className="text-xs text-red-500 mt-1">{campusesError}</p>}
                          {renderError("campus")}
                        </div>
                      </div>
                    )}

                    {/* Remove */}
                    {action === "Remove" && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-700">
                          Are you sure you want to remove{" "}
                          <span className="font-semibold">
                            {user?.name || "this user"}
                          </span>{" "}
                          as a campus ambassador?
                        </p>

                        {/* <p className="text-xs text-gray-500">
                          Confirming will remove the user's
                          current campus ambassador assignment.
                        </p> */}
                      </div>
                    )}

                    {/* Reinstate / Reactivate */}
                    {(action === "ACTIVE" || action === "DEACTIVATED") && (
                      <p className="text-sm text-gray-600">
                        Are you sure you want to set this user's status to{" "}
                        <span className="font-medium">{action}</span>?
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 p-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="custom--btn !bg-white !text-black border !border-black disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting || (isAssignOrChange && (locationsLoading || campusesLoading))}
                      className="custom--btn disabled:opacity-60"
                    >
                      {submitting
                        ? "Processing..."
                        : action === "Remove"
                          ? "Confirm Remove"
                          : "Submit"}
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
          onClose={() => {
            if (!submitting) setConfirmOpen(false);
          }}
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
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-gray-800 mb-2">
                    Confirm {meta.confirmLabel}?
                  </Dialog.Title>

                 <p className="text-xs text-gray-500 mb-5">
  {isCampusAction(action)
    ? action === "Change"
      ? `Are you sure you want to change ${user?.name}'s campus?`
      : `Are you sure you want to ${meta.confirmLabel} ${user?.name} as campus ambassador?`
    : "This will update the user's status. Please confirm to continue."}
</p>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirmOpen(false)}
                      disabled={submitting}
                      className="custom--btn !bg-white !text-black border !border-black disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={submitting || (isAssignOrChange && (locationsLoading || campusesLoading))}
                      className="custom--btn disabled:opacity-60"
                    >
                      {submitting ? "Processing..." : "Confirm"}
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
