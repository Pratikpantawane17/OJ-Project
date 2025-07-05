import React from 'react';

const ConfirmDeleteModal = ({ visible, onCancel, onConfirm, message = "Are you sure you want to delete this item?" }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#0d1117] border border-purple-600 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-semibold text-purple-400 mb-4">Confirm Deletion</h2>
        <p className="text-sm text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition hover:cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition hover:cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
