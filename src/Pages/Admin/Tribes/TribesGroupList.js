import React, { useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import AddNewTribesGroup from "./AddNewTribesGroup";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";

const circles = [
  {
    id: 1,
    name: "Tribes 1",
    position: 0,
    status: "Inactive",
  },
  {
    id: 2,
    name: "Tribes 2",
    position: 1,
    status: "Active",
  },
];

const TribesGroupList = () => {
  const [addNewTribeGroup, setAddNewTribeGroup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      // grow: 2,
    },
    {
      name: "Position",
      selector: (row) => row.position,
      center: true,
      // width: "120px",
    },
    {
      name: "Status",
      center: true,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
            row.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.status}
        </span>
      ),
      width: "120px",
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
        <div className="flex justify-end gap-4">
          <button className="custom--btn" onClick={() => setAddNewTribeGroup(true)}>
            <FiPlus />
            <span>New Tribes</span>
          </button>
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={circles}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>

      <AddNewTribesGroup
        open={addNewTribeGroup}
        onClose={() => setAddNewTribeGroup(false)}
        onSuccess={() => {
          // TODO: refetch circleGroups from API after a successful create
        }}
      />
    </>
  );
};

export default TribesGroupList;
