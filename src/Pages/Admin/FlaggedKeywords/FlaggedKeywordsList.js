import React, { useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles } from "../../../Helper/helper";
import CreateNewKeyword from "./CreateNewKeyword";

const keywords = [
  {
    id: 1,
    keyword: "Porn",
    match_type: "CONTAINS",
    severity: "MEDIUM",
    auto_action: "FLAG_FOR_REVIEW",
    status: "ACTIVE",
  },
  {
    id: 2,
    keyword: "Violence",
    match_type: "EXACT",
    severity: "HIGH",
    auto_action: "BLOCK",
    status: "ACTIVE",
  },
  {
    id: 3,
    keyword: "Spam",
    match_type: "CONTAINS",
    severity: "LOW",
    auto_action: "FLAG_FOR_REVIEW",
    status: "INACTIVE",
  },
  {
    id: 4,
    keyword: "Abuse",
    match_type: "EXACT",
    severity: "HIGH",
    auto_action: "BLOCK",
    status: "ACTIVE",
  },
];

const FlaggedKeywordsList = () => {
  const [createKeyword, setCreateKeyword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Keyword",
      selector: (row) => row.keyword,
      sortable: true,
    },
    {
      name: "Match Type",
      selector: (row) => row.match_type,
      center: true,
      sortable: true,
    },
    {
      name: "Severity",
      center: true,
      cell: (row) => {
        const colors = {
          LOW: "bg-blue-100 text-blue-700",
          MEDIUM: "bg-yellow-100 text-yellow-700",
          HIGH: "bg-red-100 text-red-700",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              colors[row.severity] || "bg-gray-100 text-gray-700"
            }`}
          >
            {row.severity}
          </span>
        );
      },
    },
    {
      name: "Auto Action",
      selector: (row) => row.auto_action,
      grow: 2,
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
            onClick={() => setCreateKeyword(true)}
          >
            <FiPlus />
            <span>New Keyword</span>
          </button>
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={keywords}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>
      <CreateNewKeyword
        open={createKeyword}
        onClose={() => setCreateKeyword(false)}
        onSuccess={() => {
          // TODO: refetch flagged keywords from API after a successful create
        }}
      />
    </>
  );
};

export default FlaggedKeywordsList;
