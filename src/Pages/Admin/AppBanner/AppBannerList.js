import React, { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import AddNewBanner from "./AddNewBanner";
import CustomDataTable from "../../../Components/Common/CustomDataTable";
import Tooltip from "../../../Components/Common/Tooltip";
import { authAxios } from "../../../Config/config";
import { toast } from "react-toastify";
import IsLoadingHOC from "../../../Components/Common/IsLoadingHOC";
import { useFormik } from "formik";
import * as Yup from "yup";
import { formatText, formatWithTimeDate } from "../../../Helper/helper";

const bannersList = [
  {
    id: 1,
    image: "https://picsum.photos/200/100?random=1",
    title: "Summer Sale",
    link_type: "NONE",
    link_target: null,
    placement: "HOME_TOP",
    starts_at: "2026-06-01T10:00:00.000Z",
    ends_at: "2026-06-30T10:00:00.000Z",
    position: 0,
    status: "ACTIVE",
  },
  {
    id: 2,
    image: "https://picsum.photos/200/100?random=2",
    title: "New Launch",
    link_type: "PRODUCT",
    link_target: "101",
    placement: "HOME_TOP",
    starts_at: "2026-06-02T10:00:00.000Z",
    ends_at: "2026-07-02T10:00:00.000Z",
    position: 1,
    status: "INACTIVE",
  },
  {
    id: 3,
    image: "https://picsum.photos/200/100?random=3",
    title: "Monsoon Offer",
    link_type: "CATEGORY",
    link_target: "Mobiles",
    placement: "HOME_MIDDLE",
    starts_at: "2026-06-03T10:00:00.000Z",
    ends_at: "2026-07-03T10:00:00.000Z",
    position: 2,
    status: "ACTIVE",
  },
  {
    id: 4,
    image: "https://picsum.photos/200/100?random=4",
    title: "Weekend Deal",
    link_type: "NONE",
    link_target: null,
    placement: "HOME_BOTTOM",
    starts_at: "2026-06-04T10:00:00.000Z",
    ends_at: "2026-07-04T10:00:00.000Z",
    position: 3,
    status: "ACTIVE",
  },
  {
    id: 5,
    image: "https://picsum.photos/200/100?random=5",
    title: "Accessories",
    link_type: "PRODUCT",
    link_target: "102",
    placement: "HOME_TOP",
    starts_at: "2026-06-05T10:00:00.000Z",
    ends_at: "2026-07-05T10:00:00.000Z",
    position: 4,
    status: "ACTIVE",
  },
  {
    id: 6,
    image: "https://picsum.photos/200/100?random=6",
    title: "Gaming Phones",
    link_type: "CATEGORY",
    link_target: "Gaming",
    placement: "HOME_MIDDLE",
    starts_at: "2026-06-06T10:00:00.000Z",
    ends_at: "2026-07-06T10:00:00.000Z",
    position: 5,
    status: "INACTIVE",
  },
  {
    id: 7,
    image: "https://picsum.photos/200/100?random=7",
    title: "Festival Offer",
    link_type: "NONE",
    link_target: null,
    placement: "HOME_BOTTOM",
    starts_at: "2026-06-07T10:00:00.000Z",
    ends_at: "2026-07-07T10:00:00.000Z",
    position: 6,
    status: "ACTIVE",
  },
  {
    id: 8,
    image: "https://picsum.photos/200/100?random=8",
    title: "Camera Promo",
    link_type: "PRODUCT",
    link_target: "103",
    placement: "HOME_TOP",
    starts_at: "2026-06-08T10:00:00.000Z",
    ends_at: "2026-07-08T10:00:00.000Z",
    position: 7,
    status: "ACTIVE",
  },
  {
    id: 9,
    image: "https://picsum.photos/200/100?random=9",
    title: "Travel Deals",
    link_type: "CATEGORY",
    link_target: "Travel",
    placement: "HOME_MIDDLE",
    starts_at: "2026-06-09T10:00:00.000Z",
    ends_at: "2026-07-09T10:00:00.000Z",
    position: 8,
    status: "ACTIVE",
  },
  {
    id: 10,
    image: "https://picsum.photos/200/100?random=10",
    title: "Power Bank",
    link_type: "PRODUCT",
    link_target: "104",
    placement: "HOME_BOTTOM",
    starts_at: "2026-06-10T10:00:00.000Z",
    ends_at: "2026-07-10T10:00:00.000Z",
    position: 9,
    status: "INACTIVE",
  },
  {
    id: 11,
    image: "https://picsum.photos/200/100?random=11",
    title: "Wireless Audio",
    link_type: "NONE",
    link_target: null,
    placement: "HOME_TOP",
    starts_at: "2026-06-11T10:00:00.000Z",
    ends_at: "2026-07-11T10:00:00.000Z",
    position: 10,
    status: "ACTIVE",
  },
  {
    id: 12,
    image: "https://picsum.photos/200/100?random=12",
    title: "Flagship Phones",
    link_type: "CATEGORY",
    link_target: "Flagship",
    placement: "HOME_MIDDLE",
    starts_at: "2026-06-12T10:00:00.000Z",
    ends_at: "2026-07-12T10:00:00.000Z",
    position: 11,
    status: "ACTIVE",
  },
  {
    id: 13,
    image: "https://picsum.photos/200/100?random=13",
    title: "Smart Watches",
    link_type: "PRODUCT",
    link_target: "105",
    placement: "HOME_BOTTOM",
    starts_at: "2026-06-13T10:00:00.000Z",
    ends_at: "2026-07-13T10:00:00.000Z",
    position: 12,
    status: "ACTIVE",
  },
  {
    id: 14,
    image: "https://picsum.photos/200/100?random=14",
    title: "Fitness Deals",
    link_type: "NONE",
    link_target: null,
    placement: "HOME_TOP",
    starts_at: "2026-06-14T10:00:00.000Z",
    ends_at: "2026-07-14T10:00:00.000Z",
    position: 13,
    status: "INACTIVE",
  },
  {
    id: 15,
    image: "https://picsum.photos/200/100?random=15",
    title: "Bluetooth Speakers",
    link_type: "PRODUCT",
    link_target: "106",
    placement: "HOME_MIDDLE",
    starts_at: "2026-06-15T10:00:00.000Z",
    ends_at: "2026-07-15T10:00:00.000Z",
    position: 14,
    status: "ACTIVE",
  },
  {
    id: 16,
    image: "https://picsum.photos/200/100?random=16",
    title: "Headphones",
    link_type: "CATEGORY",
    link_target: "Audio",
    placement: "HOME_BOTTOM",
    starts_at: "2026-06-16T10:00:00.000Z",
    ends_at: "2026-07-16T10:00:00.000Z",
    position: 15,
    status: "ACTIVE",
  },
  {
    id: 17,
    image: "https://picsum.photos/200/100?random=17",
    title: "Laptop Deals",
    link_type: "PRODUCT",
    link_target: "107",
    placement: "HOME_TOP",
    starts_at: "2026-06-17T10:00:00.000Z",
    ends_at: "2026-07-17T10:00:00.000Z",
    position: 16,
    status: "ACTIVE",
  },
  {
    id: 18,
    image: "https://picsum.photos/200/100?random=18",
    title: "Back to School",
    link_type: "CATEGORY",
    link_target: "Education",
    placement: "HOME_MIDDLE",
    starts_at: "2026-06-18T10:00:00.000Z",
    ends_at: "2026-07-18T10:00:00.000Z",
    position: 17,
    status: "INACTIVE",
  },
  {
    id: 19,
    image: "https://picsum.photos/200/100?random=19",
    title: "Clearance Sale",
    link_type: "NONE",
    link_target: null,
    placement: "HOME_BOTTOM",
    starts_at: "2026-06-19T10:00:00.000Z",
    ends_at: "2026-07-19T10:00:00.000Z",
    position: 18,
    status: "ACTIVE",
  },
  {
    id: 20,
    image: "https://picsum.photos/200/100?random=20",
    title: "Smart Home",
    link_type: "PRODUCT",
    link_target: "108",
    placement: "HOME_TOP",
    starts_at: "2026-06-20T10:00:00.000Z",
    ends_at: "2026-07-20T10:00:00.000Z",
    position: 19,
    status: "ACTIVE",
  },
  {
    id: 21,
    image: "https://picsum.photos/200/100?random=21",
    title: "Wearables",
    link_type: "CATEGORY",
    link_target: "Wearables",
    placement: "HOME_MIDDLE",
    starts_at: "2026-06-21T10:00:00.000Z",
    ends_at: "2026-07-21T10:00:00.000Z",
    position: 20,
    status: "ACTIVE",
  },
  {
    id: 22,
    image: "https://picsum.photos/200/100?random=22",
    title: "Flash Sale",
    link_type: "NONE",
    link_target: null,
    placement: "HOME_BOTTOM",
    starts_at: "2026-06-22T10:00:00.000Z",
    ends_at: "2026-07-22T10:00:00.000Z",
    position: 21,
    status: "INACTIVE",
  },
  {
    id: 23,
    image: "https://picsum.photos/200/100?random=23",
    title: "Premium Phones",
    link_type: "PRODUCT",
    link_target: "109",
    placement: "HOME_TOP",
    starts_at: "2026-06-23T10:00:00.000Z",
    ends_at: "2026-07-23T10:00:00.000Z",
    position: 22,
    status: "ACTIVE",
  },
  {
    id: 24,
    image: "https://picsum.photos/200/100?random=24",
    title: "Tablet Offer",
    link_type: "CATEGORY",
    link_target: "Tablets",
    placement: "HOME_MIDDLE",
    starts_at: "2026-06-24T10:00:00.000Z",
    ends_at: "2026-07-24T10:00:00.000Z",
    position: 23,
    status: "ACTIVE",
  },
  {
    id: 25,
    image: "https://picsum.photos/200/100?random=25",
    title: "Mega Discount",
    link_type: "NONE",
    link_target: null,
    placement: "HOME_BOTTOM",
    starts_at: "2026-06-25T10:00:00.000Z",
    ends_at: "2026-07-25T10:00:00.000Z",
    position: 24,
    status: "ACTIVE",
  },
];

const formatDate = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const AppBannerList = (props) => {
  const { setLoading } = props;
  const [addNewBanner, setAddNewBanner] = useState(false);

  const [banners, setBanners] = useState(bannersList);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

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
    },
    {
      name: "Placement",
      selector: (row) => formatText(row.placement),
      center: true,
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

  const fetchBanners = async (page = 1) => {
    setLoading(true);

    try {
      const response = await authAxios().get(
        `/api/crm/app-banner?page=${page}&limit=${rowsPerPage}`,
      );

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

  const formik = useFormik({
    initialValues: {
      image: null,
      title: "",
      link_type: "",
      placement: "",
      starts_at: null,
      ends_at: null,
      position: "",
      status: "",
    },
    validationSchema: Yup.object({
      image: Yup.mixed()
        .required("Image is required")
        .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
          if (!value || typeof value === "string") return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),

      title: Yup.string().trim().required("Title is required"),

      link_type: Yup.string().required("Link type is required"),

      placement: Yup.string().required("Placement is required"),

      starts_at: Yup.string().required("Start date is required"),

      ends_at: Yup.string().required("End date is required"),

      position: Yup.number()
        .typeError("Position must be a number")
        .required("Position is required"),

      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        formData.append("image", values.image);
        formData.append("title", values.title);
        formData.append("link_type", values.link_type);
        formData.append("placement", values.placement);
        formData.append("starts_at", formatDate(values.starts_at));
        formData.append("ends_at", formatDate(values.ends_at));
        formData.append("position", values.position);
        formData.append("status", values.status);

        // await authAxios().post("/api/crm/app-banner", formData, {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // });

        toast.success("Banner created successfully");

        resetForm();
        fetchBanners(currentPage);
        setAddNewBanner(false);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    },
  });

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
            totalRows={pagination.total}
          />
        </div>
      </div>

      <AddNewBanner
        open={addNewBanner}
        onClose={() => setAddNewBanner(false)}
        formik={formik}
        onSuccess={() => {
          // TODO: refetch circleGroups from API after a successful create
        }}
      />
    </>
  );
};

export default IsLoadingHOC(AppBannerList);
