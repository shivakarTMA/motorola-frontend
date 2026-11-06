import { Dialog, Transition, Switch } from "@headlessui/react";
import { Fragment, useCallback, useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { customStyles, formatWithTimeDate } from "../../../Helper/helper";
import { authAxios } from "../../../Config/config";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { format } from "date-fns";
import { FiHeart, FiMessageSquare } from "react-icons/fi";
import CommentsModal from "./CommentsModal";

const statusOptions = [
  { value: "PUBLISHED", label: "Published" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "HIDDEN", label: "Hidden" },
];

const statusColors = {
  PUBLISHED: "bg-green-100 text-green-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  HIDDEN: "bg-gray-200 text-gray-700",
  DELETED: "bg-red-100 text-red-700",
  BANNED: "bg-yellow-100 text-yellow-700",
};

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

// Central "show value or --" helper so every field in the info panel behaves the same way.
const showValue = (value) => {
  if (value === null || value === undefined) return "--";
  if (typeof value === "string" && value.trim() === "") return "--";
  return value;
};

const ViewPollDetails = ({ open, onClose, editId, onSuccess }) => {
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [confirmHidePostOpen, setConfirmHidePostOpen] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);

  const filteredStatusOptions = statusOptions.filter(
    (opt) => opt.value !== postDetails?.status,
  );

  const fetchPostDetails = useCallback(
    async (silent = false) => {
      if (!editId) return;

      try {
        if (!silent) setLoading(true);

        const res = await authAxios().get(`/poll/${editId}`);

        if (res.data.success) {
          const data = res.data.data;
          setPostDetails(data);
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to fetch poll details",
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [editId],
  );

  useEffect(() => {
    if (!editId || !open) return;
    fetchPostDetails();
  }, [editId, open, fetchPostDetails]);

  
  // Runs after a comment is deleted successfully.
  const handleCommentDeleted = () => {
    fetchPostDetails(true); // refresh the details (comments_count, etc.)
    onSuccess?.();          // refresh the Hot Take list in the parent
  };


  const handleClose = () => {
    setPostDetails(null);
    setSelectedStatus(null);
    setRemark("");
    setRemarkError("");
    onClose();
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    if (!remark.trim()) {
      setRemarkError("Remark is required.");
      return;
    }

    try {
      setLoading(true);

      const res = await authAxios().put(`/poll/${editId}`, {
        status: selectedStatus.value,
        remark: remark.trim(),
      });

      if (res.data.success) {
        toast.success(res.data.message || "Status updated successfully");

        onSuccess?.(); // Refresh the list
        handleClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // help_text arrives as a Quill delta JSON string, same shape as a post's `content`.
  const getHelpTextHtml = () => {
    if (!postDetails?.help_text) return "";

    try {
      const ops = JSON.parse(postDetails.help_text);
      const converter = new QuillDeltaToHtmlConverter(ops, {});
      return converter.convert();
    } catch (err) {
      console.error(err);
      return postDetails.help_text;
    }
  };

  const helpTextHtml = getHelpTextHtml();
  const options = postDetails?.options || [];
  const totalVotes = postDetails?.total_votes || 0;
  const hasImageOptions = options.some((opt) => opt.poll_option_image);

  const infoRows = [
    ["Created By", showValue(postDetails?.user?.name)],
    ["Username", showValue(postDetails?.user?.username)],
    ["Created at", formatWithTimeDate(postDetails?.created_at)],
    ["Ending at", formatWithTimeDate(postDetails?.poll_ends_at)],
    ["Content ID", showValue(postDetails?.content_id)],
    ["Tribe Group", showValue(postDetails?.circle?.circleGroup?.name)],
    ["Tribe Name", showValue(postDetails?.circle?.name)],
  ];

  const isHidden = postDetails?.status === "HIDDEN";

  const handleToggleHidePost = () => {
    if (isHidden) return; // safety: already hidden
    setConfirmHidePostOpen(true);
  };

  const handleConfirmHidePost = async () => {
    try {
      setLoading(true);

      const res = await authAxios().put(`/poll/${editId}`, {
        status: "HIDDEN",
      });

      if (res.data.success) {
        // keeps the badge and the switch in sync
        setPostDetails((prev) => ({ ...prev, status: "HIDDEN" }));
        toast.success(res.data.message || "Vibe Check hidden successfully");
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to hide Vibe Check");
    } finally {
      setLoading(false);
      setConfirmHidePostOpen(false); // closes the confirmation modal
    }
  };

  const handleCancelHidePost = () => {
    setConfirmHidePostOpen(false);
  };

  return (
    <>
      <Transition appear show={open} as={Fragment}>
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
                        {postDetails?.question && (
                          <h3 className="mb-2 lg:text-[24px] text-lg font-semibold text-gray-900">
                            {showValue(postDetails?.question)}
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
                              {showValue(postDetails?.likes_count)}
                            </span>
                            {/* <span className="flex items-center gap-2 text-sm">
                              <FiMessageSquare size={20} />
                              {showValue(postDetails?.comments_count)}
                            </span> */}
                            <button
                              type="button"
                              onClick={() => setCommentsOpen(true)}
                              aria-label="View comments"
                              className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors"
                            >
                              <FiMessageSquare size={20} />
                              {showValue(postDetails?.comments_count)}
                            </button>
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
                            <span className="text-black text-right">
                              {value}
                            </span>
                          </div>
                        ))}

                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-semibold text-black">
                            Status
                          </span>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              statusColors[postDetails?.status] ||
                              "bg-gray-100 text-black"
                            }`}
                          >
                            {showValue(
                              postDetails?.status?.replaceAll("_", " "),
                            )}
                          </span>
                        </div>
                        {(postDetails?.status === "PUBLISHED" || postDetails?.status === "HIDDEN") && (
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-semibold text-black">
                            Hide
                          </span>
                          <Switch
                            checked={isHidden}
                            onChange={handleToggleHidePost}
                            disabled={isHidden}
                            className={`${
                              isHidden
                                ? "bg-blue-600 opacity-60 cursor-not-allowed"
                                : "bg-gray-300"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                          >
                            <span
                              className={`${
                                isHidden ? "translate-x-6" : "translate-x-1"
                              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                            />
                          </Switch>
                        </div>
                        )}
                      </div>

                      {/* <div className="mt-5 bg-gray-50 rounded-lg p-4 space-y-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          Update Status<span className="text-red-500">*</span>
                        </label>
                        <Select
                          options={filteredStatusOptions}
                          value={selectedStatus}
                          onChange={setSelectedStatus}
                          placeholder="Select status"
                          styles={customStyles}
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          Remark<span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={remark}
                          onChange={(e) => {
                            setRemark(e.target.value);
                            if (remarkError) setRemarkError("");
                          }}
                          placeholder="Write a remark"
                          className="custom--input w-full bg-white"
                        />
                        {remarkError && (
                          <p className="text-[11px] text-red-500 mt-1">
                            {remarkError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex justify-end gap-3 pt-5">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="custom--btn !bg-white !border !border-black !text-black"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateStatus}
                        disabled={
                          loading ||
                          !selectedStatus ||
                          selectedStatus.value === postDetails?.status
                        }
                        className="custom--btn disabled:opacity-60"
                      >
                        {loading ? "Updating..." : "Submit"}
                      </button>
                    </div> */}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Confirmation Hide Post modal */}
      <Transition appear show={confirmHidePostOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setConfirmHidePostOpen(false)}
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
                    Hide Vibe Check?
                  </Dialog.Title>
                  <p className="text-xs text-gray-500 mb-5">
                    Are you sure you want to hide this Vibe Check?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancelHidePost}
                      disabled={loading}
                      className="custom--btn !bg-white !text-black border !border-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmHidePost}
                      disabled={loading}
                      className="custom--btn disabled:opacity-60"
                    >
                      {loading ? "Please wait..." : "Confirm"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <CommentsModal
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={editId}
        onDeleted={handleCommentDeleted}
        postType="poll"
      />
    </>
  );
};

export default ViewPollDetails;
