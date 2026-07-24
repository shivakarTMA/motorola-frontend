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

const TopPicsView = ({ open, onClose, onSuccess, editId, rowData }) => {
  const isEdit = !!editId;
  const [coverPreview, setCoverPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  console.log(rowData,'rowData')

  const formik = useFormik({
    initialValues: {
      media: null,
      position: "",
    },
    validationSchema: Yup.object({
      media: Yup.mixed()
        .required("Image is required")
        .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
          if (!value || typeof value === "string") return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),

      position: Yup.number()
        .typeError("Position must be a number")
        .required("Position is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        formData.append("position", values.position);

        if (values.media instanceof File) {
          formData.append("media", values.media);
        }

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        if (isEdit) {
          await authAxios().put(`/top-pick/${editId}`, formData, config);
          toast.success("Top Pics updated successfully");
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
    if (!formik.values.media) {
      setCoverPreview(null);
      return;
    }

    if (typeof formik.values.media === "string") {
      setCoverPreview(formik.values.media);
      return;
    }

    const url = URL.createObjectURL(formik.values.media);
    setCoverPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [formik.values.media]);

  useEffect(() => {
    if (!editId) {
      formik.resetForm();
    }
  }, [editId]);

  useEffect(() => {
    if (!rowData) return;

    formik.setValues({
      media: rowData.post?.media?.[0]?.media || null,
      position: rowData.position || "",
    });
  }, [rowData]);

  const hasMedia =
    typeof formik.values.media === "string" && formik.values.media.length > 0;

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
                    Edit Top Pics
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  {/* Cover Image */}
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
                      htmlFor={!hasMedia ? "image" : ""}
                      className={`block text-center border rounded py-2 text-sm
                        ${
                        hasMedia
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "cursor-pointer border-gray-400 text-gray-400"
                        }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <RiImageAddLine />
                        {hasMedia ? "IMAGE ALREADY ADDED" : "UPLOAD IMAGE"}
                      </span>
                    </label>
                    <input
                      id="image"
                      type="file"
                      disabled={hasMedia}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        formik.setFieldValue(
                          "media",
                          e.target.files?.[0] || null,
                        )
                      }
                    />

                    {/* {formik.values.media && (
                      <p className="text-xs text-black mt-1 truncate">
                        {typeof formik.values.media === "string"
                          ? "Current Image"
                          : formik.values.media.name}
                      </p>
                    )} */}

                    {formik.touched.media && formik.errors.media && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.media}
                      </p>
                    )}
                  </div>

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
                      placeholder="0"
                    />

                    {formik.touched.position && formik.errors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.position}
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

export default TopPicsView;
