import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  MoreVertical,
  RefreshCw,
  BriefcaseMedical,
  Building2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ListChecks,
  X,
  ChevronRight,
  ChevronLeft,
  LayoutList,
  Network,
} from "lucide-react";
import Select from "react-select";

const MasterPaket = () => {
  // --- 1. State Management ---
  const [paketList, setPaketList] = useState([]);
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [allExaminations, setAllExaminations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State UI
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // State Pagination & Filter
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  // Form & Mapping State
  const [selectedPaket, setSelectedPaket] = useState(null);
  const [selectedExamIds, setSelectedExamIds] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    companyUid: "",
    status: "ACTIVE",
  });
  const [searchExam, setSearchExam] = useState("");

  // --- 2. Configurations (Styles & Options) ---
  const companyOptions = Array.isArray(perusahaanList)
    ? perusahaanList.map((comp) => ({
        value: comp.uid,
        label: `${comp.companyCode} - ${comp.companyName}`,
      }))
    : [];

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "12px",
      padding: "2px",
      borderColor: state.isFocused ? "#0e7490" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(14, 116, 144, 0.1)" : "none",
      "&:hover": { borderColor: "#0e7490" },
      fontSize: "14px",
      backgroundColor: "#f9fafb",
      minWidth: "220px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#0e7490"
        : state.isFocused
        ? "#ecfeff"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      cursor: "pointer",
      fontSize: "13px",
    }),
  };

  // --- 3. API Calls ---
  const fetchData = async (
    page = 0,
    currentKeyword = keyword,
    currentFilter = filterCompany
  ) => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/packages", {
        params: {
          page: page,
          size: 10,
          keyword: currentKeyword,
          companyUid: currentFilter,
        },
      });
      if (res.data.success) {
        setPaketList(res.data.data.content);
        setCurrentPage(res.data.data.currentPage);
        setTotalPages(res.data.data.totalPages);
        setTotalItems(res.data.data.totalItems);
      }

      if (perusahaanList.length === 0) {
        const resComp = await axios.get("/api/perusahaan/list", {
          params: { size: 100 },
        });
        if (resComp.data.success && resComp.data.data?.content) {
          setPerusahaanList(resComp.data.data.content);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllExaminations = async () => {
    try {
      const res = await axios.get("/api/examinations/hierarchy");
      if (res.data.success) setAllExaminations(res.data.data.content || []);
    } catch (error) {
      console.error("Error fetch examinations:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAllExaminations();
  }, []);

  // --- 4. Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenUpdate = (paket) => {
    setDrawerMode("update");
    setFormData({
      id: paket.id,
      name: paket.name,
      companyUid: paket.companyUid || paket.companyId,
      status: paket.status || "ACTIVE",
    });
    setActiveDropdown(null);
    setIsDrawerOpen(true);
  };

  const handleOpenMapping = async (paket) => {
    setSelectedPaket(paket);
    setActiveDropdown(null);
    setSearchExam("");
    try {
      const res = await axios.get(`/api/packages/${paket.id}/mapping`);
      setSelectedExamIds(res.data.data || []);
      setIsMappingOpen(true);
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Gagal",
        message: "Gagal mengambil data mapping.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (drawerMode === "add") {
        await axios.post("/api/packages", formData);
      } else {
        await axios.put(`/api/packages/${formData.id}`, formData);
      }
      setIsDrawerOpen(false);
      fetchData(currentPage);
      setNotification({
        isOpen: true,
        type: "success",
        title: "Sukses",
        message: "Data paket berhasil disimpan.",
      });
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Gagal",
        message: "Terjadi kesalahan sistem (Status 500/Format Salah).",
      });
    }
  };

  const handleSaveMapping = async () => {
    try {
      await axios.post(`/api/packages/${selectedPaket.id}/mapping`, {
        examinationIds: selectedExamIds,
      });
      setNotification({
        isOpen: true,
        type: "success",
        title: "Berhasil",
        message: "Mapping item pemeriksaan disimpan.",
      });
      setIsMappingOpen(false);
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Gagal",
        message: "Gagal menyimpan mapping.",
      });
    }
  };

  const handleDuplicate = (p) => {
    setFormData({
      ...formData,
      name: p.name + " (Copy)",
      companyUid: p.companyUid,
      sourcePackageId: p.id,
    });
    setDrawerMode("add");
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      try {
        await axios.delete(`/api/packages/${id}`);
        fetchData(currentPage);
        setNotification({
          isOpen: true,
          type: "success",
          title: "Terhapus",
          message: "Paket berhasil dihapus.",
        });
      } catch (error) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Gagal",
          message: "Paket tidak bisa dihapus karena masih digunakan.",
        });
      }
    }
    setActiveDropdown(null);
  };

  const handleToggleStatus = async (paket) => {
    const newStatus = paket.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const confirmMsg = `Apakah Anda yakin ingin ${
      newStatus === "ACTIVE" ? "mengaktifkan" : "menonaktifkan"
    } paket "${paket.name}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await axios.put(`/api/packages/${paket.id}`, {
          ...paket,
          status: newStatus,
        });

        setNotification({
          isOpen: true,
          type: "success",
          title: "Status Diperbarui",
          message: `Paket kini berstatus ${newStatus}.`,
        });

        fetchData(currentPage);
      } catch (error) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Gagal",
          message: "Gagal mengubah status paket.",
        });
      }
    }
    setActiveDropdown(null);
  };

  const toggleExamSelection = (id) => {
    setSelectedExamIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // --- 5. Search Logic for Modal ---
  const getFilteredExaminations = () => {
    if (!searchExam.trim()) return allExaminations;
    const key = searchExam.toLowerCase();
    const filterNodes = (nodes) => {
      return nodes.reduce((acc, node) => {
        const isMatch = node.name.toLowerCase().includes(key);
        const filteredChildren = node.childItems
          ? filterNodes(node.childItems)
          : [];
        if (isMatch || filteredChildren.length > 0) {
          acc.push({ ...node, childItems: filteredChildren });
        }
        return acc;
      }, []);
    };
    return filterNodes(allExaminations);
  };

  const filteredExams = getFilteredExaminations();

  const toggleCategory = (node, isSelect) => {
    let idsToUpdate = [];

    const collectChildIds = (item) => {
      if (item.level === 3) idsToUpdate.push(item.id);
      if (item.childItems) item.childItems.forEach(collectChildIds);
    };

    collectChildIds(node);

    if (isSelect) {
      setSelectedExamIds((prev) => [...new Set([...prev, ...idsToUpdate])]);
    } else {
      setSelectedExamIds((prev) =>
        prev.filter((id) => !idsToUpdate.includes(id))
      );
    }
  };

  // --- 6. Helper Render Tree ---
  const renderExamTree = (nodes) => {
    return nodes.map((node) => (
      <div key={node.id} className="ml-4 my-2">
        <div
          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
            node.level === 3 ? "hover:bg-cyan-50" : "bg-gray-50/50"
          }`}
        >
          {node.level === 1 && (
            <LayoutList size={16} className="text-cyan-700" />
          )}
          {node.level === 2 && <Network size={14} className="text-gray-400" />}

          <span
            className={`${
              node.level < 3
                ? "font-bold text-gray-700 uppercase text-[10px]"
                : "text-sm text-gray-600"
            }`}
          >
            {node.name}
          </span>

          {node.level < 3 && (
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => toggleCategory(node, true)}
                className="text-[8px] font-black bg-cyan-100 text-cyan-700 px-2 py-1 rounded hover:bg-cyan-700 hover:text-white transition-all"
              >
                ALL
              </button>
              <button
                onClick={() => toggleCategory(node, false)}
                className="text-[8px] font-black bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-700 hover:text-white transition-all"
              >
                NONE
              </button>
            </div>
          )}

          {node.level === 3 && (
            <input
              type="checkbox"
              className="ml-auto w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
              checked={selectedExamIds.includes(node.id)}
              onChange={() => toggleExamSelection(node.id)}
            />
          )}
        </div>
        {node.childItems && node.childItems.length > 0 && (
          <div className="border-l border-gray-100 ml-2">
            {renderExamTree(node.childItems)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <header className="p-8 pb-4 flex justify-between items-center bg-white border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Paket Pemeriksaan
          </h1>
          <nav className="text-[10px] text-gray-400 mt-1 italic uppercase tracking-widest">
            Kemitraan (B2B) &gt;{" "}
            <span className="text-cyan-700 font-bold">Master Paket MCU</span>
          </nav>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchData(currentPage)}
            className="p-3 text-gray-400 hover:text-cyan-700 bg-white border rounded-xl transition-all hover:shadow-md"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setDrawerMode("add");
              setFormData({
                id: null,
                name: "",
                companyUid: "",
                status: "ACTIVE",
              });
              setIsDrawerOpen(true);
            }}
            className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-cyan-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Buat Paket Baru</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8 flex-1 overflow-auto">
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar Search & Filter */}
          <div className="p-4 bg-gray-50/50 border-b flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative w-full max-w-xs">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari nama paket..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData(0)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>

              {/* Searchable Select Filter */}
              <Select
                options={companyOptions}
                styles={customSelectStyles}
                isClearable
                placeholder="Pilih Perusahaan..."
                value={
                  companyOptions.find((opt) => opt.value === filterCompany) ||
                  null
                }
                onChange={(opt) => {
                  const val = opt ? opt.value : "";
                  setFilterCompany(val);
                  fetchData(0, keyword, val);
                }}
              />
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
              Total Paket
              <br />
              <span className="text-cyan-700 text-lg">{totalItems}</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b">
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-5">Nama Paket & Mitra</th>
                <th className="p-5 text-center">Item Test</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {paketList.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-cyan-50/20 transition-all duration-500 ease-in-out group"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all">
                        <BriefcaseMedical size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 uppercase tracking-tight">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Building2 size={10} /> {p.companyName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full font-bold text-[10px]">
                      {p.itemTotal || 0} Items
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className={`text-[9px] font-black px-2 py-1 rounded-md border ${
                        p.status === "ACTIVE"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-5 text-center relative">
                    <button
                      onClick={() =>
                        setActiveDropdown(activeDropdown === p.id ? null : p.id)
                      }
                      className="p-2 text-gray-400 hover:text-cyan-700 transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {activeDropdown === p.id && (
                      <div className="absolute right-12 top-1/2 -translate-y-1/2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-30 py-2 animate-in fade-in zoom-in duration-200">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-xs font-bold border-b border-gray-50 transition-colors ${
                            p.status === "ACTIVE"
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {p.status === "ACTIVE" ? (
                            <>
                              <X size={14} /> Nonaktifkan Paket
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} /> Aktifkan Paket
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenMapping(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-cyan-50 flex items-center gap-3 text-xs font-bold text-cyan-700"
                        >
                          <ListChecks size={14} /> Mapping Item Test
                        </button>
                        <button
                          onClick={() => handleOpenUpdate(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-xs font-bold text-gray-600 border-t border-gray-50"
                        >
                          <Edit size={14} /> Edit Paket
                        </button>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="w-full text-left px-4 py-2.5 hover:bg-amber-50 flex items-center gap-3 text-xs font-bold text-amber-700 border-t border-gray-50"
                        >
                          <RefreshCw size={14} /> Duplicate Paket
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-3 text-xs font-bold text-red-600 border-t border-gray-50"
                        >
                          <Trash2 size={14} /> Hapus Paket
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-4 border-t bg-gray-50/50 flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Halaman {currentPage + 1} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => fetchData(currentPage - 1)}
                className="p-2 border rounded-xl bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage + 1 === totalPages}
                onClick={() => fetchData(currentPage + 1)}
                className="p-2 border rounded-xl bg-white disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL MAPPING ITEM TEST --- */}
      {isMappingOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                  Mapping Item Pemeriksaan
                </h2>
                <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-widest mt-1">
                  Paket: {selectedPaket?.name}
                </p>
              </div>
              <button
                onClick={() => setIsMappingOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-white scrollbar-hide">
              <div className="relative mb-6 sticky top-0 z-10">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari nama pemeriksaan..."
                  value={searchExam}
                  onChange={(e) => setSearchExam(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[20px] text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all shadow-inner"
                />
              </div>
              <div className="bg-white border border-gray-50 rounded-2xl p-4 min-h-[300px]">
                {filteredExams.length > 0 ? (
                  renderExamTree(filteredExams)
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="text-sm italic">
                      Pemeriksaan tidak ditemukan...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t bg-gray-50 flex justify-between items-center">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                ITEM TERPILIH:{" "}
                <span className="text-cyan-700 text-xl ml-2">
                  {selectedExamIds.length}
                </span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsMappingOpen(false)}
                  className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveMapping}
                  className="px-10 py-3 bg-cyan-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-cyan-100 hover:bg-cyan-800 active:scale-95 transition-all"
                >
                  Simpan Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDE DRAWER FORM --- */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 p-0 flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                  {drawerMode === "add" ? "Buat Paket Baru" : "Edit Data Paket"}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Medical Checkup Package Management
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <form
              className="p-8 space-y-8 overflow-y-auto flex-1 scrollbar-hide"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nama Paket <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BriefcaseMedical
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                    size={18}
                  />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm font-semibold"
                    placeholder="Contoh: Paket Executive A"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Perusahaan Mitra <span className="text-red-500">*</span>
                </label>
                <Select
                  options={companyOptions}
                  styles={customSelectStyles}
                  placeholder="Cari & Pilih Perusahaan..."
                  value={
                    companyOptions.find(
                      (opt) => opt.value === formData.companyUid
                    ) || null
                  }
                  onChange={(opt) =>
                    setFormData({
                      ...formData,
                      companyUid: opt ? opt.value : "",
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Status Aktivasi
                </label>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
                  {["ACTIVE", "INACTIVE"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, status: s }))
                      }
                      className={`px-8 py-2.5 text-[10px] font-black rounded-xl transition-all ${
                        formData.status === s
                          ? "bg-white text-cyan-700 shadow-md"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {s === "ACTIVE" ? "AKTIF" : "NONAKTIF"}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-8 border-t bg-gray-50 flex gap-4">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-4 text-sm font-bold text-gray-500 bg-white border border-gray-100 rounded-2xl hover:bg-gray-100 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] py-4 bg-cyan-700 text-white text-sm font-bold rounded-2xl shadow-xl shadow-cyan-100 hover:bg-cyan-800 transition-all active:scale-95"
              >
                Simpan Data Paket
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notification Modal */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="p-10 text-center">
              <div
                className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                  notification.type === "success"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 size={40} />
                ) : (
                  <AlertCircle size={40} />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() =>
                setNotification({ ...notification, isOpen: false })
              }
              className="w-full py-6 bg-gray-900 text-white font-bold hover:bg-black transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterPaket;
