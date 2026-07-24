import React, { useEffect, useState } from "react";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";
import Pagination from "../../../Components/Common/Pagination";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  formatText,
  formatViewDate,
  formatViewTime,
  formatWithTimeDate,
} from "../../../Helper/helper";
import Tooltip from "../../../Components/Common/Tooltip";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { MdModeEdit } from "react-icons/md";
import TopPicsView from "./TopPicsView";

const TopPicsList = (props) => {
  const { setLoading } = props;

  const [moderationList, setModerationList] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [addNewBanner, setAddNewBanner] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchTopPicsList = async () => {
    try {
      setLoading(true);

      const response = await authAxios().get("/top-pick");
      const resData = response.data;

      if (resData.success) {
        const items = resData.data.items;
        setModerationList(items);
      } else {
        toast.error(resData.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopPicsList();
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/top-pick/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        fetchTopPicsList();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete tribe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[80px]">Media</th>
                    <th className="px-2 py-4 min-w-[120px]">content type</th>
                    <th className="px-2 py-4 min-w-[120px]">title</th>
                    <th className="px-2 py-4 min-w-[100px] ">Username</th>
                    <th className="px-2 py-4 min-w-[120px] text-center">
                      Status
                    </th>
                    <th className="px-2 py-4 min-w-[120px] text-center">
                      position
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {moderationList?.length > 0 ? (
                    moderationList.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">
                          {row?.post?.media[0] ? (
                            <div className="p-1">
                              <img
                                src={row?.post?.media[0]?.media}
                                alt={row?.post?.media[0]?.post_id}
                                className="w-10 h-10 rounded-full object-cover object-center"
                              />
                            </div>
                          ) : (
                            "--"
                          )}
                        </td>

                        <td className="px-2 py-4">
                          {row?.post?.type === "POST"
                            ? "Hot Take"
                            : row?.post?.type === "ARTICLE"
                              ? "Deep Dive"
                              : row?.post?.type === "POLL"
                                ? "Vibe Check"
                                : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row.post?.title ? row.post?.title : "--"}
                        </td>
                        <td className="px-2 py-4">
                          {row.post?.user?.username
                            ? row.post?.user?.username
                            : "--"}
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              {
                                PUBLISHED: "bg-green-100 text-green-700",
                                HIDE_CONTENT: "bg-blue-100 text-blue-700",
                                SUSPEND_USER: "bg-blue-100 text-blue-700",
                                BAN_USER: "bg-red-100 text-red-700",
                                DEACTIVATE_USER: "bg-gray-200 text-gray-700",
                                PENDING: "bg-yellow-100 text-yellow-700",
                              }[row.post?.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatText(row.post?.status)}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          {row?.position}
                        </td>

                        <td className="px-2 py-4 ">
                          <div className="flex items-center justify-center gap-[1px]">
                            <Tooltip
                              id={`tooltip-edit-${row.id}`}
                              content="Edit"
                              place="left"
                            >
                              <button
                                onClick={() => {
                                  setEditBannerId(row.id);
                                  setAddNewBanner(true);
                                  setSelectedRow(row);
                                }}
                                className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-l-md"
                              >
                                <MdModeEdit size={18} />
                              </button>
                            </Tooltip>

                            <Tooltip
                              id={`tooltip-delete-${row.id}`}
                              content="Delete"
                              place="left"
                            >
                              <button
                                onClick={() => {
                                  setDeleteId(row.id);
                                  setDeleteModal(true);
                                  
                                }}
                                className="text-red-500 bg-red-100 w-[30px] h-[30px] flex items-center justify-center rounded-r-md"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <TopPicsView
        open={addNewBanner}
        rowData={selectedRow}
        onClose={() => {
          setAddNewBanner(false);
          setEditBannerId(null);
          setSelectedRow(null);
        }}
        editId={editBannerId}
        onSuccess={() => fetchTopPicsList()}
      />

      <Dialog
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Delete
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setDeleteId(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default IsLoadingHOC(TopPicsList);
