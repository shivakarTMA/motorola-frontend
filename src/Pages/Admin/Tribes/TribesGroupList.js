import React, { useEffect, useState } from "react";
import { MdImage, MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import AddNewTribesGroup from "./AddNewTribesGroup";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { formatWithTimeDate } from "../../../Helper/helper";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";

const TribesGroupList = (props) => {
  const { setLoading } = props;
  const [tribeGroupList, setTribeGroupList] = useState([]);
  const [editTribeGroupId, setEditTribeGroupId] = useState(null);
  const [addNewTribeGroup, setAddNewTribeGroup] = useState(false);

  const [status, setStatus] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = [
    {
      name: "Photo",
      width: "80px",
      cell: (row) =>
        row?.image ? (
          <div className="p-1">
            <img
              src={row.image}
              alt={row.name}
              className="w-10 h-10 rounded-full object-cover object-center"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">
              <MdImage />
            </span>
          </div>
        ),
    },
    {
      name: "Created at",
      selector: (row) => formatWithTimeDate(row.created_at),
      center: true,
      // width: "120px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      // grow: 2,
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
      name: "Position",
      selector: (row) => row.position,
      center: true,
      // width: "120px",
    },
    // {
    //   name: "Created by",
    //   selector: (row) => row.staff?.name,
    //   center: true,
    //   // width: "120px",
    // },
    {
      name: "Tribes",
      selector: (row) => (row.staff?.sub_tribes ? row.staff?.sub_tribes : 0),
      center: true,
      // width: "120px",
    },

    {
      name: "Actions",
      // width: "120px",
      center: true,
      cell: (row) => (
        <div className="flex items-center justify-center gap-[1px]">
          <Tooltip id={`tooltip-view-${row.id}`} content="Edit" place="left">
            <button
              onClick={() => {
                setEditTribeGroupId(row.id);
                setAddNewTribeGroup(true);
              }}
              className="text-black bg-gray-100 w-[30px] h-[30px] flex items-center justify-center rounded-l-md"
              title="Edit"
            >
              <MdModeEdit size={18} />
            </button>
          </Tooltip>
          <Tooltip id={`tooltip-view-${row.id}`} content="Delete" place="left">
            <button
              onClick={() => {
                setDeleteId(row.id);
                setDeleteModal(true);
              }}
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

  const handleFetchTribesGroup = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: rowsPerPage,
      };

      if (status?.value) {
        params.status = status?.value;
      }

      if (startDate && endDate) {
        params.date_from = format(startDate, "yyyy-MM-dd");
        params.date_to = format(endDate, "yyyy-MM-dd");
        params.date_filter_field = "created_at";
      }

      // Fetch tribe-group data from API
      const response = await authAxios().get("/tribe-group", { params });
      const resData = response?.data;
      if (resData?.success) {
        setTribeGroupList(resData.data.items || []);
        // console.log("Fetched tribe group data:", resData.data.items);
        setPagination(resData.data.pagination);
      } else {
        console.error("Failed to fetch tribe group data:", resData?.message);
      }
    } catch (error) {
      console.error("Error fetching tribe group data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTribesGroup(currentPage);
  }, [currentPage, startDate, endDate, status]);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/tribe-group/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchTribesGroup(currentPage);
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

  // Called only when DateRangePicker's Apply or Clear button is clicked.
  const handleDateRangeChange = ({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="relative flex justify-between gap-4">
          <div className="max-w-[200px] w-full">
            <DateRangePicker
              onChange={handleDateRangeChange}
              defaultPreset="Today"
              panelOffsetTop={100}
              panelOffsetLeft={0}
            />
          </div>

          <button
            className="custom--btn"
            onClick={() => setAddNewTribeGroup(true)}
          >
            <FiPlus />
            <span>New Tribe Group</span>
          </button>
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={tribeGroupList}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            paginationTotalRows={pagination?.total || 0}
          />
        </div>
      </div>

      <AddNewTribesGroup
        open={addNewTribeGroup}
        onClose={() => {
          setAddNewTribeGroup(false);
          setEditTribeGroupId(null);
        }}
        editId={editTribeGroupId}
        onSuccess={() => handleFetchTribesGroup(currentPage)}
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

export default IsLoadingHOC(TribesGroupList);
