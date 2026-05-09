import { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, Mail, CheckCircle, XCircle, ShieldAlert, Waves, BoxSelect, Info, Building2 } from 'lucide-react';
import { getAllVisitSlots, getAllRecurringSlots } from '../utils/registrationStorage';

export default function InfoPanel() {
    const [schedule, setSchedule] = useState<{ day: string; time: string; type: 'Biasa' | 'Spesial', dateStr?: string }[]>([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const [slots, recurring] = await Promise.all([
                    getAllVisitSlots(),
                    getAllRecurringSlots()
                ]);
                const daysOrder = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                const scheduleList: { day: string, time: string, type: 'Biasa' | 'Spesial', dateStr?: string }[] = [];

                recurring.filter((r: any) => r.is_active).forEach((rule: any) => {
                    const dayName = daysOrder[rule.day_of_week];
                    const timeStr = `${rule.start_time.substring(0, 5)}-${rule.end_time.substring(0, 5)}`;
                    const existing = scheduleList.find(s => s.day === dayName && s.type === 'Biasa');
                    if (existing) {
                        existing.time = existing.time.replace(' WIB', '') + ` & ${timeStr} WIB`;
                    } else {
                        scheduleList.push({
                            day: dayName,
                            time: `${timeStr} WIB`,
                            type: 'Biasa'
                        });
                    }
                });

                const today = new Date().toISOString().split('T')[0];
                slots.filter((s: any) => s.is_available && s.date >= today).forEach((slot: any) => {
                    const dateObj = new Date(slot.date);
                    const dayName = daysOrder[dateObj.getDay()];
                    const dateFormatted = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                    const timeStr = `${slot.start_time.substring(0, 5)}-${slot.end_time.substring(0, 5)}`;

                    const existing = scheduleList.find(s => s.dateStr === slot.date && s.type === 'Spesial');
                    if (existing) {
                        existing.time = existing.time.replace(' WIB', '') + ` & ${timeStr} WIB`;
                    } else {
                        scheduleList.push({
                            day: `${dayName}, ${dateFormatted}`,
                            time: `${timeStr} WIB`,
                            type: 'Spesial',
                            dateStr: slot.date
                        });
                    }
                });

                scheduleList.sort((a, b) => {
                    if (a.type === 'Biasa' && b.type === 'Biasa') return daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
                    if (a.type === 'Spesial' && b.type === 'Spesial') return a.dateStr!.localeCompare(b.dateStr!);
                    return a.type === 'Biasa' ? -1 : 1;
                });

                if (scheduleList.length > 0) setSchedule(scheduleList);
            } catch (e) {
                console.error('Error fetching schedule:', e);
            }
        };
        fetchSchedule();
    }, []);

    const forbiddenFoods = [
        "Makanan serbuk/bubuk", "Mie instan", "Rokok & Korek api",
        "Kacang kulit/atom", "Rambak", "Roti", "Bumbu pecel/sambal", "Permen",
        "Makanan berongga", "Cumi-cumi utuh", "Serundeng/Abon", "Perkedel & tahu",
        "Pentol/Bakso", "Gorengan", "Cabe & Bawang", "Masakan berkuah", "Minuman berwarna"
    ];
    const forbiddenPersonalCare = ["Parfum & Roll on", "Sikat & Pasta gigi", "Sabun cuci", "Kosmetik & Sachet"];
    const forbiddenPackaging = ["Kemasan Kaca", "Kaleng", "Botol Plastik"];
    const forbiddenMain = [
        "HP & Barang Elektronik", "Narkoba & Alkohol",
        "Senjata Tajam/Api", "Kasur dan sejenisnya", "Pakaian dibatasi maksimal 2 potong (dilarang jeans & topi)"
    ];

    return (
        <div className="space-y-6">
            {/* Header Info Card */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-xl shadow-lg p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-[0.06] pointer-events-none">
                    <MapPin className="w-48 h-48 -mr-12 -mt-12" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-200" />
                    </div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wider">
                        Lapas Narkotika IIA Pamekasan
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                    <div className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-lg p-4">
                        <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-blue-200" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Alamat Institusi</p>
                            <p className="text-sm font-semibold text-white leading-relaxed">Jl. Pembina No.02, RW.01, Rw. 01, Jungcangcang, Kec. Pamekasan, Kabupaten Pamekasan, Jawa Timur 69317</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-lg p-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Phone className="w-4 h-4 text-blue-200" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Telepon</p>
                                <p className="text-sm font-bold text-white">082143317094</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-lg p-3">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4 text-blue-200" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Email Resmi</p>
                                <p className="text-sm font-bold text-white break-all">lapasnarkotik.pamekasan@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side */}
                <div className="space-y-5">
                    {/* Schedule - DYNAMIC */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-blue-50 border-b border-blue-100 px-5 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-blue-700" />
                            </div>
                            <h3 className="font-black text-blue-900 tracking-wider uppercase text-sm">Jadwal Layanan Kunjungan</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            {schedule.length > 0 ? (
                                schedule.map((s, i) => (
                                    <div key={i} className={`flex justify-between items-center ${i < schedule.length - 1 ? 'pb-3 border-b border-slate-100' : ''}`}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 uppercase text-xs tracking-widest">{s.day}</span>
                                            <span className={`text-[9px] font-black uppercase mt-0.5 ${s.type === 'Spesial' ? 'text-amber-500' : 'text-slate-400'}`}>{s.type === 'Spesial' ? 'Spesial' : 'Biasa (Rutin)'}</span>
                                        </div>
                                        <span className="font-black text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg text-xs">{s.time}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-2 font-semibold">Memuat jadwal...</p>
                            )}
                        </div>
                    </div>

                    {/* Allowed Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-emerald-700" />
                            </div>
                            <h3 className="font-black text-emerald-900 tracking-wider uppercase text-sm">Barang Diperbolehkan</h3>
                        </div>
                        <div className="p-5">
                            <ul className="space-y-2.5">
                                {[
                                    { label: "Makanan kemasan (max 10kg)", detail: "Harus dalam segel pabrik" },
                                    { label: "Uang tunai (max Rp 1.000.000)", detail: "Untuk penitipan di kantin/layanan" },
                                    { label: "Pakaian dalam (max 2 helai)", detail: "Harus baru/bersih" },
                                    { label: "Obat dengan resep dokter", detail: "Wajib lapor petugas medis" }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 uppercase">{item.label}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">{item.detail}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Warning Banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        <div className="flex gap-3">
                            <div className="w-9 h-9 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Info className="w-5 h-5 text-amber-700" />
                            </div>
                            <div>
                                <p className="font-black text-amber-900 text-xs tracking-widest uppercase mb-1">Peringatan Keamanan</p>
                                <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                                    Semua barang bawaan wajib melalui pemeriksaan X-Ray dan manual oleh petugas. Pelanggaran dikenakan sanksi tegas sesuai aturan Lapas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Prohibited Items */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                    <div className="bg-red-50 border-b border-red-100 px-5 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <h3 className="font-black text-red-900 tracking-wider uppercase text-sm">Daftar Larangan (Prohibited)</h3>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Main & Personal Care */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                                <div className="flex items-center gap-2 text-[10px] font-black text-red-700 uppercase tracking-widest mb-3 border-b border-red-100 pb-2">
                                    <ShieldAlert className="w-3 h-3" /> Larangan Utama
                                </div>
                                <div className="space-y-2">
                                    {forbiddenMain.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                                            <span className="text-[10px] font-bold text-slate-700 leading-tight uppercase">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">
                                    <Waves className="w-3 h-3" /> Perawatan Diri
                                </div>
                                <div className="space-y-2">
                                    {forbiddenPersonalCare.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 flex-shrink-0" />
                                            <span className="text-[10px] font-bold text-slate-700 leading-tight uppercase">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Packaging */}
                        <div className="bg-white rounded-lg p-4 border border-dashed border-red-200">
                            <div className="flex items-center gap-2 text-[10px] font-black text-red-700 uppercase tracking-widest mb-3">
                                <BoxSelect className="w-3 h-3" /> Jenis Kemasan Terlarang
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {forbiddenPackaging.map((item, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-[10px] font-black text-red-700 uppercase">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Food list */}
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Makanan & Minuman (Semua)</span>
                                <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black">{forbiddenFoods.length} Item</span>
                            </div>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                {forbiddenFoods.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom warning bar */}
                    <div className="bg-red-700 px-5 py-3 text-center">
                        <p className="text-white text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-200" />
                            Dilarang keras memasukkan barang titipan secara ilegal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
