import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

interface MedicineRule {
    id: number;
    title: string;
    description: string;
    is_prohibited: boolean;
}

import { API_BASE_URL } from '../config';

export default function MedicineRules() {
    const [rules, setRules] = useState<MedicineRule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would fetch from the API we created
        // For now, I'll provide a fallback or fetch if the API is ready
        fetch(`${API_BASE_URL}/medicine-deliveries/rules`)
            .then(res => res.json())
            .then(data => {
                setRules(data);
                setLoading(false);
            })
            .catch(() => {
                // Fallback static rules if API fails during dev
                setRules([
                    { id: 1, title: 'Kemasan Asli', description: 'Obat harus dalam kemasan asli yang belum terbuka.', is_prohibited: false },
                    { id: 2, title: 'Tanpa Label', description: 'Dilarang membawa obat tanpa label yang jelas.', is_prohibited: true },
                    { id: 3, title: 'Psikotropika', description: 'Wajib menyertakan resep dokter resmi.', is_prohibited: true },
                ]);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-xl"></div>;

    return (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden h-fit">
            <div className="bg-slate-900 px-6 py-4 flex items-center gap-3 border-b-4 border-blue-700">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-white font-bold tracking-wider uppercase text-sm">Aturan Penitipan Barang/Obat</h3>
            </div>
            <div className="p-6">
                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mb-6">
                    Demi keamanan dan ketertiban, harap perhatikan aturan penyitaan berikut ini:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rules.map((rule) => (
                        <div
                            key={rule.id}
                            className={`p-4 rounded-sm border shadow-sm flex gap-3 ${rule.is_prohibited
                                ? 'bg-red-50 border-red-200'
                                : 'bg-emerald-50 border-emerald-200'
                                }`}
                        >
                            {rule.is_prohibited ? (
                                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h4 className={`text-xs font-black uppercase tracking-widest ${rule.is_prohibited ? 'text-red-900' : 'text-emerald-900'}`}>
                                    {rule.title}
                                </h4>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${rule.is_prohibited ? 'text-red-700' : 'text-emerald-700'}`}>
                                    {rule.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-sm flex gap-4 shadow-sm items-start">
                    <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[11px] text-amber-900 leading-relaxed font-bold uppercase tracking-wide">
                            SEMUA OBAT/BARANG TITIPAN WAJIB MELALUI PROSEDUR PEMERIKSAAN KETAT OLEH PETUGAS MEDIS LAPAS SEBELUM DISERAHKAN KEPADA WARGA BINAAN. KEPUTUSAN TIM MEDIS BERSIFAT MUTLAK.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
