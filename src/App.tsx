import { useState, useEffect } from 'react';
import { Building2, MessageSquare, FileText, BarChart3, Menu, X, Shield, LogOut, CheckCircle2, ArrowRight, Home, Mail, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import ChatAssistant from './components/ChatAssistant';
import RegistrationForm from './components/RegistrationForm';
import InfoPanel from './components/InfoPanel';
import DashboardStats from './components/DashboardStats';
import VisitSchedule from './components/VisitSchedule';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { getRegistrationsByNIK, getAllVisitSlots, getAllRecurringSlots, type RegistrationRecord } from './utils/registrationStorage';

type Tab = 'beranda' | 'dashboard' | 'registration' | 'chat' | 'info' | 'admin' | 'status';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('beranda');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(localStorage.getItem('is_admin_logged_in') === 'true');
  const [statusNik, setStatusNik] = useState('');
  const [visitorRegistrations, setVisitorRegistrations] = useState<RegistrationRecord[]>([]);
  const [dynamicSchedule, setDynamicSchedule] = useState<{ day: string, time: string, color: string }[]>([]);

  // Reset scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  useEffect(() => {
    const fetchDynamicSchedule = async () => {
      try {
        const [slots, recurring] = await Promise.all([
          getAllVisitSlots(),
          getAllRecurringSlots()
        ]);

        const dayMap: Record<string, { start: string, end: string }> = {};
        const daysOrder = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        recurring.filter(r => r.is_active).forEach(rule => {
          const dayName = daysOrder[rule.day_of_week];
          if (!dayMap[dayName]) {
            dayMap[dayName] = { start: rule.start_time, end: rule.end_time };
          }
        });

        const today = new Date().toISOString().split('T')[0];
        slots.filter(s => s.is_available && s.date >= today).forEach(slot => {
          const date = new Date(slot.date);
          const dayName = daysOrder[date.getDay()];
          dayMap[dayName] = { start: slot.start_time, end: slot.end_time };
        });

        const schedule = Object.entries(dayMap).map(([day, times]) => ({
          day,
          time: `${times.start.substring(0, 5)} - ${times.end.substring(0, 5)}`,
          color: 'blue'
        })).sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

        if (schedule.length > 0) {
          setDynamicSchedule(schedule);
        }
      } catch (error) {
        console.error('Error processing dynamic schedule:', error);
      }
    };
    fetchDynamicSchedule();
  }, []);

  const handleAdminLogin = (status: boolean) => {
    setIsAdminLoggedIn(status);
    if (status) setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('is_admin_logged_in');
    setIsAdminLoggedIn(false);
    setActiveTab('dashboard');
  };

  const handleCheckStatus = async () => {
    if (statusNik.length === 16) {
      const data = await getRegistrationsByNIK(statusNik);
      setVisitorRegistrations(data);
    }
  };

  const tabs = [
    { id: 'beranda' as Tab, label: 'Home', icon: Home },
    { id: 'dashboard' as Tab, label: 'Statistik Kunjungan', icon: BarChart3 },
    { id: 'registration' as Tab, label: 'Daftar Kunjungan', icon: FileText },
    { id: 'status' as Tab, label: 'Cek Status', icon: CheckCircle2 },
    { id: 'chat' as Tab, label: 'Pusat Bantuan AI', icon: MessageSquare },
    { id: 'info' as Tab, label: 'Pusat Informasi', icon: Building2 },
    { id: 'admin' as Tab, label: isAdminLoggedIn ? 'Admin Panel' : 'Login Petugas', icon: Shield },
  ];

  return (
    <div className="min-h-screen relative font-sans text-slate-800 flex flex-col bg-slate-50">
      {/* INSTITUTIONAL BACKGROUND - LIGHT THEME */}
      <div className="fixed inset-0 z-0 bg-slate-100 pointer-events-none">
        <img
          src="/lapas_bg.jpg"
          alt="Lapas Background"
          className="w-full h-full object-cover object-center opacity-[0.03] mix-blend-multiply filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/80" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* FORMAL HEADER - 2 ROWS (LIGHT THEME) */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          {/* Top border accent - Institutional Blue */}
          <div className="w-full h-1.5 bg-blue-800"></div>

          {/* Top Row: Logo & Identity & Admin */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-24">
              {/* Logo & Title */}
              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity gap-3" onClick={() => setActiveTab('dashboard')}>
                  <img src="/logo-kemenkumham.png" alt="Logo Kemenkumham" className="h-12 w-auto object-contain drop-shadow-sm" />
                  <img src="/logo-pemasyarakatan.png" alt="Logo Pemasyarakatan" className="h-12 w-auto object-contain drop-shadow-sm" />
                </div>
                <div className="flex flex-col border-l-2 border-slate-200 pl-5 py-1">
                  <h1 className="text-slate-900 text-2xl font-black tracking-tight uppercase leading-tight">Sistem Layanan PAS</h1>
                  <p className="text-xs text-blue-700 font-bold tracking-widest uppercase mt-1">Lapas Narkotika IIA Pamekasan</p>
                </div>
              </div>

              {/* ADMIN ACTIONS */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`hidden md:flex items-center gap-2.5 px-5 py-2.5 rounded-sm text-sm font-bold border transition-all ${activeTab === 'admin'
                    ? 'bg-blue-800 border-blue-800 text-white shadow-md'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-700'
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>{isAdminLoggedIn ? 'Admin Panel' : 'Petugas'}</span>
                </button>

                {isAdminLoggedIn && (
                  <button
                    onClick={handleAdminLogout}
                    className="hidden md:flex p-2.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-sm transition-all shadow-sm"
                    title="Logout Petugas"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}

                {/* MOBILE Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2.5 bg-slate-50 border border-slate-200 rounded-sm text-slate-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Navigation Tabs */}
          <div className="border-t border-slate-200 bg-slate-50/90 hidden md:block backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                {tabs.filter(t => !['admin'].includes(t.id)).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold tracking-wide uppercase transition-all duration-200 rounded-t-lg border-b-4 ${isActive
                        ? 'bg-white text-blue-800 border-blue-700 shadow-sm'
                        : 'text-slate-600 border-transparent hover:text-blue-700 hover:bg-white'
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* MOBILE NAV OVERLAY */}
          {mobileMenuOpen && (
            <nav className="md:hidden bg-white border-t border-slate-200 shadow-2xl absolute w-full top-full">
              <div className="grid grid-cols-2 gap-px bg-slate-200 p-px">
                {tabs.filter(t => t.id !== 'admin').map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-4 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                        ? 'bg-blue-50 text-blue-800 shadow-inner border-b-2 border-blue-600'
                        : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-700'
                        }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="p-4 bg-slate-50">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-sm font-bold border ${activeTab === 'admin'
                    ? 'bg-blue-800 border-blue-800 text-white shadow-md'
                    : 'bg-white border-slate-300 text-slate-700 shadow-sm'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    {isAdminLoggedIn ? 'Administrator Panel' : 'Login Petugas'}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                {isAdminLoggedIn && (
                  <button
                    onClick={() => {
                      handleAdminLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-4 mt-3 rounded-sm bg-red-50 border border-red-200 text-red-600 font-bold shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar (Logout)
                  </button>
                )}
              </div>
            </nav>
          )}
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative z-10 flex flex-col">

          {/* HERO SECTION FOR BERANDA */}
          {activeTab === 'beranda' && (
            <div className="flex flex-col gap-6 mb-4">

              {/* Hero Split Layout */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 shadow-xl border border-blue-900">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <img src="/lapas_bg.jpg" alt="" className="w-full h-full object-cover object-center" />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 px-8 py-12 md:px-14 md:py-14">
                  {/* Left: Text */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Sistem Online & Aktif</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                      Portal Layanan<br />
                      <span className="text-yellow-300">Kunjungan WBP</span>
                    </h2>

                    <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
                      Daftarkan kunjungan kepada Warga Binaan Pemasyarakatan Lapas Narkotika Kelas IIA Pamekasan secara <strong>online</strong>, mudah, dan transparan.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                      <button
                        onClick={() => setActiveTab('registration')}
                        className="flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-blue-800 rounded-lg font-black text-sm uppercase tracking-wider hover:bg-yellow-50 transition-all shadow-lg hover:-translate-y-0.5"
                      >
                        <FileText className="w-4 h-4" />
                        Daftar Kunjungan
                      </button>
                      <button
                        onClick={() => setActiveTab('status')}
                        className="flex items-center justify-center gap-2.5 px-6 py-3 bg-transparent text-white border-2 border-white/40 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-white/10 hover:border-white/60 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                        Cek Status
                      </button>
                    </div>
                  </div>

                  {/* Right: Stats Visual */}
                  <div className="flex-shrink-0 w-full md:w-72 grid grid-cols-2 gap-3">
                    {[
                      {
                        label: 'Hari Layanan',
                        value: dynamicSchedule.length > 0
                          ? dynamicSchedule.map(s => s.day).join(', ')
                          : '—',
                        sub: 'Per Minggu',
                        color: 'bg-white/10 border-white/20'
                      },
                      {
                        label: 'Jam Kunjungan',
                        value: dynamicSchedule.length > 0
                          ? dynamicSchedule[0].time.replace('-', '–')
                          : '—',
                        sub: 'WIB',
                        color: 'bg-white/10 border-white/20'
                      },
                      { label: 'Proses Pendaftaran', value: '100% Online', sub: 'Via Portal', color: 'bg-yellow-400/20 border-yellow-300/30' },
                      { label: 'Verifikasi Status', value: 'Real-time', sub: 'Via NIK', color: 'bg-emerald-400/20 border-emerald-300/30' },
                    ].map((item, i) => (
                      <div key={i} className={`${item.color} border rounded-xl p-4 backdrop-blur-sm`}>
                        <p className="text-[10px] text-blue-200 uppercase tracking-wider font-bold mb-1">{item.label}</p>
                        <p className="text-white font-black text-sm leading-tight">{item.value}</p>
                        <p className="text-blue-300 text-[10px] font-semibold mt-0.5">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Banner / Pengumuman */}
              <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">📢 Catatan Penting</p>
                  <p className="text-sm text-amber-900">
                    Silakan lakukan <strong>pendaftaran lebih awal</strong> untuk memastikan kuota kunjungan pada jadwal yang dipilih belum penuh. Pastikan NIK pengunjung dan nama WBP sesuai dokumen resmi.
                  </p>
                </div>
                <button onClick={() => setActiveTab('info')} className="hidden sm:flex items-center gap-1.5 text-xs font-black text-amber-700 uppercase tracking-widest hover:text-amber-900 transition-colors whitespace-nowrap mt-1">
                  Info Lengkap <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Layanan Utama */}
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-5 h-px bg-slate-300 block"></span>
                  Layanan Utama
                  <span className="flex-1 h-px bg-slate-200 block"></span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      tab: 'registration' as Tab,
                      icon: FileText,
                      title: 'Daftar Kunjungan',
                      desc: 'Ajukan usulan kunjungan ke Warga Binaan secara online. Isi formulir lengkap dan tunggu konfirmasi petugas.',
                      action: 'Daftar Sekarang',
                      accent: 'border-t-blue-600',
                      iconBg: 'bg-blue-50',
                      iconColor: 'text-blue-700',
                      linkColor: 'text-blue-700 hover:text-blue-900',
                    },
                    {
                      tab: 'status' as Tab,
                      icon: CheckCircle2,
                      title: 'Cek Status',
                      desc: 'Lacak status persetujuan pendaftaran kunjungan menggunakan Nomor Induk Kependudukan (NIK) Anda.',
                      action: 'Periksa Status',
                      accent: 'border-t-emerald-600',
                      iconBg: 'bg-emerald-50',
                      iconColor: 'text-emerald-700',
                      linkColor: 'text-emerald-700 hover:text-emerald-900',
                    },
                    {
                      tab: 'chat' as Tab,
                      icon: MessageSquare,
                      title: 'Bantuan AI',
                      desc: 'Konsultasikan pertanyaan Anda tentang prosedur dan layanan kunjungan kepada asisten kecerdasan buatan.',
                      action: 'Tanya Asisten',
                      accent: 'border-t-violet-600',
                      iconBg: 'bg-violet-50',
                      iconColor: 'text-violet-700',
                      linkColor: 'text-violet-700 hover:text-violet-900',
                    },
                    {
                      tab: 'info' as Tab,
                      icon: Building2,
                      title: 'Informasi',
                      desc: 'Pelajari tata tertib, persyaratan kunjungan, dan regulasi yang berlaku di Lapas Narkotika IIA Pamekasan.',
                      action: 'Baca Selengkapnya',
                      accent: 'border-t-amber-600',
                      iconBg: 'bg-amber-50',
                      iconColor: 'text-amber-700',
                      linkColor: 'text-amber-700 hover:text-amber-900',
                    },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.tab}
                        onClick={() => setActiveTab(card.tab)}
                        className={`group text-left bg-white border border-slate-200 border-t-4 ${card.accent} rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
                      >
                        <div className={`w-11 h-11 rounded-lg ${card.iconBg} flex items-center justify-center mb-4`}>
                          <Icon className={`w-5 h-5 ${card.iconColor}`} />
                        </div>
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide mb-2">{card.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                        <div className={`flex items-center gap-1.5 mt-5 text-xs font-black ${card.linkColor} uppercase tracking-widest group-hover:gap-2.5 transition-all`}>
                          {card.action} <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Institutional Headers for other tabs */}
          {activeTab !== 'beranda' && (
            <div className="mb-6 lg:mb-8 border-l-4 border-blue-700 pl-4 lg:pl-5 py-2 mt-2">
              {activeTab === 'dashboard' && (
                <>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">Dasbor Statistik & Jadwal</h2>
                  <p className="text-sm text-slate-600 mt-1.5 uppercase tracking-widest font-bold">Ringkasan Layanan & Jadwal Kunjungan Lapas Narkotika Pamekasan</p>
                </>
              )}
              {activeTab === 'status' && (
                <>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">Verifikasi Status Pendaftaran</h2>
                  <p className="text-sm text-slate-600 mt-1.5 uppercase tracking-widest font-bold">Pengecekan Status Berdasarkan Nomor Induk Kependudukan</p>
                </>
              )}
              {activeTab === 'registration' && (
                <>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">Formulir Pendaftaran Registrasi</h2>
                  <p className="text-sm text-slate-600 mt-1.5 uppercase tracking-widest font-bold">Pengajuan Usulan Kunjungan Warga Binaan</p>
                </>
              )}
              {activeTab === 'chat' && (
                <>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">Pusat Layanan Bantuan Terpadu</h2>
                  <p className="text-sm text-slate-600 mt-1.5 uppercase tracking-widest font-bold">Konsultasi Informasi Melalui Artificial Intelligence (AI)</p>
                </>
              )}
              {activeTab === 'info' && (
                <>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">Pusat Regulasi & Informasi</h2>
                  <p className="text-sm text-slate-600 mt-1.5 uppercase tracking-widest font-bold">Tata Tertib & Petunjuk Pelaksanaan Layanan</p>
                </>
              )}
              {activeTab === 'admin' && (
                <>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">Modul Administrasi Petugas</h2>
                  <p className="text-sm text-slate-600 mt-1.5 uppercase tracking-widest font-bold">Platform Tata Kelola Pendaftaran & Manajemen Sistem</p>
                </>
              )}
            </div>
          )}

          {/* Institutional Content Panel Wrapper */}
          <div className={activeTab === 'beranda' ? 'hidden' : `bg-white flex-1 rounded-sm shadow-sm border border-slate-200 ${activeTab === 'admin' ? 'p-4 md:p-5' : 'p-5 md:p-8'} relative`}>
            {/* Soft decorative background in the panel */}
            <div className="absolute inset-0 bg-white/60 pointer-events-none rounded-sm"></div>

            <div className="relative z-10 space-y-10">
              {activeTab === 'dashboard' && (
                <div>
                  {!isAdminLoggedIn && <DashboardStats />}
                  <div className="mt-8">
                    <VisitSchedule />
                  </div>
                </div>
              )}

              {activeTab === 'status' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white p-6 md:p-8 border-t-4 border-t-blue-700 shadow-md border-x border-b border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Nomor Induk Kependudukan (NIK)</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        maxLength={16}
                        value={statusNik}
                        onChange={(e) => setStatusNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="Masukkan 16 Digit NIK Anda Sesuai KTP"
                        className="flex-1 px-4 py-3 border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors font-medium text-slate-800"
                      />
                      <button
                        onClick={handleCheckStatus}
                        className="bg-blue-800 text-white px-8 py-3 font-bold uppercase tracking-wider hover:bg-blue-900 transition-colors border border-blue-900 shadow-sm"
                      >
                        Pencarian Data
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {visitorRegistrations.length === 0 ? (
                      <div className="text-center py-16 bg-slate-100 border border-slate-300 border-dashed text-slate-500 font-medium tracking-wide">
                        <p>DATA TIDAK DITEMUKAN / BELUM ADA PENCARIAN</p>
                      </div>
                    ) : (
                      visitorRegistrations.map((reg) => (
                        <div key={reg.id} className="bg-white p-5 shadow-sm border-l-4 border-slate-400 border-y border-r border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg uppercase">{reg.id}</h3>
                            <p className="text-sm text-slate-600 font-medium mt-1">NAMA WBP: <span className="font-bold">{reg.inmateName}</span></p>
                            <p className="text-xs text-slate-500 font-medium">TANGGAL USULAN: <span className="text-slate-700">{reg.visitDate}</span></p>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border ${reg.status === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                              reg.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' :
                                'bg-amber-50 border-amber-200 text-amber-800'
                              }`}>
                              STATUS: {reg.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="animate-in fade-in duration-500">
                  {isAdminLoggedIn ? (
                    <AdminDashboard />
                  ) : (
                    <div className="py-10 max-w-xl mx-auto">
                      <AdminLogin onLogin={handleAdminLogin} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'registration' && (
                <RegistrationForm />
              )}

              {activeTab === 'chat' && (
                <div className="max-w-4xl mx-auto">
                  <ChatAssistant />
                </div>
              )}

              {activeTab === 'info' && (
                <InfoPanel />
              )}
            </div>
          </div>
        </main>

        {/* INSTITUTIONAL FOOTER */}
        <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 relative z-10 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <img src="/logo-kemenkumham.png" alt="Logo Kemenkumham" className="h-10 w-auto opacity-90" />
                    <img src="/logo-pemasyarakatan.png" alt="Logo Pemasyarakatan" className="h-10 w-auto opacity-90" />
                  </div>
                  <div className="border-l-2 border-slate-800 pl-4 py-1">
                    <h3 className="text-slate-100 font-bold tracking-widest text-lg uppercase">PAS-Assistant</h3>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Humas Lapas Pamekasan</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-500 font-medium">
                  Sistem Informasi & Tata Kelola Terpadu Layanan Kunjungan Warga Binaan Pemasyarakatan pada Lapas Narkotika Kelas IIA Pamekasan.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <a href="#" className="w-8 h-8 rounded-sm bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-sm bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-slate-200 font-bold text-xs uppercase tracking-widest mb-6 border-l-2 border-blue-500 pl-3">Navigasi Sistem</h4>
                <ul className="space-y-3">
                  {tabs.filter(t => t.id !== 'admin').map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className="text-sm font-semibold text-slate-500 hover:text-blue-400 flex items-center gap-2 transition-colors uppercase tracking-wider"
                      >
                        <span className="w-1.5 h-1.5 bg-slate-700 block"></span> {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-slate-200 font-bold text-xs uppercase tracking-widest mb-6 border-l-2 border-blue-500 pl-3">Informasi Kontak</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Layanan Informasi</p>
                      <p className="text-sm font-semibold text-slate-300">082143317094</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Surat Elektronik</p>
                      <p className="text-sm font-semibold text-slate-300">lapasnarkotik.pamekasan@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-slate-200 font-bold text-xs uppercase tracking-widest mb-6 border-l-2 border-blue-500 pl-3">Agenda Operasional</h4>
                <div className="bg-slate-900 border border-slate-800 p-4 space-y-3">
                  {dynamicSchedule.length > 0 ? (
                    dynamicSchedule.map((item, index) => (
                      <div key={index} className={`flex justify-between items-center ${index !== dynamicSchedule.length - 1 ? 'border-b border-slate-800 pb-2 mb-2' : ''}`}>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.day}</span>
                        <span className="text-xs font-bold text-slate-200 bg-slate-800 px-2 py-1 border border-slate-700">{item.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3 text-slate-600 text-xs font-semibold tracking-widest uppercase">
                      Memuat jadwal...
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-600 text-xs font-bold tracking-widest uppercase text-center md:text-left">
                &copy; 2026 KEMENTERIAN HUKUM DAN HAK ASASI MANUSIA<br className="md:hidden" /> REPUBLIK INDONESIA
              </p>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest cursor-pointer transition-colors">Kebijakan Privasi</span>
                <span className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest cursor-pointer transition-colors">Syarat Ketentuan</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}