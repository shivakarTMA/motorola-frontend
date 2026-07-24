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

const AddNewBanner = ({ open, onClose, onSuccess, editId }) => {
  const isEdit = !!editId;
  const [coverPreview, setCoverPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      image: null,
      title: "",
      link_type: "",
      link_target: "",
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

      // title: Yup.string().trim().required("Title is required"),

      link_type: Yup.string().required("Link type is required"),

      link_target: Yup.string().when("link_type", ([linkType], schema) => {
        if (linkType === "INTERNAL") {
          return schema
            .required("Post ID is required")
            .matches(/^\d+$/, "Post ID must be numeric");
        }

        if (linkType === "EXTERNAL") {
          return schema.required("URL is required");
        }

        return schema.notRequired().nullable();
      }),

      starts_at: Yup.date().nullable().required("Start date is required"),

      ends_at: Yup.date().nullable().required("End date is required"),

      position: Yup.number()
        .typeError("Position must be a number")
        .required("Position is required"),

      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        formData.append("title", values.title);
        formData.append("link_type", values.link_type);
        formData.append("link_target", values.link_target);
        formData.append("starts_at", formatDate(values.starts_at));
        formData.append("ends_at", formatDate(values.ends_at));
        formData.append("position", values.position);
        formData.append("status", values.status);

        if (values.image instanceof File) {
          formData.append("image", values.image);
        }

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        if (isEdit) {
          await authAxios().put(`/app-banner/${editId}`, formData, config);
          toast.success("Banner updated successfully");
        } else {
          await authAxios().post("/app-banner", formData, config);
          toast.success("Banner created successfully");
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
  useEffect(() => {
    if (!formik.values.image) {
      setCoverPreview(null);
      return;
    }

    if (typeof formik.values.image === "string") {
      setCoverPreview(formik.values.image);
      return;
    }

    const url = URL.createObjectURL(formik.values.image);
    setCoverPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [formik.values.image]);

  useEffect(() => {
    if (!editId) {
      formik.resetForm();
    }
  }, [editId]);

  useEffect(() => {
    const fetchTribesGroupById = async () => {
      if (!editId) return;

      try {
        const res = await authAxios().get(`/app-banner/${editId}`);
        const data = res?.data?.data;

        if (res?.data?.success && data) {
          formik.setValues({
            image: data.image || null,
            title: data.title || "",
            link_type: data.link_type || "",
            link_target: data.link_target || "",
            starts_at: data.starts_at
              ? new Date(data.starts_at.replace(" ", "T"))
              : null,

            ends_at: data.ends_at
              ? new Date(data.ends_at.replace(" ", "T"))
              : null,
            position: data.position || "",
            status: data.status || "",
          });

          // Existing image preview
          setCoverPreview(data.image || null);
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
                    Add New Banner
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  {/* Cover Image */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Cover Image<span className="text-red-600">*</span>
                    </label>

                    {coverPreview && (
                      <div className="mb-2 relative w-full h-32 rounded overflow-hidden border">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
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
                      name="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden "
                      onChange={(e) =>
                        formik.setFieldValue(
                          "image",
                          e.target.files?.[0] || null,
                        )
                      }
                      onBlur={() => formik.setFieldTouched("image", true)}
                    />

                    {formik.values.image && (
                      <p className="text-xs text-black mt-1 truncate">
                        {typeof formik.values.image === "string"
                          ? "Current Banner Image"
                          : formik.values.image.name}
                      </p>
                    )}

                    {formik.touched.image && formik.errors.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.image}
                      </p>
                    )}
                  </div>

                  <div className="grid lg:grid-cols-2 grid-cols-1 gap-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formik.values.title}
                        // onKeyDown={blockOnlyTextKeys}
                        // onChange={(e) => {
                        //   const cleaned = sanitizeOnlyText(e.target.value);
                        //   formik.setFieldValue("title", cleaned);
                        // }}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                        placeholder="Title"
                      />

                      {/* {formik.touched.title && formik.errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.title}
                        </p>
                      )} */}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Link Type<span className="text-red-600">*</span>
                      </label>

                      <Select
                        styles={customStyles}
                        options={linkTypeOptions}
                        value={linkTypeOptions.find(
                          (item) => item.value === formik.values.link_type,
                        )}
                        onChange={(option) => {
                          formik.setFieldValue("link_type", option.value);

                          if (option.value === "NONE") {
                            formik.setFieldValue("link_target", "");
                          } else {
                            formik.setFieldValue("link_target", "");
                          }
                        }}
                      />

                      {formik.touched.link_type && formik.errors.link_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.link_type}
                        </p>
                      )}
                    </div>

                    {formik.values.link_type === "NONE" ||
                    formik.values.link_type === "" ? null : (
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          {formik.values.link_type === "INTERNAL"
                            ? "Post ID"
                            : "External URL"}

                          <span className="text-red-600">*</span>
                        </label>

                        {formik.values.link_type === "INTERNAL" ? (
                          <input
                            type="number"
                            name="link_target"
                            value={formik.values.link_target}
                            onKeyDown={blockOnlyNumericKeys}
                            onChange={(e) => {
                              const cleaned = sanitizePositiveInteger(
                                e.target.value,
                              );
                              formik.setFieldValue("link_target", cleaned);
                            }}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full"
                          />
                        ) : (
                          <input
                            type="text"
                            name="link_target"
                            value={formik.values.link_target}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="custom--input w-full"
                          />
                        )}

                        {formik.touched.link_target &&
                          formik.errors.link_target && (
                            <p className="text-red-500 text-sm mt-1">
                              {formik.errors.link_target}
                            </p>
                          )}
                      </div>
                    )}

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Position<span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="position"
                        value={formik.values.position}
                        onKeyDown={blockOnlyNumericKeys}
                        onChange={(e) => {
                          const cleaned = sanitizePositiveInteger(
                            e.target.value,
                          );
                          formik.setFieldValue("position", cleaned);
                        }}
                        onBlur={formik.handleBlur}
                        className="custom--input w-full"
                        placeholder="0"
                      />

                      {formik.touched.position && formik.errors.position && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.position}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Starts at <span className="text-red-600">*</span>
                      </label>

                      <div className="custom--date w-full">
                        <DatePicker
                          selected={formik.values.starts_at}
                          onChange={(date) => {
                            formik.setFieldValue("starts_at", date);

                            if (
                              formik.values.ends_at &&
                              date > formik.values.ends_at
                            ) {
                              formik.setFieldValue("ends_at", null);
                            }
                          }}
                          showTimeSelect
                          timeIntervals={30}
                          dateFormat="dd/MM/yyyy hh:mm aa"
                          placeholderText="Select Start Date"
                          className="custom--input w-full"
                          minDate={new Date()}
                          minTime={
                            formik.values.starts_at &&
                            new Date().toDateString() ===
                              formik.values.starts_at.toDateString()
                              ? new Date()
                              : new Date(0, 0, 0, 0, 0)
                          }
                          maxTime={new Date(0, 0, 0, 23, 59)}
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                        />
                      </div>

                      {formik.touched.starts_at && formik.errors.starts_at && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.starts_at}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Ends at <span className="text-red-600">*</span>
                      </label>
                      <div className="custom--date w-full">
                        <DatePicker
                          selected={formik.values.ends_at}
                          onChange={(date) =>
                            formik.setFieldValue("ends_at", date)
                          }
                          showTimeSelect
                          timeIntervals={30}
                          dateFormat="dd/MM/yyyy hh:mm aa"
                          placeholderText="Select End Date"
                          className="custom--input w-full"
                          minDate={formik.values.starts_at || new Date()}
                          minTime={
                            formik.values.starts_at &&
                            formik.values.ends_at &&
                            formik.values.starts_at.toDateString() ===
                              formik.values.ends_at.toDateString()
                              ? formik.values.starts_at
                              : new Date(0, 0, 0, 0, 0)
                          }
                          maxTime={new Date(0, 0, 0, 23, 59)}
                          onKeyDown={(e) => {
                            e.preventDefault();
                          }}
                        />
                      </div>

                      {formik.touched.ends_at && formik.errors.ends_at && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.ends_at}
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

export default AddNewBanner;
