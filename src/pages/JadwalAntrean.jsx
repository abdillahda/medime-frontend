import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  User,
  Building2,
  Package,
  X,
  RefreshCw,
  Fingerprint,
  Clock,
  Filter,
  PlayCircle,
} from "lucide-react";

const JadwalAntrean = () => {
  const [queueList, setQueueList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [processingUid, setProcessingUid] = useState(null); 

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    mcuNumber: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [packageList, setPackageList] = useState([]);

  const initialFormState = {
    nik: "",
    name: "",
    gender: "PRIA",
    employeeNumber: "",
    birthdayDate: "",
    phoneNumber: "",
    uidCompany: "",
    companyDepartment: "",
    companyDepartmentPosition: "",
    packageId: "",
    registrationRemarks: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchQueueData();
    fetchCompanies();
  }, []);

  const fetchQueueData = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get("/api/mcu-registrations/queue/today");
      setQueueList(res.data.data || []);
    } catch (error) {
      console.error("Gagal memuat antrean", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("/api/perusahaan/list");
      setCompanyList(res.data.data?.content || res.data.data || []);
    } catch (err) {}
  };

  const fetchPackages = async (companyUid) => {
    if (!companyUid) return;
    try {
      const res = await axios.get(
        `/api/mcu-registrations/medical-packages/${companyUid}`
      );
      setPackageList(res.data.data?.content || res.data.data || []);
    } catch (err) {
      setPackageList([]);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setSearchQuery("");
    setSearchResults([]);
    setPackageList([]);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const res = await axios.get("/api/participants/search", {
          params: { q: query },
        });
        setSearchResults(res.data.data || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectParticipant = async (p) => {
    if (p.companyUid) await fetchPackages(p.companyUid);
    setFormData({
      ...initialFormState,
      nik: p.nik || "",
      name: p.name || "",
      gender: p.gender || "PRIA",
      employeeNumber: p.employeeNumber || "",
      birthdayDate: p.birthdayDate || "",
      phoneNumber: p.phoneNumber || "",
      uidCompany: p.companyUid || "",
      companyDepartment: p.departmentName || "",
      companyDepartmentPosition: p.positionName || "",
      packageId: p.packageUid || "",
      registrationRemarks: p.remarks || "",
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "uidCompany") {
      fetchPackages(value);
      setFormData((prev) => ({ ...prev, packageId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/mcu-registrations/direct-checkin",
        formData
      );

      setNotification({
        isOpen: true,
        type: "success",
        title: "Berhasil",
        message: response.data.message || "Pasien berhasil didaftarkan.",
        mcuNumber: response.data.data,
      });

      setIsDrawerOpen(false);
      fetchQueueData();
      handleReset();
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Pendaftaran Gagal",
        message:
          error.response?.data?.message || "Terjadi kesalahan pada server.",
        mcuNumber: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (uid, newStatus) => {
    setProcessingUid(uid);
    try {
      const response = await axios.put(`/api/mcu-registrations/${uid}/status`, {
        status: newStatus,
      });

      setNotification({
        isOpen: true,
        type: "success",
        title: "Status Diperbarui",
        message: response.data.message || "Status antrean berhasil diubah.",
        mcuNumber: "", 
      });

      fetchQueueData();
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Gagal Update Status",
        message: error.response?.data?.message || "Gagal menghubungi server.",
        mcuNumber: "",
      });
    } finally {
      setProcessingUid(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "REGISTERED":
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[11px] font-black uppercase tracking-widest">
            Menunggu
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-3 py-1 bg-cyan-100 text-cyan-600 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
            <PlayCircle size={12} /> Diperiksa
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[11px] font-black uppercase tracking-widest">
            Selesai
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[11px] font-black uppercase tracking-widest">
            {status}
          </span>
        );
    }
  };

  const filteredQueue = filterStatus
    ? queueList.filter((q) => q.status === filterStatus)
    : queueList;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden font-sans">
      {/* HEADER UTAMA */}
      <header className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white border-b border-slate-200 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Daftar Antrean MCU
          </h1>
          <nav className="text-[10px] text-slate-400 mt-1 italic font-bold uppercase tracking-widest">
            Operasional &gt;{" "}
            <span className="text-cyan-700">Jadwal & Antrean</span>
          </nav>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl outline-none appearance-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="REGISTERED">Menunggu</option>
              <option value="IN_PROGRESS">Diperiksa</option>
              <option value="COMPLETED">Selesai</option>
            </select>
          </div>

          <button
            onClick={fetchQueueData}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-cyan-600 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-bold active:scale-95"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />{" "}
            Segarkan
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-200 active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} /> Registrasi Baru
          </button>
        </div>
      </header>

      {/* TABEL ANTREAN */}
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-5 w-28">Waktu</th>
                  <th className="p-5 w-48">No. Registrasi</th>
                  <th className="p-5">Data Pasien</th>
                  <th className="p-5">Layanan</th>
                  <th className="p-5 w-32 text-center">Status</th>
                  <th className="p-5 w-32 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((item, index) => (
                  <tr
                    key={item.uid || index}
                    className="hover:bg-cyan-50/30 transition-colors group"
                  >
                    <td className="p-5 text-sm font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        {item.registrationDate
                          ? new Date(item.registrationDate)
                              .toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              .replace(":", ".")
                          : "--.--"}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1.5 bg-cyan-50 text-cyan-700 font-black text-[11px] rounded-lg border border-cyan-100 tracking-wider">
                        {item.mcuNumber}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="font-black text-sm text-slate-800 uppercase">
                        {item.participantName}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1 uppercase">
                        <Building2 size={12} className="text-slate-400" />{" "}
                        {item.companyName}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Package size={14} className="text-cyan-600" />{" "}
                        {item.packageName}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* KOLOM AKSI (TOMBOL PANGGIL & SELESAI) */}
                    <td className="p-5 text-right">
                      {item.status === "COMPLETED" ? (
                        <span className="text-xs font-black text-slate-400 italic">
                          Selesai
                        </span>
                      ) : item.status === "IN_PROGRESS" ? (
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              item.registrationUid,
                              "COMPLETED"
                            )
                          }
                          disabled={processingUid === item.uid}
                          className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 ml-auto w-24 active:scale-95 ${
                            processingUid === item.uid
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {processingUid === item.registrationUid ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          {processingUid === item.registrationUid
                            ? "Proses..."
                            : "Selesai"}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              item.registrationUid,
                              "IN_PROGRESS"
                            )
                          }
                          disabled={processingUid === item.registrationUid}
                          className={`px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-cyan-200 flex items-center justify-center gap-1.5 ml-auto w-24 active:scale-95 ${
                            processingUid === item.uid
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {processingUid === item.registrationUid ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <PlayCircle size={14} />
                          )}
                          {processingUid === item.registrationUid
                            ? "Proses..."
                            : "Panggil"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredQueue.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-10 text-center text-slate-400 font-bold"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Package size={40} className="text-slate-200" />
                        Belum ada antrean untuk status yang dipilih.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DRAWER REGISTRASI (Tetap sama seperti sebelumnya) */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Pendaftaran & Check-In
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
              Cari Data / Input Baru
            </p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <RefreshCw size={40} className="text-cyan-600 animate-spin" />
            </div>
          )}
          <div className="mb-8 relative">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Cari NIK / Nama Pasien..."
                className="w-full pl-12 pr-4 py-3.5 bg-cyan-50/50 border border-cyan-100 rounded-2xl text-sm font-bold text-cyan-900 uppercase focus:outline-none focus:border-cyan-500"
              />
              {isSearching && (
                <RefreshCw
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-600 animate-spin"
                  size={18}
                />
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto font-sans">
                {searchResults.map((p) => (
                  <button
                    key={p.uid}
                    onClick={() => handleSelectParticipant(p)}
                    className="w-full text-left p-4 hover:bg-cyan-50 border-b border-slate-50 flex flex-col gap-1"
                  >
                    <span className="text-sm font-black text-slate-800 uppercase">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono flex items-center gap-1 uppercase">
                      <Fingerprint size={12} /> {p.nik}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            id="registrasiForm"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-cyan-700 flex items-center gap-2">
                <User size={16} /> Info Pribadi
              </h3>
              <div className="grid grid-cols-1 gap-4 font-sans">
                <input
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder="NIK KTP (Wajib)"
                  required
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-cyan-500"
                />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  required
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase outline-none focus:border-cyan-500"
                />
                <div className="flex gap-4">
                  <input
                    type="date"
                    name="birthdayDate"
                    value={formData.birthdayDate}
                    onChange={handleChange}
                    required
                    className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none"
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-slate-600 appearance-none"
                  >
                    <option value="PRIA">PRIA</option>
                    <option value="WANITA">WANITA</option>
                  </select>
                </div>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="No. HP / WA"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <Building2 size={16} /> Medis & Kemitraan
              </h3>
              <div className="grid grid-cols-1 gap-4 font-sans">
                <select
                  name="uidCompany"
                  value={formData.uidCompany}
                  onChange={handleChange}
                  required
                  className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="">-- Pilih Perusahaan --</option>
                  {companyList.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
                <select
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleChange}
                  required
                  className="w-full p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-sm font-black text-emerald-800 outline-none"
                >
                  <option value="">-- Pilih Paket MCU --</option>
                  {packageList.map((pkg) => (
                    <option key={pkg.uid} value={pkg.uid}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
          <button
            form="registrasiForm"
            type="submit"
            className="w-full py-4 bg-cyan-700 hover:bg-cyan-800 text-white font-black rounded-xl shadow-lg shadow-cyan-200 uppercase text-xs tracking-widest transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            <CheckCircle2 size={18} /> Konfirmasi Kehadiran
          </button>
        </div>
      </div>

      {/* NOTIFIKASI MODAL */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div
                className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                  notification.type === "success"
                    ? "bg-emerald-50 text-emerald-500"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 size={40} />
                ) : (
                  <AlertCircle size={40} />
                )}
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight font-sans">
                {notification.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium px-2 font-sans leading-relaxed">
                {notification.message}
              </p>

              {notification.mcuNumber && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1 font-sans">
                    Nomor Antrean
                  </p>
                  <p className="text-3xl font-black text-emerald-700 font-mono tracking-tighter">
                    {notification.mcuNumber}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() =>
                  setNotification({ ...notification, isOpen: false })
                }
                className={`w-full py-4 px-6 font-black rounded-2xl text-white font-sans uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all ${
                  notification.type === "success"
                    ? "bg-slate-800 hover:bg-slate-900"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalAntrean;
