import { Dialog, Transition, Switch } from "@headlessui/react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { customStyles, formatWithTimeDate } from "../../../Helper/helper";
import { authAxios } from "../../../Config/config";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { format } from "date-fns";
import {
  FiHeart,
  FiMessageSquare,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
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

// Central "show value or --" helper so every field in the info panel behaves the same way.
const showValue = (value) => {
  if (value === null || value === undefined) return "--";
  if (typeof value === "string" && value.trim() === "") return "--";
  return value;
};

// NOTE: the API response doesn't include a dedicated "content_id" field.
// This derives a display code from the post id (e.g. POST-004) as a placeholder —
// swap this for the real field name once the backend exposes one.

const ViewPostDetails = ({ open, onClose, editId, onSuccess }) => {
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [pendingValue, setPendingValue] = useState(false);
  const [confirmTopPickOpen, setConfirmTopPickOpen] = useState(false);
  const [confirmHidePostOpen, setConfirmHidePostOpen] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const fetchPostDetails = useCallback(
    async (silent = false) => {
      if (!editId) return;

      try {
        if (!silent) setLoading(true);

        const res = await authAxios().get(`/post/${editId}`);

        if (res.data.success) {
          const data = res.data.data;
          setPostDetails(data);
          setEnabled(Boolean(data.is_featured));
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to fetch post details",
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
    onClose();
  };

  const getHtmlContent = () => {
    if (!postDetails?.content) return "";

    try {
      const ops = JSON.parse(postDetails.content);

      const convertedOps = ops.flatMap((op) => {
        if (op.insert?.atomicLink) {
          const link = JSON.parse(op.insert.atomicLink);

          return [
            {
              insert: link.text,
              attributes: {
                link: link.url,
              },
            },
          ];
        }

        return [op];
      });

      const converter = new QuillDeltaToHtmlConverter(convertedOps, {});
      return converter.convert();
    } catch (err) {
      console.error(err);
      return postDetails.content;
    }
  };

  const html = getHtmlContent();
  const media = postDetails?.media || [];

  const infoRows = [
    ["Created By", showValue(postDetails?.user?.name)],
    ["Username", showValue(postDetails?.user?.username)],
    ["Created at", formatWithTimeDate(postDetails?.created_at)],
    ["Content ID", showValue(postDetails?.content_id)],
    ["Tribe Group", showValue(postDetails?.circle?.circleGroup?.name)],
    ["Tribe Name", showValue(postDetails?.circle?.name)],
  ];

  const handleToggleTopPick = (checked) => {
    setPendingValue(checked);
    setConfirmTopPickOpen(true);
  };

  const isHidden = postDetails?.status === "HIDDEN";

  const handleToggleHidePost = () => {
    if (isHidden) return; // safety: already hidden
    setConfirmHidePostOpen(true);
  };

  const handleConfirmTopPick = async () => {
    try {
      setLoading(true);

      const payload = {
        is_featured: pendingValue,
      };

      console.log(payload);

      const res = await authAxios().put(`/post/${editId}`, payload);

      if (res.data.success) {
        setEnabled(pendingValue);
        toast.success(res.data.message || "Featured status updated");
        onSuccess?.();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update featured status",
      );
    } finally {
      setLoading(false);
      setConfirmTopPickOpen(false);
    }
  };

  const handleCancel = () => {
    setPendingValue(enabled); // reset pending value
    setConfirmTopPickOpen(false);
  };

  const handleConfirmHidePost = async () => {
    try {
      setLoading(true);

      const res = await authAxios().put(`/post/${editId}`, {
        status: "HIDDEN",
      });

      if (res.data.success) {
        // keeps the badge and the switch in sync
        setPostDetails((prev) => ({ ...prev, status: "HIDDEN" }));
        toast.success(res.data.message || "Hot Take hidden successfully");
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to hide Hot Take");
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
                    {/* Left: media + description + engagement */}
                    <div className="border-b md:border-b-0 md:border-r border-gray-100">
                      <Dialog.Title className="text-lg font-semibold text-gray-900 border-b p-5">
                        Hot Take Details
                      </Dialog.Title>

                      <div className="px-5 py-3">
                        <div className="max-h-[40vh] overflow-auto">
                          {postDetails?.title && (
                            <p className="mb-2 lg:text-[24px] text-lg font-semibold text-gray-900">
                              {showValue(postDetails?.title)}
                            </p>
                          )}
                          {html ? (
                            <div className="article--content">
                              <div
                                className="ql-editor p-0"
                                dangerouslySetInnerHTML={{ __html: html }}
                              />
                            </div>
                          ) : null}

                          <div className="relative mt-4">
                            {media.length ? (
                              <>
                                <Swiper
                                  modules={[Navigation]}
                                  spaceBetween={12}
                                  slidesPerView={media.length > 1 ? 1.4 : 1}
                                  navigation={{
                                    prevEl: prevRef.current,
                                    nextEl: nextRef.current,
                                  }}
                                  onBeforeInit={(swiper) => {
                                    // Attach custom nav buttons before Swiper initializes navigation
                                    swiper.params.navigation.prevEl =
                                      prevRef.current;
                                    swiper.params.navigation.nextEl =
                                      nextRef.current;
                                  }}
                                >
                                  {media.map((item) => (
                                    <SwiperSlide key={item.id}>
                                      <img
                                        src={item.media}
                                        alt="Post media"
                                        className="w-full h-56 object-cover"
                                      />
                                    </SwiperSlide>
                                  ))}
                                </Swiper>

                                {media.length > 1 && (
                                  <>
                                    <button
                                      ref={prevRef}
                                      type="button"
                                      aria-label="Previous media"
                                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-black hover:bg-gray-50"
                                    >
                                      <FiChevronLeft size={18} />
                                    </button>
                                    <button
                                      ref={nextRef}
                                      type="button"
                                      aria-label="Next media"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-black hover:bg-gray-50"
                                    >
                                      <FiChevronRight size={18} />
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <div className="h-40 rounded-lg border flex items-center justify-center text-gray-400">
                                No Media
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-5 text-black px-2">
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
                            Status<span className="text-red-500">*</span>
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
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-semibold text-black">
                            Top Picks
                          </span>
                          <Switch
                            checked={enabled}
                            onChange={handleToggleTopPick}
                            className={`${
                              enabled ? "bg-blue-600" : "bg-gray-300"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                          >
                            <span
                              className={`${
                                enabled ? "translate-x-6" : "translate-x-1"
                              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                            />
                          </Switch>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-semibold text-black">
                            Hide Hot Take
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
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Confirmation Top Picks modal */}
      <Transition appear show={confirmTopPickOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setConfirmTopPickOpen(false)}
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
                    {pendingValue
                      ? "Top Picks this Deep Dive?"
                      : "Remove Top Picks Deep Dive?"}
                  </Dialog.Title>
                  <p className="text-xs text-gray-500 mb-5">
                    {pendingValue
                      ? "Are you sure you want to mark this Deep Dive as Top Picks?"
                      : "Are you sure you want to remove this Deep Dive from Top Picks?"}
                  </p>
                  <div className="flex justify-end gap-3 ">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="custom--btn !bg-white !text-black border !border-black"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmTopPick}
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
                    Hide Hot Take?
                  </Dialog.Title>
                  <p className="text-xs text-gray-500 mb-5">
                    Are you sure you want to hide this Hot Take?
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
      />

    </>
  );
};

export default ViewPostDetails;
