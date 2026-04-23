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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
                <Info className="w-6 h-6 text-white" />
                <h3 className="text-white font-bold">Aturan Penitipan Obat</h3>
            </div>
            <div className="p-6">
                <p className="text-sm text-gray-600 mb-6">
                    Demi keamanan dan ketertiban, harap perhatikan aturan penitipan obat berikut ini:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rules.map((rule) => (
                        <div
                            key={rule.id}
                            className={`p-4 rounded-xl border flex gap-3 ${rule.is_prohibited
                                ? 'bg-red-50 border-red-100'
                                : 'bg-emerald-50 border-emerald-100'
                                }`}
                        >
                            {rule.is_prohibited ? (
                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            )}
                            <div>
                                <h4 className={`text-sm font-bold ${rule.is_prohibited ? 'text-red-900' : 'text-emerald-900'}`}>
                                    {rule.title}
                                </h4>
                                <p className={`text-xs mt-1 ${rule.is_prohibited ? 'text-red-700' : 'text-emerald-700'}`}>
                                    {rule.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>PENTING:</strong> Semua obat yang dititipkan akan diperiksa terlebih dahulu oleh tim Medis Lapas sebelum diserahkan kepada Warga Binaan. Keputusan tim medis bersifat mutlak.
                    </p>
                </div>
            </div>
        </div>
    );
}
