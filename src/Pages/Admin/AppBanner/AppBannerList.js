import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import AddNewBanner from "./AddNewBanner";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { formatText, formatWithTimeDate } from "../../../Helper/helper";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

const AppBannerList = (props) => {
  const { setLoading } = props;
  const [banners, setBanners] = useState([]);
  const [editBannerId, setEditBannerId] = useState(null);
  const [addNewBanner, setAddNewBanner] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Banner",
      cell: (row) => (
        <div className="p-1">
          <img
            src={row.image}
            alt={row.title}
            className="w-20 h-12 rounded object-cover"
          />
        </div>
      ),
      width: "120px",
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      width: "160px",
    },
    {
      name: "Link Type",
      selector: (row) => formatText(row.link_type),
      center: true,
    },
    {
      name: "Position",
      selector: (row) => row.position,
      center: true,
    },
    {
      name: "Start Date",
      selector: (row) => formatWithTimeDate(row.starts_at),
      center: true,
      width: "170px",
    },
    {
      name: "End Date",
      selector: (row) => formatWithTimeDate(row.ends_at),
      center: true,
      width: "170px",
    },
    {
      name: "Status",
      center: true,
      width: "120px",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
            row.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
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
                setEditBannerId(row.id);
                setAddNewBanner(true);
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

  const fetchBanners = async (page = 1) => {
    try {
      setLoading(true);
      const response = await authAxios().get("/app-banner", {
        params: {
          page,
          limit: rowsPerPage,
        },
      });
      const resData = response.data;
      if (resData.success) {
        setBanners(resData.data.items);
        setPagination(resData.data.pagination);
      } else {
        toast.error(resData.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners(currentPage);
  }, [currentPage]);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/app-banner/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        fetchBanners(currentPage);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete tribe group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end gap-4">
          <button className="custom--btn" onClick={() => setAddNewBanner(true)}>
            <FiPlus />
            <span>Add Banner</span>
          </button>
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={banners}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
          />
        </div>
      </div>

      <AddNewBanner
        open={addNewBanner}
        onClose={() => {
          setAddNewBanner(false);
          setEditBannerId(null);
        }}
        editId={editBannerId}
        onSuccess={() => fetchBanners(currentPage)}
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
              Delete Tribe Group
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this tribe group? This action
              cannot be undone.
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

export default IsLoadingHOC(AppBannerList);
