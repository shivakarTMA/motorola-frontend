import React, { useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles } from "../../../Helper/helper";
import CreateNewStaff from "./CreateNewStaff";

const users = [
  {
    id: 1,
    name: "Ankush Goyal",
    email: "admin2@example.com",
    mobile: "9540787532",
    role: "Administrator",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    mobile: "9876543210",
    role: "Manager",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Priya Verma",
    email: "priya@example.com",
    mobile: "9123456789",
    role: "Support Executive",
    status: "INACTIVE",
  },
  {
    id: 4,
    name: "Neha Singh",
    email: "neha@example.com",
    mobile: "9988776655",
    role: "Content Editor",
    status: "ACTIVE",
  },
  {
    id: 5,
    name: "Amit Kumar",
    email: "amit@example.com",
    mobile: "9090909090",
    role: "Viewer",
    status: "INACTIVE",
  },
];

const roleOptions = [
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
];

const StaffList = () => {
  const [role, setRole] = useState(null);
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
      selector: (row) => row.role,
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
              onClick={() => handleEdit(row)}
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
              onClick={() => handleDelete(row.id)}
              className="text-red-500 bg-red-100 w-[30px] h-[30px] flex items-center justify-center rounded-r-md"
            >
              <FiTrash2 size={18} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleEdit = (row) => {
    console.log("Edit:", row);
    // Open edit modal
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      console.log("Delete:", id);
      // Call delete API
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="">
            {/* Role */}
            <Select
              styles={customStyles}
              options={roleOptions}
              value={role}
              onChange={setRole}
              isSearchable={false}
              placeholder="Select Role"
            />
          </div>
          <button type="button" className="custom--btn" onClick={() => setCreateStaff(true)}>
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
          />
        </div>
      </div>
      <CreateNewStaff
        open={createStaff}
        onClose={() => setCreateStaff(false)}
        onSuccess={() => {
          // TODO: refetch circleGroups from API after a successful create
        }}
      />
    </>
  );
};

export default StaffList;
