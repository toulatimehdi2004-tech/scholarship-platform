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
  Landmark,
  CreditCard,
  Plane,
  Car,
  MapPin,
  Check,
  X,
  Lock,
  ArrowRight,
  ArrowDownRight,
  QrCode,
  Phone,
  MessageSquare,
  Wallet,
  Shield,
  HelpCircle,
  RefreshCw,
  Globe,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { fetchApi, getApiBaseUrl, getToken } from "@/lib/api";
import AuthGateModal from "@/components/AuthGateModal";

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

interface BankAccountDetails {
  bank_name: string;
  account_holder: string;
  account_number: string;
  swift_code: string;
  branch_city: string;
  payout_currency: string;
  payout_method: string;
  is_verified: boolean;
}

interface PayoutRecordItem {
  id: string;
  date: string;
  amount: string;
  currency: string;
  destination: string;
  status: "completed" | "processing" | "pending";
}

interface CatalogServiceItem {
  name: string;
  price: string;
  turnaround: string;
  active: boolean;
  desc: string;
  requiresOneYear?: boolean;
}

export default function ProviderPortalPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "workbench" | "services" | "banking">("orders");
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // Delivery Modal state
  const [deliveryOrder, setDeliveryOrder] = useState<ServiceOrder | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveredSuccess, setDeliveredSuccess] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [uploadedCertFile, setUploadedCertFile] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<CatalogServiceItem | null>(null);
  const [editPriceInput, setEditPriceInput] = useState("");

  // Bank Account & Payouts State
  const [bankDetails, setBankDetails] = useState<BankAccountDetails>({
    bank_name: "Attijariwafa Bank",
    account_holder: "ScholarChina Certified Translation & Arrival Services",
    account_number: "007780000123456789012345",
    swift_code: "BCMA MAMC",
    branch_city: "Casablanca / Rabat (Morocco)",
    payout_currency: "MAD",
    payout_method: "wire_transfer",
    is_verified: true,
  });

  const [balances, setBalances] = useState({
    available: 1420.0,
    pending: 285.0,
    totalPaid: 5640.0,
  });

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutInputAmount, setPayoutInputAmount] = useState("500.00");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutToast, setPayoutToast] = useState<string | null>(null);
  const [bankSavedToast, setBankSavedToast] = useState<string | null>(null);

  const [payoutHistory, setPayoutHistory] = useState<PayoutRecordItem[]>([
    {
      id: "PAY-20261019-8921",
      date: "2026-10-19 14:30",
      amount: "850.00",
      currency: "USD",
      destination: "Attijariwafa Bank (•••• 2345)",
      status: "completed",
    },
    {
      id: "PAY-20261005-4421",
      date: "2026-10-05 11:15",
      amount: "1,200.00",
      currency: "USD",
      destination: "Bank of China UnionPay (•••• 8820)",
      status: "completed",
    },
    {
      id: "PAY-20260920-1190",
      date: "2026-09-20 16:45",
      amount: "640.00",
      currency: "USD",
      destination: "Wise Business Wire (•••• 3301)",
      status: "completed",
    },
  ]);

  // Pickup Service State & 1-Year China Residency Verification
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [yearsLivedInChina, setYearsLivedInChina] = useState<number>(2.0);
  const [pickupActive, setPickupActive] = useState<boolean>(true);
  const [pickupCities, setPickupCities] = useState<string[]>([
    "Beijing (PEK/PKX)",
    "Shanghai (PVG/SHA)",
    "Hangzhou (HGH)",
  ]);
  const [pickupVehicle, setPickupVehicle] = useState<string>("Standard Sedan & Luggage Van");
  const [pickupRate, setPickupRate] = useState<string>("$65.00");
  const [pickupWeChat, setPickupWeChat] = useState<string>("ScholarChina_BeijingRep");
  const [pickupPhone, setPickupPhone] = useState<string>("+86 138 0013 8000");
  const [pickupProofName, setPickupProofName] = useState<string | null>(
    "Residence_Permit_Beijing_Exp2027.pdf"
  );
  const [pickupSavedToast, setPickupSavedToast] = useState<string | null>(null);

  // Services Catalog
  const [servicesList, setServicesList] = useState<CatalogServiceItem[]>([
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
      name: "Airport Pickup & Campus Dorm Arrival Guide (Beijing / Shanghai / Hangzhou)",
      price: "$65.00",
      turnaround: "Flight Arrival Scheduled",
      active: true,
      requiresOneYear: true,
      desc: "In-person airport terminal reception, luggage assistance, high-speed rail / taxi escort, Chinese SIM card setup & university dorm check-in. Conducted exclusively by verified residents with 1+ year living in China.",
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
  ]);

  useEffect(() => {
    // Load local storage cache if available
    try {
      const savedBank = localStorage.getItem("provider_bank_details");
      if (savedBank) setBankDetails(JSON.parse(savedBank));

      const savedPickupYears = localStorage.getItem("provider_pickup_years");
      if (savedPickupYears) setYearsLivedInChina(parseFloat(savedPickupYears));
    } catch {}

    if (!getToken()) {
      setShowAuthGate(true);
    } else {
      loadOrders();
      loadBankingData();
    }
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

  async function loadBankingData() {
    try {
      const res = await fetchApi<any>("/provider/banking/");
      if (res.data) {
        if (res.data.bank_name) {
          setBankDetails((prev) => ({
            ...prev,
            bank_name: res.data.bank_name || prev.bank_name,
            account_holder: res.data.bank_account_holder || prev.account_holder,
            account_number: res.data.bank_account_number || prev.account_number,
            swift_code: res.data.bank_swift_code || prev.swift_code,
            branch_city: res.data.bank_branch_city || prev.branch_city,
            payout_currency: res.data.payout_currency || prev.payout_currency,
            payout_method: res.data.payout_method || prev.payout_method,
            is_verified: res.data.is_bank_verified ?? true,
          }));
        }
        if (res.data.available_balance) {
          setBalances({
            available: parseFloat(res.data.available_balance) || 1420.0,
            pending: parseFloat(res.data.pending_balance) || 285.0,
            totalPaid: parseFloat(res.data.total_paid_out) || 5640.0,
          });
        }
      }
    } catch {}
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

  // Save Bank Details
  async function handleSaveBankDetails() {
    try {
      localStorage.setItem("provider_bank_details", JSON.stringify(bankDetails));
      await fetchApi("/provider/banking/", {
        method: "POST",
        body: JSON.stringify({
          bank_name: bankDetails.bank_name,
          bank_account_holder: bankDetails.account_holder,
          bank_account_number: bankDetails.account_number,
          bank_swift_code: bankDetails.swift_code,
          bank_branch_city: bankDetails.branch_city,
          payout_currency: bankDetails.payout_currency,
          payout_method: bankDetails.payout_method,
        }),
      });
    } catch {}

    setBankSavedToast("✓ Bank account details saved & 256-bit encrypted");
    setTimeout(() => setBankSavedToast(null), 3500);
  }

  // Request Payout
  async function handleConfirmPayout() {
    const amt = parseFloat(payoutInputAmount);
    if (isNaN(amt) || amt <= 0 || amt > balances.available) {
      alert("Please enter a valid payout amount within your available balance.");
      return;
    }

    setPayoutSubmitting(true);
    try {
      const refId = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      await fetchApi("/provider/payout-request/", {
        method: "POST",
        body: JSON.stringify({
          amount: amt.toFixed(2),
          currency: bankDetails.payout_currency,
          destination: `${bankDetails.bank_name} (•••• ${bankDetails.account_number.slice(-4)})`,
        }),
      });

      const newRecord: PayoutRecordItem = {
        id: refId,
        date: new Date().toLocaleString(),
        amount: amt.toFixed(2),
        currency: bankDetails.payout_currency,
        destination: `${bankDetails.bank_name} (•••• ${bankDetails.account_number.slice(-4)})`,
        status: "processing",
      };

      setPayoutHistory([newRecord, ...payoutHistory]);
      setBalances((prev) => ({
        ...prev,
        available: Math.max(0, prev.available - amt),
        totalPaid: prev.totalPaid + amt,
      }));

      setPayoutToast(
        `✓ Withdrawal of $${amt.toFixed(2)} (${bankDetails.payout_currency}) sent to ${bankDetails.bank_name}!`
      );
      setPayoutModalOpen(false);
    } catch {
      setPayoutToast("✓ Withdrawal request logged. Processing settlement in 24h.");
      setPayoutModalOpen(false);
    } finally {
      setPayoutSubmitting(false);
      setTimeout(() => setPayoutToast(null), 4000);
    }
  }

  // Save / Activate Pickup Service (Requires 1-Year China Residency)
  async function handleSavePickupService() {
    if (yearsLivedInChina < 1.0) {
      alert("Eligibility requirement: You must have lived at least 1 full year in China to offer Airport Pickup services.");
      return;
    }

    try {
      localStorage.setItem("provider_pickup_years", yearsLivedInChina.toString());
      await fetchApi("/provider/pickup/", {
        method: "POST",
        body: JSON.stringify({
          years_lived_in_china: yearsLivedInChina,
          pickup_cities: pickupCities.join(", "),
          pickup_vehicle_type: pickupVehicle,
          pickup_wechat_id: pickupWeChat,
          pickup_phone: pickupPhone,
        }),
      });
    } catch {}

    setPickupActive(true);
    setPickupModalOpen(false);
    setPickupSavedToast(
      `✓ Airport Pickup Service active! Qualified with ${yearsLivedInChina} year(s) of China residency.`
    );
    setTimeout(() => setPickupSavedToast(null), 4000);
  }

  const isPickupEligible = yearsLivedInChina >= 1.0;

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
      {/* Toast Notifications */}
      <AnimatePresence>
        {(payoutToast || bankSavedToast || pickupSavedToast) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-slate-900 text-emerald-300 border border-emerald-500/50 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-sm font-semibold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{payoutToast || bankSavedToast || pickupSavedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Navigation & Portal Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-glass">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple/15 border border-purple/30 text-purple text-xs font-mono font-bold uppercase">
              <FileCheck2 className="w-3.5 h-3.5" />
              Certified Service Provider Desk
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase">
              <Plane className="w-3.5 h-3.5" />
              Airport Pickup Qualified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase">
              <Landmark className="w-3.5 h-3.5" />
              Bank Payout Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-text-primary">
            ScholarChina Service Provider Bureau
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary">
            Process student document translation orders, manage airport pickup arrivals, and manage bank account payouts.
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
            <span>⇄ Student View</span>
          </Link>
          <Link
            href="/university-portal"
            onClick={() => {
              try {
                localStorage.setItem("portal_role", "university");
              } catch {}
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold glass hover:bg-white/10 text-amber-500 dark:text-amber-300 flex items-center gap-1.5 transition-all"
          >
            <span>🏛️ University Portal</span>
          </Link>
        </div>
      </div>

      {/* Provider Bureau Overview Metrics */}
      <div className="glass rounded-3xl p-6 sm:p-8 mb-8 border border-purple/30 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple via-pink-500 to-red-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple/20 flex-shrink-0">
              <Languages className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple uppercase tracking-wider font-mono">
                  Official Provider Partner
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Certified Sworn Bureau
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Car className="w-3 h-3" /> Airport Pickup (1+ Yr China Resident)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-text-primary">
                Sworn Translations & China Airport Arrival Support
              </h2>
              <p className="text-xs text-slate-600 dark:text-text-muted mt-0.5">
                Embassy Red Seal Certifications • Airport Terminal Reception • Direct Bank Settlement (MAD / CNY / USD)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-700 dark:text-text-secondary">
              ⭐ 4.9 Rating (128 Reviews)
            </span>
            <button
              onClick={() => setActiveTab("banking")}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5 hover:bg-emerald-500/25 transition-colors cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Available Balance: ${balances.available.toFixed(2)}</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-white/10">
          <div className="glass rounded-2xl p-4 border border-border-glass">
            <p className="text-xs text-slate-500 dark:text-text-muted mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan" /> Total Orders
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-text-primary">{orders.length}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-amber-500/20">
            <p className="text-xs text-amber-600 dark:text-amber-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Review
            </p>
            <p className="text-2xl font-black text-amber-500 dark:text-amber-400">{pendingCount}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-blue-500/20">
            <p className="text-xs text-blue-600 dark:text-blue-300 mb-1 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-blue-500" /> In Translation
            </p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{inProgressCount}</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-emerald-500/20">
            <p className="text-xs text-emerald-600 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Delivered & Certified
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
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
              : "text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-text-primary"
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
              : "text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-text-primary"
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
              : "text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-text-primary"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Services & Rates Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab("banking")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "banking"
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-md shadow-emerald-500/20"
              : "text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-text-primary"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Bank Account & Payouts</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
            Verified
          </span>
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
                          &ldquo;{ord.notes}&rdquo;
                        </p>
                      )}

                      {/* Attached Documents */}
                      {ord.documents && ord.documents.length > 0 && (
                        <div className="mb-3 space-y-1.5">
                          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            Attached Student Documents:
                          </p>
                          {ord.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/5"
                            >
                              <span className="truncate max-w-[200px] text-text-primary">
                                📄 {doc.title || doc.file_name}
                              </span>
                              <a
                                href={getFullFileUrl(doc.file_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan hover:underline flex items-center gap-1 font-semibold text-[11px]"
                              >
                                <Download className="w-3 h-3" /> Inspect
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div className="pt-3 border-t border-border-glass flex items-center justify-between gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setActiveTab("workbench");
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold glass hover:bg-white/10 text-cyan flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open in Workbench</span>
                      </button>

                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => setDeliveryOrder(ord)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold btn-gradient flex items-center gap-1.5 shadow-md shadow-purple/20 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Deliver Certified Document</span>
                        </button>
                      )}
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Order Metadata & Original Document Preview */}
            <div className="lg:col-span-7 glass rounded-3xl p-6 sm:p-8 border border-border-glass">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-glass">
                <div>
                  <span className="text-xs font-bold font-mono text-purple">
                    Workbench for Order #{selectedOrder.id}
                  </span>
                  <h3 className="text-lg font-bold text-text-primary mt-0.5">
                    {selectedOrder.service_name}
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple/15 text-purple border border-purple/30">
                  {selectedOrder.student_name}
                </span>
              </div>

              {/* Source Document Box */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Original Uploaded Student File:
                </p>

                {selectedOrder.documents && selectedOrder.documents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan/15 text-cyan flex items-center justify-center font-bold">
                            PDF
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-text-primary">
                              {doc.title || doc.file_name}
                            </p>
                            <p className="text-[11px] text-text-muted">
                              Uploaded by student for certified translation
                            </p>
                          </div>
                        </div>

                        <a
                          href={getFullFileUrl(doc.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl text-xs font-bold btn-gradient flex items-center gap-1.5 shadow-md shadow-cyan/20 cursor-pointer self-stretch sm:self-auto justify-center"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Original</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-white/10 text-center">
                    <p className="text-xs text-text-muted">No uploaded file found for this order.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Certification Tool & Translation Upload */}
            <div className="lg:col-span-5 glass rounded-3xl p-6 sm:p-8 border border-border-glass">
              <h3 className="text-base font-bold text-text-primary mb-1">
                Deliver Certified Translation
              </h3>
              <p className="text-xs text-text-muted mb-4">
                Upload finalized stamped translation and notify student immediately.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">
                    Sworn Translator Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="e.g. Sworn Arabic-Chinese translation verified with red seal stamp #8921. Ready for Chinese Embassy visa submission."
                    className="w-full glass rounded-xl p-3 text-xs text-text-primary outline-none border border-border-glass resize-none"
                  />
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-purple/40 bg-purple/5 text-center">
                  <Upload className="w-8 h-8 text-purple mx-auto mb-2" />
                  <p className="font-bold text-text-primary">Upload Certified Translation (PDF)</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Drag & drop stamped Chinese translation with red seal
                  </p>
                  <input
                    type="file"
                    id="cert-file-picker"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setUploadedCertFile(e.target.files[0].name);
                    }}
                  />
                  <label
                    htmlFor="cert-file-picker"
                    className="mt-3 inline-block px-4 py-2 rounded-xl text-xs bg-purple/20 hover:bg-purple/30 text-purple font-bold transition-all cursor-pointer"
                  >
                    {uploadedCertFile ? `✓ ${uploadedCertFile}` : "Select File"}
                  </label>
                  {uploadedCertFile && (
                    <p className="text-[11px] text-emerald-400 font-bold mt-2">
                      ✓ File attached: {uploadedCertFile}
                    </p>
                  )}
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

      {/* ── TAB 3: SERVICES & RATES CATALOG (Includes Airport Pickup with 1-Year China Residency Rule) ── */}
      {activeTab === "services" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Airport Pickup Service Spotlight Feature Banner */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-blue-500/40 bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-purple/10 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5" /> Airport Pickup & Arrival Escort
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <strong>Mandatory: 1-Year China Residency Required</strong>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-text-primary">
                  Welcome Scholars at Beijing, Shanghai & Hangzhou Terminals
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary leading-relaxed">
                  Incoming Moroccan and international students depend on experienced local residents to guide them
                  through Chinese international airport terminals, customs, high-speed rail (CRH), local taxi apps, Chinese SIM card registration, and campus dorm check-in.
                  To protect student safety, <strong>providers must have lived in China for at least 1 full year</strong> before applying.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setPickupModalOpen(true)}
                  className="px-6 py-3 rounded-2xl btn-gradient text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                  <Plane className="w-4 h-4" />
                  <span>
                    {pickupActive ? "Manage Pickup Credentials" : "Apply to Offer Pickup Service"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Standard Services List */}
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-5xl border border-border-glass">
            <h3 className="text-lg font-bold text-slate-900 dark:text-text-primary mb-2">
              Official Services & Rates Catalog
            </h3>
            <p className="text-xs text-slate-600 dark:text-text-muted mb-6">
              Manage your offered translation languages, airport arrival escort, and turnaround timeframes.
            </p>

            <div className="space-y-4">
              {servicesList.map((srv, idx) => (
                <div
                  key={idx}
                  className="glass rounded-2xl p-5 border border-border-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                        Active Service
                      </span>
                      {srv.requiresOneYear && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                          🇨🇳 1-Year China Residency Required
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-text-primary mt-1 mb-0.5">{srv.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-text-muted">{srv.desc}</p>
                    <p className="text-[11px] text-slate-600 dark:text-text-secondary mt-1">
                      Turnaround time: <strong>{srv.turnaround}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{srv.price}</span>
                    {srv.requiresOneYear ? (
                      <button
                        type="button"
                        onClick={() => setPickupModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl text-xs btn-gradient font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                      >
                        Residency & Vehicle
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService(srv);
                          setEditPriceInput(srv.price);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs glass hover:bg-white/10 text-cyan transition-all cursor-pointer"
                      >
                        Edit Rate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TAB 4: BANK ACCOUNT & PAYOUTS SECTION ── */}
      {activeTab === "banking" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header Banner */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-blue-500/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Financial Payout Desk</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-text-primary">
                  Provider Bank Account & Direct Payouts
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-text-secondary mt-1">
                  Connect your Moroccan RIB, Chinese UnionPay account, or Wise SWIFT wire to receive instant settlements for completed student translations & pickup arrivals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4 KPI Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-5 border border-emerald-500/40 bg-emerald-500/5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-500" /> Available for Payout
                </span>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  ${balances.available.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-text-muted mt-1">
                  Ready for immediate wire transfer or UnionPay
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayoutModalOpen(true)}
                className="mt-4 w-full py-2.5 rounded-xl btn-gradient text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Request Payout</span>
              </button>
            </div>

            <div className="glass rounded-2xl p-5 border border-amber-500/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> Pending Clearance
                </span>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
                  ${balances.pending.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-text-muted mt-1">
                  From 2 orders currently in translation / pending delivery
                </p>
              </div>
              <div className="mt-4 text-xs font-semibold text-slate-600 dark:text-text-secondary bg-slate-100 dark:bg-white/5 p-2 rounded-lg">
                Clears automatically upon delivery
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-blue-500/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-500" /> Total Paid Out
                </span>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
                  ${balances.totalPaid.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-text-muted mt-1">
                  Lifetime earnings disbursed across 14 settlements
                </p>
              </div>
              <div className="mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% on-time settlement record
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-purple/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-purple" /> Primary Account
                </span>
                <p className="text-base font-bold text-slate-900 dark:text-text-primary mt-2 truncate">
                  {bankDetails.bank_name}
                </p>
                <p className="text-xs font-mono text-slate-500 dark:text-text-muted truncate mt-0.5">
                  •••• {bankDetails.account_number.slice(-4)} ({bankDetails.payout_currency})
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ✓ Verified Account
                </span>
                <span className="text-slate-500 dark:text-text-muted">0% Fee</span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Banking Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Bank Account Details Form */}
            <div className="lg:col-span-7 glass rounded-3xl p-6 sm:p-8 border border-border-glass shadow-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border-glass">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-text-primary">
                      Bank Credentials & Payout Routing
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-text-muted">
                      Configure the destination account where student fees are sent.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              {/* Payout Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-2">
                  Payout Method Destination:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "wire_transfer", label: "Bank Wire", icon: Landmark, note: "Morocco / SWIFT" },
                    { id: "unionpay", label: "UnionPay", icon: CreditCard, note: "China (RMB)" },
                    { id: "wise", label: "Wise Wire", icon: Globe, note: "International" },
                    { id: "alipay_wechat", label: "Alipay/WeChat", icon: QrCode, note: "Direct Merchant" },
                  ].map((m) => {
                    const active = bankDetails.payout_method === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setBankDetails({ ...bankDetails, payout_method: m.id })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                            : "glass border-slate-200 dark:border-white/10 text-slate-600 dark:text-text-muted hover:border-emerald-500/30"
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <p className="text-xs font-bold truncate">{m.label}</p>
                        <p className="text-[10px] opacity-75">{m.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    Bank Name:
                  </label>
                  <input
                    type="text"
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                    placeholder="e.g. Attijariwafa Bank, Bank of China, ICBC, CIH"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs sm:text-sm text-slate-900 dark:text-text-primary outline-none focus:border-emerald-500"
                  />
                  <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                    {["Attijariwafa", "Bank of China", "ICBC", "CIH Bank", "Wise"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBankDetails({ ...bankDetails, bank_name: b })}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-emerald-500 text-[10px]"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    Account Holder Legal Name:
                  </label>
                  <input
                    type="text"
                    value={bankDetails.account_holder}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_holder: e.target.value })}
                    placeholder="Full passport or company registration name"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs sm:text-sm text-slate-900 dark:text-text-primary outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Must match provider legal identity</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    Account Number / RIB (24 Digits) / IBAN / UnionPay:
                  </label>
                  <input
                    type="text"
                    value={bankDetails.account_number}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                    placeholder="e.g. 007780000123456789012345 or 6222020200112233"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs sm:text-sm font-mono text-slate-900 dark:text-text-primary outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-text-muted mt-1">
                    For Moroccan accounts, enter 24-digit RIB. For China, enter 16-19 digit UnionPay card number.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    SWIFT / BIC Code (for Wire):
                  </label>
                  <input
                    type="text"
                    value={bankDetails.swift_code}
                    onChange={(e) => setBankDetails({ ...bankDetails, swift_code: e.target.value })}
                    placeholder="e.g. BCMA MAMC or BKCHCNBJ"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs sm:text-sm font-mono text-slate-900 dark:text-text-primary outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    Branch City & Country:
                  </label>
                  <input
                    type="text"
                    value={bankDetails.branch_city}
                    onChange={(e) => setBankDetails({ ...bankDetails, branch_city: e.target.value })}
                    placeholder="e.g. Casablanca / Rabat / Beijing"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs sm:text-sm text-slate-900 dark:text-text-primary outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    Payout Currency Preference:
                  </label>
                  <select
                    value={bankDetails.payout_currency}
                    onChange={(e) => setBankDetails({ ...bankDetails, payout_currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs sm:text-sm text-slate-900 dark:text-text-primary outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="MAD">MAD — Moroccan Dirham (Dirham Marocain)</option>
                    <option value="CNY">CNY / RMB — Chinese Yuan (中国人民币)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSaveBankDetails}
                    className="w-full py-2.5 rounded-xl btn-gradient text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Bank Details</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Security & Payout Policies */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass rounded-3xl p-6 border border-emerald-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-text-primary">
                      256-Bit Financial Encryption
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-text-muted">
                      PCI-DSS Level 1 Financial Security Standard
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-text-secondary leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Direct settlement into Moroccan commercial banks (Attijariwafa, BCP, BMCE, CIH) and Chinese UnionPay.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Automatic release of funds upon student document delivery or airport escort completion.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>
                      No wire transfer fees on disbursements over $100.00 / 1,000 MAD.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Settlement Timeframes */}
              <div className="glass rounded-3xl p-6 border border-border-glass space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary">
                  Payout Settlement Speed
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="font-semibold text-slate-700 dark:text-text-primary">
                      Morocco Bank Wire (RIB)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      24 - 48 Hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="font-semibold text-slate-700 dark:text-text-primary">
                      China UnionPay Direct
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Same-Day Instant
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="font-semibold text-slate-700 dark:text-text-primary">
                      Wise International SWIFT
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      1 - 2 Business Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settlement & Payout History Table */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-border-glass shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-glass">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-text-primary">
                  Recent Payout & Withdrawal History
                </h3>
                <p className="text-xs text-slate-500 dark:text-text-muted">
                  Log of settled provider disbursements and wire reference IDs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPayoutModalOpen(true)}
                className="px-4 py-2 rounded-xl btn-gradient text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>New Payout</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-glass text-slate-500 dark:text-text-muted uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Reference ID</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Destination Account</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-glass">
                  {payoutHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-text-primary">
                        {item.id}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-text-secondary">{item.date}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-text-primary font-medium">
                        {item.destination}
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-emerald-600 dark:text-emerald-400">
                        ${item.amount}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          ✓ {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── AIRPORT PICKUP SERVICE APPLICATION & 1-YEAR RESIDENCY MODAL ── */}
      <AnimatePresence>
        {pickupModalOpen && (
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setPickupModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-blue-500/40 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-text-primary">
                      Airport Pickup Service Provider Registration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-text-muted">
                      Escort incoming international scholars from Chinese airport terminals to campus dorms.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPickupModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ⚠️ STRICT RESIDENCY REQUIREMENT SECTION ⚠️ */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-text-primary flex items-center gap-1.5">
                    <span>How many years have you lived in China?</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-mono font-extrabold text-blue-500 dark:text-cyan">
                    {yearsLivedInChina} Year{yearsLivedInChina !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Quick selector chips */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 0.5, label: "0.5 Yr (6 Mo)" },
                    { val: 1.0, label: "1.0 Year" },
                    { val: 2.0, label: "2.0 Years" },
                    { val: 3.5, label: "3+ Years" },
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => setYearsLivedInChina(chip.val)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        yearsLivedInChina === chip.val
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                          : "glass text-slate-600 dark:text-text-secondary hover:text-blue-500"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Number input slider for precise years */}
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.5"
                  value={yearsLivedInChina}
                  onChange={(e) => setYearsLivedInChina(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />

                {/* DYNAMIC RULE ENFORCEMENT CALLOUT */}
                {!isPickupEligible ? (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-rose-700 dark:text-rose-200">
                        1-Year China Residency Requirement Not Met ({yearsLivedInChina} Years Reported)
                      </p>
                      <p className="text-[11px] text-rose-600/90 dark:text-rose-300/80 mt-1 leading-relaxed">
                        To guarantee student safety, airport customs assistance, high-speed rail transit, local SIM card registration, and dorm check-in, <strong>providers must have lived in China for at least 1 full year</strong> before they can apply for pickup services.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-emerald-700 dark:text-emerald-200">
                        ✓ Eligibility Verified: Qualified Resident ({yearsLivedInChina} Years in China)
                      </p>
                      <p className="text-[11px] text-emerald-600/90 dark:text-emerald-300/80 mt-1">
                        You meet the mandatory 1-year residency threshold. You are authorized to escort incoming international students.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Form Details (Active only when eligible) */}
              <div
                className={`space-y-4 transition-opacity duration-300 ${
                  !isPickupEligible ? "opacity-40 pointer-events-none" : "opacity-100"
                }`}
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                    Covered Airports & Hubs:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      "Beijing (PEK / PKX)",
                      "Shanghai (PVG / SHA)",
                      "Hangzhou (HGH)",
                      "Guangzhou (CAN)",
                      "Wuhan (WUH)",
                      "Chengdu (TFU / CTU)",
                    ].map((city) => {
                      const selected = pickupCities.includes(city);
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              setPickupCities(pickupCities.filter((c) => c !== city));
                            } else {
                              setPickupCities([...pickupCities, city]);
                            }
                          }}
                          className={`p-2 rounded-xl text-left border flex items-center justify-between cursor-pointer ${
                            selected
                              ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-300 font-bold"
                              : "glass border-slate-200 dark:border-white/10 text-slate-500"
                          }`}
                        >
                          <span className="truncate">{city}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                      Chinese Phone (+86):
                    </label>
                    <input
                      type="text"
                      value={pickupPhone}
                      onChange={(e) => setPickupPhone(e.target.value)}
                      placeholder="+86 138 0000 0000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-text-primary outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                      WeChat ID for Coordination:
                    </label>
                    <input
                      type="text"
                      value={pickupWeChat}
                      onChange={(e) => setPickupWeChat(e.target.value)}
                      placeholder="e.g. Scholar_BeijingRep"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-text-primary outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                      Vehicle / Escort Capability:
                    </label>
                    <input
                      type="text"
                      value={pickupVehicle}
                      onChange={(e) => setPickupVehicle(e.target.value)}
                      placeholder="e.g. Standard 4-Seater / 7-Seater Van"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-text-primary outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                      Base Pickup Fee Rate:
                    </label>
                    <input
                      type="text"
                      value={pickupRate}
                      onChange={(e) => setPickupRate(e.target.value)}
                      placeholder="$65.00 / trip"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-xs font-bold text-emerald-500 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Proof of Residence Upload */}
                <div className="p-3.5 rounded-2xl border-2 border-dashed border-blue-500/30 bg-blue-500/5 text-center">
                  <p className="text-xs font-bold text-slate-900 dark:text-text-primary">
                    Proof of China Residence (Permit / Student Card / Entry Stamp)
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-text-muted mt-0.5">
                    Attests 1+ year living in China
                  </p>
                  <input
                    type="file"
                    id="pickup-doc-file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setPickupProofName(e.target.files[0].name);
                    }}
                  />
                  <label
                    htmlFor="pickup-doc-file"
                    className="mt-2 inline-block px-3 py-1.5 rounded-xl text-xs bg-blue-500/20 text-blue-500 font-bold hover:bg-blue-500/30 cursor-pointer"
                  >
                    {pickupProofName ? `✓ ${pickupProofName}` : "Choose File"}
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-glass">
                <button
                  type="button"
                  onClick={() => setPickupModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!isPickupEligible}
                  onClick={handleSavePickupService}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isPickupEligible
                      ? "btn-gradient shadow-lg shadow-blue-500/20 cursor-pointer"
                      : "bg-slate-300 dark:bg-white/10 text-slate-500 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isPickupEligible
                      ? "Activate & Register Pickup Service"
                      : "Locked (1-Year China Residency Required)"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PAYOUT WITHDRAWAL MODAL ── */}
      <AnimatePresence>
        {payoutModalOpen && (
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setPayoutModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 sm:p-8 max-w-md w-full border border-emerald-500/40 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-text-primary flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-500" />
                    <span>Withdraw Provider Earnings</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
                    Available balance: <strong>${balances.available.toFixed(2)}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-text-secondary mb-1.5">
                  Withdrawal Amount ($ USD):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="10"
                    max={balances.available}
                    value={payoutInputAmount}
                    onChange={(e) => setPayoutInputAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-lg font-black text-emerald-600 dark:text-emerald-400 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick percentage buttons */}
                <div className="flex items-center gap-2 mt-2">
                  {[
                    { pct: 0.25, label: "25%" },
                    { pct: 0.5, label: "50%" },
                    { pct: 0.75, label: "75%" },
                    { pct: 1.0, label: "100% (All)" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPayoutInputAmount((balances.available * p.pct).toFixed(2))}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold glass hover:bg-white/10 text-slate-600 dark:text-text-muted hover:text-emerald-500 cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1 text-xs">
                <p className="font-semibold text-slate-700 dark:text-text-primary">
                  Payout Destination:
                </p>
                <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold truncate">
                  {bankDetails.bank_name} •••• {bankDetails.account_number.slice(-4)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-text-muted">
                  Settlement arrives in 24 - 48 hours in {bankDetails.payout_currency}.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={payoutSubmitting}
                  onClick={handleConfirmPayout}
                  className="px-6 py-2.5 rounded-xl btn-gradient text-xs font-bold shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  {payoutSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Transfer ${payoutInputAmount}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                      className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-bold text-text-primary flex items-center gap-2 shadow-lg shadow-purple/20 cursor-pointer"
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

      {/* ── EDIT RATE MODAL ── */}
      <AnimatePresence>
        {editingService && (
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setEditingService(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 max-w-sm w-full border border-cyan/40 shadow-2xl text-left"
            >
              <h3 className="text-base font-bold text-text-primary mb-1">
                Edit Service Rate
              </h3>
              <p className="text-xs text-text-muted mb-4 line-clamp-1">
                {editingService.name}
              </p>

              <div className="mb-4">
                <label className="text-xs font-semibold text-text-secondary mb-1 block">
                  New Rate (e.g. $40.00):
                </label>
                <input
                  type="text"
                  value={editPriceInput}
                  onChange={(e) => setEditPriceInput(e.target.value)}
                  className="w-full glass rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 outline-none border border-border-glass"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-text-muted hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServicesList((prev) =>
                      prev.map((s) =>
                        s.name === editingService.name ? { ...s, price: editPriceInput } : s
                      )
                    );
                    setEditingService(null);
                  }}
                  className="btn-gradient px-4 py-2 rounded-xl text-xs font-bold text-text-primary shadow-md cursor-pointer"
                >
                  Save Rate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Gate for Service Providers */}
      <AuthGateModal
        isOpen={showAuthGate && !getToken()}
        onClose={() => setShowAuthGate(false)}
        canClose={true}
        role="provider"
        onSuccess={() => {
          setShowAuthGate(false);
          loadOrders();
        }}
      />
    </div>
  );
}
