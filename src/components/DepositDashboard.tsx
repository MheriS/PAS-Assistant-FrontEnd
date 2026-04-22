import { useState, useEffect } from 'react';
import { Pill, CheckCircle, CheckCircle2, ChevronRight, AlertCircle, FileText, DollarSign, Wallet } from 'lucide-react';

interface MedicineDelivery {
    id: number;
    registration_id: string;
    medicine_name: string;
    quantity: string;
    dosage: string;
    approval_status: 'waiting' | 'approved' | 'rejected';
    rejection_reason?: string;
    delivery_status: 'pending' | 'delivered';
    registration?: { visitor_name: string; inmate_name: string; };
    wbp?: { nama: string; blok: string; kamar: string; };
    created_at: string;
}

interface MoneyDeposit {
    id: number;
    registration_id: string;
    amount: number;
    notes?: string;
    status: 'pending' | 'delivered';
    registration?: { visitor_name: string; inmate_name: string; };
    wbp?: { nama: string; blok: string; kamar: string; };
    created_at: string;
}

export default function DepositDashboard() {
    const [activeTab, setActiveTab] = useState<'medicine' | 'money'>('medicine');
    const [medicines, setMedicines] = useState<MedicineDelivery[]>([]);
    const [money, setMoney] = useState<MoneyDeposit[]>([]);
    const [type, setType] = useState<'all' | 'waiting' | 'approved' | 'delivered' | 'pending'>('waiting');
    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'medicine') {
                const url = `http://localhost:8000/api/medicine-deliveries?${type !== 'all' ? (type === 'waiting' ? 'approval_status=waiting' : (type === 'delivered' ? 'delivery_status=delivered' : 'approval_status=approved&delivery_status=pending')) : ''}`;
                const response = await fetch(url);
                setMedicines(await response.json());
            } else {
                const url = `http://localhost:8000/api/money-deposits?${type !== 'all' ? `status=${type}` : ''}`;
                const response = await fetch(url);
                setMoney(await response.json());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, type]);

    const handleMedicineApproval = async (id: number, status: 'approved' | 'rejected') => {
        if (status === 'rejected' && !rejectionReason) {
            setSelectedId(id);
            return;
        }
        try {
            await fetch(`http://localhost:8000/api/medicine-deliveries/${id}/approval`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approval_status: status, rejection_reason: rejectionReason })
            });
            setRejectionReason('');
            setSelectedId(null);
            fetchData();
        } catch (error) { alert('Gagal memperbarui status'); }
    };

    const handleMedicineDelivery = async (id: number) => {
        try {
            await fetch(`http://localhost:8000/api/medicine-deliveries/${id}/delivery`, { method: 'PATCH' });
            fetchData();
        } catch (error) { alert('Gagal memperbarui status penyerahan'); }
    };

    const handleMoneyDelivery = async (id: number) => {
        try {
            await fetch(`http://localhost:8000/api/money-deposits/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'delivered' })
            });
            fetchData();
        } catch (error) { alert('Gagal memperbarui status penyerahan'); }
    };

    return (
        <div className="space-y-6">
            {/* Main Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => { setActiveTab('medicine'); setType('waiting'); }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'medicine' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                >
                    <Pill className="w-4 h-4" /> Penitipan Obat
                </button>
                <button
                    onClick={() => { setActiveTab('money'); setType('pending'); }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'money' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                >
                    <Wallet className="w-4 h-4" /> Penitipan Uang
                </button>
            </div>

            {/* Sub Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-2">
                {activeTab === 'medicine' ? (
                    <>
                        {[
                            { id: 'waiting', label: 'Validasi Tim Medis', icon: AlertCircle },
                            { id: 'approved', label: 'Proses Penyerahan', icon: Pill },
                            { id: 'delivered', label: 'Terkirim', icon: CheckCircle2 },
                            { id: 'all', label: 'Riwayat', icon: FileText },
                        ].map(t => (
                            <button key={t.id} onClick={() => setType(t.id as any)} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${type === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                                <t.icon className="w-3 h-3" /> {t.label}
                            </button>
                        ))}
                    </>
                ) : (
                    <>
                        {[
                            { id: 'pending', label: 'Belum Diserahkan', icon: Clock },
                            { id: 'delivered', label: 'Sudah Diterima WBP', icon: CheckCircle2 },
                            { id: 'all', label: 'Riwayat Semua', icon: FileText },
                        ].map(t => (
                            <button key={t.id} onClick={() => setType(t.id as any)} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${type === t.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                                <t.icon className="w-3 h-3" /> {t.label}
                            </button>
                        ))}
                    </>
                )}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {(activeTab === 'medicine' ? medicines : money).length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                        <Pill className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium font-inter">Tidak ada data penitipan</p>
                    </div>
                ) : (
                    (activeTab === 'medicine' ? medicines : money).map((item: any) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'medicine' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {activeTab === 'medicine' ? <Pill className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{activeTab === 'medicine' ? item.medicine_name : `Rp ${new Intl.NumberFormat('id-ID').format(item.amount)}`}</h4>
                                        <p className="text-xs text-gray-500">Reg: {item.registration_id} | {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${(item.approval_status === 'approved' || item.status === 'delivered' || item.delivery_status === 'delivered') ? 'bg-emerald-100 text-emerald-700' :
                                        item.approval_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {activeTab === 'medicine' ? item.approval_status : item.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 text-sm">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Tujuan (WBP)</p>
                                    <p className="font-bold text-gray-800">{item.registration?.inmate_name || item.wbp?.nama || 'N/A'}</p>
                                    <p className="text-xs text-blue-600">{item.wbp?.blok} / {item.wbp?.kamar}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{activeTab === 'medicine' ? 'Detail' : 'Catatan'}</p>
                                    <p className="text-gray-600">{activeTab === 'medicine' ? `${item.quantity} | ${item.dosage}` : (item.notes || '-')}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                {activeTab === 'medicine' && item.approval_status === 'waiting' && (
                                    <div className="flex gap-2 w-full">
                                        {selectedId === item.id ? (
                                            <>
                                                <input type="text" placeholder="Alasan tunda..." className="flex-1 px-3 py-2 border rounded-lg text-sm" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                                                <button onClick={() => handleMedicineApproval(item.id, 'rejected')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Simpan</button>
                                                <button onClick={() => setSelectedId(null)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold">Batal</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => setSelectedId(item.id)} className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-50">Tolak Medis</button>
                                                <button onClick={() => handleMedicineApproval(item.id, 'approved')} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20">Setujui Medis</button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'medicine' && item.approval_status === 'approved' && item.delivery_status === 'pending' && (
                                    <button onClick={() => handleMedicineDelivery(item.id)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                        Serahkan ke WBP <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}

                                {activeTab === 'money' && item.status === 'pending' && (
                                    <button onClick={() => handleMoneyDelivery(item.id)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                        Serahkan ke WBP <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}

                                {(item.delivery_status === 'delivered' || item.status === 'delivered') && (
                                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" /> Selesai Diserahkan
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const Clock = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
