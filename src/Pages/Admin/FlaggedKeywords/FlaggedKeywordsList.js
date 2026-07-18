import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles, formatText } from "../../../Helper/helper";
import CreateNewKeyword from "./CreateNewKeyword";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

const FlaggedKeywordsList = (props) => {
  const { setLoading } = props;
  const [flaggedKeywordList, setFlaggedKeywordList] = useState([]);
  const [createKeyword, setCreateKeyword] = useState(false);
  const [editKeywordId, setEditKeywordId] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [pagination, setPagination] = useState(null);
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
      selector: (row) => formatText(row.match_type),
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
            {formatText(row.severity)}
          </span>
        );
      },
    },
    {
      name: "Auto Action",
      selector: (row) => formatText(row.auto_action),
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
                setEditKeywordId(row.id);
                setCreateKeyword(true);
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

  const handleFetchFlaggedKeyword = async (page = 1) => {
    try {
      setLoading(true);

      // Fetch staff data from API
      const response = await authAxios().get("/flagged-keyword", {
        params: {
          page,
          limit: rowsPerPage,
        },
      });
      const resData = response?.data;
      if (resData?.success) {
        setFlaggedKeywordList(resData.data.items || []);
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

  useEffect(() => {
    handleFetchFlaggedKeyword(currentPage);
  }, [currentPage]);

    const handleDelete = async () => {
      try {
        setLoading(true);
  
        const response = await authAxios().delete(`/flagged-keyword/${deleteId}`);
  
        if (response.data.success) {
          setDeleteModal(false);
          setDeleteId(null);
  
          // Refresh list
          handleFetchFlaggedKeyword(currentPage);
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
            data={flaggedKeywordList}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>
      <CreateNewKeyword
        open={createKeyword}
        onClose={() => {
          setCreateKeyword(false);
          setEditKeywordId(null);
        }}
        editId={editKeywordId}
        onSuccess={() => handleFetchFlaggedKeyword(currentPage)}
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
              Delete Keyword
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this Keyword?
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

export default IsLoadingHOC(FlaggedKeywordsList);
