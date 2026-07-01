import React, { useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles } from "../../../Helper/helper";

const roles = [
  {
    id: 1,
    name: "Administrator",
    description: "Full access to all modules and system settings.",
    created_at: "15 Jan 2025",
    status: "Active",
  },
  {
    id: 2,
    name: "Manager",
    description: "Can manage users, roles, and reports.",
    created_at: "20 Jan 2025",
    status: "Active",
  },
  {
    id: 3,
    name: "Support Executive",
    description: "Handles customer queries and support tickets.",
    created_at: "05 Feb 2025",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Content Editor",
    description: "Can create and update website content.",
    created_at: "12 Feb 2025",
    status: "Active",
  },
  {
    id: 5,
    name: "Viewer",
    description: "Read-only access to dashboard and reports.",
    created_at: "25 Feb 2025",
    status: "Inactive",
  },
];

const RolesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Role Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Description",
      selector: (row) => row.description,
      grow: 2,
    },
    {
      name: "Created At",
      selector: (row) => row.created_at,
      center: true,
      sortable: true,
    },

    {
      name: "Actions",
      // width: "120px",
      center: true,
      cell: (row) => (
        <div className="flex items-center justify-center gap-[1px]">
          <Tooltip id={`tooltip-view-${row.id}`} content="Edit" place="left">
            <button
              onClick={() => handleEdit(row)}
              className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-l-md"
              title="Edit"
            >
              <MdModeEdit size={18} />
            </button>
          </Tooltip>
          <Tooltip id={`tooltip-view-${row.id}`} content="Delete" place="left">
            <button
              onClick={() => handleDelete(row.id)}
              className="text-red-500 bg-red-100 w-[30px] h-[30px] flex items-center justify-center rounded-r-md "
              title="Delete"
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
        <div className="flex justify-end items-center gap-4">
          <Link to="/role" className="custom--btn">
            <FiPlus />
            <span>New Role</span>
          </Link>
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={roles}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>
    </>
  );
};

export default RolesList;
