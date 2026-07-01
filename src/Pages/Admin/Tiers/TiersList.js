import React, { useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles } from "../../../Helper/helper";
import CreateNewTiers from "./CreateNewTiers";

const tiers = [
  {
    id: 1,
    name: "Silver",
    level: 1,
    min_points: 0,
    benefits: "Free shipping, 5% discount",
    badge_icon: null,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Gold",
    level: 2,
    min_points: 500,
    benefits: "Free shipping, 10% discount",
    badge_icon: "https://via.placeholder.com/40x40.png?text=G",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Platinum",
    level: 3,
    min_points: 1500,
    benefits: "Free shipping, 15% discount",
    badge_icon: "https://via.placeholder.com/40x40.png?text=P",
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Diamond",
    level: 4,
    min_points: 3000,
    benefits: "Priority Support, 20% discount",
    badge_icon: null,
    status: "INACTIVE",
  },
];

const TiersList = () => {
  const [createTier, setCreateTier] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Tier Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Level",
      selector: (row) => row.level,
      center: true,
      sortable: true,
    },
    {
      name: "Minimum Points",
      selector: (row) => row.min_points,
      center: true,
      sortable: true,
    },
    {
      name: "Benefits",
      selector: (row) => row.benefits,
      grow: 2,
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
            onClick={() => setCreateTier(true)}
          >
            <FiPlus />
            <span>New Tier</span>
          </button>
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={tiers}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>
      <CreateNewTiers
        open={createTier}
        onClose={() => setCreateTier(false)}
        onSuccess={() => {
          // TODO: refetch tiers from API after a successful create
        }}
      />
    </>
  );
};

export default TiersList;
