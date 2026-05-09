'use client'

import { useState, useRef } from "react";
import api from "@/lib/api";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const MAX_SIZE_MB = 10;

function FileIcon({ type }) {
  if (IMAGE_TYPES.includes(type)) {
    return (
      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type === "application/pdf") {
    return (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TaskAttachments({ taskId, attachments = [], onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const oversized = files.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setUploadError(`"${oversized.name}" exceeds the ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("attachments", f));

      const { data } = await api.post(`/api/tasks/${taskId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdate?.(data.task?.attachments || []);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (attachmentId) => {
    setDeletingId(attachmentId);
    try {
      const { data } = await api.delete(`/api/tasks/${taskId}/attachments/${attachmentId}`);
      onUpdate?.(data.task?.attachments || []);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Could not delete attachment.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          uploading
            ? "border-violet-300 bg-violet-50 dark:bg-violet-900/10 cursor-wait"
            : "border-gray-300 dark:border-gray-600 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop files here or <span className="text-violet-600 dark:text-violet-400">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Max {MAX_SIZE_MB}MB per file · Images, PDFs, Docs, Zip</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {uploadError && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {attachments.length} Attachment{attachments.length !== 1 ? "s" : ""}
          </p>
          {attachments.map((att) => {
            const isImage = IMAGE_TYPES.includes(att.mimetype);
            const isDeleting = deletingId === att._id;

            return (
              <div
                key={att._id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                {/* Thumbnail or icon */}
                {isImage ? (
                  <button
                    onClick={() => setPreview(att)}
                    className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity"
                  >
                    <img src={att.url} alt={att.filename} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <FileIcon type={att.mimetype} />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{att.filename}</p>
                  <p className="text-xs text-gray-400">{formatBytes(att.size)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.filename}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleDelete(att._id)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={preview.url}
              alt={preview.filename}
              className="w-full h-full object-contain rounded-xl"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-white/80 text-sm">{preview.filename}</p>
              <a
                href={preview.url}
                download={preview.filename}
                className="text-sm text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}