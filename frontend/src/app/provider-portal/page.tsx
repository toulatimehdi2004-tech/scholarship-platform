"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck2,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Languages,
  DollarSign,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Send,
  Sparkles,
  Tag,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { fetchApi, getApiBaseUrl } from "@/lib/api";

interface OrderDocument {
  id: number;
  title: string;
  file_name: string;
  file_url: string | null;
  file_size: number;
  status: string;
}

interface ServiceOrder {
  id: number;
  service: number;
  service_name: string;
  provider_name: string;
  student: number;
  student_username: string;
  student_name: string;
  student_country: string;
  quantity: number;
  total_amount: string;
  commission_amount: string;
  provider_payout: string;
  currency: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  requested_date: string | null;
  notes: string | null;
  documents: OrderDocument[];
  created_at: string;
}

export default function ProviderPortalPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "workbench" | "services">("orders");
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // Delivery Modal state
  const [deliveryOrder, setDeliveryOrder] = useState<ServiceOrder | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveredSuccess, setDeliveredSuccess] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetchApi<ServiceOrder[]>("/service-orders/");
      if (res.data && Array.isArray(res.data)) {
        setOrders(res.data);
        if (res.data.length > 0) setSelectedOrder(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load provider orders:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: number, newStatus: string) {
    try {
      await fetchApi<ServiceOrder>(`/service-orders/${orderId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  function handleDeliverTranslation(order: ServiceOrder) {
    updateOrderStatus(order.id, "completed");
    setDeliveredSuccess(true);
    setTimeout(() => {
      setDeliveryOrder(null);
      setDeliveredSuccess(false);
      setDeliveryNote("");
    }, 2000);
  }

  function getFullFileUrl(url: string | null | undefined): string {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = getApiBaseUrl().replace(/\/api\/?$/, "");
    return `${base}${url.startsWith("/") ? url : "/" + url}`;
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.notes || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const inProgressCount = orders.filter((o) => o.status === "in_progress").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Top Banner Navigation & Portal Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-glass">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple/15 border border-purple/30 text-purple text-xs font-mono font-bold uppercase mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            Certified Service Provider Desk (Translation & Notarization)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary">
            Moroccan Scholar Sworn Translation Bureau
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Process student document translation orders, inspect source diplomas & deliver certified Chinese translations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            onClick={() => {
              try {
                localStorage.setItem("portal_role", "student");
              } catch {}
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold glass hover:bg-white/10 text-cyan flex items-center gap-1.5 transition-all"
          >
            <span>⇄ Switch to Student View</span>
          </Link>
          <Link
            href="/university-portal"
            onClick={() => {
              try {
                localStorage.setItem("portal_role", "university");
              } catch {}
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold glass hover:bg-white/10 text-amber-300 flex items-center gap-1.5 transition-all"
          >
            <span>🏛️ University Portal</span>
          </Link>
        </div>
      </div>

      {/* Provider Bureau Overview Metrics */}
      <div className="glass rounded-3xl p-6 sm:p-8 mb-8 border border-purple/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple via-pink-500 to-red-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple/20 flex-shrink-0">
              <Languages className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple uppercase tracking-wider font-mono">
                  Official Provider
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Certified Sworn Bureau
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                Sworn Arabic • French • English to Chinese Translation
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Official Red Seal Certification for Chinese Embassy, CSC Scholarships & Universities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary">
              ⭐ 4.9 Rating (128 Reviews)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
              Turnaround: 24-48 Hours
            </span>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-white/10">
          <div className="glass rounded-2xl p-4 border border-border-glass">
            <p className="text-xs text-text-muted mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan" /> Total Orders
            </p>
            <p className="text-2xl font-black text-text-primary">{orders.length}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-amber-500/20">
            <p className="text-xs text-amber-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Review
            </p>
            <p className="text-2xl font-black text-amber-400">{pendingCount}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-blue-500/20">
            <p className="text-xs text-blue-300 mb-1 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-blue-400" /> In Translation
            </p>
            <p className="text-2xl font-black text-blue-400">{inProgressCount}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-emerald-500/20">
            <p className="text-xs text-emerald-300 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Delivered & Certified
            </p>
            <p className="text-2xl font-black text-emerald-400">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-glass mb-6 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "orders"
              ? "bg-purple/20 text-purple border border-purple/40 shadow-md shadow-purple/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Student Orders Queue ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("workbench")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "workbench"
              ? "bg-purple/20 text-purple border border-purple/40 shadow-md shadow-purple/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Document Workbench</span>
        </button>

        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "services"
              ? "bg-purple/20 text-purple border border-purple/40 shadow-md shadow-purple/20"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Services & Rates Catalog</span>
        </button>
      </div>

      {/* ── TAB 1: STUDENT ORDERS QUEUE ── */}
      {activeTab === "orders" && (
        <div>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 max-w-md w-full border border-border-glass">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by student name, service or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Orders" },
                { id: "pending", label: "Pending" },
                { id: "in_progress", label: "In Translation" },
                { id: "completed", label: "Completed" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st.id
                      ? "bg-purple text-white font-bold"
                      : "glass text-text-muted hover:text-text-primary"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 h-48 animate-pulse" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <FileCheck2 className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <h4 className="text-base font-bold text-text-primary mb-1">No orders found</h4>
              <p className="text-xs text-text-muted">No student document orders match current filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((ord) => {
                const isCompleted = ord.status === "completed";
                const isInProgress = ord.status === "in_progress";
                const isPending = ord.status === "pending";

                return (
                  <motion.div
                    key={ord.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-5 border border-border-glass hover:border-purple/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Order # & Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold font-mono text-purple">
                              Order #{ord.id}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              • {ord.requested_date || "Oct 2026"}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-text-primary">
                            {ord.service_name}
                          </h3>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            isCompleted
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : isInProgress
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {ord.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Student info */}
                      <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple/20 text-purple font-bold flex items-center justify-center text-xs">
                            {ord.student_name[0] || "S"}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary">{ord.student_name}</p>
                            <p className="text-[11px] text-text-muted">📍 {ord.student_country}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-emerald-400">
                            ${ord.total_amount}
                          </span>
                          <p className="text-[10px] text-text-muted">Payout: ${ord.provider_payout}</p>
                        </div>
                      </div>

                      {/* Student Notes */}
                      {ord.notes && (
                        <p className="text-xs text-text-secondary italic mb-3">
                          "{ord.notes}"
                        </p>
                      )}

                      {/* Attached Documents */}
                      {ord.documents && ord.documents.length > 0 && (
                        <div className="mb-3 space-y-1.5">
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                            Uploaded Student File:
                          </p>
                          {ord.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
                                <span className="truncate font-mono">{doc.file_name}</span>
                              </div>
                              {doc.file_url && (
                                <a
                                  href={getFullFileUrl(doc.file_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-bold text-cyan hover:underline flex items-center gap-1 flex-shrink-0 ml-2"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View File</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setActiveTab("workbench");
                        }}
                        className="text-xs font-semibold text-cyan hover:underline flex items-center gap-1"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Open Workbench</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, "in_progress")}
                            className="px-3 py-1.5 rounded-xl text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold transition-all"
                          >
                            Accept & Start
                          </button>
                        )}

                        {!isCompleted && (
                          <button
                            onClick={() => setDeliveryOrder(ord)}
                            className="px-3.5 py-1.5 rounded-xl text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Deliver Translation</span>
                          </button>
                        )}

                        {isCompleted && (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: DOCUMENT WORKBENCH ── */}
      {activeTab === "workbench" && selectedOrder && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Source Document Inspection */}
            <div className="glass rounded-3xl p-6 sm:p-8 border border-border-glass">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono text-purple font-bold">
                    Order #{selectedOrder.id} • {selectedOrder.student_name}
                  </span>
                  <h3 className="text-lg font-bold text-text-primary">Source Document Inspection</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
                  {selectedOrder.student_country}
                </span>
              </div>

              {selectedOrder.documents && selectedOrder.documents.length > 0 && selectedOrder.documents[0].file_url ? (
                <div className="rounded-2xl overflow-hidden border border-border-glass bg-black/40 h-[460px]">
                  <iframe
                    src={getFullFileUrl(selectedOrder.documents[0].file_url)}
                    className="w-full h-full"
                    title="Student document preview"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-xs text-text-muted">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-cyan" />
                  <p>Document: {selectedOrder.service_name}</p>
                  <p className="mt-1">Uploaded for translation from English/French to Chinese.</p>
                </div>
              )}

              <div className="mt-4 p-3 rounded-xl bg-white/5 text-xs text-text-secondary">
                <p>
                  <strong>Translator Instruction:</strong> {selectedOrder.notes || "Official translation for CSC scholarship submission."}
                </p>
              </div>
            </div>

            {/* Right: Translation Certificate & Delivery Form */}
            <div className="glass rounded-3xl p-6 sm:p-8 border border-purple/30">
              <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Certification & Delivery Desk</span>
              </h3>
              <p className="text-xs text-text-muted mb-6">
                Affix your certified sworn translator stamp and deliver the translated Chinese document to the candidate.
              </p>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-text-secondary mb-1 block">
                    Target Language Certification
                  </label>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <span className="font-bold text-text-primary">Mandarin Chinese (简体中文)</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Standard HSK 6
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-text-secondary mb-1 block">
                    Sworn Translator Statement & Seal
                  </label>
                  <textarea
                    rows={4}
                    defaultValue="This is to certify that the attached document is a true, accurate, and faithful translation of the original academic transcript from French/English into Chinese, prepared by Moroccan Scholar Certified Translation Bureau."
                    className="w-full glass rounded-xl p-3 text-xs text-text-primary outline-none border border-border-glass leading-relaxed"
                  />
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-purple/40 bg-purple/5 text-center">
                  <Upload className="w-8 h-8 text-purple mx-auto mb-2" />
                  <p className="font-bold text-text-primary">Upload Certified Translation (PDF)</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Drag & drop stamped Chinese translation with red seal
                  </p>
                  <button
                    type="button"
                    onClick={() => alert("Select certified translation PDF file")}
                    className="mt-3 px-4 py-2 rounded-xl text-xs bg-purple/20 hover:bg-purple/30 text-purple font-bold transition-all"
                  >
                    Select File
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeliverTranslation(selectedOrder)}
                  className="w-full btn-gradient py-3 rounded-xl text-xs font-bold text-text-primary flex items-center justify-center gap-2 shadow-lg shadow-purple/20 active:scale-95 transition-all cursor-pointer mt-4"
                >
                  <Send className="w-4 h-4" />
                  <span>Certify & Mark Order Completed</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 3: SERVICES & RATES CATALOG ── */}
      {activeTab === "services" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-4xl border border-border-glass">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Official Translation & Verification Services Catalog
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Manage your offered translation languages, legal authentication rates, and delivery timeframes.
            </p>

            <div className="space-y-4">
              {[
                {
                  name: "Academic Transcript Sworn Translation (Arabic/FR to Chinese)",
                  price: "$35.00",
                  turnaround: "24-48 Hours",
                  active: true,
                  desc: "Certified sworn translation of university semester grades with official red seal stamp.",
                },
                {
                  name: "Degree & Diploma Embassy Legalization Prep",
                  price: "$65.00",
                  turnaround: "3-4 Days",
                  active: true,
                  desc: "Pre-check, sworn notarization and authentication formatting for Chinese Embassy visa submission.",
                },
                {
                  name: "Motivation Letter & Recommendation Translation (Chinese)",
                  price: "$25.00",
                  turnaround: "24 Hours",
                  active: true,
                  desc: "Professional academic translation of recommendation letters and personal statements into Mandarin.",
                },
                {
                  name: "Medical Examination Foreigner Form Translation",
                  price: "$20.00",
                  turnaround: "12-24 Hours",
                  active: true,
                  desc: "Bilingual English-Chinese translation of official physical examination reports.",
                },
              ].map((srv, idx) => (
                <div
                  key={idx}
                  className="glass rounded-2xl p-5 border border-border-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 mr-2">
                      Active Service
                    </span>
                    <h4 className="text-sm font-bold text-text-primary mt-1 mb-0.5">{srv.name}</h4>
                    <p className="text-xs text-text-muted">{srv.desc}</p>
                    <p className="text-[11px] text-text-secondary mt-1">
                      Turnaround time: <strong>{srv.turnaround}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-base font-extrabold text-emerald-400">{srv.price}</span>
                    <button
                      type="button"
                      onClick={() => alert(`Edit rates for: ${srv.name}`)}
                      className="px-3 py-1.5 rounded-xl text-xs glass hover:bg-white/10 text-cyan transition-all"
                    >
                      Edit Rate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── DELIVERY MODAL ── */}
      <AnimatePresence>
        {deliveryOrder && (
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setDeliveryOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple/40 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Deliver Certified Translation
              </h3>
              <p className="text-xs text-text-muted mb-4">
                Order #{deliveryOrder.id} for <strong>{deliveryOrder.student_name}</strong>
              </p>

              {deliveredSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
                  Translation delivered and certified successfully!
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary mb-1 block">
                      Translator Delivery Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="e.g., Certified translation complete with sworn red seal. Ready for submission."
                      className="w-full glass rounded-xl p-3 text-xs text-text-primary outline-none border border-border-glass"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryOrder(null)}
                      className="px-4 py-2 rounded-xl text-xs text-text-muted hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeliverTranslation(deliveryOrder)}
                      className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-bold text-text-primary flex items-center gap-2 shadow-lg shadow-purple/20"
                    >
                      <Send className="w-4 h-4" />
                      <span>Confirm Delivery</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
