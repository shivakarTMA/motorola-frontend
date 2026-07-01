import React, { useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles } from "../../../Helper/helper";
import CreateNewModule from "./CreateNewModule";

const modules = [
  {
    id: 1,
    name: "Dashboard",
    slug: "dashboard",
    status: "ACTIVE",
    position: 1,
    menu: null,
  },
  {
    id: 2,
    name: "Users",
    slug: "users",
    status: "ACTIVE",
    position: 2,
    menu: null,
  },
  {
    id: 3,
    name: "Staff",
    slug: "staff",
    status: "ACTIVE",
    position: 3,
    menu: null,
  },
  {
    id: 4,
    name: "Roles",
    slug: "roles",
    status: "ACTIVE",
    position: 4,
    menu: null,
  },
  {
    id: 5,
    name: "Modules",
    slug: "modules",
    status: "ACTIVE",
    position: 5,
    menu: null,
  },
  {
    id: 6,
    name: "Leads",
    slug: "leads",
    status: "ACTIVE",
    position: 6,
    menu: "Settin",
  },
  {
    id: 7,
    name: "Invoices",
    slug: "invoices",
    status: "ACTIVE",
    position: 7,
    menu: null,
  },
  {
    id: 8,
    name: "Reports",
    slug: "reports",
    status: "ACTIVE",
    position: 8,
    menu: null,
  },
];


const ModulesList = () => {
  const [createModule, setCreateModule] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Slug",
      selector: (row) => row.slug,
      sortable: true,
    },
    {
      name: "Position",
      selector: (row) => row.position,
      center: true,
      sortable: true,
    },
    {
      name: "Menu",
      selector: (row) => row.Menu?.name || "-",
      center: true,
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
    if (window.confirm("Are you sure you want to delete this module?")) {
      console.log("Delete:", id);
      // Call delete API
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end items-center gap-4">
          <button
            type="button"
            className="custom--btn"
            onClick={() => setCreateModule(true)}
          >
            <FiPlus />
            <span>New Module</span>
          </button>
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={modules}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>
      <CreateNewModule
        open={createModule}
        onClose={() => setCreateModule(false)}
        onSuccess={() => {
          // TODO: refetch modules from API after a successful create
        }}
      />
    </>
  );
};

export default ModulesList;
