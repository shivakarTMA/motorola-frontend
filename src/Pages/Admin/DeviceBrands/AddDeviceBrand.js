import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { customStyles } from "../../../Helper/helper";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  blockOnlyTextKeys,
  sanitizeOnlyText,
  blockOnlyNumericKeys,
  sanitizePositiveInteger,
  sanitizeFreeText,
} from "../../../Helper/Inputhelpers";
import { RiImageAddLine } from "react-icons/ri";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { authAxios } from "../../../Config/config";

const linkTypeOptions = [
  { value: "NONE", label: "None" },
  { value: "INTERNAL", label: "Internal" },
  { value: "EXTERNAL", label: "External" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const formatDate = (date) => {
  if (!date || !(date instanceof Date)) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:00`;
};

const AddDeviceBrand = ({ open, onClose, onSuccess, editId }) => {
  const isEdit = !!editId;
  const [coverPreview, setCoverPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      // logo_url: null,
      name: "",
      status: "",
    },

    validationSchema: Yup.object({
      // logo_url: Yup.mixed()
      //   .required("Logo is required")
      //   .test("fileType", "Only JPG, PNG or WEBP allowed", (value) => {
      //     if (!value || typeof value === "string") return true;

      //     return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
      //   }),

      name: Yup.string().trim().required("Brand name is required"),

      status: Yup.string().required("Status is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        formData.append("name", values.name);
        formData.append("status", values.status);

        // if (values.logo_url instanceof File) {
        //   formData.append("logo_url", values.logo_url);
        // }

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        if (isEdit) {
          await authAxios().put(`/device-brand/${editId}`, formData, config);
          toast.success("Brand updated successfully");
        } else {
          await authAxios().post("/device-brand", formData, config);
          toast.success("Brand created successfully");
        }

        onSuccess?.();
        resetForm();
        onClose();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    },
  });

  // Build/revoke the cover image preview URL whenever the file changes
  // useEffect(() => {
  //   if (!formik.values.logo_url) {
  //     setCoverPreview(null);
  //     return;
  //   }

  //   if (typeof formik.values.logo_url === "string") {
  //     setCoverPreview(formik.values.logo_url);
  //     return;
  //   }

  //   const url = URL.createObjectURL(formik.values.logo_url);
  //   setCoverPreview(url);

  //   return () => URL.revokeObjectURL(url);
  // }, [formik.values.logo_url]);

  useEffect(() => {
    if (!editId) {
      formik.resetForm();
    }
  }, [editId]);

  useEffect(() => {
    const fetchTribesGroupById = async () => {
      if (!editId) return;

      try {
        const res = await authAxios().get(`/device-brand/${editId}`);
        const data = res?.data?.data;

        if (res?.data?.success && data) {
          formik.setValues({
            // logo_url: data.logo_url || null,
            name: data.name || "",
            status: data.status || "",
          });

          // setCoverPreview(data.logo_url || null);
        }
      } catch (err) {
        console.error("Failed to load banner:", err);
      }
    };

    fetchTribesGroupById();
  }, [editId]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-5">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="border-b px-6 py-4">
                  <Dialog.Title className="text-lg font-semibold">
                    {editId ? "Update" : "Add New"} Brand
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  {/* Cover Image */}
                  {/* <div>
                    <label className="block mb-2 text-sm font-medium">
                      Logo
                    </label>

                    {coverPreview && (
                      <div className="mb-2 relative">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-20 h-20 object-contain object-left-top"
                        />
                      </div>
                    )}

                    <label
                      htmlFor="image"
                      className="block text-center cursor-pointer border border-gray-400 text-gray-400 rounded py-2 text-sm"
                    >
                      <span className="flex items-center gap-2 justify-center">
                        <RiImageAddLine />{" "}
                        {coverPreview
                          ? "REPLACE COVER IMAGE"
                          : "UPLOAD COVER IMAGE"}
                      </span>
                    </label>
                    <input
                      id="image"
                      name="logo_url"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden "
                      onChange={(e) =>
                        formik.setFieldValue(
                          "logo_url",
                          e.target.files?.[0] || null,
                        )
                      }
                      onBlur={() => formik.setFieldTouched("image", true)}
                    />
                  </div> */}

                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Brand Name<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        // onKeyDown={blockOnlyTextKeys}
                        // onChange={(e) => {
                        //   const cleaned = sanitizeOnlyText(e.target.value);
                        //   formik.setFieldValue("name", cleaned);
                        // }}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                        placeholder="Name"
                      />

                      {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Status<span className="text-red-600">*</span>
                      </label>

                      <Select
                        styles={customStyles}
                        options={statusOptions}
                        value={statusOptions.find(
                          (item) => item.value === formik.values.status,
                        )}
                        onChange={(option) =>
                          formik.setFieldValue("status", option.value)
                        }
                      />

                      {formik.touched.status && formik.errors.status && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.status}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="custom--btn !bg-white !border !border-black !text-black"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="custom--btn disabled:opacity-60"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddDeviceBrand;
