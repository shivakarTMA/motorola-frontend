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
// import { authAxios } from "../../../config/config";

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const AddNewCircle = ({ open, onClose, groups = [], onSuccess }) => {
  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: group.name,
  }));

  // Object URLs for live image previews. Kept in separate state (not
  // formik) since these are derived/display-only and must be revoked
  // on change/unmount to avoid leaking memory.
  const [coverPreview, setCoverPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      circleGroup: null,
      bio: "",
      cover_image: null,
      icon_image: null,
      position: "",
      status: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Name is required"),
      circleGroup: Yup.object().nullable().required("Tribes is required"),
      bio: Yup.string().trim().required("Bio is required"),
      position: Yup.number()
        .typeError("Position must be a number")
        .required("Position is required"),
      cover_image: Yup.mixed()
        .required("Image is required")
        .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
          if (!value || typeof value === "string") return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),
      icon_image: Yup.mixed()
        .nullable()
        .test("fileType", "Only JPG, PNG, or WEBP allowed", (value) => {
          if (!value || typeof value === "string") return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(value.type);
        }),
      status: Yup.string().trim().required("Status is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        formData.append("name", sanitizeOnlyText(values.name));
        formData.append("circle_group_id", values.circleGroup?.value); // changed
        formData.append("bio", sanitizeFreeText(values.bio));
        formData.append("position", values.position);
        formData.append("status", values.status);

        formData.append("cover_image", values.cover_image);

        if (values.icon_image) {
          formData.append("icon_image", values.icon_image);
        }

        // await authAxios().post("/circle/create", formData, {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // });

        toast.success("Sub-Tribes Created Successfully");
        onSuccess?.();
        resetForm();
        onClose();
      } catch (err) {
        console.error(err.response?.data || err.message);
        toast.error(err.response?.data?.errors || "Something went wrong");
      }
    },
  });

  // Build/revoke the cover image preview URL whenever the file changes
  useEffect(() => {
    if (!formik.values.cover_image) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(formik.values.cover_image);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formik.values.cover_image]);

  // Build/revoke the icon image preview URL whenever the file changes
  useEffect(() => {
    if (!formik.values.icon_image) {
      setIconPreview(null);
      return;
    }
    const url = URL.createObjectURL(formik.values.icon_image);
    setIconPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formik.values.icon_image]);

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
                    Add New Sub-Tribes
                  </Dialog.Title>
                </div>

                <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
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
                      placeholder="Name"
                    />

                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* Circle Group */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Select Tribes<span className="text-red-600">*</span>
                    </label>
                    <Select
                      name="circleGroup"
                      styles={customStyles}
                      options={groupOptions}
                      value={formik.values.circleGroup}
                      onChange={(option) =>
                        formik.setFieldValue("circleGroup", option)
                      }
                      onBlur={() => formik.setFieldTouched("circleGroup", true)}
                      placeholder="Select Tribes"
                    />

                    {formik.touched.circleGroup &&
                      formik.errors.circleGroup && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.circleGroup}
                        </p>
                      )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Bio<span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formik.values.bio}
                      onChange={(e) => {
                        const cleaned = sanitizeFreeText(e.target.value);
                        formik.setFieldValue("bio", cleaned);
                      }}
                      onBlur={formik.handleBlur}
                      className="custom--input w-full resize-none"
                      placeholder="Bio"
                    />

                    {formik.touched.bio && formik.errors.bio && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.bio}
                      </p>
                    )}
                  </div>

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
                      htmlFor="cover_image"
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
                      id="cover_image"
                      name="cover_image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden "
                      onChange={(e) =>
                        formik.setFieldValue(
                          "cover_image",
                          e.target.files?.[0] || null,
                        )
                      }
                      onBlur={() => formik.setFieldTouched("cover_image", true)}
                    />

                    {formik.values.cover_image && (
                      <p className="text-xs text-black mt-1 truncate">
                        {formik.values.cover_image.name}
                      </p>
                    )}

                    {formik.touched.cover_image &&
                      formik.errors.cover_image && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.cover_image}
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
                      htmlFor="icon_image"
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
                      id="icon_image"
                      name="icon_image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        formik.setFieldValue(
                          "icon_image",
                          e.target.files?.[0] || null,
                        )
                      }
                      onBlur={() => formik.setFieldTouched("icon_image", true)}
                    />

                    {formik.values.icon_image && (
                      <p className="text-xs text-black mt-1 truncate">
                        {formik.values.icon_image.name}
                      </p>
                    )}

                    {formik.touched.icon_image && formik.errors.icon_image && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.icon_image}
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
                      placeholder="0"
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
                      className="px-5 py-2 rounded-lg border"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="custom--btn disabled:opacity-60"
                    >
                      Save Circle
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

export default AddNewCircle;
