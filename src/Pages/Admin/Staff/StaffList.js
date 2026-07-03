import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles } from "../../../Helper/helper";
import CreateNewStaff from "./CreateNewStaff";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { authAxios } from "../../../Config/config";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

const StaffList = (props) => {
  const { setLoading } = props;
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [role, setRole] = useState(null);
  const [editStaffId, setEditStaffId] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [pagination, setPagination] = useState(null);
  const [createStaff, setCreateStaff] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      grow: 2,
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile,
      center: true,
    },
    {
      name: "Role",
      selector: (row) => row.role?.name ?? "--",
      center: true,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      center: true,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
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
      ),
    },
  ];

  const handleFetchStaff = async (page = 1) => {
    try {
      setLoading(true);

      // Fetch staff data from API
      const response = await authAxios().get("/staff", {
        params: {
          page,
          limit: rowsPerPage,
        },
      });
      const resData = response?.data;
      if (resData?.success) {
        setUsers(resData.data.items || []);
        setPagination(resData.data.pagination);
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
    handleFetchStaff(currentPage);
  }, [currentPage]);

  const handleEdit = (row) => {
    console.log("Edit:", row);
    // Open edit modal
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/staff/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchStaff(currentPage);
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
        <div className="flex justify-between items-center gap-4">
          <div className="min-w-[150px]">
            {/* Role */}
            <Select
              styles={customStyles}
              options={roleOptions}
              value={role}
              onChange={setRole}
              isSearchable={false}
              placeholder="Select Role"
              className="w-full"
            />
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
          <CustomDataTable
            columns={columns}
            data={users}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            totalPages={pagination?.totalPages}
          />
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
        onSuccess={() => handleFetchStaff(currentPage)}
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
