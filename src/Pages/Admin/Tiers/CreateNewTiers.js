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
  sanitizeFreeText,
} from "../../../Helper/Inputhelpers";
import { RiImageAddLine } from "react-icons/ri";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authAxios } from "../../../Config/config";
// import { authAxios } from "../../../config/config";

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];
const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

const CreateNewTiers = ({ open, onClose, onSuccess, editId }) => {
  const [badgePreview, setBadgePreview] = useState(null);
  const isEdit = !!editId;

  const formik = useFormik({
    initialValues: {
      name: "",
      level: "",
      min_points: "",
      benefits: "",
      badge_icon: null,
      status: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),

      level: Yup.number()
        .typeError("Level must be a number")
        .required("Level is required"),

      min_points: Yup.number()
        .typeError("Minimum points must be a number")
        .required("Minimum points is required"),

      benefits: Yup.string().required("Benefits are required"),

      status: Yup.object().nullable().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        formData.append("name", values.name);
        formData.append("level", values.level);
        formData.append("min_points", values.min_points);
        formData.append("benefits", values.benefits);
        formData.append("status", values.status.value);

        if (values.badge_icon instanceof File) {
          formData.append("badge_icon", values.badge_icon);
        }

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        if (isEdit) {
          await authAxios().put(`/tier/${editId}`, formData, config);
          toast.success("Tier updated successfully");
        } else {
          await authAxios().post("/tier", formData, config);
          toast.success("Tier created successfully");
        }

        resetForm();
        setBadgePreview(null);
        onSuccess?.();
        onClose();
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong");
      }
    },
  });

  useEffect(() => {
    if (!editId) {
      formik.resetForm();
    }
  }, [editId]);

  useEffect(() => {
    if (!editId) return;
    const fetchKeywordById = async () => {
      try {
        const res = await authAxios().get(`/tier/${editId}`);
        const data = res?.data?.data;

        if (res?.data?.success && data) {
          formik.setValues({
            name: data.name || "",
            level: data.level || "",
            min_points: data.min_points || "",
            benefits: data.benefits || "",
            badge_icon: null, // keep null since this should be a File when uploading
            status:
              statusOptions.find((option) => option.value === data.status) ||
              null,
          });
          if (data.badge_icon) {
            setBadgePreview(data.badge_icon);
          }
        }
      } catch (err) {
        console.error("Failed to load staff:", err);
      }
    };

    fetchKeywordById();
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
                    Add New Tier
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
                  <div className="grid lg:grid-cols-2 gap-3 grid-cols-1">
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Name <span className="text-red-600">*</span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onKeyDown={blockOnlyTextKeys}
                        onChange={(e) =>
                          formik.setFieldValue(
                            "name",
                            sanitizeOnlyText(e.target.value),
                          )
                        }
                        className="custom--input w-full"
                        placeholder="Enter Tier Name"
                      />

                      {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Level <span className="text-red-600">*</span>
                      </label>

                      <input
                        type="number"
                        name="level"
                        value={formik.values.level}
                        onKeyDown={blockOnlyNumericKeys}
                        onChange={(e) =>
                          formik.setFieldValue(
                            "level",
                            sanitizePositiveInteger(e.target.value),
                          )
                        }
                        className="custom--input w-full"
                        placeholder="Enter Level"
                      />

                      {formik.touched.level && formik.errors.level && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.level}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Minimum Points <span className="text-red-600">*</span>
                      </label>

                      <input
                        type="number"
                        name="min_points"
                        value={formik.values.min_points}
                        onKeyDown={blockOnlyNumericKeys}
                        onChange={(e) =>
                          formik.setFieldValue(
                            "min_points",
                            sanitizePositiveInteger(e.target.value),
                          )
                        }
                        className="custom--input w-full"
                        placeholder="Enter Minimum Points"
                      />

                      {formik.touched.min_points &&
                        formik.errors.min_points && (
                          <p className="text-red-500 text-sm">
                            {formik.errors.min_points}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Status <span className="text-red-600">*</span>
                      </label>

                      <Select
                        styles={customStyles}
                        options={statusOptions}
                        value={formik.values.status}
                        onChange={(option) =>
                          formik.setFieldValue("status", option)
                        }
                      />

                      {formik.touched.status && formik.errors.status && (
                        <p className="text-red-500 text-sm">
                          {formik.errors.status}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Benefits <span className="text-red-600">*</span>
                    </label>

                    <textarea
                      rows={3}
                      name="benefits"
                      value={formik.values.benefits}
                      onChange={(e) => {
                        const cleaned = sanitizeFreeText(e.target.value);
                        formik.setFieldValue("benefits", cleaned);
                      }}
                      className="custom--input w-full resize-none"
                      placeholder="Free shipping, 5% discount"
                    />

                    {formik.touched.benefits && formik.errors.benefits && (
                      <p className="text-red-500 text-sm">
                        {formik.errors.benefits}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Badge Icon
                    </label>

                    <label className="border-2 border-dashed rounded-lg py-2 flex flex-col items-center justify-center cursor-pointer">
                      {badgePreview ? (
                        <img
                          src={badgePreview}
                          alt="badge"
                          className="h-[70px] w-[70px] object-contain rounded-lg"
                        />
                      ) : (
                        <>
                          <RiImageAddLine size={40} />
                          <p className="text-sm mt-2">Upload Badge Icon</p>
                        </>
                      )}

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files[0];

                          if (!file) return;

                          if (!allowedTypes.includes(file.type)) {
                            toast.error(
                              "Only JPG, JPEG and PNG files are allowed.",
                            );
                            e.target.value = "";
                            formik.setFieldValue("badge_icon", null);
                            setBadgePreview(null);
                            return;
                          }

                          formik.setFieldValue("badge_icon", file);
                          setBadgePreview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="custom--btn !bg-white !text-black border !border-black"
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

export default CreateNewTiers;
