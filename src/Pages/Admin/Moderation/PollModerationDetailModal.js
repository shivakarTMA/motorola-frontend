import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { customStyles, formatWithTimeDate } from "../../../Helper/helper";
import { authAxios } from "../../../Config/config";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { format } from "date-fns";
import { FiHeart, FiMessageSquare } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const statusOptions = [
  { value: "PUBLISHED", label: "Published" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "HIDDEN", label: "Hidden" },
];

const optionPalette = [
  {
    bar: "bg-[#685BC730]",
    text: "text-[#685BC7]",
    chip: "bg-[#685BC730] text-[#685BC7]",
  },
  {
    bar: "bg-[#685BC730]",
    text: "text-[#685BC7]",
    chip: "bg-[#685BC730] text-[#685BC7]",
  },
  {
    bar: "bg-[#685BC730]",
    text: "text-[#685BC7]",
    chip: "bg-[#685BC730] text-[#685BC7]",
  },
  {
    bar: "bg-[#685BC730]",
    text: "text-[#685BC7]",
    chip: "bg-[#685BC730] text-[#685BC7]",
  },
];

// Options for the "Action" select shown when a report is Pending
const actionOptions = [
  { value: "PUBLISHED", label: "Published" },
  { value: "HIDDEN", label: "Hidden" },
  { value: "WARNED", label: "Warn user" },
  { value: "SUSPENDED", label: "Suspend user" },
  { value: "BANNED", label: "Ban user" },
];

