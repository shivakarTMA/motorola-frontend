import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles, formatText } from "../../../Helper/helper";
import CreateNewTiers from "./CreateNewTiers";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

const TiersList = (props) => {
  const { setLoading } = props;
  const [tiersDataList, setTiersDataList] = useState([]);
  const [createTier, setCreateTier] = useState(false);
  const [editTierId, setEditTierId] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Tier Name",
      selector: (row) => row.name,
      // sortable: true,
    },
    {
      name: "Level",
      selector: (row) => row.level,
      center: true,
      // sortable: true,
    },
    {
      name: "Minimum Points",
      selector: (row) => row.min_points,
      center: true,
      // sortable: true,
    },
    {
      name: "Benefits",
      selector: (row) => row.benefits,
      // grow: 2,
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
                setEditTierId(row.id);
                setCreateTier(true);
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

  const handleFetchTiersList = async (page = 1) => {
    try {
      setLoading(true);

      // Fetch staff data from API
      const response = await authAxios().get("/tier", {
        params: {
          page,
          limit: rowsPerPage,
        },
      });
      const resData = response?.data;
      if (resData?.success) {
        setTiersDataList(resData.data.items || []);
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
    handleFetchTiersList(currentPage);
  }, [currentPage]);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/tier/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchTiersList(currentPage);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete tier.");
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
            onClick={() => setCreateTier(true)}
          >
            <FiPlus />
            <span>New Tier</span>
          </button>
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={tiersDataList}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>
      <CreateNewTiers
        open={createTier}
        onClose={() => {
          setCreateTier(false);
          setEditTierId(null);
        }}
        editId={editTierId}
        onSuccess={() => handleFetchTiersList(currentPage)}
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
              Delete Tiers
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this tiers?
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

export default IsLoadingHOC(TiersList);
