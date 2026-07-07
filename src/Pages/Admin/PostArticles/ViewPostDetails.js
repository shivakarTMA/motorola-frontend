import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { customStyles } from "../../../Helper/helper";
import { authAxios } from "../../../Config/config";

const statusOptions = [
  { value: "PUBLISHED", label: "Published" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "HIDDEN", label: "Hidden" },
  { value: "DELETED", label: "Deleted" },
  { value: "BANNED", label: "Banned" },
];

const ViewPostDetails = ({ open, onClose, editId, onSuccess }) => {
  const isEdit = !!editId;
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const filteredStatusOptions = statusOptions.filter(
    (opt) => opt.value !== postDetails?.status
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

    try {
      setLoading(true);

      const res = await authAxios().put(`/post/${editId}`, {
        status: selectedStatus.value,
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
              <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="border-b px-6 py-4">
                  <Dialog.Title className="text-lg font-semibold">
                    View Post Details
                  </Dialog.Title>
                </div>

                <div className="p-6 space-y-3">
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Media
                    </label>

                    {postDetails?.media?.length ? (
                      <img
                        src={postDetails.media[0].media}
                        alt="Post"
                        className="w-full h-56 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="h-40 rounded-lg border flex items-center justify-center text-gray-400">
                        No Media
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Title
                    </label>

                    <div className="custom--input bg-gray-50">
                      {postDetails?.title || "-"}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Status
                    </label>

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        {
                          PUBLISHED: "bg-green-100 text-green-700",
                          UNDER_REVIEW: "bg-blue-100 text-blue-700",
                          HIDDEN: "bg-gray-200 text-gray-700",
                          DELETED: "bg-red-100 text-red-700",
                          BANNED: "bg-yellow-100 text-yellow-700",
                        }[postDetails?.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {postDetails?.status?.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Content
                    </label>

                    <div className="custom--input min-h-[120px] bg-gray-50 whitespace-pre-wrap">
                      {postDetails?.content || "-"}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Created By
                    </label>

                    <div className="custom--input bg-gray-50">
                      {postDetails?.user?.name || "-"}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Update Status
                    </label>

                    <div>
                      <Select
                        options={filteredStatusOptions}
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        styles={customStyles}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
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

export default ViewPostDetails;
