import React, { useState } from 'react';
import { Pill, X, Plus, Save, Trash2, AlertCircle } from 'lucide-react';

interface MedicineEntryModalProps {
    registrationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface MedicineItem {
    name: string;
    quantity: string;
    dosage: string;
}

import { API_BASE_URL } from '../config';

export default function MedicineEntryModal({ registrationId, onClose, onSuccess }: MedicineEntryModalProps) {
    const [medicines, setMedicines] = useState<MedicineItem[]>([{ name: '', quantity: '', dosage: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasConsented, setHasConsented] = useState(false);

    const addRow = () => {
        setMedicines([...medicines, { name: '', quantity: '', dosage: '' }]);
    };

    const removeRow = (index: number) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index));
        }
    };

    const updateRow = (index: number, field: keyof MedicineItem, value: string) => {
        setMedicines(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasConsented) {
            alert('Harap konfirmasi bahwa pengunjung sudah membaca aturan obat dilarang.');
            return;
        }

        setIsSubmitting(true);
        try {
            const promises = medicines.filter(m => m.name.trim()).map(async (m) => {
                const res = await fetch(`${API_BASE_URL}/medicine-deliveries`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        registration_id: registrationId,
                        medicine_name: m.name,
                        quantity: m.quantity,
                        dosage: m.dosage
                    })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || `Gagal menyimpan ${m.name}`);
                }
                return res;
            });

            await Promise.all(promises);
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(`Gagal: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <Pill className="w-6 h-6" />
                        <div>
                            <h3 className="font-bold">Titip Obat Terpadu</h3>
                            <p className="text-xs text-orange-100">ID Regis: {registrationId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                        <div className="text-xs text-orange-800 leading-relaxed font-medium">
                            Pastikan obat yang dititipkan TIDAK termasuk dalam daftar jenis obat yang dilarang (Psikotropika tanpa resep, cairan tumpah, kemasan tidak jelas).
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                            <div className="col-span-5 text-[10px] font-bold text-gray-400 uppercase">Nama Obat</div>
                            <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase">Jumlah</div>
                            <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase">Dosis</div>
                            <div className="col-span-1"></div>
                        </div>

                        {medicines.map((m, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 animate-in slide-in-from-right-3 duration-200">
                                <div className="col-span-5">
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:border-orange-500 text-sm"
                                        placeholder="Contoh: Paracetamol"
                                        value={m.name}
                                        onChange={e => updateRow(idx, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:border-orange-500 text-sm"
                                        placeholder="1 Strip"
                                        value={m.quantity}
                                        onChange={e => updateRow(idx, 'quantity', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:border-orange-500 text-sm"
                                        placeholder="3x1"
                                        value={m.dosage}
                                        onChange={e => updateRow(idx, 'dosage', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeRow(idx)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                        disabled={medicines.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addRow}
                        className="w-full py-2 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all font-bold text-xs flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Tambah Obat Lain
                    </button>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                checked={hasConsented}
                                onChange={e => setHasConsented(e.target.checked)}
                            />
                            <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                Saya menyatakan bahwa pengunjung telah membaca aturan obat dilarang dan isi titipan sudah sesuai.
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3">
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
                            className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Semua</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
