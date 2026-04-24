import { useState, useEffect } from 'react';
import { getAllVisitSlots, createVisitSlot, deleteVisitSlot, toggleVisitSlotAvailability, type VisitSlot, getAllRecurringSlots, createRecurringSlot, deleteRecurringSlot, updateRecurringSlot, type RecurringVisitSlot } from '@/utils/registrationStorage';
import { Calendar, Clock, Plus, Trash2, CheckCircle, XCircle, AlertCircle, RefreshCw, Repeat } from 'lucide-react';

export default function AdminScheduleManager() {
    const [slots, setSlots] = useState<VisitSlot[]>([]);
    const [recurringSlots, setRecurringSlots] = useState<RecurringVisitSlot[]>([]);
    const [activeTab, setActiveTab] = useState<'daily' | 'recurring'>('daily');

    // Daily Form States
    const [newDate, setNewDate] = useState('');

    // Recurring Form States
    const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Senin

    // Shared Form States
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [sessionName, setSessionName] = useState('');
    const [maxVisitors, setMaxVisitors] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchSlots();
        fetchRecurringSlots();
    }, []);

    const fetchSlots = async () => {
        const data = await getAllVisitSlots();
        setSlots(data);
    };

    const fetchRecurringSlots = async () => {
        const data = await getAllRecurringSlots();
        setRecurringSlots(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (activeTab === 'daily') {
                if (!newDate || !startTime || !endTime) return;
                await createVisitSlot({
                    date: newDate,
                    start_time: startTime,
                    end_time: endTime,
                    session_name: sessionName,
                    max_visitors: maxVisitors
                });
                fetchSlots();
            } else {
                if (!startTime || !endTime) return;
                await createRecurringSlot({
                    day_of_week: selectedDay,
                    start_time: startTime,
                    end_time: endTime,
                    session_name: sessionName,
                    max_visitors: maxVisitors
                });
                fetchRecurringSlots();
            }
            setStartTime('');
            setEndTime('');
            setSessionName('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRecurring = async (id: number) => {
        if (confirm('Hapus jadwal rutin ini?')) {
            await deleteRecurringSlot(id);
            fetchRecurringSlots();
        }
    };

    const handleToggleRecurring = async (id: number, currentStatus: boolean) => {
        await updateRecurringSlot(id, { is_active: !currentStatus });
        fetchRecurringSlots();
    };

    const dayName = (day: number) => {
        return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][day];
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
            {/* Tab Selection */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Calendar className="w-4 h-4" />
                    Jadwal Spesial (Per Tanggal)
                </button>
                <button
                    onClick={() => setActiveTab('recurring')}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'recurring' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Repeat className="w-4 h-4" />
                    Jadwal Rutin (Mingguan)
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    {activeTab === 'daily' ? <Plus className="w-6 h-6 text-blue-600" /> : <Repeat className="w-6 h-6 text-blue-600" />}
                    {activeTab === 'daily' ? 'Atur Slot Kunjungan Per Tanggal' : 'Atur Jadwal Rutin Mingguan'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                {activeTab === 'daily' ? 'Tanggal' : 'Hari'}
                            </label>
                            {activeTab === 'daily' ? (
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            ) : (
                                <select
                                    value={selectedDay}
                                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                    required
                                >
                                    <option value={1}>Senin</option>
                                    <option value={2}>Selasa</option>
                                    <option value={3}>Rabu</option>
                                    <option value={4}>Kamis</option>
                                    <option value={5}>Jumat</option>
                                    <option value={6}>Sabtu</option>
                                    <option value={0}>Minggu</option>
                                </select>
                            )}
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
                        disabled={isSubmitting || (activeTab === 'daily' && !newDate) || !startTime || !endTime}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        {isSubmitting ? 'Menyimpan...' : activeTab === 'daily' ? 'Simpan Slot Tanggal' : 'Simpan Jadwal Rutin'}
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {activeTab === 'daily' ? <Calendar className="w-6 h-6 text-blue-600" /> : <Repeat className="w-6 h-6 text-blue-600" />}
                    {activeTab === 'daily' ? 'Manajemen Slot Spesial (Per Tanggal)' : 'Manajemen Jadwal Rutin (Mingguan)'}
                </h3>

                {activeTab === 'daily' ? (
                    Object.keys(groupedSlots).length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada jadwal pendaftaran spesial yang diatur</p>
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
                    )
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {recurringSlots.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Belum ada jadwal rutin mingguan. <br /> Atur jadwal rutin di atas agar otomatis berlaku setiap minggu.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recurringSlots.map((slot) => (
                                    <div key={slot.id} className={`p-5 rounded-2xl border transition-all ${slot.is_active ? 'bg-white border-blue-100 hover:shadow-md' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${slot.is_active ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'}`}>
                                                    {dayName(slot.day_of_week).substring(0, 3).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 leading-none">{dayName(slot.day_of_week)}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Rutin Mingguan</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleToggleRecurring(slot.id, slot.is_active)} className={`p-2 rounded-xl transition-all ${slot.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                                    {slot.is_active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                </button>
                                                <button onClick={() => handleDeleteRecurring(slot.id)} className="p-2 text-red-500 bg-red-50 rounded-xl">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {slot.session_name && (
                                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase w-fit">{slot.session_name}</div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <span className="font-black text-gray-900 tracking-tight">{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)} WIB</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium">Kapasitas: <span className="text-gray-700 font-bold">{slot.max_visitors} pengunjung</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

