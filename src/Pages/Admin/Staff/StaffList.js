import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import {
  customStyles,
  filterActiveItems,
  formatText,
  formatViewDate,
} from "../../../Helper/helper";
import CreateNewStaff from "./CreateNewStaff";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { authAxios } from "../../../Config/config";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Pagination from "../../../Components/Common/Pagination";

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const StaffList = (props) => {
  const { setLoading } = props;
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [editStaffId, setEditStaffId] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [createStaff, setCreateStaff] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleFetchStaff = async (
    currentPage = page,
    selectedRole = role,
    selectedStatus = status,
  ) => {
    try {
      setLoading(true);

      // Fetch staff data from API
      const response = await authAxios().get("/staff", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          ...(selectedRole?.value != null && {
            role_id: selectedRole.value,
          }),
          ...(selectedStatus?.value && {
            status: selectedStatus.value,
          }),
        },
      });
      const resData = response?.data;
      if (resData?.success) {
        setUsers(resData.data.items || []);
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
        const activeRoles = filterActiveItems(resData?.data?.items);

        const options = activeRoles.map((item) => ({
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
    setPage(1);
    handleFetchStaff(1, role, status);
  }, [role, status]);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/staff/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchStaff();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete staff member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Role filter */}
            <div className="min-w-[180px]">
              <Select
                styles={customStyles}
                options={roleOptions}
                value={role}
                onChange={setRole}
                isClearable
                isSearchable={false}
                placeholder="Filter by Role"
              />
            </div>

            {/* Status filter */}
            <div className="min-w-[180px]">
              <Select
                styles={customStyles}
                options={statusOptions}
                value={status}
                onChange={setStatus}
                isClearable
                isSearchable={false}
                placeholder="Filter by Status"
              />
            </div>
          </div>
          <button
            type="button"
            className="custom--btn"
            onClick={() => setCreateStaff(true)}
          >
            <FiPlus />
            <span>New Staff</span>
          </button>
        </div>

        <div className="mt-3">
          <div className="box--shadow bg-white rounded-[15px] p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 ">Staff ID</th>
                    <th className="px-2 py-4 ">Name</th>
                    <th className="px-2 py-4 ">Email</th>
                    <th className="px-2 py-4 ">Mobile</th>
                    <th className="px-2 py-4 ">Role</th>
                    <th className="px-2 py-4 ">Status</th>
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
                        <td className="px-2 py-4">{row.email || "-"}</td>
                        <td className="px-2 py-4">{row.mobile || "--"}</td>
                        <td className="px-2 py-4">{row.role?.name || "--"}</td>
                        <td className="px-2 py-4">
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
                          {formatViewDate(row.created_at) || "--"}
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
              currentDataLength={users.length}
              onPageChange={(newPage) => {
                setPage(newPage);
                handleFetchStaff(newPage, role, status);
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
              Delete Staff
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this staff?
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
