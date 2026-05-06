import { useState, useEffect } from 'react';
import { Calendar, User, IdCard, FileText, CheckCircle, Search, Scan, UserCheck, UserPlus, Building2 } from 'lucide-react';
import { findVisitorByNIK, saveVisitor, type VisitorData } from '@/utils/visitorStorage';
import { saveRegistration, getAvailableDates, getAvailableTimes, searchWBP, type VisitSlot } from '@/utils/registrationStorage';
import MedicineRules from './MedicineRules';

interface FormData {
    visitorName: string;
    visitorId: string;
    visitorPhone: string;
    visitorAddress: string;
    inmateName: string;
    relationship: string;
    visitDate: string;
    visitTime: string;
    roomBlock: string;
    pengikutLaki: number;
    pengikutPerempuan: number;
    pengikutAnak: number;
    jumlahPengikut: number;
    visitorGender: string;
}

// Shared input/label styles
const inputCls = "w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors placeholder:text-slate-400";
const labelCls = "block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5";
const disabledInputCls = "w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed";

export default function RegistrationForm() {
    const [nikInput, setNikInput] = useState('');
    const [nikChecked, setNikChecked] = useState(false);
    const [isReturningVisitor, setIsReturningVisitor] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [regNumber, setRegNumber] = useState('');
    const [formData, setFormData] = useState<FormData>({
        visitorName: '', visitorId: '', visitorPhone: '', visitorAddress: '',
        inmateName: '', relationship: '', visitDate: '', visitTime: '',
        roomBlock: '', pengikutLaki: 0, pengikutPerempuan: 0, pengikutAnak: 0,
        jumlahPengikut: 0, visitorGender: '',
    });
    const [wbpSuggestions, setWbpSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [selectedWbpPhoto, setSelectedWbpPhoto] = useState<string | null>(null);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<VisitSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { fetchDates(); }, []);

    const fetchDates = async () => {
        const dates = await getAvailableDates();
        setAvailableDates(dates);
    };

    const handleDateChange = async (date: string) => {
        setFormData({ ...formData, visitDate: date, visitTime: '' });
        if (date) {
            setIsLoadingSlots(true);
            const times = await getAvailableTimes(date);
            setAvailableSlots(times);
            setIsLoadingSlots(false);
        } else {
            setAvailableSlots([]);
        }
    };

    const handleNikSearch = async () => {
        if (!nikInput || nikInput.length !== 16) { alert('Masukkan NIK dengan benar (16 digit)'); return; }
        setIsSearching(true);
        try {
            const existingVisitor = await findVisitorByNIK(nikInput);
            if (existingVisitor) {
                setFormData({ ...formData, visitorId: existingVisitor.nik, visitorName: existingVisitor.name, visitorPhone: existingVisitor.phone, visitorAddress: existingVisitor.address, relationship: existingVisitor.relationship, visitorGender: existingVisitor.gender || '' });
                setIsReturningVisitor(true);
            } else {
                setFormData({ ...formData, visitorId: nikInput });
                setIsReturningVisitor(false);
            }
            setNikChecked(true);
        } catch { alert('Gagal mencari data pengunjung'); }
        finally { setIsSearching(false); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWbpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, inmateName: value });
        if (value.length > 2) {
            const results = await searchWBP(value);
            setWbpSuggestions(results);
            setShowSuggestions(true);
        } else {
            setWbpSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectWbp = (wbp: any) => {
        setFormData({ ...formData, inmateName: wbp.nama, roomBlock: `${wbp.blok} / ${wbp.kamar}` });
        setSelectedWbpPhoto(wbp.foto);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const visitorData: VisitorData = { nik: formData.visitorId, name: formData.visitorName, phone: formData.visitorPhone, address: formData.visitorAddress, relationship: formData.relationship, gender: formData.visitorGender };
            await saveVisitor(visitorData);
            const registration = await saveRegistration({ nik: formData.visitorId, visitorName: formData.visitorName, visitorPhone: formData.visitorPhone, visitorAddress: formData.visitorAddress, inmateName: formData.inmateName, relationship: formData.relationship, visitDate: formData.visitDate, visitTime: formData.visitTime, roomBlock: formData.roomBlock, pengikutLaki: formData.pengikutLaki, pengikutPerempuan: formData.pengikutPerempuan, pengikutAnak: formData.pengikutAnak, jumlahPengikut: formData.jumlahPengikut, visitorGender: formData.visitorGender });
            setRegNumber(registration.id);
            setSubmitted(true);
            setIsSubmitting(false);
            setTimeout(() => {
                setSubmitted(false); setNikChecked(false); setNikInput(''); setIsReturningVisitor(false);
                setFormData({ visitorName: '', visitorId: '', visitorPhone: '', visitorAddress: '', inmateName: '', relationship: '', visitDate: '', visitTime: '', roomBlock: '', pengikutLaki: 0, pengikutPerempuan: 0, pengikutAnak: 0, jumlahPengikut: 0, visitorGender: '' });
            }, 5000);
        } catch {
            alert('Terjadi kesalahan saat menyimpan data');
            setIsSubmitting(false);
        }
    };

    const handleResetNik = () => {
        setNikChecked(false); setNikInput(''); setIsReturningVisitor(false); setSelectedWbpPhoto(null);
        setFormData({ visitorName: '', visitorId: '', visitorPhone: '', visitorAddress: '', inmateName: '', relationship: '', visitDate: '', visitTime: '', roomBlock: '', pengikutLaki: 0, pengikutPerempuan: 0, pengikutAnak: 0, jumlahPengikut: 0, visitorGender: '' });
    };

    // ── Success Screen ───────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 border-t-4 border-t-emerald-600 p-10 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-emerald-800 font-black uppercase tracking-wider mb-2 text-xl">Pendaftaran Berhasil!</h2>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl my-5 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Nomor Registrasi Kunjungan</p>
                    <p className="text-2xl font-mono text-blue-800 font-black tracking-widest">{regNumber}</p>
                </div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-2">
                    Simpan nomor ini untuk pengecekan status kunjungan Anda.
                </p>
            </div>
        );
    }

    // ── Main Form ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                    <Building2 className="w-48 h-48 -mr-10 -mt-10" />
                </div>

                {/* Header */}
                <div className="mb-8 pb-5 border-b border-slate-200 relative z-10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Formulir Pendaftaran Kunjungan</h2>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {!nikChecked ? 'Masukkan NIK untuk memulai pendaftaran' : 'Lengkapi formulir data di bawah ini'}
                        </p>
                    </div>
                </div>

                {!nikChecked ? (
                    // ── Step 1: NIK Input ─────────────────────────────────────────────────
                    <div className="space-y-5">
                        <MedicineRules />
                        <div className="bg-blue-50 border border-blue-200 border-l-4 border-l-blue-700 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-100">
                                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                                    <Scan className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-slate-900 font-black uppercase tracking-wider text-sm">Validasi NIK Pengunjung</h3>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Sistem Pemeriksaan Identitas Kependudukan</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="nikInput" className={labelCls}>Nomor Induk Kependudukan (16 Digit) *</label>
                                    <input
                                        type="text" id="nikInput" value={nikInput}
                                        onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 16) setNikInput(v); }}
                                        maxLength={16} placeholder="Ketikkan NIK sesuai KTP..."
                                        className={`${inputCls} text-lg font-mono tracking-widest`}
                                        disabled={isSearching}
                                    />
                                    <div className="flex justify-between mt-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status input:</span>
                                        <span className={`text-[10px] font-mono font-bold ${nikInput.length === 16 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            [{nikInput.length}/16 DIGIT]
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button" onClick={handleNikSearch}
                                    disabled={nikInput.length !== 16 || isSearching}
                                    className={`w-full py-3.5 rounded-lg font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${nikInput.length === 16 && !isSearching
                                        ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-md shadow-blue-200'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {isSearching ? (
                                        <><div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />Mencari Data Identitas...</>
                                    ) : (
                                        <><Search className="w-4 h-4" />Proses Verifikasi NIK</>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex gap-4 items-start">
                            <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Panduan Pengisian</p>
                                <ul className="text-xs text-slate-500 space-y-1.5 font-medium leading-relaxed">
                                    {[
                                        'Sistem akan otomatis mendeteksi jika NIK sudah pernah terdaftar pada kunjungan sebelumnya.',
                                        'Jika NIK baru, formulir pendaftaran lengkap akan otomatis terbuka.',
                                        'Pastikan NIK sesuai dengan Kartu Tanda Penduduk (KTP) fisik.',
                                    ].map((t, i) => (
                                        <li key={i} className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />{t}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ── Step 2: Full Form ────────────────────────────────────────────────
                    <form onSubmit={handleSubmit} className="space-y-7">

                        {/* Status Banner */}
                        <div className={`rounded-xl p-4 border flex items-center gap-4 ${isReturningVisitor ? 'bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-600' : 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-600'}`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isReturningVisitor ? 'bg-emerald-600' : 'bg-blue-700'}`}>
                                {isReturningVisitor ? <UserCheck className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-black uppercase tracking-widest text-sm ${isReturningVisitor ? 'text-emerald-900' : 'text-blue-900'}`}>
                                    {isReturningVisitor ? 'Pengunjung Terdaftar' : 'Pengunjung Baru'}
                                </h3>
                                <p className={`text-[11px] font-semibold tracking-wide mt-0.5 ${isReturningVisitor ? 'text-emerald-700' : 'text-blue-700'}`}>
                                    {isReturningVisitor ? 'Data ditemukan. Silakan periksa kembali.' : 'NIK belum terdaftar. Harap lengkapi data.'}
                                </p>
                            </div>
                            <button type="button" onClick={handleResetNik}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                Ganti NIK
                            </button>
                        </div>

                        {/* Section: Data Pengunjung */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                                <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-slate-600" />
                                </div>
                                <h3 className="text-slate-800 font-black uppercase tracking-widest text-sm">Data Identitas Pengunjung</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="visitorId" className={labelCls}>NIK (No. KTP) *</label>
                                    <input type="text" id="visitorId" name="visitorId" value={formData.visitorId} disabled className={disabledInputCls} />
                                </div>
                                <div>
                                    <label htmlFor="visitorName" className={labelCls}>Nama Lengkap *</label>
                                    <input type="text" id="visitorName" name="visitorName" value={formData.visitorName} onChange={handleChange} required className={inputCls} placeholder="Nama lengkap sesuai KTP" />
                                </div>
                                <div>
                                    <label htmlFor="visitorPhone" className={labelCls}>No. Telepon *</label>
                                    <input type="tel" id="visitorPhone" name="visitorPhone" value={formData.visitorPhone} onChange={handleChange} required className={inputCls} placeholder="08xxx" />
                                </div>
                                <div>
                                    <label htmlFor="visitorGender" className={labelCls}>Jenis Kelamin *</label>
                                    <select id="visitorGender" name="visitorGender" value={formData.visitorGender} onChange={handleChange} required className={inputCls}>
                                        <option value="">Pilih jenis kelamin</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="relationship" className={labelCls}>Hubungan dengan WBP *</label>
                                    <select id="relationship" name="relationship" value={formData.relationship} onChange={handleChange} required className={inputCls}>
                                        <option value="">Pilih hubungan</option>
                                        <option value="keluarga">Keluarga Inti</option>
                                        <option value="saudara">Saudara</option>
                                        <option value="kuasa-hukum">Kuasa Hukum</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="visitorAddress" className={labelCls}>Alamat Lengkap *</label>
                                <textarea id="visitorAddress" name="visitorAddress" value={formData.visitorAddress} onChange={handleChange} required rows={3} className={inputCls} placeholder="Alamat sesuai KTP" />
                            </div>
                        </div>

                        {/* Section: Pengikut */}
                        <div className="pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                                <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                                    <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                                </div>
                                <h3 className="text-slate-800 font-black uppercase tracking-widest text-sm">Data Pengikut (Anggota Keluarga Lain)</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { id: 'pengikutLaki', label: 'Laki-laki', key: 'pengikutLaki' as const },
                                    { id: 'pengikutPerempuan', label: 'Perempuan', key: 'pengikutPerempuan' as const },
                                    { id: 'pengikutAnak', label: 'Anak-anak', key: 'pengikutAnak' as const },
                                ].map(f => (
                                    <div key={f.id}>
                                        <label htmlFor={f.id} className={labelCls}>{f.label}</label>
                                        <input type="number" id={f.id} name={f.id} min="0" value={formData[f.key]}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setFormData(prev => ({
                                                    ...prev, [f.key]: val,
                                                    jumlahPengikut: (f.key === 'pengikutLaki' ? val : prev.pengikutLaki) + (f.key === 'pengikutPerempuan' ? val : prev.pengikutPerempuan) + (f.key === 'pengikutAnak' ? val : prev.pengikutAnak)
                                                }));
                                            }}
                                            className={inputCls}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label htmlFor="jumlahPengikut" className={labelCls}>Total Pengikut</label>
                                    <input type="number" id="jumlahPengikut" name="jumlahPengikut" value={formData.jumlahPengikut} readOnly className={`${disabledInputCls} font-black text-blue-700`} />
                                </div>
                            </div>
                        </div>

                        {/* Section: Data WBP */}
                        <div className="pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                                <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                                    <IdCard className="w-3.5 h-3.5 text-slate-600" />
                                </div>
                                <h3 className="text-slate-800 font-black uppercase tracking-widest text-sm">Data Warga Binaan Pemasyarakatan (WBP)</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label htmlFor="inmateName" className={labelCls}>Nama WBP *</label>
                                    <input type="text" id="inmateName" name="inmateName" value={formData.inmateName} onChange={handleWbpChange} autoComplete="off" required className={inputCls} placeholder="Ketik nama warga binaan..." />
                                    {showSuggestions && wbpSuggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                            {wbpSuggestions.map((wbp, i) => (
                                                <div key={i} onClick={() => selectWbp(wbp)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 border-slate-100 transition-colors">
                                                    <p className="font-bold text-slate-900 text-sm">{wbp.nama}</p>
                                                    <p className="text-xs text-blue-600 font-semibold mt-0.5">{wbp.blok} / {wbp.kamar}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedWbpPhoto && (
                                        <div className="mt-4 flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                            <img src={selectedWbpPhoto} alt="WBP Photo" className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-md" />
                                            <div>
                                                <p className="text-sm font-bold text-blue-800">Foto Teridentifikasi</p>
                                                <p className="text-xs text-blue-600 mt-1">Pastikan wajah sesuai dengan warga binaan yang dituju.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="roomBlock" className={labelCls}>Blok Kamar WBP *</label>
                                    <input type="text" id="roomBlock" name="roomBlock" value={formData.roomBlock} readOnly required className={`${disabledInputCls} font-semibold text-blue-800`} placeholder="Otomatis terisi..." />
                                </div>
                            </div>
                        </div>

                        {/* Section: Jadwal */}
                        <div className="pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                                <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                </div>
                                <h3 className="text-slate-800 font-black uppercase tracking-widest text-sm">Jadwal Registrasi Kunjungan</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="visitDate" className={labelCls}>Tanggal Kunjungan *</label>
                                    <select id="visitDate" name="visitDate" value={formData.visitDate} onChange={(e) => handleDateChange(e.target.value)} required className={inputCls}>
                                        <option value="">Pilih tanggal</option>
                                        {availableDates.map((date: string) => (
                                            <option key={date} value={date}>
                                                {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </option>
                                        ))}
                                        {availableDates.length === 0 && <option disabled>Tidak ada jadwal tersedia</option>}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="visitTime" className={labelCls}>Pilih Sesi Kunjungan *</label>
                                    <select id="visitTime" name="visitTime" value={formData.visitTime} onChange={handleChange} required disabled={!formData.visitDate || isLoadingSlots} className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`}>
                                        <option value="">{isLoadingSlots ? 'Memuat jadwal...' : 'Pilih jadwal'}</option>
                                        {availableSlots.map(slot => {
                                            const label = slot.session_name
                                                ? `${slot.session_name} (${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)})`
                                                : `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`;
                                            return <option key={slot.id} value={label}>{label}</option>;
                                        })}
                                        {formData.visitDate && !isLoadingSlots && availableSlots.length === 0 && <option disabled>Penuh / Tidak tersedia</option>}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex gap-4 items-start">
                            <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Kewajiban Pengunjung</p>
                                <ul className="text-xs text-slate-500 space-y-1.5 font-medium leading-relaxed">
                                    {[
                                        'Hadir 15 menit sebelum waktu kunjungan untuk registrasi fisik.',
                                        'Membawa KTP asli sebagai bukti identitas validator.',
                                        'Mematuhi segala tata tertib, aturan pakaian, dan barang bawaan Lapas.',
                                    ].map((t, i) => (
                                        <li key={i} className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 flex-shrink-0" />{t}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-md ${isSubmitting
                                ? 'bg-slate-200 cursor-not-allowed text-slate-400'
                                : 'bg-blue-700 text-white hover:bg-blue-800 shadow-blue-200 hover:shadow-lg'}`}
                        >
                            {isSubmitting ? (
                                <><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />Memproses Pendaftaran...</>
                            ) : (
                                <><CheckCircle className="w-5 h-5" />Daftar Kunjungan</>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