const AUTOMATED_MESSAGES = {
  HIDDEN:
    "Your content was hidden for violating community guidelines. This notification was sent automatically.",
  PUBLISHED:
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

const statusColors = {
  ACTIONED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
};

// Central "show value or --" helper so every field in the info panel behaves the same way.
const showValue = (value) => {
  if (value === null || value === undefined) return "--";
  if (typeof value === "string" && value.trim() === "") return "--";
  return value;
};

const PollModerationDetailModal = ({
  isOpen,
  onClose,
  editId,
  onSuccess,
  onSubmit,
}) => {
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");

  const [selectedAction, setSelectedAction] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [reason, setReason] = useState("");
  const [suspendStart, setSuspendStart] = useState(null);
  const [suspendEnd, setSuspendEnd] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  //   const filteredStatusOptions = statusOptions.filter(
  //     (opt) => opt.value !== postDetails?.status,
  //   );

  useEffect(() => {
    if (!editId || !isOpen) return;

    const fetchPostDetails = async () => {
      try {
        setLoading(true);

        const res = await authAxios().get(`/moderation/${editId}`);

        if (res.data.success) {
          const data = res.data.data;
          setPostDetails(data);
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to fetch poll details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [editId, isOpen]);

  // help_text arrives as a Quill delta JSON string, same shape as a post's `content`.
  const getHelpTextHtml = () => {
    if (!postDetails?.poll?.help_text) return "";

    try {
      const ops = JSON.parse(postDetails?.poll?.help_text);
      const converter = new QuillDeltaToHtmlConverter(ops, {});
      return converter.convert();
    } catch (err) {
      console.error(err);
      return postDetails?.poll?.help_text;
    }
  };

  const helpTextHtml = getHelpTextHtml();
  const options = postDetails?.poll?.options || [];
  const totalVotes = postDetails?.poll?.total_votes || 0;
  const hasImageOptions = options.some((opt) => opt.poll_option_image);

  const infoRows = [
    ["Item Type", "Vibe Check"],
    ["Created By", showValue(postDetails?.user?.name)],
    ["Username", showValue(postDetails?.user?.username)],
    ["Created at", formatWithTimeDate(postDetails?.created_at)],
    ["Ending at", formatWithTimeDate(postDetails?.poll?.poll_ends_at)],
    ["Content ID", showValue(postDetails?.content_id)],
    ["Tribe Group", showValue(postDetails?.poll?.circle?.circleGroup?.name)],
    ["Tribe Name", showValue(postDetails?.poll?.circle?.name)],
    ["Flagged Keywords", showValue(postDetails?.matchedKeyword?.keyword)],
  ];

  if (!postDetails) return null;

  const isPending = postDetails.status === "PENDING";

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
      flag_id: postDetails.id,
      status: selectedAction?.value,
    };

    switch (selectedAction?.value) {
      case "HIDDEN":
      case "PUBLISHED":
        return {
          ...base,
        };
      case "WARNED":
        return { ...base, reason: remarks };
      case "SUSPENDED":
        return {
          ...base,
          effective_from: format(suspendStart, "yyyy-MM-dd HH:mm:ss"),
          effective_to: format(suspendEnd, "yyyy-MM-dd HH:mm:ss"),
          reason: remarks,
        };
      case "BANNED":
        return { ...base, reason: reason };
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
      case "WARNED":
        if (!remarks.trim()) {
          errors.remarks = "Remarks are required.";
        }
        break;

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
    // console.log(pendingPayload, "pendingPayload");
    if (pendingPayload) {
      onSubmit?.(pendingPayload);
    }
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
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[1100px] rounded-xl bg-white shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left: question + options + engagement */}
                  <div className="border-b md:border-b-0 md:border-r border-gray-100">
                    <Dialog.Title className="text-lg font-semibold text-gray-900 border-b p-5">
                      Vibe Check Details
                    </Dialog.Title>
                    <div className="px-5 py-3">
                      {postDetails?.poll?.question && (
                        <h3 className="mb-2 lg:text-[24px] text-lg font-semibold text-gray-900">
                          {showValue(postDetails?.poll?.question)}
                        </h3>
                      )}
                      {helpTextHtml ? (
                        <div className="article--content">
                          <div
                            className="ql-editor p-0"
                            dangerouslySetInnerHTML={{ __html: helpTextHtml }}
                          />
                        </div>
                      ) : null}

                      <div className="mt-4">
                        {options.length ? (
                          hasImageOptions ? (
                            // Image-grid style options
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {options.map((opt, index) => {
                                const palette =
                                  optionPalette[index % optionPalette.length];
                                const votePercent =
                                  totalVotes > 0
                                    ? Math.round(
                                        (opt.votes_count / totalVotes) * 100,
                                      )
                                    : 0;

                                return (
                                  <div key={opt.id} className="space-y-1.5">
                                    <span
                                      className={`inline-block max-w-full truncate px-2 py-1 rounded-md text-[11px] font-semibold ${palette.chip}`}
                                    >
                                      {opt.option_text} {votePercent}%
                                    </span>

                                    {opt.poll_option_image ? (
                                      <img
                                        src={opt.poll_option_image}
                                        alt={opt.option_text}
                                        className="w-full h-24 object-cover rounded-lg border"
                                      />
                                    ) : (
                                      <div className="w-full h-24 rounded-lg border flex items-center justify-center text-gray-400 text-xs">
                                        No Image
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            // Text-only options with vote-share bars
                            <div className="space-y-3">
                              {options.map((opt, index) => {
                                const palette =
                                  optionPalette[index % optionPalette.length];
                                const votePercent =
                                  totalVotes > 0
                                    ? Math.round(
                                        (opt.votes_count / totalVotes) * 100,
                                      )
                                    : 0;

                                return (
                                  <div
                                    key={opt.id}
                                    className="relative rounded-lg overflow-hidden border border-gray-100"
                                  >
                                    <div
                                      className={`absolute inset-y-0 left-0 ${palette.bar}`}
                                      style={{ width: `${votePercent}%` }}
                                    />

                                    <div className="relative flex items-center justify-between px-3 py-2.5">
                                      <span
                                        className={`text-sm font-medium ${palette.text}`}
                                      >
                                        {opt.option_text}
                                      </span>
                                      <span
                                        className={`text-sm font-semibold ${palette.text}`}
                                      >
                                        {votePercent}%
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )
                        ) : (
                          <div className="text-sm text-gray-500">
                            No options available
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-black px-2">
                        <div className="flex items-center gap-5">
                          <span className="flex items-center gap-2 text-sm">
                            <FiHeart size={20} />
                            {showValue(postDetails?.poll?.likes_count)}
                          </span>
                          <span className="flex items-center gap-2 text-sm">
                            <FiMessageSquare size={20} />
                            {showValue(postDetails?.poll?.comments_count)}
                          </span>
                        </div>

                        <span className="text-sm text-black">
                          {totalVotes} votes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: info + status update */}
                  <div className="p-6 flex flex-col">
                    <div className="space-y-3">
                      {infoRows.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <span className="font-semibold text-black">
                            {label}
                          </span>
                          <span className="text-black text-right">{value}</span>
                        </div>
                      ))}

                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-semibold text-black">Status</span>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[postDetails?.status] ||
                            "bg-gray-100 text-black"
                          }`}
                        >
                          {postDetails?.status === "ACTIONED"
                            ? "Resolved"
                            : postDetails?.status}
                        </span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="border-t border-gray-100 pt-4 mt-3 space-y-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium">
                            Action<span className="text-red-600">*</span>
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

                        {/* {(selectedAction?.value === "HIDDEN" ||
                            selectedAction?.value === "PUBLISHED") && (
                            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                              {AUTOMATED_MESSAGES[selectedAction.value]}
                            </p>
                          )} */}

                        {selectedAction?.value === "WARNED" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block mb-2 text-sm font-medium">
                                Remarks (sent to user)
                                <span className="text-red-600">*</span>
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

                        {selectedAction?.value === "SUSPENDED" && (
                          <div className="space-y-3">
                            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
                              <div className="">
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
                                {validationErrors.suspendStart && (
                                  <p className="text-[11px] text-red-500 mt-1">
                                    {validationErrors.suspendStart}
                                  </p>
                                )}
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
                              {validationErrors.reason && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {validationErrors.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedAction?.value === "BANNED" && (
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
                              {validationErrors.reason && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {validationErrors.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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

export default PollModerationDetailModal;
