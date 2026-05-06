import { useState, useEffect } from 'react';
import { getAllRegistrations, updateRegistrationStatus, type RegistrationRecord } from '@/utils/registrationStorage';
import {
    CheckCircle, XCircle, Clock, Search, MapPin, User, FileText,
    Calendar, LayoutGrid, Users, Printer, Pill, DollarSign,
    ChevronLeft, ChevronRight, Filter, RefreshCw, AlertTriangle,
    Shield, Layers
} from 'lucide-react';
import AdminScheduleManager from './AdminScheduleManager';
import AdminWBPManager from './AdminWBPManager';
import DepositDashboard from './DepositDashboard';
import MedicineEntryModal from './MedicineEntryModal';
import MoneyEntryModal from './MoneyEntryModal';
import { API_BASE_URL } from '../config';

const ShieldCheck = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);

type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'management' | 'wbp' | 'medicine';

const NAV_ITEMS: { id: FilterType; label: string; icon: React.ElementType; color: string; activeColor: string }[] = [
    { id: 'all', label: 'Semua Data', icon: Layers, color: 'text-slate-500', activeColor: 'bg-blue-700 text-white' },
    { id: 'pending', label: 'Tertunda', icon: Clock, color: 'text-amber-600', activeColor: 'bg-amber-500 text-white' },
    { id: 'approved', label: 'Disetujui', icon: CheckCircle, color: 'text-emerald-600', activeColor: 'bg-emerald-600 text-white' },
    { id: 'rejected', label: 'Ditolak', icon: XCircle, color: 'text-red-500', activeColor: 'bg-red-500 text-white' },
    { id: 'management', label: 'Atur Jadwal', icon: Calendar, color: 'text-blue-600', activeColor: 'bg-blue-600 text-white' },
    { id: 'wbp', label: 'Data WBP', icon: Shield, color: 'text-indigo-600', activeColor: 'bg-indigo-600 text-white' },
    { id: 'medicine', label: 'Layanan Titipan', icon: Pill, color: 'text-orange-500', activeColor: 'bg-orange-500 text-white' },
];

