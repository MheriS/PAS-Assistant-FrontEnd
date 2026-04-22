import React, { useState } from 'react';
import { DollarSign, X, Save, AlertCircle } from 'lucide-react';

interface MoneyEntryModalProps {
    registrationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MoneyEntryModal({ registrationId, onClose, onSuccess }: MoneyEntryModalProps) {
    const [formData, setFormData] = useState({
        amount: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:8000/api/money-deposits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    registration_id: registrationId,
                    amount: formData.amount.replace(/[^0-9]/g, ''),
                    notes: formData.notes
                })
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                alert('Gagal menyimpan data uang');
            }
        } catch (error) {
            alert('Terjadi kesalahan koneksi');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6" />
                        <div>
                            <h3 className="font-bold">Titip Uang Baru</h3>
                            <p className="text-xs text-emerald-100">ID Regis: {registrationId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <p className="text-[10px] text-blue-800 leading-tight">
                            Pastikan nominal uang sudah dihitung bersama pengunjung dan disegel dalam amplop/plastik terpisah.
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nominal Uang (Rp)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                            <input
                                required
                                type="text"
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-emerald-500 transition-all font-bold text-xl text-emerald-700"
                                placeholder="0"
                                value={formData.amount}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setFormData({ ...formData, amount: new Intl.NumberFormat('id-ID').format(Number(val)) });
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Catatan / Keperluan</label>
                        <textarea
                            className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                            rows={2}
                            placeholder="Contoh: Uang saku atau beli sabun"
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Data</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
