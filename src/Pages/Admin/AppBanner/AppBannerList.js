import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import AddNewBanner from "./AddNewBanner";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { formatText, formatWithTimeDate } from "../../../Helper/helper";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Pagination from "../../../Components/Common/Pagination";

const AppBannerList = (props) => {
  const { setLoading } = props;
  const [banners, setBanners] = useState([]);
  const [editBannerId, setEditBannerId] = useState(null);
  const [addNewBanner, setAddNewBanner] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const columns = [
    {
      name: "Banner",
      cell: (row) => (
        <div className="p-1">
          <img
            src={row.image}
            alt={row.title}
            className="w-20 h-12 rounded object-cover"
          />
        </div>
      ),
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: "Link Type",
      selector: (row) => formatText(row.link_type),
      center: true,
    },
    {
      name: "Position",
      selector: (row) => row.position,
      center: true,
    },
    {
      name: "Start Date",
      selector: (row) => formatWithTimeDate(row.starts_at),
      center: true,
    },
    {
      name: "End Date",
      selector: (row) => formatWithTimeDate(row.ends_at),
      center: true,
    },
    {
      name: "Status",
      center: true,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
            row.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      center: true,
      cell: (row) => (
        <div className="flex items-center justify-center gap-[1px]">
          <Tooltip id={`tooltip-edit-${row.id}`} content="Edit" place="left">
            <button
              onClick={() => {
                setEditBannerId(row.id);
                setAddNewBanner(true);
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
      ),
    },
  ];

  const fetchBanners = async (currentPage = page) => {
    try {
      setLoading(true);
      const response = await authAxios().get("/app-banner", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
        },
      });
      const resData = response.data;
      if (resData.success) {
        setBanners(resData.data.items);
        const paginationData = resData.data.pagination;
        setPage(paginationData.page);
        setTotalPages(paginationData.totalPages);
        setTotalCount(paginationData.total);
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
    fetchBanners();
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/app-banner/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        fetchBanners();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete tribe group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end gap-4">
          <button className="custom--btn" onClick={() => setAddNewBanner(true)}>
            <FiPlus />
            <span>Add Banner</span>
          </button>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[80px] text-center">
                      Banner
                    </th>
                    <th className="px-2 py-4 min-w-[150px]">Title</th>
                    <th className="px-2 py-4 min-w-[80px]">Link Type</th>
                    <th className="px-2 py-4 min-w-[120px] text-center">Position</th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Start Date
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      End Date
                    </th>
                    <th className="px-2 py-4 min-w-[120px] text-center">
                      Status
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {banners?.length > 0 ? (
                    banners.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4 text-center">
                          <div className="p-1">
                            <img
                              src={row.image}
                              alt={row.title}
                              className="w-20 h-12 rounded object-cover"
                            />
                          </div>
                        </td>

                        <td className="px-2 py-4">{row.title || "-"}</td>

                        <td className="px-2 py-4">
                          {formatText(row.link_type) || "-"}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {row.position || "--"}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {formatWithTimeDate(row.starts_at)}
                        </td>

                        <td className="px-2 py-4 text-center">
                          {formatWithTimeDate(row.ends_at)}
                        </td>

                        <td className="px-2 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                              row.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>

                        <td className="px-2 py-4">
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
            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              currentDataLength={banners.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchBanners(newPage);
              }}
            />
          </div>
        </div>
      </div>

      <AddNewBanner
        open={addNewBanner}
        onClose={() => {
          setAddNewBanner(false);
          setEditBannerId(null);
        }}
        editId={editBannerId}
        onSuccess={() => fetchBanners()}
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
              Delete Tribe Group
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this tribe group? This action
              cannot be undone.
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

export default IsLoadingHOC(AppBannerList);
