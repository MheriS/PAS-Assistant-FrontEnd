import { useState, useEffect } from 'react';
import { getAllRegistrations, updateRegistrationStatus, type RegistrationRecord } from '@/utils/registrationStorage';
import { CheckCircle, XCircle, Clock, Search, MapPin, User, FileText, Calendar, LayoutGrid, Users, Printer, Pill, DollarSign } from 'lucide-react';
import AdminScheduleManager from './AdminScheduleManager';
import AdminWBPManager from './AdminWBPManager';
import DepositDashboard from './DepositDashboard';
import MedicineEntryModal from './MedicineEntryModal';
import MoneyEntryModal from './MoneyEntryModal';
import { API_BASE_URL } from '../config';

export default function AdminDashboard() {
    const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'management' | 'wbp' | 'medicine'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filterDate, setFilterDate] = useState<string>(''); // Kosong berarti semua tanggal
    const [showMedicineModal, setShowMedicineModal] = useState(false);
    const [showMoneyModal, setShowMoneyModal] = useState(false);
    const [selectedRegForMedicine, setSelectedRegForMedicine] = useState<string | null>(null);
    const [selectedRegForMoney, setSelectedRegForMoney] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAllRegistrations();
            setRegistrations(data);
        };
        fetchData();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        await updateRegistrationStatus(id, status);
        const data = await getAllRegistrations();
        setRegistrations(data);
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
                        body { 
                            font-family: 'Times New Roman', serif; 
                            line-height: 1.2; 
                            color: #000; 
                            margin: 0; 
                            padding: 0;
                            background: #fff;
                        }
                        .page {
                            width: 148mm;
                            height: 210mm;
                            margin: auto;
                            padding: 8mm;
                            position: relative;
                            background: white;
                            color: #000;
                            box-sizing: border-box;
                            overflow: hidden;
                            display: flex;
                            flex-direction: column;
                        }
                        .header {
                            display: table;
                            width: 100%;
                            margin-bottom: 2mm;
                        }
                        .logo-cell {
                            display: table-cell;
                            vertical-align: middle;
                            width: 20mm;
                        }
                        .logo-cell svg { width: 15mm; height: 15mm; }
                        .header-text-cell {
                            display: table-cell;
                            vertical-align: middle;
                            text-align: center;
                        }
                        .header-text-cell h3 { margin: 0; font-size: 9pt; font-weight: bold; line-height: 1.2; }
                        .header-text-cell p { margin: 0; font-size: 8pt; line-height: 1.2; }
                        .header-text-cell small { font-size: 7pt; font-weight: 500; }
                        
                        .divider {
                            border-bottom: 2px solid #000;
                            border-top: 1px solid #000;
                            height: 3px;
                            margin: 1.5mm 0;
                        }

                        .title-section {
                            text-align: center;
                            position: relative;
                            margin-bottom: 4mm;
                        }
                        .title-section h2 {
                            margin: 0;
                            font-size: 11pt;
                            text-decoration: underline;
                            font-weight: bold;
                        }
                        .queue-box {
                            position: absolute;
                            top: 0;
                            right: 0;
                            border: 1px solid #000;
                            padding: 1mm 4mm;
                            font-size: 9pt;
                        }
                        .queue-box b { font-size: 12pt; }

                        .data-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 3mm;
                            font-size: 9pt;
                        }
                        .data-table td {
                            vertical-align: top;
                            padding: 0.5mm 0;
                        }
                        .label-col { width: 32mm; }
                        .colon-col { width: 3mm; text-align: center; }
                        .value-col { font-weight: 500; }

                        .followers-grid {
                            font-size: 7.5pt;
                            margin-top: 0.5mm;
                        }
                        .followers-grid span { display: inline-block; width: 25%; }

                        .wbp-container {
                            margin-top: 2mm;
                            padding-top: 1.5mm;
                            border-top: 1px dashed #000;
                            display: table;
                            width: 100%;
                        }
                        .wbp-photo-cell {
                            display: table-cell;
                            width: 32mm;
                            vertical-align: top;
                        }
                        .wbp-photo-box {
                            width: 28mm;
                            height: 35mm;
                            border: 1px solid #000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 7pt;
                        }
                        .wbp-info-cell {
                            display: table-cell;
                            vertical-align: top;
                            padding-left: 3mm;
                        }
                        .wbp-title {
                            font-weight: bold;
                            border-bottom: 1px solid #000;
                            margin-bottom: 1.5mm;
                            padding-bottom: 0.5mm;
                            font-size: 8.5pt;
                        }

                        .footer-table {
                            width: 100%;
                            margin-top: 3mm;
                            border-collapse: collapse;
                        }
                        .footer-table td {
                            width: 50%;
                            text-align: center;
                            vertical-align: top;
                            padding: 0;
                        }
                        .sig-label {
                            font-size: 7.5pt;
                            margin-top: 0.5mm;
                        }

                        .notice-section {
                            margin-top: auto; /* Push to bottom but within one page */
                            font-size: 6.8pt;
                            color: #d32f2f;
                            font-style: italic;
                            line-height: 1.1;
                            border-top: 0.5px solid #000;
                            padding-top: 1mm;
                        }

                        @media print {
                            body { margin: 0; padding: 0; }
                            .page { border: none; padding: 10mm; }
                            @page { size: A5; margin: 0; }
                        }
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
                            <div class="queue-box">
                                No Antrian : <b>${reg.queueNumber || '1'}</b>
                            </div>
                        </div>

                        <table class="data-table">
                            <tr>
                                <td class="label-col">Nama Pengunjung</td>
                                <td class="colon-col">:</td>
                                <td class="value-col">${reg.visitorName.toUpperCase()}</td>
                            </tr>
                             <tr>
                                 <td class="label-col">Jenis Kelamin</td>
                                 <td class="colon-col">:</td>
                                 <td class="value-col">${reg.visitorGender || '-'}</td>
                             </tr>
                            <tr>
                                <td class="label-col">KTP</td>
                                <td class="colon-col">:</td>
                                <td class="value-col">${reg.nik}</td>
                            </tr>
                            <tr>
                                <td class="label-col">Alamat</td>
                                <td class="colon-col">:</td>
                                <td class="value-col">${reg.visitorAddress.toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td class="label-col">No. Telepon</td>
                                <td class="colon-col">:</td>
                                <td class="value-col">${reg.visitorPhone}</td>
                            </tr>
                            <tr>
                                <td class="label-col">Pengikut</td>
                                <td class="colon-col">:</td>
                                <td class="value-col">
                                    <div class="followers-grid">
                                        <span>Laki-laki : ${reg.pengikutLaki || 0}</span>
                                        <span>Perempuan : ${reg.pengikutPerempuan || 0}</span>
                                        <span>Anak : ${reg.pengikutAnak || 0}</span>
                                        <span>Total : ${reg.jumlahPengikut || 0}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td class="label-col">Barang dititipkan</td>
                                <td class="colon-col">:</td>
                                <td class="value-col">-</td>
                            </tr>
                        </table>

                        <div class="wbp-container">
                            <div class="wbp-photo-cell">
                                <div class="wbp-photo-box">
                                    ${reg.inmatePhoto ? `<img src="${reg.inmatePhoto}" style="width: 100%; height: 100%; object-cover: cover;" />` : 'FOTO WBP'}
                                </div>
                            </div>
                            <div class="wbp-info-cell">
                                <div class="wbp-title">Warga Binaan yang dikunjungi :</div>
                                <table class="data-table" style="margin-bottom: 0;">
                                    <tr>
                                        <td style="width: 25mm;">Nama</td>
                                        <td style="width: 3mm; text-align: center;">:</td>
                                        <td style="font-weight: bold;">${reg.inmateName.toUpperCase()}</td>
                                    </tr>
                                    <tr>
                                        <td>Perkara</td>
                                        <td style="text-align: center;">:</td>
                                        <td style="font-weight: 500;">${reg.perkara || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td>Blok / Kamar</td>
                                        <td style="text-align: center;">:</td>
                                        <td style="font-weight: 500;">${reg.roomBlock || '-'}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <table class="footer-table">
                            <tr>
                                <td></td>
                                <td style="font-size: 8.5pt; padding-bottom: 2mm;">
                                    Pamekasan, ${new Date(reg.visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div style="height: 12mm;"></div>
                                    <p style="margin:0; font-weight: bold;">( ................................................ )</p>
                                    <p class="sig-label">Pengunjung</p>
                                </td>
                                <td>
                                    <div style="height: 12mm;"></div>
                                    <p style="margin:0; font-weight: bold;">( ................................................ )</p>
                                    <p class="sig-label">Petugas Pendaftaran</p>
                                </td>
                            </tr>
                        </table>

                        <div class="notice-section">
                            <div>* Kunjungan Tidak Dipungut Biaya (GRATIS)</div>
                            <div>* Apabila anda ada keluhan terhadap pelayanan kunjungan Silahkan SMS 08119102020</div>
                        </div>
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                        };
                    </script>
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

            if (!data || data.length === 0) {
                alert(`Tidak ada data ${type} untuk pendaftaran ini`);
                return;
            }

            const wbpInfo = data[0].wbp || data[0].registration?.wbp;
            const blok = wbpInfo?.blok || '-';
            const kamar = wbpInfo?.kamar || '-';

            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            const title = type === 'medicine' ? 'SLIP PENITIPAN OBAT' : 'SLIP PENITIPAN UANG';

            printWindow.document.write(`
                <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            @page { 
                                size: 58mm auto; 
                                margin: 0; 
                            }
                            html, body {
                                margin: 0;
                                padding: 0;
                                width: 58mm;
                                height: auto;
                                background-color: #fff;
                            }
                            body { 
                                font-family: 'Courier New', Courier, monospace; 
                                padding: 2mm 2mm 8mm 2mm; 
                                font-size: 10px; 
                                line-height: 1.1; 
                                color: #000;
                            }
                            .header { border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 5px; text-align: center; }
                            .title { font-weight: bold; font-size: 11px; display: block; }
                            .reg-id { font-size: 7px; }
                            .item { margin-bottom: 3px; }
                            .label { display: block; font-size: 7px; text-transform: uppercase; }
                            .value { font-weight: bold; font-size: 10px; }
                            .footer { margin-top: 8px; border-top: 1px dashed #000; padding-top: 4px; font-size: 7px; text-align: center; }
                            .sig-box { display: flex; justify-content: space-between; margin-top: 10px; }
                            .sig { border-bottom: 1px solid #000; width: 45%; text-align: center; padding-bottom: 15px; font-size: 7px; }
                            * { -webkit-print-color-adjust: exact; box-sizing: border-box; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <span class="title">PAS ASSISTANT</span>
                            <span class="title">${title}</span>
                            <span class="reg-id">ID: ${regId}</span>
                        </div>
                        
                        <div class="item">
                            <span class="label">Pengunjung:</span>
                            <span class="value">${data[0].registration?.visitor_name || 'N/A'}</span>
                        </div>
                        <div class="item">
                            <span class="label">Tujuan WBP:</span>
                            <span class="value">${data[0].registration?.inmate_name || wbpInfo?.nama || 'N/A'}</span>
                        </div>
                        <div class="item">
                            <span class="label">Blok/Kamar:</span>
                            <span class="value">${blok} / ${kamar}</span>
                        </div>
                        
                        <div class="item" style="border: 1px solid #000; padding: 4px; margin-top: 5px;">
                            <span class="label">` + (type === 'medicine' ? 'Daftar Obat:' : 'Nominal Titipan:') + `</span>
                            <span class="value" style="font-size: 13px;">
                                ` + (type === 'medicine'
                    ? data.map((m: any) => m.medicine_name + ' (' + m.quantity + ')').join('<br/>')
                    : 'Rp ' + new Intl.NumberFormat('id-ID').format(data[0].amount)) + `
                            </span>
                        </div>

                        ` + (type === 'money' && data[0].notes ? `
                        <div class="item">
                            <span class="label">Catatan:</span>
                            <span class="value" style="font-size: 10px;">` + data[0].notes + `</span>
                        </div>
                        ` : '') + `

                        <div class="sig-box">
                            <div class="sig">Petugas</div>
                            <div class="sig">Pengunjung</div>
                        </div>

                        <div class="footer">
                            ${new Date().toLocaleString('id-ID')}
                            <br/>*** SEGEL TERPISAH ***
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        } catch (error) {
            alert('Gagal mengambil data untuk dicetak');
        }
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

    // Pagination logic
    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);

    // Reset current page when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter, filterDate]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari pengunjung, WBP, atau No. Regis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    {['all', 'pending', 'approved', 'rejected', 'management', 'wbp', 'medicine'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${filter === f
                                ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                                : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {f === 'all' ? 'Semua' :
                                f === 'pending' ? 'Tertunda' :
                                    f === 'approved' ? 'Disetujui' :
                                        f === 'rejected' ? 'Ditolak' :
                                            f === 'management' ? 'Atur Jadwal' :
                                                f === 'wbp' ? 'Data WBP' : 'Layanan Obat'}
                        </button>
                    ))}
                </div>
            </div>

            {filter === 'management' ? (
                <AdminScheduleManager />
            ) : filter === 'wbp' ? (
                <AdminWBPManager />
            ) : filter === 'medicine' ? (
                <DepositDashboard />
            ) : (
                <>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-wrap items-center justify-between gap-4 text-sm shadow-sm">
                        <div className="flex items-center gap-6">
                            <span className="text-gray-500 font-medium">Total Data Pencarian: <span className="text-blue-600">{filteredRegistrations.length}</span></span>
                            <div className="flex items-center gap-2 border-l pl-6 border-gray-200">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500 font-medium">Filter Tanggal:</span>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold bg-gray-50"
                                />
                                {filterDate && (
                                    <button
                                        onClick={() => setFilterDate('')}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="text-gray-400 text-xs italic">
                            Halaman {currentPage} dari {totalPages || 1}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {currentItems.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Tidak ada pendaftaran yang ditemukan</p>
                            </div>
                        ) : (
                            currentItems.map((reg) => (
                                <div key={reg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                                    <div className="p-6">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{reg.id}</h3>
                                                    <p className="text-xs text-gray-500">Dibuat pada: {new Date(reg.createdAt).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(reg.status)}`}>
                                                {reg.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <User className="w-5 h-5 text-gray-400 mt-1" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pengunjung</p>
                                                        <p className="text-gray-900 font-medium">{reg.visitorName}</p>
                                                        <p className="text-sm text-gray-600">{reg.nik}</p>
                                                        <p className="text-sm text-gray-600">{reg.visitorPhone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Alamat</p>
                                                        <p className="text-sm text-gray-700 leading-tight">{reg.visitorAddress}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <LayoutGrid className="w-5 h-5 text-emerald-500 mt-1" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">WBP (Warga Binaan)</p>
                                                        <p className="text-gray-900 font-medium">{reg.inmateName}</p>
                                                        <p className="text-sm font-semibold text-emerald-700">{reg.roomBlock || 'Belum diisi'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <ShieldCheck className="w-5 h-5 text-gray-400 mt-1" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Hubungan</p>
                                                        <p className="text-sm text-gray-700 capitalize">{reg.relationship}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-blue-500 mt-1" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Jadwal Kunjungan</p>
                                                        <p className="text-gray-900 font-medium">{new Date(reg.visitDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                        <p className="text-sm font-bold text-blue-600">{reg.visitTime} WIB</p>
                                                    </div>
                                                </div>
                                                {reg.jumlahPengikut && reg.jumlahPengikut > 0 ? (
                                                    <div className="flex items-start gap-3 mt-2 pt-2 border-t border-gray-50">
                                                        <Users className="w-5 h-5 text-orange-500 mt-1" />
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pengikut ({reg.jumlahPengikut})</p>
                                                            <p className="text-xs text-gray-600">
                                                                L: {reg.pengikutLaki} | P: {reg.pengikutPerempuan} | A: {reg.pengikutAnak}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="flex flex-col justify-end gap-2">
                                                {reg.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(reg.id, 'approved')}
                                                            className="w-full bg-emerald-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all font-medium"
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                                                            className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all font-medium"
                                                        >
                                                            <XCircle className="w-4 h-4" /> Tolak
                                                        </button>
                                                    </>
                                                )}
                                                {reg.status === 'approved' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRegForMedicine(reg.id);
                                                                setShowMedicineModal(true);
                                                            }}
                                                            className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-100 transition-all font-medium"
                                                        >
                                                            <Pill className="w-4 h-4 text-orange-600" /> Titipkan Obat
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRegForMoney(reg.id);
                                                                setShowMoneyModal(true);
                                                            }}
                                                            className="w-full bg-emerald-50 text-emerald-600 border border-emerald-200 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all font-medium"
                                                        >
                                                            <DollarSign className="w-4 h-4 text-emerald-600" /> Titipkan Uang
                                                        </button>
                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            <button
                                                                onClick={() => handlePrintSmallSlip(reg.id, 'medicine')}
                                                                className="py-1 px-2 border border-orange-200 text-orange-600 text-[10px] font-bold rounded-lg hover:bg-orange-50 flex items-center justify-center gap-1"
                                                            >
                                                                <Printer className="w-3 h-3" /> Slip Obat
                                                            </button>
                                                            <button
                                                                onClick={() => handlePrintSmallSlip(reg.id, 'money')}
                                                                className="py-1 px-2 border border-emerald-200 text-emerald-600 text-[10px] font-bold rounded-lg hover:bg-emerald-50 flex items-center justify-center gap-1"
                                                            >
                                                                <Printer className="w-3 h-3" /> Slip Uang
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => handlePrint(reg)}
                                                            className="w-full bg-blue-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
                                                        >
                                                            <Printer className="w-4 h-4" /> Cetak Kartu
                                                        </button>
                                                    </>
                                                )}
                                                {reg.status !== 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(reg.id, 'pending')}
                                                        className="text-xs text-gray-400 hover:text-gray-600 underline text-center"
                                                    >
                                                        Kembalikan ke Pending
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination Bottom */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 py-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                            >
                                Sebelumnya
                            </button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all font-bold ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-110' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'}`}
                                    >
                                        {i + 1}
                                    </button>
                                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </>
            )}

            {showMedicineModal && selectedRegForMedicine && (
                <MedicineEntryModal
                    registrationId={selectedRegForMedicine}
                    onClose={() => {
                        setShowMedicineModal(false);
                        setSelectedRegForMedicine(null);
                    }}
                    onSuccess={() => {
                        alert('Data obat berhasil ditambahkan!');
                    }}
                />
            )}

            {showMoneyModal && selectedRegForMoney && (
                <MoneyEntryModal
                    registrationId={selectedRegForMoney}
                    onClose={() => {
                        setShowMoneyModal(false);
                        setSelectedRegForMoney(null);
                    }}
                    onSuccess={() => {
                        alert('Data uang berhasil ditambahkan!');
                    }}
                />
            )}
        </div>
    );
}

const ShieldCheck = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);