export default function AdminDashboard() {
    const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filterDate, setFilterDate] = useState<string>('');
    const [showMedicineModal, setShowMedicineModal] = useState(false);
    const [showMoneyModal, setShowMoneyModal] = useState(false);
    const [selectedRegForMedicine, setSelectedRegForMedicine] = useState<string | null>(null);
    const [selectedRegForMoney, setSelectedRegForMoney] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getAllRegistrations();
        setRegistrations(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        await updateRegistrationStatus(id, status);
        fetchData();
    };

    const handlePrint = (reg: RegistrationRecord) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
                <head>
                    <title>Surat Izin Kunjungan - ${reg.id}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&display=swap');
                        * { box-sizing: border-box; }
                        body { font-family: 'Times New Roman', serif; line-height: 1.2; color: #000; margin: 0; padding: 0; background: #fff; }
                        .page { width: 148mm; height: 210mm; margin: auto; padding: 8mm; position: relative; background: white; color: #000; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; }
                        .header { display: table; width: 100%; margin-bottom: 2mm; }
                        .logo-cell { display: table-cell; vertical-align: middle; width: 20mm; }
                        .logo-cell svg { width: 15mm; height: 15mm; }
                        .header-text-cell { display: table-cell; vertical-align: middle; text-align: center; }
                        .header-text-cell h3 { margin: 0; font-size: 9pt; font-weight: bold; line-height: 1.2; }
                        .header-text-cell p { margin: 0; font-size: 8pt; line-height: 1.2; }
                        .header-text-cell small { font-size: 7pt; font-weight: 500; }
                        .divider { border-bottom: 2px solid #000; border-top: 1px solid #000; height: 3px; margin: 1.5mm 0; }
                        .title-section { text-align: center; position: relative; margin-bottom: 4mm; }
                        .title-section h2 { margin: 0; font-size: 11pt; text-decoration: underline; font-weight: bold; }
                        .queue-box { position: absolute; top: 0; right: 0; border: 1px solid #000; padding: 1mm 4mm; font-size: 9pt; }
                        .queue-box b { font-size: 12pt; }
                        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 3mm; font-size: 9pt; }
                        .data-table td { vertical-align: top; padding: 0.5mm 0; }
                        .label-col { width: 32mm; }
                        .colon-col { width: 3mm; text-align: center; }
                        .value-col { font-weight: 500; }
                        .followers-grid { font-size: 7.5pt; margin-top: 0.5mm; }
                        .followers-grid span { display: inline-block; width: 25%; }
                        .wbp-container { margin-top: 2mm; padding-top: 1.5mm; border-top: 1px dashed #000; display: table; width: 100%; }
                        .wbp-photo-cell { display: table-cell; width: 32mm; vertical-align: top; }
                        .wbp-photo-box { width: 28mm; height: 35mm; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 7pt; }
                        .wbp-info-cell { display: table-cell; vertical-align: top; padding-left: 3mm; }
                        .wbp-title { font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 1.5mm; padding-bottom: 0.5mm; font-size: 8.5pt; }
                        .footer-table { width: 100%; margin-top: 3mm; border-collapse: collapse; }
                        .footer-table td { width: 50%; text-align: center; vertical-align: top; padding: 0; }
                        .sig-label { font-size: 7.5pt; margin-top: 0.5mm; }
                        .notice-section { margin-top: auto; font-size: 6.8pt; color: #d32f2f; font-style: italic; line-height: 1.1; border-top: 0.5px solid #000; padding-top: 1mm; }
                        @media print { body { margin: 0; padding: 0; } .page { border: none; padding: 10mm; } @page { size: A5; margin: 0; } }
                    </style>
                </head>
                <body>
                    <div class="page">
                        <div class="header">
                            <div class="logo-cell">
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M50 5L20 20V45C20 63.3333 32.5 80.4167 50 85C67.5 80.4167 80 63.3333 80 45V20L50 5Z" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M50 25V65" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M35 40L65 40" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div class="header-text-cell">
                                <h3>KEMENTERIAN IMIGRASI DAN PEMASYARAKATAN REPUBLIK INDONESIA</h3>
                                <p>KANTOR WILAYAH KEMENTERIAN HUKUM DAN HAM JAWA TIMUR</p>
                                <h3>LEMBAGA PEMASYARAKATAN NARKOTIKA PAMEKASAN</h3>
                                <small>Jalan Pembina No. 02 Pamekasan Telp 0324325333 Fax 0324325333</small>
                            </div>
                        </div>
                        <div class="divider"></div>
                        <div class="title-section">
                            <h2>SURAT IZIN KUNJUNGAN</h2>
                            <div class="queue-box">No Antrian : <b>${reg.queueNumber || '1'}</b></div>
                        </div>
                        <table class="data-table">
                            <tr><td class="label-col">Nama Pengunjung</td><td class="colon-col">:</td><td class="value-col">${reg.visitorName.toUpperCase()}</td></tr>
                            <tr><td class="label-col">Jenis Kelamin</td><td class="colon-col">:</td><td class="value-col">${reg.visitorGender || '-'}</td></tr>
                            <tr><td class="label-col">KTP</td><td class="colon-col">:</td><td class="value-col">${reg.nik}</td></tr>
                            <tr><td class="label-col">Alamat</td><td class="colon-col">:</td><td class="value-col">${reg.visitorAddress.toUpperCase()}</td></tr>
                            <tr><td class="label-col">No. Telepon</td><td class="colon-col">:</td><td class="value-col">${reg.visitorPhone}</td></tr>
                            <tr><td class="label-col">Pengikut</td><td class="colon-col">:</td><td class="value-col"><div class="followers-grid"><span>Laki-laki : ${reg.pengikutLaki || 0}</span><span>Perempuan : ${reg.pengikutPerempuan || 0}</span><span>Anak : ${reg.pengikutAnak || 0}</span><span>Total : ${reg.jumlahPengikut || 0}</span></div></td></tr>
                            <tr><td class="label-col">Barang dititipkan</td><td class="colon-col">:</td><td class="value-col">-</td></tr>
                        </table>
                        <div class="wbp-container">
                            <div class="wbp-photo-cell">
                                <div class="wbp-photo-box">${reg.inmatePhoto ? `<img src="${reg.inmatePhoto}" style="width: 100%; height: 100%; object-cover: cover;" />` : 'FOTO WBP'}</div>
                            </div>
                            <div class="wbp-info-cell">
                                <div class="wbp-title">Warga Binaan yang dikunjungi :</div>
                                <table class="data-table" style="margin-bottom: 0;">
                                    <tr><td style="width: 25mm;">Nama</td><td style="width: 3mm; text-align: center;">:</td><td style="font-weight: bold;">${reg.inmateName.toUpperCase()}</td></tr>
                                    <tr><td>Perkara</td><td style="text-align: center;">:</td><td style="font-weight: 500;">${reg.perkara || '-'}</td></tr>
                                    <tr><td>Blok / Kamar</td><td style="text-align: center;">:</td><td style="font-weight: 500;">${reg.roomBlock || '-'}</td></tr>
                                </table>
                            </div>
                        </div>
                        <table class="footer-table">
                            <tr><td></td><td style="font-size: 8.5pt; padding-bottom: 2mm;">Pamekasan, ${new Date(reg.visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
                            <tr>
                                <td><div style="height: 12mm;"></div><p style="margin:0; font-weight: bold;">( ................................................ )</p><p class="sig-label">Pengunjung</p></td>
                                <td><div style="height: 12mm;"></div><p style="margin:0; font-weight: bold;">( ................................................ )</p><p class="sig-label">Petugas Pendaftaran</p></td>
                            </tr>
                        </table>
                        <div class="notice-section">
                            <div>* Kunjungan Tidak Dipungut Biaya (GRATIS)</div>
                            <div>* Apabila anda ada keluhan terhadap pelayanan kunjungan Silahkan SMS 08119102020</div>
                        </div>
                    </div>
                    <script>window.onload = () => { window.print(); };</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintSmallSlip = async (regId: string, type: 'medicine' | 'money') => {
        const url = type === 'medicine'
            ? `${API_BASE_URL}/medicine-deliveries?registration_id=${regId}`
            : `${API_BASE_URL}/money-deposits?registration_id=${regId}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (!data || data.length === 0) { alert(`Tidak ada data ${type} untuk pendaftaran ini`); return; }
            const wbpInfo = data[0].wbp || data[0].registration?.wbp;
            const blok = wbpInfo?.blok || '-';
            const kamar = wbpInfo?.kamar || '-';
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            const title = type === 'medicine' ? 'SLIP PENITIPAN OBAT' : 'SLIP PENITIPAN UANG';
            printWindow.document.write(`<html><head><title>${title}</title><style>@page{size:58mm auto;margin:0;}html,body{margin:0;padding:0;width:58mm;height:auto;background-color:#fff;}body{font-family:'Courier New',Courier,monospace;padding:2mm 2mm 8mm 2mm;font-size:10px;line-height:1.1;color:#000;}.header{border-bottom:2px solid #000;padding-bottom:3px;margin-bottom:5px;text-align:center;}.title{font-weight:bold;font-size:11px;display:block;}.reg-id{font-size:7px;}.item{margin-bottom:3px;}.label{display:block;font-size:7px;text-transform:uppercase;}.value{font-weight:bold;font-size:10px;}.footer{margin-top:8px;border-top:1px dashed #000;padding-top:4px;font-size:7px;text-align:center;}.sig-box{display:flex;justify-content:space-between;margin-top:10px;}.sig{border-bottom:1px solid #000;width:45%;text-align:center;padding-bottom:15px;font-size:7px;}*{-webkit-print-color-adjust:exact;box-sizing:border-box;}</style></head><body><div class="header"><span class="title">PAS ASSISTANT</span><span class="title">${title}</span><span class="reg-id">ID: ${regId}</span></div><div class="item"><span class="label">Pengunjung:</span><span class="value">${data[0].registration?.visitor_name || 'N/A'}</span></div><div class="item"><span class="label">Tujuan WBP:</span><span class="value">${data[0].registration?.inmate_name || wbpInfo?.nama || 'N/A'}</span></div><div class="item"><span class="label">Blok/Kamar:</span><span class="value">${blok} / ${kamar}</span></div><div class="item" style="border:1px solid #000;padding:4px;margin-top:5px;"><span class="label">` + (type === 'medicine' ? 'Daftar Obat:' : 'Nominal Titipan:') + `</span><span class="value" style="font-size:13px;">` + (type === 'medicine' ? data.map((m: any) => m.medicine_name + ' (' + m.quantity + ')').join('<br/>') : 'Rp ' + new Intl.NumberFormat('id-ID').format(data[0].amount)) + `</span></div>` + (type === 'money' && data[0].notes ? `<div class="item"><span class="label">Catatan:</span><span class="value" style="font-size:10px;">` + data[0].notes + `</span></div>` : '') + `<div class="sig-box"><div class="sig">Petugas</div><div class="sig">Pengunjung</div></div><div class="footer">${new Date().toLocaleString('id-ID')}<br/>*** SEGEL TERPISAH ***</div></body></html>`);
            printWindow.document.close();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
        } catch { alert('Gagal mengambil data untuk dicetak'); }
    };

    const filteredRegistrations = registrations.filter(reg => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            (reg.visitorName?.toLowerCase().includes(term) ?? false) ||
            (reg.inmateName?.toLowerCase().includes(term) ?? false) ||
            (reg.id?.toLowerCase().includes(term) ?? false) ||
            (reg.nik?.toLowerCase().includes(term) ?? false) ||
            (reg.visitorPhone?.toLowerCase().includes(term) ?? false);
        const matchesFilter = filter === 'all' || reg.status === filter;
        const matchesDate = !filterDate || reg.visitDate === filterDate;
        return matchesSearch && matchesFilter && matchesDate;
    });

    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, filter, filterDate]);

    const statusCounts = {
        all: registrations.length,
        pending: registrations.filter(r => r.status === 'pending').length,
        approved: registrations.filter(r => r.status === 'approved').length,
        rejected: registrations.filter(r => r.status === 'rejected').length,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-1 ring-emerald-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200 ring-1 ring-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200 ring-1 ring-amber-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-3 h-3" />;
            case 'rejected': return <XCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    const isViewMode = ['management', 'wbp', 'medicine'].includes(filter);

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* ── SIDEBAR NAV ── */}
            <aside className="w-full lg:w-56 xl:w-64 shrink-0">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-4">
                    {/* Sidebar header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-blue-800 to-blue-700">
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-0.5">Modul Admin</p>
                        <h2 className="text-sm font-black text-white">Panel Administrasi</h2>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                        {[
                            { label: 'Total', value: statusCounts.all, color: 'text-slate-800' },
                            { label: 'Pending', value: statusCounts.pending, color: 'text-amber-600' },
                            { label: 'OK', value: statusCounts.approved, color: 'text-emerald-600' },
                        ].map((s) => (
                            <div key={s.label} className="flex flex-col items-center py-3 px-2">
                                <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Nav items */}
                    <nav className="p-2 space-y-0.5">
                        {NAV_ITEMS.map(item => {
                            const Icon = item.icon;
                            const isActive = filter === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setFilter(item.id)}
                                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 text-sm font-bold ${isActive
                                        ? `${item.activeColor} shadow-sm`
                                        : `text-slate-600 hover:bg-slate-50 hover:text-slate-900`
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`w-4 h-4 ${isActive ? 'opacity-100' : item.color}`} />
                                        <span className="truncate">{item.label}</span>
                                    </div>
                                    {/* count badge for data filters */}
                                    {item.id in statusCounts && (
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {statusCounts[item.id as keyof typeof statusCounts]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="px-3 pb-3">
                        <button onClick={fetchData} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100">
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 min-w-0 space-y-4">

                {/* ── Sub-module views ── */}
                {filter === 'management' && <AdminScheduleManager />}
                {filter === 'wbp' && <AdminWBPManager />}
                {filter === 'medicine' && <DepositDashboard />}

                {/* ── Registration List ── */}
                {!isViewMode && (
                    <>
                        {/* Search + Filter toolbar */}
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, NIK, WBP, atau ID registrasi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-slate-50 transition placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="px-3 py-2.5 border border-slate-200 text-sm rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-medium"
                                />
                                {filterDate && (
                                    <button onClick={() => setFilterDate('')} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results meta */}
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                            <span><span className="text-blue-700 font-black text-sm">{filteredRegistrations.length}</span> pendaftaran ditemukan</span>
                            {totalPages > 1 && <span>Hal. <span className="text-slate-800 font-black">{currentPage}</span> / {totalPages}</span>}
                        </div>

                        {/* Cards */}
                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
                                    <RefreshCw className="w-8 h-8 text-blue-300 animate-spin mb-3" />
                                    <p className="text-sm text-slate-400 font-semibold">Memuat data...</p>
                                </div>
                            ) : currentItems.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-slate-200">
                                    <AlertTriangle className="w-10 h-10 text-slate-300 mb-3" />
                                    <p className="text-sm font-bold text-slate-500">Tidak ada pendaftaran yang ditemukan</p>
                                    <p className="text-xs text-slate-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
                                </div>
                            ) : (
                                currentItems.map((reg) => (
                                    <div
                                        key={reg.id}
                                        className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200"
                                    >
                                        {/* Card Header */}
                                        <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 ${reg.status === 'approved' ? 'bg-emerald-50/50' : reg.status === 'rejected' ? 'bg-red-50/50' : 'bg-amber-50/40'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${reg.status === 'approved' ? 'bg-emerald-100' : reg.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'}`}>
                                                    <FileText className={`w-4 h-4 ${reg.status === 'approved' ? 'text-emerald-600' : reg.status === 'rejected' ? 'text-red-500' : 'text-amber-600'}`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 text-sm tracking-tight">{reg.id}</h3>
                                                    <p className="text-[10px] text-slate-400 font-semibold">Dibuat: {new Date(reg.createdAt).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${getStatusBadge(reg.status)}`}>
                                                {getStatusIcon(reg.status)}
                                                {reg.status === 'approved' ? 'DISETUJUI' : reg.status === 'rejected' ? 'DITOLAK' : 'TERTUNDA'}
                                            </span>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                                            {/* Col 1: Pengunjung */}
                                            <div className="space-y-3 bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Pengunjung</p>
                                                <div className="flex items-start gap-2">
                                                    <User className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-black text-slate-800 text-sm leading-tight">{reg.visitorName}</p>
                                                        <p className="text-xs text-slate-500 font-mono mt-0.5">{reg.nik}</p>
                                                        <p className="text-xs text-slate-500">{reg.visitorPhone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-slate-500 leading-relaxed">{reg.visitorAddress}</p>
                                                </div>
                                            </div>

                                            {/* Col 2: WBP + Jadwal */}
                                            <div className="space-y-3">
                                                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">WBP Dikunjungi</p>
                                                    <div className="flex items-start gap-2">
                                                        <LayoutGrid className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-black text-slate-800 text-sm leading-tight">{reg.inmateName}</p>
                                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-block mt-1">{reg.roomBlock || 'Blok belum diisi'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                                                        <p className="text-xs text-slate-500 capitalize">{reg.relationship}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700">{new Date(reg.visitDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        <p className="text-xs font-black text-blue-700 mt-0.5">{reg.visitTime} WIB</p>
                                                    </div>
                                                </div>

                                                {reg.jumlahPengikut && reg.jumlahPengikut > 0 ? (
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100 text-xs">
                                                        <Users className="w-3.5 h-3.5 text-amber-500" />
                                                        <span className="font-bold text-amber-700">{reg.jumlahPengikut} Pengikut</span>
                                                        <span className="text-amber-500 text-[10px] ml-1">L:{reg.pengikutLaki} P:{reg.pengikutPerempuan} A:{reg.pengikutAnak}</span>
                                                    </div>
                                                ) : null}
                                            </div>

                                            {/* Col 3: Aksi */}
                                            <div className="flex flex-col gap-2 justify-start">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aksi</p>

                                                {reg.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(reg.id, 'approved')}
                                                            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all font-bold text-sm shadow-sm shadow-emerald-200"
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                                                            className="w-full bg-white text-red-600 border border-red-200 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 active:scale-95 transition-all font-bold text-sm"
                                                        >
                                                            <XCircle className="w-4 h-4" /> Tolak
                                                        </button>
                                                    </>
                                                )}

                                                {reg.status === 'approved' && (
                                                    <>
                                                        <button
                                                            onClick={() => { setSelectedRegForMedicine(reg.id); setShowMedicineModal(true); }}
                                                            className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-100 active:scale-95 transition-all font-bold text-xs"
                                                        >
                                                            <Pill className="w-3.5 h-3.5" /> Titipkan Obat
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedRegForMoney(reg.id); setShowMoneyModal(true); }}
                                                            className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-100 active:scale-95 transition-all font-bold text-xs"
                                                        >
                                                            <DollarSign className="w-3.5 h-3.5" /> Titipkan Uang
                                                        </button>
                                                        <div className="grid grid-cols-2 gap-1.5">
                                                            <button
                                                                onClick={() => handlePrintSmallSlip(reg.id, 'medicine')}
                                                                className="py-1.5 px-2 border border-orange-200 text-orange-600 text-[10px] font-black rounded-lg hover:bg-orange-50 flex items-center justify-center gap-1 active:scale-95 transition-all"
                                                            >
                                                                <Printer className="w-3 h-3" /> Slip Obat
                                                            </button>
                                                            <button
                                                                onClick={() => handlePrintSmallSlip(reg.id, 'money')}
                                                                className="py-1.5 px-2 border border-emerald-200 text-emerald-600 text-[10px] font-black rounded-lg hover:bg-emerald-50 flex items-center justify-center gap-1 active:scale-95 transition-all"
                                                            >
                                                                <Printer className="w-3 h-3" /> Slip Uang
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => handlePrint(reg)}
                                                            className="w-full bg-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 active:scale-95 transition-all font-bold text-sm shadow-sm shadow-blue-200"
                                                        >
                                                            <Printer className="w-4 h-4" /> Cetak Kartu
                                                        </button>
                                                    </>
                                                )}

                                                {reg.status !== 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(reg.id, 'pending')}
                                                        className="mt-auto text-xs text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline text-center transition-colors pt-1"
                                                    >
                                                        Kembalikan ke Pending
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 py-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Sebelumnya
                                </button>
                                <div className="flex gap-1.5">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-9 h-9 rounded-lg text-sm font-black transition-all border ${currentPage === i + 1
                                                ? 'bg-blue-700 text-white border-blue-700 shadow-md'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition shadow-sm"
                                >
                                    Selanjutnya <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {showMedicineModal && selectedRegForMedicine && (
                <MedicineEntryModal
                    registrationId={selectedRegForMedicine}
                    onClose={() => { setShowMedicineModal(false); setSelectedRegForMedicine(null); }}
                    onSuccess={() => { alert('Data obat berhasil ditambahkan!'); }}
                />
            )}
            {showMoneyModal && selectedRegForMoney && (
                <MoneyEntryModal
                    registrationId={selectedRegForMoney}
                    onClose={() => { setShowMoneyModal(false); setSelectedRegForMoney(null); }}
                    onSuccess={() => { alert('Data uang berhasil ditambahkan!'); }}
                />
            )}
        </div>
    );
}
