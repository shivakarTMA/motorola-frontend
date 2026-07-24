import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles, formatText } from "../../../Helper/helper";
import CreateNewTiers from "./CreateNewTiers";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Pagination from "../../../Components/Common/Pagination";

const TiersList = (props) => {
  const { setLoading } = props;
  const [tiersDataList, setTiersDataList] = useState([]);
  const [createTier, setCreateTier] = useState(false);
  const [editTierId, setEditTierId] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const columns = [
    {
      name: "Tier Name",
      selector: (row) => row.name,
      // sortable: true,
    },
    {
      name: "Level",
      selector: (row) => row.level,
      center: true,
      // sortable: true,
    },
    {
      name: "Minimum Points",
      selector: (row) => row.min_points,
      center: true,
      // sortable: true,
    },
    {
      name: "Benefits",
      selector: (row) => row.benefits,
      // grow: 2,
    },
    {
      name: "Badge",
      center: true,
      cell: (row) =>
        row.badge_icon ? (
          <img
            src={row.badge_icon}
            alt={row.name}
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <span className="text-gray-400">No Badge</span>
        ),
    },
    {
      name: "Status",
      center: true,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {formatText(row.status)}
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
                setEditTierId(row.id);
                setCreateTier(true);
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

  const handleFetchTiersList = async (currentPage = page) => {
    try {
      setLoading(true);

      // Fetch staff data from API
      const response = await authAxios().get("/tier", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
        },
      });
      const resData = response?.data;
      if (resData?.success) {
        setTiersDataList(resData.data.items || []);
        const paginationData = resData.data.pagination;
        setPage(paginationData.page);
        setTotalPages(paginationData.totalPages);
        setTotalCount(paginationData.total);
      } else {
        console.error("Failed to fetch staff data:", resData?.message);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTiersList();
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/tier/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchTiersList();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete tier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end items-center gap-4">
          <button
            type="button"
            className="custom--btn"
            onClick={() => setCreateTier(true)}
          >
            <FiPlus />
            <span>New Tier</span>
          </button>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 min-w-[100px]">
                      Tier Name
                    </th>
                    <th className="px-2 py-4 min-w-[100px]">Level</th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Minimum Points
                    </th>
                    <th className="px-2 py-4 min-w-[120px]">Benefits</th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Badge
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Status
                    </th>
                    <th className="px-2 py-4 min-w-[100px] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tiersDataList?.length > 0 ? (
                    tiersDataList.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">{row.name || "--"}</td>

                        <td className="px-2 py-4">
                          {row.level || "--"}
                        </td>
                        <td className="px-2 py-4 text-center">
                          {row.min_points || 0}
                        </td>
                        <td className="px-2 py-4">
                          {row.benefits || "--"}
                        </td>
                        <td className="px-2 py-4 text-center">
                            {row.badge_icon ? (
                            <img
                              src={row.badge_icon}
                              alt={row.name}
                              className="w-10 h-10 rounded object-cover mx-auto"
                            />
                          ) : (
                            <span className="text-gray-400">No Badge</span>
                          )}
                        </td>

                        <td className="px-2 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              row.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {formatText(row.status)}
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
                                  setEditTierId(row.id);
                                  setCreateTier(true);
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
              currentDataLength={tiersDataList.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                handleFetchTiersList(newPage);
              }}
            />
          </div>
        </div>
      </div>
      <CreateNewTiers
        open={createTier}
        onClose={() => {
          setCreateTier(false);
          setEditTierId(null);
        }}
        editId={editTierId}
        onSuccess={() => handleFetchTiersList()}
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
              Delete Tiers
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this tiers?
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

export default IsLoadingHOC(TiersList);
