import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import AddNewTribes from "./AddNewTribes";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { authAxios } from "../../../Config/config";
import { filterActiveItems, formatText, formatViewDate } from "../../../Helper/helper";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { format } from "date-fns";
import DateRangePicker from "../../../Components/Common/DateRangePickerField";

const TribesList = (props) => {
  const { setLoading } = props;
  const [tribeList, setTribeList] = useState([]);
  const [editTribeId, setEditTribeId] = useState(null);
  const [addNewTribe, setAddNewTribe] = useState(false);
  const [tribeGroupList, setTribeGroupList] = useState([]);
  const [parentTribeList, setParentTribeList] = useState([]);

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
      name: "",
      cell: (row) => (
        <div className="p-0">
          <img
            src={row.icon_url}
            alt={row.name}
            className="w-7 h-7 rounded-full object-cover object-center"
          />
        </div>
      ),
      width: "60px",
    },
    {
      name: "Created At",
      selector: (row) => formatViewDate(row.created_at),
      center: true,
    },
    {
      name: "Name",
      grow: 2,
      cell: (row) => (
        <div className="whitespace-normal break-words py-2">
          {row.name}
        </div>
      ),
      width:'200px'
    },
    {
      name: "Tribe Group",
      selector: (row) => row.circleGroup?.name ?? "--",
      center: true,
      width:"120px"
    },
    {
      name: "Parent",
      selector: (row) => row.parent?.name ?? "--",
      center: true,
    },
    

    {
      name: "Users",
      selector: (row) => row.users_count,
      center: true,
    },
    {
      name: "Interactions",
      selector: (row) => row.interactions_count,
      center: true,
      width:"120px"
    },
    {
      name: "Posts",
      selector: (row) => row.posts_count,
      center: true,
    },
    // {
    //   name: "Polls",
    //   selector: (row) => row.polls_count,
    //   center: true,
    // },
    {
      name: "Moderators",
      selector: (row) => row.moderators ? row.moderators : 0,
      center: true,
      width:"120px"
    },
    
    {
      name: "Status",
      center: true,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {formatText(row.status)}
        </span>
      ),
    },
    {
      name: "Is Feature",
      selector: (row) => row.is_featured,
      center: true,
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.is_featured
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.is_featured ? "Yes" : "No"}
        </span>
      ),
    },
    
    // {
    //   name: "Created by",
    //   selector: (row) => row.staff?.name,
    //   center: true,
    // },
    {
      name: "Position",
      selector: (row) => row.position,
      center: true,
    },
    {
      name: "Actions",
      center: true,
      cell: (row) => (
        <div className="flex items-center justify-center gap-[1px]">
          <Tooltip id={`tooltip-view-${row.id}`} content="Edit" place="left">
            <button
              onClick={() => {
                setEditTribeId(row.id);
                setAddNewTribe(true);
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

  const handleFetchTribes = async (page = 1) => {
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

      // Fetch tribe data from API
      const response = await authAxios().get("/tribe", {params});
      const resData = response?.data;
      if (resData?.success) {
        setTribeList(resData.data.items || []);
        // console.log("Fetched tribe data:", resData.data.items);
        setPagination(resData.data.pagination);
      } else {
        console.error("Failed to fetch tribe data:", resData?.message);
      }
    } catch (error) {
      console.error("Error fetching tribe data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTribes(currentPage);
  }, [currentPage, startDate, endDate, status]);

  const handleFetchTribesGroup = async (page = 1) => {
    try {
      setLoading(true);

      // Fetch tribe-group data from API
      const response = await authAxios().get("/tribe-group", {
        params: {
          page,
          limit: rowsPerPage,
        },
      });
      const resData = response?.data;
      if (resData?.success) {
        let data = resData.data.items || [];
        const activeOnly = filterActiveItems(data);
        setTribeGroupList(activeOnly);
        console.log("Fetched tribe group data:", activeOnly);
      } else {
        console.error("Failed to fetch tribe group data:", resData?.message);
      }
    } catch (error) {
      console.error("Error fetching tribe group data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchParentTribes = async (page = 1) => {
    try {
      setLoading(true);

      // Fetch tribe parents data from API
      const response = await authAxios().get("/tribe/parents");
      const resData = response?.data;
      if (resData?.success) {
        setParentTribeList(resData.data || []);
        console.log("Fetched parent tribe parents data:", resData.data);
      } else {
        console.error(
          "Failed to fetch parent tribe parents data:",
          resData?.message,
        );
      }
    } catch (error) {
      console.error("Error fetching parent tribe parents data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchTribesGroup();
    handleFetchParentTribes();
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await authAxios().delete(`/tribe/${deleteId}`);

      if (response.data.success) {
        setDeleteModal(false);
        setDeleteId(null);

        // Refresh list
        handleFetchTribes(currentPage);
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
          <button className="custom--btn" onClick={() => setAddNewTribe(true)}>
            <FiPlus />
            <span>New Tribes</span>
          </button>
        </div>

        <div className="mt-3">
          <CustomDataTable
            columns={columns}
            data={tribeList}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            paginationTotalRows={pagination?.total || 0}
          />
        </div>
      </div>

      <AddNewTribes
        open={addNewTribe}
        groups={tribeGroupList}
        tribeParents={parentTribeList}
        onClose={() => {
          setAddNewTribe(false);
          setEditTribeId(null);
        }}
        editId={editTribeId}
        onSuccess={() => handleFetchTribes(currentPage)}
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
              Delete Tribe
            </DialogTitle>

            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this tribe?
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

export default IsLoadingHOC(TribesList);
