import React, { useEffect, useState,useRef } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link, useLocation } from "react-router-dom";
import Select from "react-select";
import { customStyles, formatViewDate } from "../../../Helper/helper";
import CreateNewStaff from "./CreateCampus";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { authAxios } from "../../../Config/config";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Pagination from "../../../Components/Common/Pagination";
import { FiDownload, FiX,FiSearch } from "react-icons/fi";
const StaffList = (props) => {
  const { setLoading } = props;
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [role, setRole] = useState(null);
  const [editStaffId, setEditStaffId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [createStaff, setCreateStaff] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const latestRequest = useRef(0);


const handleFetchStaff = async (
  currentPage = page,
  searchValue = debouncedSearch
) => {
  const requestId = ++latestRequest.current;

  try {
    setLoading(true);

    const response = await authAxios().get("/campus", {
      params: {
        page: currentPage,
        limit: rowsPerPage,
        ...(searchValue.trim()
          ? { search: searchValue.trim() }
          : {}),
      },
    });

    if (requestId !== latestRequest.current) return;

    const resData = response?.data;

    if (resData?.success) {
      setUsers(resData?.data?.items || []);

      const paginationData = resData?.data?.pagination;

      setPage(paginationData?.page ?? currentPage);
      setTotalPages(paginationData?.totalPages ?? 1);
      setTotalCount(paginationData?.total ?? 0);
    } else {
      setUsers([]);
      setTotalPages(1);
      setTotalCount(0);
      console.error(resData?.message);
    }
  } catch (error) {
    if (requestId !== latestRequest.current) return;

    console.error("Error fetching retailers:", error);
  } finally {
    if (requestId === latestRequest.current) {
      setLoading(false);
    }
  }
};
  const handleFetchRoles = async () => {
    try {
      const response = await authAxios().get("/role", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      const resData = response?.data;

      if (resData?.success) {
        const options = resData.data.items.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        setRoleOptions(options);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    handleFetchRoles();
  }, []);

  useEffect(() => {
    handleFetchStaff();
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/campus/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchStaff();
      } 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const generateReferralUrl = (referralCode) => {
  if (!referralCode) return "";

  const referrer = new URLSearchParams({
    refer_code: referralCode,
    refer_type: "RETAIL",
  });

  const playStoreUrl = new URL(
    "https://play.google.com/store/apps/details"
  );

  playStoreUrl.searchParams.set("id", "com.motorollers.app");
  playStoreUrl.searchParams.set("referrer", referrer.toString());

  return playStoreUrl.toString();
};




useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search.trim());
  }, 500);

  return () => clearTimeout(timer);
}, [search]);

useEffect(() => {
  setPage(1);
  handleFetchStaff(1, debouncedSearch);
}, [debouncedSearch]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="relative w-full sm:w-[350px]">
  <FiSearch
    size={18}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
  />

  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search campus..."
    aria-label="Search campus"
    className="w-full rounded-lg border border-gray-300
      bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800
      outline-none transition
      focus:border-black focus:ring-1 focus:ring-black"
  />

  {search && (
    <button
      type="button"
      onClick={() => setSearch("")}
      aria-label="Clear search"
      className="absolute right-3 top-1/2
        -translate-y-1/2 text-gray-400
        hover:text-gray-700"
    >
      <FiX size={18} />
    </button>
  )}
</div>
          <button
            type="button"
            className="custom--btn"
            onClick={() => setCreateStaff(true)}
          >
            <FiPlus />
            <span>Add</span>
          </button>
        </div>


        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 ">ID</th>
                    <th className="px-2 py-4 ">Name</th>
                    <th className="px-2 py-4 ">location</th>
                    <th className="px-2 py-4 ">address</th>
                    {/* <th className="px-2 py-4 ">position</th> */}
                    <th className="px-2 py-4 ">No. of Ambassadors</th>
                    <th className="px-2 py-4 ">status</th>
                    <th className="px-2 py-4 ">Created At</th>
                    
                    <th className="px-2 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users?.length > 0 ? (
                    users.map((row, index) => (
                      <tr
                        key={row.id || index}
                        className="border-b hover:bg-gray-50 text-xs"
                      >
                        <td className="px-2 py-4">{row.id || "-"}</td>
                        <td className="px-2 py-4">{row.name || "-"}</td>
                        {/* <td className="px-2 py-4">{row.referral_code || "-"}</td> */}
                        <td className="px-2 py-4">{row.location || "--"}</td>
                        <td className="px-2 py-4">{row.address || "--"}</td>
                        {/* <td className="px-2 py-4">{row.position|| "--"}</td> */}
                        <td className="px-2 py-4">{row.associated_user_count || 0}</td>
                        <td className="px-2 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              row.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        {console.log(row?.total_referred_count,'dssddsdssdds')}
                        <td className="px-2 py-4">{formatViewDate(row.created_at) || "--"}</td>
                        <td className="px-2 py-4">
                          <div className="flex items-center justify-center gap-[1px]">
                            <Tooltip
                              id={`tooltip-edit-${row.id}`}
                              content="Edit"
                              place="left"
                            >
                              <button
                                onClick={() => {
                                  setEditStaffId(row.id);
                                  setCreateStaff(true);
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
                        colSpan={10}
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
  currentDataLength={users.length}
  onPageChange={(newPage) => {
    setPage(newPage);
    handleFetchStaff(newPage, debouncedSearch);
  }}
/>
          </div>
        </div>
      </div>
      <CreateNewStaff
        open={createStaff}
        onClose={() => {
          setCreateStaff(false);
          setEditStaffId(null);
        }}
        editId={editStaffId}
        roleOptions={roleOptions}
        onSuccess={() => handleFetchStaff()}
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
              Delete Campus
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this Campus?
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

export default IsLoadingHOC(StaffList);
