import { useState, useEffect } from 'react';
import { getAllVisitSlots, createVisitSlot, deleteVisitSlot, toggleVisitSlotAvailability, type VisitSlot } from '@/utils/registrationStorage';
import { Calendar, Clock, Plus, Trash2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminScheduleManager() {
    const [slots, setSlots] = useState<VisitSlot[]>([]);
    const [newDate, setNewDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [sessionName, setSessionName] = useState('');
    const [maxVisitors, setMaxVisitors] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        const data = await getAllVisitSlots();
        setSlots(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDate || !startTime || !endTime) return;

        setIsSubmitting(true);
        try {
            await createVisitSlot({
                date: newDate,
                start_time: startTime,
                end_time: endTime,
                session_name: sessionName,
                max_visitors: maxVisitors
            });
            // Don't reset date to allow adding multiple sessions easily
            setStartTime('');
            setEndTime('');
            setSessionName('');
            fetchSlots();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Hapus slot ini?')) {
            await deleteVisitSlot(id);
            fetchSlots();
        }
    };

    const handleToggle = async (id: number) => {
        await toggleVisitSlotAvailability(id);
        fetchSlots();
    };

    const applyPreset = (type: 'session1' | 'session2') => {
        if (type === 'session1') {
            setStartTime('08:00');
            setEndTime('11:00');
            setSessionName('Sesi 1');
        } else {
            setStartTime('13:00');
            setEndTime('15:00');
            setSessionName('Sesi 2');
        }
    };

    const groupedSlots = slots.reduce((acc: any, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus className="w-6 h-6 text-blue-600" />
                    Atur Jam Buka - Jam Tutup Kunjungan
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Tanggal</label>
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Sesi (Opsional)</label>
                            <input
                                type="text"
                                value={sessionName}
                                onChange={(e) => setSessionName(e.target.value)}
                                placeholder="Misal: Sesi 1 / Pagi"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Maks. Pengunjung</label>
                            <input
                                type="number"
                                value={maxVisitors}
                                onChange={(e) => setMaxVisitors(parseInt(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Jam Buka</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Jam Tutup</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="text-sm font-bold text-blue-800 uppercase tracking-wider block mb-3">Gunakan Pilih Sesi Cepat</label>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => applyPreset('session1')}
                                className="flex-1 min-w-[200px] px-4 py-3 bg-white border-2 border-blue-200 text-blue-700 rounded-xl font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Clock className="w-5 h-5" />
                                Pilih Sesi 1 (08:00 - 11:00)
                            </button>
                            <button
                                type="button"
                                onClick={() => applyPreset('session2')}
                                className="flex-1 min-w-[200px] px-4 py-3 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl font-bold hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Clock className="w-5 h-5" />
                                Pilih Sesi 2 (13:00 - 15:00)
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !newDate || !startTime || !endTime}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal Kunjungan'}
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    Manajemen Jadwal Aktif
                </h3>
                {Object.keys(groupedSlots).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Belum ada jadwal pendaftaran yang diatur</p>
                    </div>
                ) : (
                    Object.keys(groupedSlots).map(date => (
                        <div key={date} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h4 className="font-bold text-gray-900">
                                    {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </h4>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {groupedSlots[date].length} Sesi Terdaftar
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedSlots[date].map((slot: VisitSlot) => (
                                        <div
                                            key={slot.id}
                                            className={`relative group p-4 rounded-xl border transition-all ${slot.is_available ? 'bg-white border-gray-200 hover:border-blue-300' : 'bg-gray-50 border-gray-100 opacity-60'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                {slot.session_name && (
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{slot.session_name}</span>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className={`w-4 h-4 ${slot.is_available ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        <span className="font-bold text-gray-900">
                                                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleToggle(slot.id)}
                                                            className={`p-1.5 rounded-lg transition-all ${slot.is_available ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                                                                }`}
                                                            title={slot.is_available ? 'Matikan' : 'Aktifkan'}
                                                        >
                                                            {slot.is_available ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(slot.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">Kuota: {slot.max_visitors} Pengunjung</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

