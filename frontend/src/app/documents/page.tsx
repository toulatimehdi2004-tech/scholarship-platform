"use client";

import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Camera,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchApi, uploadApi, getToken, getApiBaseUrl } from "@/lib/api";

interface DocumentItem {
  id: number;
  title: string;
  document_type: string;
  file_url: string;
  file_name: string;
  file_size: number;
  status: string;
  is_verified: boolean;
  created_at: string;
  scan_result?: {
    full_text: string;
    name: string;
    document_number: string;
    confidence_score: number;
  };
}

const docTypes = [
  { value: "passport", label: "Passport" },
  { value: "id_card", label: "ID Card" },
  { value: "transcript", label: "Academic Transcript" },
  { value: "diploma", label: "Diploma / Certificate" },
  { value: "recommendation", label: "Recommendation Letter" },
  { value: "motivation", label: "Motivation Letter" },
  { value: "cv", label: "CV / Resume" },
  { value: "translation", label: "Translation Document" },
  { value: "other", label: "Other" },
];

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("passport");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/auth/login");
      return;
    }
    loadDocuments();
  }, [router]);

  async function loadDocuments() {
    setLoading(true);
    const res = await fetchApi<DocumentItem[]>("/documents/");
    if (res.data) {
      setDocuments(Array.isArray(res.data) ? res.data : []);
    }
    setLoading(false);
  }

  function onFileChosen(file: File | null) {
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(null);
    setSelectedFile(file);
    if (!title.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]/g, " ")
        .trim();
      const formatted = cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : "";
      setTitle(formatted || docTypes.find((d) => d.value === selectedType)?.label || "Document");
    }
  }

  async function handleUpload(fileToUpload?: File | null) {
    const file = fileToUpload || selectedFile;
    if (!file) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const docTitle =
      title.trim() ||
      file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim() ||
      "Document";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", docTitle);
    formData.append("document_type", selectedType);

    try {
      const res = await uploadApi<DocumentItem>("/documents/", formData);

      if (res.data) {
        setUploadSuccess(`Document "${docTitle}" uploaded successfully!`);
        setTitle("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
        await loadDocuments();
        setTimeout(() => {
          setShowUpload(false);
          setUploadSuccess(null);
        }, 1200);
      } else {
        setUploadError(res.error || "Upload failed. Please check your file and try again.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please check your connection.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(id: number) {
    if (!confirm("Delete this document?")) return;
    try {
      await fetchApi("/documents/" + id + "/", { method: "DELETE" });
      loadDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  }

  function getFullFileUrl(url: string | null | undefined): string {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = getApiBaseUrl().replace(/\/api\/?$/, "");
    return `${base}${url.startsWith("/") ? url : "/" + url}`;
  }

  function formatSize(bytes: number) {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "processing":
        return <Clock className="w-4 h-4 text-amber-400 animate-pulse" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-cyan" />;
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
              My <span className="gradient-text">Documents</span>
            </h1>
            <p className="text-text-secondary">
              Upload, scan, and manage your scholarship documents
            </p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn-gradient text-sm px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </span>
          </button>
        </motion.div>

        {/* Upload Panel */}
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Upload Document
              </h3>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                  setUploadError(null);
                  setUploadSuccess(null);
                }}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., My Passport (auto-filled if empty)"
                  className="w-full glass rounded-xl py-3 px-4 text-text-primary placeholder:text-text-muted outline-none input-glow"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  Document Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full glass rounded-xl py-3 px-4 text-text-primary outline-none input-glow bg-transparent"
                >
                  {docTypes.map((dt) => (
                    <option key={dt.value} value={dt.value} className="bg-surface">
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedFile ? (
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-6 mb-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatSize(selectedFile.size)} • Ready to upload
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-3 py-2 rounded-xl text-xs text-text-muted hover:text-red-400 hover:bg-white/5 transition-all"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => handleUpload(selectedFile)}
                    className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-cyan/20 active:scale-95 transition-all flex-1 sm:flex-initial justify-center cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) onFileChosen(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-border-glass hover:border-cyan/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer p-8 sm:p-10 flex flex-col items-center gap-3 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan/20 to-purple/20 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-cyan" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    Drop files here or click to browse
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    PDF, JPG, PNG, DOC, DOCX — Max 10MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-purple hover:bg-purple/10 transition-all border border-border-glass mt-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Or scan with camera
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              onChange={(e) => onFileChosen(e.target.files?.[0] || null)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onFileChosen(e.target.files?.[0] || null)}
            />
          </motion.div>
        )}

        {/* Documents List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 h-48 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-20 mb-4" />
                <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                <div className="h-4 bg-white/10 rounded w-full" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-16 text-center"
          >
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg mb-2">
              No documents uploaded yet
            </p>
            <p className="text-text-muted text-sm mb-6">
              Upload your passport, transcripts, recommendation letters, and
              more. You can also scan documents directly with your camera.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-gradient text-sm px-6 py-2 rounded-xl"
            >
              <span>Upload First Document</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass rounded-2xl p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="flex items-center gap-2 text-xs font-semibold text-cyan bg-cyan/10 px-2 py-1 rounded-full">
                    {getStatusIcon(doc.status)}
                    {docTypes.find((d) => d.value === doc.document_type)
                      ?.label || doc.document_type}
                  </span>
                  {doc.is_verified && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-text-primary mb-2 line-clamp-1">
                  {doc.title}
                </h3>

                <div className="text-xs text-text-muted space-y-1 mb-4">
                  <p>{doc.file_name || "No filename"}</p>
                  <p>{formatSize(doc.file_size)}</p>
                  <p>
                    {new Date(doc.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {doc.scan_result && (
                  <div className="p-2 rounded-lg bg-white/5 text-xs text-text-secondary mb-3">
                    <p className="font-medium text-text-primary mb-1">
                      Extracted Info:
                    </p>
                    {doc.scan_result.name && <p>Name: {doc.scan_result.name}</p>}
                    {doc.scan_result.document_number && (
                      <p>Number: {doc.scan_result.document_number}</p>
                    )}
                    {doc.scan_result.confidence_score && (
                      <p>
                        Confidence:{" "}
                        {Math.round(
                          Number(doc.scan_result.confidence_score) * 100
                        )}
                        %
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-border-glass">
                  {doc.file_url && (
                    <a
                      href={getFullFileUrl(doc.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs text-cyan hover:bg-cyan/10 transition-all cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </a>
                  )}
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewDoc && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {previewDoc.title}
                </h3>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {previewDoc.file_url && (
                <iframe
                  src={getFullFileUrl(previewDoc.file_url)}
                  className="w-full h-96 rounded-lg"
                  title="Document preview"
                />
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
