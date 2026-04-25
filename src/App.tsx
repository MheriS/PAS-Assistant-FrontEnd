import { useState, useEffect } from 'react';
import { Building2, MessageSquare, FileText, BarChart3, Menu, X, Shield, LogOut, CheckCircle2, ArrowRight, Mail, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import ChatAssistant from './components/ChatAssistant';
import RegistrationForm from './components/RegistrationForm';
import InfoPanel from './components/InfoPanel';
import DashboardStats from './components/DashboardStats';
import VisitSchedule from './components/VisitSchedule';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { getRegistrationsByNIK, getAllVisitSlots, getAllRecurringSlots, type RegistrationRecord } from './utils/registrationStorage';

type Tab = 'dashboard' | 'registration' | 'chat' | 'info' | 'admin' | 'status';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
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

        // 1. Process Recurring Slots (Base Schedule)
        recurring.filter(r => r.is_active).forEach(rule => {
          const dayName = daysOrder[rule.day_of_week];
          if (!dayMap[dayName]) {
            dayMap[dayName] = { start: rule.start_time, end: rule.end_time };
          }
        });

        // 2. Process Specific Slots (Overrides/Additional)
        const today = new Date().toISOString().split('T')[0];
        slots.filter(s => s.is_available && s.date >= today).forEach(slot => {
          const date = new Date(slot.date);
          const dayName = daysOrder[date.getDay()];
          // specific slots override or add to recurring
          dayMap[dayName] = { start: slot.start_time, end: slot.end_time };
        });

        const schedule = Object.entries(dayMap).map(([day, times]) => ({
          day,
          time: `${times.start.substring(0, 5)} - ${times.end.substring(0, 5)}`,
          color: day === 'Selasa' ? 'blue' : day === 'Kamis' ? 'emerald' : 'indigo'
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
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'registration' as Tab, label: 'Daftar Kunjungan', icon: FileText },
    { id: 'status' as Tab, label: 'Cek Status', icon: CheckCircle2 },
    { id: 'chat' as Tab, label: 'Chat Assistant', icon: MessageSquare },
    { id: 'info' as Tab, label: 'Informasi', icon: Building2 },
    { id: 'admin' as Tab, label: isAdminLoggedIn ? 'Admin Panel' : 'Admin Login', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-11 h-11 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="hidden lg:flex flex-col">
                <h1 className="text-gray-900 text-lg font-black tracking-tight leading-none">PAS-Assistant</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Lapas Pamekasan</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/50">
              {tabs.filter(t => !['admin'].includes(t.id)).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                      ? 'bg-white text-blue-600 shadow-md border border-gray-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                      }`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={isActive ? 'block' : 'hidden xl:block'}>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/20'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="hidden lg:block">{isAdminLoggedIn ? 'Admin Panel' : 'Admin'}</span>
                </button>

                {isAdminLoggedIn && (
                  <button
                    onClick={handleAdminLogout}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Always show Menu Trigger on Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 flex items-center justify-center bg-gray-50 border border-gray-200"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-6 px-4 border-t border-gray-100 bg-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 mb-3">
                {tabs.filter(t => t.id !== 'admin').map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl text-xs font-bold transition-all ${activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-3">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-gray-50 text-gray-600 border border-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    {isAdminLoggedIn ? 'Admin Panel' : 'Admin Login'}
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-50" />
                </button>

                {isAdminLoggedIn && (
                  <button
                    onClick={() => {
                      handleAdminLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-5 py-4 rounded-2xl bg-red-50 text-red-600 font-bold border border-red-100 shadow-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    Keluar (Logout)
                  </button>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Dashboard Monitoring</h2>
              <p className="text-gray-600 font-medium">
                Pantau statistik dan jadwal kunjungan Lapas Narkotika IIA Pamekasan
              </p>
            </div>
            {!isAdminLoggedIn && <DashboardStats />}
            <VisitSchedule />
          </div>
        )}

        {activeTab === 'status' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Cek Status Pendaftaran</h2>
              <p className="text-gray-600 font-medium">
                Masukkan NIK Anda untuk melihat status pendaftaran kunjungan
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  maxLength={16}
                  value={statusNik}
                  onChange={(e) => setStatusNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="Masukkan 16 digit NIK"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                />
                <button
                  onClick={handleCheckStatus}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Cek Status
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {visitorRegistrations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">Masukkan NIK untuk melihat data pendaftaran Anda</p>
                </div>
              ) : (
                visitorRegistrations.map((reg) => (
                  <div key={reg.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{reg.id}</h3>
                      <p className="text-sm text-gray-500">WBP: {reg.inmateName} | Tanggal: {reg.visitDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                        reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                        {reg.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isAdminLoggedIn ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Panel Administrasi</h2>
                  <p className="text-gray-600 font-medium">
                    Layanan pengelolaan pendaftaran kunjungan Lapas Pamekasan
                  </p>
                </div>
                <AdminDashboard />
              </>
            ) : (
              <div className="py-12">
                <AdminLogin onLogin={handleAdminLogin} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'registration' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Pendaftaran Kunjungan</h2>
              <p className="text-gray-600 font-medium">
                Daftarkan kunjungan Anda secara online untuk memudahkan proses administrasi
              </p>
            </div>
            <RegistrationForm />
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Chat dengan AI Assistant</h2>
              <p className="text-gray-600 font-medium">
                Tanya jawab seputar informasi kunjungan, jadwal, dan prosedur
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <ChatAssistant />
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Informasi & Peraturan</h2>
              <p className="text-gray-600 font-medium">
                Informasi lengkap mengenai jadwal, kontak, dan peraturan kunjungan
              </p>
            </div>
            <InfoPanel />
          </div>
        )}
      </main>

      <footer className="bg-gray-950 text-gray-300 mt-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Branding */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl tracking-tight leading-none">PAS-Assistant</h3>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1">Lapas Pamekasan</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Solusi digital terpadu untuk kemudahan layanan kunjungan dan informasi Warga Binaan Lapas Narkotika IIA Pamekasan.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="#" className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors group">
                  <ShieldCheck className="w-5 h-5 text-gray-500 group-hover:text-white" />
                </a>
                <a href="#" className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors group">
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Navigasi Cepat</h4>
              <ul className="space-y-4">
                {tabs.filter(t => t.id !== 'admin').map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className="text-sm font-bold text-gray-500 hover:text-blue-400 flex items-center gap-2 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" /> {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Hubungi Kami</h4>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Telepon</p>
                    <p className="text-sm font-bold text-gray-300">(0324) 322xxx</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Email Resmi</p>
                    <p className="text-sm font-bold text-gray-300 break-all">lapas.pamekasan@kemenkumham.go.id</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Op Hours */}
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Jam Operasional</h4>
              <div className="bg-gray-900/50 rounded-2xl p-5 border border-gray-800/50 space-y-4">
                {dynamicSchedule.length > 0 ? (
                  dynamicSchedule.map((item, index) => (
                    <div key={index} className={`flex justify-between items-center ${index !== dynamicSchedule.length - 1 ? 'border-b border-gray-800 pb-3' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color === 'blue' ? 'bg-blue-500' : item.color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                        <span className="text-sm font-bold text-gray-400">{item.day}</span>
                      </div>
                      <span className={`text-xs font-black text-white px-2 py-1 rounded-md ${item.color === 'blue' ? 'bg-blue-600/20' : item.color === 'emerald' ? 'bg-emerald-600/20' : 'bg-indigo-600/20'}`}>
                        {item.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-bold text-gray-400">Selasa</span>
                      </div>
                      <span className="text-xs font-black text-white bg-blue-600/20 px-2 py-1 rounded-md">08:00 - 11:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-bold text-gray-400">Kamis</span>
                      </div>
                      <span className="text-xs font-black text-white bg-emerald-600/20 px-2 py-1 rounded-md">08:00 - 11:00</span>
                    </div>
                  </>
                )}
                <p className="text-[10px] text-gray-500 italic mt-2">* Hari lain libur layanan kunjungan</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <p className="text-gray-500 text-xs font-medium text-center md:text-left">
              &copy; 2026 Lapas Narkotika IIA Pamekasan. Kemenkumham RI.
            </p>
            <div className="flex justify-center md:justify-end gap-6">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Privacy Policy</span>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}