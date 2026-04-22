import { useState, useEffect } from 'react';
import { Pill, CheckCircle, CheckCircle2, ChevronRight, AlertCircle, FileText, PlusCircle } from 'lucide-react';

interface MedicineDelivery {
    id: number;
    registration_id: string;
    medicine_name: string;
    quantity: string;
    dosage: string;
    approval_status: 'waiting' | 'approved' | 'rejected';
    rejection_reason?: string;
    delivery_status: 'pending' | 'delivered';
    registration?: {
        visitor_name: string;
        inmate_name: string;
    };
    wbp?: {
        nama: string;
        blok: string;
        kamar: string;
    };
    created_at: string;
}

export default function MedicineAdminDashboard() {
    const [deliveries, setDeliveries] = useState<MedicineDelivery[]>([]);
    const [type, setType] = useState<'all' | 'waiting' | 'approved' | 'delivered'>('waiting');
    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/medicine-deliveries?${type !== 'all' ? (type === 'waiting' ? 'approval_status=waiting' : (type === 'delivered' ? 'delivery_status=delivered' : 'approval_status=approved&delivery_status=pending')) : ''}`);
            const data = await response.json();
            setDeliveries(data);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, [type]);

    const handleApproval = async (id: number, status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !rejectionReason) {
            setSelectedId(id);
            return;
        }

        try {
            await fetch(`http://localhost:8000/api/medicine-deliveries/${id}/approval`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    approval_status: status,
                    rejection_reason: status === 'rejected' ? rejectionReason : null
                })
            });
            setRejectionReason('');
            setSelectedId(null);
            fetchDeliveries();
        } catch (error) {
            alert('Gagal memperbarui status');
        }
    };

    const handleDelivery = async (id: number) => {
        try {
            await fetch(`http://localhost:8000/api/medicine-deliveries/${id}/delivery`, {
                method: 'PATCH'
            });
            fetchDeliveries();
        } catch (error) {
            alert('Gagal memperbarui status penyerahan');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex gap-2">
                    {[
                        { id: 'waiting', label: 'Perlu Validasi Medis', icon: AlertCircle },
                        { id: 'approved', label: 'Siap Diserahkan (Blok)', icon: Pill },
                        { id: 'delivered', label: 'Sudah Diterima WBP', icon: CheckCircle2 },
                        { id: 'all', label: 'Riwayat Semua', icon: FileText },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${type === t.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <t.icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {deliveries.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                        <Pill className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium font-inter">Tidak ada data penitipan obat</p>
                    </div>
                ) : (
                    deliveries.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                            item.approval_status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            <Pill className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{item.medicine_name}</h4>
                                            <p className="text-xs text-gray-500">ID Regis: {item.registration_id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                            item.approval_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {item.approval_status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-y border-gray-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Detail Obat</p>
                                        <p className="text-sm font-medium text-gray-800">Jumlah: {item.quantity}</p>
                                        <p className="text-sm font-medium text-gray-800">Dosis: {item.dosage}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">WBP (Tujuan)</p>
                                        <p className="text-sm font-bold text-gray-900">{item.wbp?.nama || 'N/A'}</p>
                                        <p className="text-xs font-medium text-blue-600">{item.wbp?.blok} / {item.wbp?.kamar}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tanggal Masuk</p>
                                        <p className="text-sm font-medium text-gray-800">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3">
                                    {item.approval_status === 'waiting' && (
                                        <>
                                            {selectedId === item.id ? (
                                                <div className="flex-1 flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Alasan penolakan..."
                                                        className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-red-500"
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={() => handleApproval(item.id, 'rejected')}
                                                        className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg"
                                                    >
                                                        Konfirmasi Tolak
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedId(null)}
                                                        className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleApproval(item.id, 'rejected')}
                                                        className="px-4 py-2 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        Dilarang / Tolak
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproval(item.id, 'approved')}
                                                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-shadow shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Setujui Masuk
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {item.approval_status === 'approved' && item.delivery_status === 'pending' && (
                                        <button
                                            onClick={() => handleDelivery(item.id)}
                                            className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                                        >
                                            Serahkan ke WBP <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}

                                    {item.delivery_status === 'delivered' && (
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                                            <CheckCircle className="w-4 h-4" /> Selesai Diserahkan
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
