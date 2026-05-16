import { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import keycloak, { initKeycloak } from '../keycloak';

interface AdminLoginProps {
    onLogin: (status: boolean) => void;
}

import { API_BASE_URL } from '../config';

export default function AdminLogin({ onLogin }: AdminLoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSSOLoading, setIsSSOLoading] = useState(false);

    // Login via username & password (SQL/Laravel)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                localStorage.setItem('is_admin_logged_in', 'true');
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                if (data.user) {
                    localStorage.setItem('auth_user', JSON.stringify(data.user));
                }
                onLogin(true);
            } else {
                setError(data.message || 'Username atau password tidak valid');
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('Gagal menghubungkan ke server');
            setIsLoading(false);
        }
    };

    // Login via Keycloak SSO — redirect to Keycloak login page.
    // After successful Keycloak login, the browser redirects back to the app
    // and the callback is handled in App.tsx useEffect on mount.
    const handleSSOLogin = async () => {
        setIsSSOLoading(true);
        setError('');

        try {
            // Mark that SSO login is in progress so App.tsx knows to process callback
            localStorage.setItem('sso_login_pending', 'true');

            // Initialize keycloak (check-sso first to see if already authenticated)
            const authenticated = await initKeycloak({
                onLoad: 'check-sso',
                checkLoginIframe: false,
            });

            if (authenticated && keycloak.token) {
                // Already authenticated — exchange token with backend
                await exchangeSSOToken(keycloak.token);
            } else {
                // Not authenticated — redirect to Keycloak login page
                // This will navigate away from the app; on return,
                // App.tsx will call keycloak.init() to process the callback
                keycloak.login({
                    redirectUri: window.location.origin + '/?sso_callback=1',
                });
            }
        } catch (err) {
            console.error('SSO init error:', err);
            localStorage.removeItem('sso_login_pending');
            setError(
                typeof err === 'string'
                    ? err
                    : 'Gagal login menggunakan SSO. Pastikan Keycloak server aktif.'
            );
            setIsSSOLoading(false);
        }
    };

    // Exchange Keycloak token with Laravel backend for a local Sanctum token
    const exchangeSSOToken = async (kcToken: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/login-sso`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: kcToken }),
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                localStorage.setItem('is_admin_logged_in', 'true');
                localStorage.setItem('kc_token', kcToken);
                localStorage.removeItem('sso_login_pending');
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                if (data.user) {
                    localStorage.setItem('auth_user', JSON.stringify(data.user));
                }
                onLogin(true);
            } else {
                localStorage.removeItem('sso_login_pending');
                setError(data.message || 'Gagal login menggunakan SSO');
                setIsSSOLoading(false);
            }
        } catch (err) {
            console.error('SSO token exchange error:', err);
            localStorage.removeItem('sso_login_pending');
            setError('Gagal menghubungkan ke server backend');
            setIsSSOLoading(false);
        }
    };

    const isAnyLoading = isLoading || isSSOLoading;

    return (
        <div className="relative">
            {/* Background Decorative Elements */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>

            <div className="max-w-md mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
                    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 p-10 text-center relative overflow-hidden">
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck className="w-12 h-12 text-white drop-shadow-lg" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Portal</h2>
                            <p className="text-blue-50/80 text-sm font-medium">Otentikasi sistem manajemen pendaftaran</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-6">
                        {error && (
                            <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-3 animate-shake">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold">!</span>
                                </div>
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest" htmlFor="username">
                                    Username
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within/input:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-900 font-medium"
                                        placeholder="Ketik username..."
                                        disabled={isAnyLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-widest" htmlFor="password">
                                    Sandi Keamanan
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within/input:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-900 font-medium"
                                        placeholder="••••••••"
                                        disabled={isAnyLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SQL/Laravel Login Button */}
                        <button
                            type="submit"
                            disabled={isAnyLoading || !username || !password}
                            className={`w-full relative overflow-hidden group/btn bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none`}
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Memproses login...
                                    </>
                                ) : (
                                    <>
                                        Masuk dengan Akun
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">atau</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        </div>

                        {/* SSO / Keycloak Login Button */}
                        <button
                            type="button"
                            onClick={handleSSOLogin}
                            disabled={isAnyLoading}
                            className="w-full relative overflow-hidden group/sso bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {isSSOLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Menghubungkan ke SSO...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="w-5 h-5" />
                                        Masuk dengan SSO
                                    </>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/sso:translate-y-0 transition-transform duration-300"></div>
                        </button>

                        <p className="text-center text-xs text-gray-400 font-medium">
                            Hanya personel berwenang yang diizinkan masuk.<br />
                            Log aktivitas akan dicatat untuk audit keamanan.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
