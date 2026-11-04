import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FiX } from "react-icons/fi";
import CommentsSection from "./CommentsSection";

// z-[55] sits above the post details modal (z-50); the delete confirmation
// inside CommentsSection uses z-[60], so it stacks above this one.
const CommentsModal = ({ open, onClose, postId, onDeleted, postType }) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[55]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl rounded-xl bg-white shadow-xl overflow-hidden">
                <div className="flex items-center justify-between border-b p-5">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Comments
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close comments"
                    className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="p-5">
                  <CommentsSection
                    postId={postId}
                    open={open}
                    showHeader={false}
                    listClassName="max-h-[60vh]"
                    onDeleted={onDeleted}
                    postType={postType}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CommentsModal;