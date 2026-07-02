import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { Link } from "react-router-dom";
import Select from "react-select";
import { customStyles, formatViewDate } from "../../../Helper/helper";
import { authAxios } from "../../../Config/config";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";

const RolesList = (props) => {
  const { setLoading } = props;
  const [rolesList, setRolesList] = useState([]);
  const [pagination, setPagination] = useState(null);
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
      selector: (row) => formatViewDate(row.created_at),
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

  const handleFetchRoles = async (page = 1) => {
    try {
      setLoading(true);

      const response = await authAxios().get("/role", {
        params: {
          page,
          limit: rowsPerPage,
        },
      });

      const resData = response?.data;

      if (resData?.success) {
        setRolesList(resData.data.items || []);
        setPagination(resData.data.pagination);
      } else {
        console.error("Failed to fetch role data:", resData?.message);
      }
    } catch (error) {
      console.error("Error fetching role:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchRoles(currentPage);
  }, [currentPage]);

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
            data={rolesList}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            totalPages={pagination?.totalPages}
          />
        </div>
      </div>
    </>
  );
};

export default IsLoadingHOC(RolesList);
