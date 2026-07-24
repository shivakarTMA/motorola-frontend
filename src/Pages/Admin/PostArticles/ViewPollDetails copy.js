import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { customStyles, formatViewDate } from "../../../Helper/helper";
import { authAxios } from "../../../Config/config";

const ViewPollDetails = ({ open, onClose, editId, onSuccess }) => {
  const isEdit = !!editId;
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    if (!editId || !open) return;

    const fetchPostDetails = async () => {
      try {
        setLoading(true);

        const res = await authAxios().get(`/poll/${editId}`);

        if (res.data.success) {
          setPostDetails(res.data.data);
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
  }, [editId, open]);

  const handleClose = () => {
    setPostDetails(null);
    onClose();
  };

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
          <div className="flex min-h-full items-center justify-center p-5">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
                <div className="border-b px-6 py-4">
                  <Dialog.Title className="text-lg font-semibold flex gap-2 items-center justify-between">
                    <div>
                      <span>View Question Details</span>
                    </div>

                    <div className="block text-sm font-medium">
                      Total Votes : <span className="font-bold">{postDetails?.total_votes}</span>
                    </div>
                  </Dialog.Title>
                </div>

                <div className="p-6">
                  <div className="grid space-y-2 pb-3">

                    <div className="border p-2 rounded-lg">
                      <label className="block mb-1 text-sm font-bold">
                        Question:
                      </label>

                      <div className="text-sm">
                        {postDetails?.question || "-"}
                      </div>
                    </div>

                    {/* MCQ-style Options section */}
                    <div className="border p-2 rounded-lg">
                      <label className="block mb-2 text-sm font-bold">
                        Options:
                      </label>

                      <div className="space-y-3">
                        {postDetails?.options?.length ? (
                          postDetails.options.map((opt, index) => {
                            const optionLetter = String.fromCharCode(
                              65 + index,
                            ); // A, B, C, D...
                            const totalVotes = postDetails?.total_votes || 0;
                            const votePercent =
                              totalVotes > 0
                                ? Math.round(
                                    (opt.votes_count / totalVotes) * 100,
                                  )
                                : 0;

                            return (
                              <div
                                key={opt.id}
                                className="relative border rounded-lg px-3 py-2.5 overflow-hidden"
                              >
                                {/* Background progress bar */}
                                <div
                                  className="absolute inset-y-0 left-0 bg-blue-50 transition-all"
                                  style={{ width: `${votePercent}%` }}
                                />

                                <div className="relative flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {/* Lettered circle like MCQ option */}
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-700 shrink-0">
                                      {optionLetter}
                                    </span>
                                    <span className="text-sm font-medium text-gray-800">
                                      {opt.option_text}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {/* <span className="text-xs font-semibold text-blue-600">
                                      {votePercent}%
                                    </span> */}
                                    <span className="text-xs text-gray-500">
                                      ({opt.votes_count} votes)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-sm text-gray-500">
                            No options available
                          </div>
                        )}
                      </div>
                    </div>
                    
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="custom--btn !bg-white !border !border-black !text-black"
                    >
                      Close
                    </button>
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

export default ViewPollDetails;