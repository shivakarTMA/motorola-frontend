import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
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

const ViewArticleDetails = ({ open, onClose, editId, onSuccess }) => {
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const filteredStatusOptions = statusOptions.filter(
    (opt) => opt.value !== postDetails?.status,
  );

  useEffect(() => {
    if (!editId || !open) return;

    const fetchPostDetails = async () => {
      try {
        setLoading(true);

        const res = await authAxios().get(`/post/${editId}`);

        if (res.data.success) {
          setPostDetails(res.data.data);
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to fetch post details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [editId, open]);

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

      const res = await authAxios().put(`/post/${editId}`, {
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

  const handleClose = () => {
    setPostDetails(null);
    setSelectedStatus(null);
    setRemark("");
    setRemarkError("");
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

  return (
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
                      Deep Dive Details
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
                          {media.length > 0 && (
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
                                  swiper.params.navigation.prevEl = prevRef.current;
                                  swiper.params.navigation.nextEl = nextRef.current;
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
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-5 text-black px-2">
                        <span className="flex items-center gap-2 text-sm">
                          <FiHeart size={20} />
                          {showValue(postDetails?.likes_count)}
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <FiMessageSquare size={20} />
                          {showValue(postDetails?.comments_count)}
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
                          Status<span className="text-red-500">*</span>
                        </span>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[postDetails?.status] ||
                            "bg-gray-100 text-black"
                          }`}
                        >
                          {showValue(postDetails?.status?.replaceAll("_", " "))}
                        </span>
                      </div>
                    </div>

                    {/* <div className="mt-5 bg-gray-50 rounded-lg p-4 space-y-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          Update Status
                        </label>
                        <Select
                          options={filteredStatusOptions}
                          value={selectedStatus}
                          onChange={(val) => {
                            setSelectedStatus(val);
                          }}
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
  );
};

export default ViewArticleDetails;
