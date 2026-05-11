import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, MessageCircle, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
}

import { API_BASE_URL } from '../config';

const INITIAL_MESSAGE: Message = {
    id: '1',
    text: 'Selamat datang di PAS-Assistant! Saya siap membantu Anda dengan informasi seputar kunjungan ke Lapas Narkotika IIA Pamekasan. Ada yang bisa saya bantu?',
    sender: 'assistant',
    timestamp: new Date(),
};

export default function ChatAssistant() {
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('pas_chat_messages');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
            } catch (e) {
                console.error('Error loading chat history:', e);
            }
        }
        return [INITIAL_MESSAGE];
    });

    useEffect(() => {
        localStorage.setItem('pas_chat_messages', JSON.stringify(messages));
    }, [messages]);

    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isVoiceMuted, setIsVoiceMutedState] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const transcriptRef = useRef('');
    const isVoiceMutedRef = useRef(false);

    const setIsVoiceMuted = (muted: boolean) => {
        setIsVoiceMutedState(muted);
        isVoiceMutedRef.current = muted;
        if (muted && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    const speakText = (text: string) => {
        if ('speechSynthesis' in window && !isVoiceMutedRef.current) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            utterance.pitch = 1;
            utterance.rate = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Removed auto-send effect to allow manual control of user sending


    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        try {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : undefined;
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = [];
                // Stop tracks to release mic immediately
                stream.getTracks().forEach(track => track.stop());

                await processAudioBlob(audioBlob);
            };

            mediaRecorder.start();
            setIsListening(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Izin mikrofon ditolak atau mikrofon tidak ditemukan! Harap izinkan akses pada browser Anda.');
            setIsListening(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            setIsListening(false);
            mediaRecorderRef.current.stop();
        }
    };

    const processAudioBlob = async (blob: Blob) => {
        setIsThinking(true);
        setInput('');

        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/transcribe`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.text) {
                // Must toggle off thinking so handleSend doesn't block!
                setIsThinking(false);
                setInput(data.text);
                // Langsung lempar ke chatbot dengan me-bypass lock isThinking (karena state asinkron)
                handleSend(data.text, true);
            } else {
                throw new Error("Teks kosong dari server.");
            }
        } catch (err) {
            console.error('Transcription error:', err);
            alert('Maaf, komunikasi dengan server Whisper terputus.');
            setIsThinking(false);
        }
    };

    // Fitur Push-to-Talk atau Tap-to-Talk Hybrid
    const handleToggleRecording = () => {
        if (isListening) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior
            });
        }
    };

    useEffect(() => {
        // Only scroll to bottom if there's more than the initial message
        // or if assistant is thinking/typing (user interaction)
        if (messages.length > 1 || isThinking || isTyping) {
            // First scroll on mount should be instant to avoid jumping
            const behavior = (messages.length > 1 && !isThinking && !isTyping) ? 'auto' : 'smooth';
            scrollToBottom(behavior);
        }
    }, [messages, isThinking, isTyping]);


    const handleSend = async (textOverride?: string | any, forceSend: boolean = false) => {
        const actualTextOverride = typeof textOverride === 'string' ? textOverride : undefined;
        const textToSend = actualTextOverride !== undefined ? actualTextOverride : input;

        if (!textToSend.trim() || ((isThinking || isTyping) && !forceSend)) return;

        if (isListening) {
            stopRecording();
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        transcriptRef.current = '';
        setIsThinking(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: textToSend }),
            });

            const data = await response.json();
            const aiText = data.response || 'Maaf, saya sedang tidak dapat merespon.';

            setIsThinking(false);
            setIsTyping(true);

            // Remove artificial typing delay to get an immediate response
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiText,
                sender: 'assistant',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsTyping(false);
            speakText(aiText);

        } catch (error) {
            console.error('Error calling chatbot API:', error);
            setIsThinking(false);
            setIsTyping(false);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Maaf, terjadi kesalahan koneksi ke server chatbot.',
                sender: 'assistant',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            speakText(errorMessage.text);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-border">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white">PAS-Assistant</h3>
                        <p className="text-blue-100 text-sm">AI Layanan Kunjungan</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                        className={`p-2 rounded-lg transition-colors ${isVoiceMuted ? 'bg-red-500/20 hover:bg-red-500/40 text-red-100' : 'hover:bg-white/20 text-white/80 hover:text-white'}`}
                        title={isVoiceMuted ? "Nyalakan Suara AI" : "Matikan Suara AI"}
                    >
                        {isVoiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Apakah Anda yakin ingin menghapus semua riwayat percakapan?')) {
                                setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
                                localStorage.removeItem('pas_chat_messages');
                            }
                        }}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Hapus percakapan"
                    >
                        <Trash2 className="w-5 h-5 text-white/80 hover:text-white" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            {message.sender === 'user' ? (
                                <User className="w-5 h-5 text-white" />
                            ) : (
                                <Bot className="w-5 h-5 text-gray-700" />
                            )}
                        </div>
                        <div
                            className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.text}</p>
                            <p
                                className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}
                            >
                                {message.timestamp.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex gap-3 flex-row">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200">
                            <Bot className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <span className="text-[10px] text-gray-500 ml-2 italic">Memikirkan...</span>
                        </div>
                    </div>
                )}

                {isTyping && (
                    <div className="flex gap-3 flex-row">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200">
                            <Bot className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            <span className="text-[10px] text-gray-500 ml-2 italic">Mengetik...</span>
                        </div>
                    </div>
                )}


            </div>

            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <button
                        onClick={handleToggleRecording}
                        className={`flex-shrink-0 p-2 sm:px-3 text-white rounded-lg transition-colors flex items-center justify-center ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gray-500 hover:bg-gray-600'}`}
                        title={isListening ? "Klik untuk menghentikan rekaman & kirim" : "Tap untuk bicara dengan Whisper AI"}
                    >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            transcriptRef.current = e.target.value; // Sync with typing
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder={isListening ? "Sedang merekam suara Anda... Klik off jika selesai." : "Ketik pertanyaan Anda atau klik logo Mic..."}
                        className="flex-1 min-w-0 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    />
                    <button
                        onClick={handleSend}
                        className="flex-shrink-0 px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Kirim</span>
                    </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                    {['Jadwal', 'Syarat', 'Barang', 'Kontak'].map((chip) => (
                        <button
                            key={chip}
                            onClick={() => setInput(chip)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {chip}
                        </button>
                    ))}
                    <div className="flex-1"></div>
                    <a
                        href="https://wa.me/6282143317094"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-[#25D366]/10 text-[#128C7E] rounded-full hover:bg-[#25D366]/20 transition-colors flex items-center gap-1.5 font-bold border border-[#25D366]/30 shadow-sm"
                        title="Chat Petugas via WhatsApp"
                    >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp Petugas
                    </a>
                </div>
            </div>
        </div>
    );
}
