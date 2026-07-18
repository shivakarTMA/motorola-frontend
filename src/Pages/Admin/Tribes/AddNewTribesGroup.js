import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { customStyles } from "../../../Helper/helper";
import {
  blockOnlyTextKeys,
  sanitizeOnlyText,
  blockOnlyNumericKeys,
  sanitizePositiveInteger,
} from "../../../Helper/Inputhelpers";
import { authAxios } from "../../../Config/config";
import { RiImageAddLine } from "react-icons/ri";
// import { authAxios } from "../../../config/config";

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const AddNewTribesGroup = ({ open, onClose, onSuccess, editId }) => {
  const isEdit = !!editId;

  const [coverPreview, setCoverPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      position: "",
      status: null,
      image: null,
      icon: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),
      position: Yup.number()
        .typeError("Position must be a number")
        .positive("Position must be greater than 0")
        .integer("Position must be a whole number")
        .required("Position is required"),
      image: Yup.mixed()
        .required("Image is required")
        .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
          if (!value || typeof value === "string") return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),
      icon: Yup.mixed()
        .nullable()
        .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
          if (!value || typeof value === "string") return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),
      status: Yup.object().nullable().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          name: values.name,
          position: values.position,
          status: values.status?.value,
        };

        const formData = new FormData();

        formData.append("name", values.name);
        formData.append("position", values.position);
        formData.append("status", values.status?.value);
        
        if (values.image instanceof File) {
          formData.append("image", values.image);
        }

        if (values.icon instanceof File) {
          formData.append("icon", values.icon);
        }

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        if (isEdit) {
          await authAxios().put(`/tribe-group/${editId}`, formData, config);
          toast.success("Tribe Group Updated Successfully");
        } else {
          await authAxios().post("/tribe-group", formData, config);
          toast.success("Tribe Group Created Successfully");
        }

        onSuccess?.();
        resetForm();
        onClose();
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        toast.error(err.response?.data?.errors || "Something went wrong");
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

  // Build/revoke the icon image preview URL whenever the file changes
  useEffect(() => {
    if (!formik.values.icon) {
      setIconPreview(null);
      return;
    }

    if (typeof formik.values.icon === "string") {
      setIconPreview(formik.values.icon);
      return;
    }

    const url = URL.createObjectURL(formik.values.icon);
    setIconPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [formik.values.icon]);

  useEffect(() => {
    if (!editId) {
      formik.resetForm();
    }
  }, [editId]);

  useEffect(() => {
    const fetchTribesGroupById = async () => {
      if (!editId) return;

      try {
        const res = await authAxios().get(`/tribe-group/${editId}`);
        const data = res?.data?.data;

        if (res?.data?.success && data) {
          formik.setValues({
            name: data.name || "",
            position: data.position || "",
            image: data.image || null,
            icon: data.icon || null,
            status: data.status
              ? { value: data.status, label: data.status }
              : null,
          });
        }
      } catch (err) {
        console.error("Failed to load tribes group:", err);
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
                    Add New Tribe Group
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  {/* Image */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Image<span className="text-red-600">*</span>
                    </label>

                    {coverPreview && (
                      <div className="mb-2 relative w-full h-32 rounded overflow-hidden border">
                        <img
                          src={coverPreview}
                          alt="Image preview"
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
                        {formik.values.image.name}
                      </p>
                    )}

                    {formik.touched.image &&
                      formik.errors.image && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.image}
                        </p>
                      )}
                  </div>

                  {/* Icon Image */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Icon Image
                    </label>

                    {iconPreview && (
                      <div className="mb-2 relative w-16 h-16 rounded-full overflow-hidden border">
                        <img
                          src={iconPreview}
                          alt="Icon preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <label
                      htmlFor="icon"
                      className="block text-center cursor-pointer border border-gray-400 text-gray-400 rounded py-2 text-sm"
                    >
                      <span className="flex items-center gap-2 justify-center">
                        <RiImageAddLine />{" "}
                        {iconPreview
                          ? "REPLACE ICON IMAGE"
                          : "UPLOAD ICON IMAGE"}
                      </span>
                    </label>
                    <input
                      id="icon"
                      name="icon"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        formik.setFieldValue(
                          "icon",
                          e.target.files?.[0] || null,
                        )
                      }
                      onBlur={() => formik.setFieldTouched("icon", true)}
                    />

                    {formik.values.icon && (
                      <p className="text-xs text-black mt-1 truncate">
                        {formik.values.icon.name}
                      </p>
                    )}

                    {formik.touched.icon && formik.errors.icon && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.icon}
                      </p>
                    )}
                  </div>
                  {/* Name */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Name<span className="text-red-600">*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formik.values.name}
                      onKeyDown={blockOnlyTextKeys}
                      onChange={(e) => {
                        const cleaned = sanitizeOnlyText(e.target.value);
                        formik.setFieldValue("name", cleaned);
                      }}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                      placeholder="Enter name"
                    />

                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Position */}
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
                        const cleaned = sanitizePositiveInteger(e.target.value);
                        formik.setFieldValue("position", cleaned);
                      }}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full"
                      placeholder="Enter position"
                    />

                    {formik.touched.position && formik.errors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.position}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Status<span className="text-red-600">*</span>
                    </label>

                    <Select
                      name="status"
                      styles={customStyles}
                      options={statusOptions}
                      value={formik.values.status}
                      onChange={(option) =>
                        formik.setFieldValue("status", option)
                      }
                      onBlur={() => formik.setFieldTouched("status", true)}
                    />

                    {formik.touched.status && formik.errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.status}
                      </p>
                    )}
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

export default AddNewTribesGroup;
