import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
}

import { API_BASE_URL } from '../config';

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
        return [
            {
                id: '1',
                text: 'Selamat datang di PAS-Assistant! Saya siap membantu Anda dengan informasi seputar kunjungan ke Lapas Narkotika IIA Pamekasan. Ada yang bisa saya bantu?',
                sender: 'assistant',
                timestamp: new Date(),
            },
        ];
    });

    useEffect(() => {
        localStorage.setItem('pas_chat_messages', JSON.stringify(messages));
    }, [messages]);

    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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


    const handleSend = async () => {
        if (!input.trim() || isThinking || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsThinking(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentInput }),
            });

            const data = await response.json();

            setIsThinking(false);
            setIsTyping(true);

            // Simulate typing delay based on message length
            const typingTime = Math.min(Math.max(data.response?.length * 20, 1000), 3000);

            setTimeout(() => {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.response || 'Maaf, saya sedang tidak dapat merespon.',
                    sender: 'assistant',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
                setIsTyping(false);
            }, typingTime);

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
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white">PAS-Assistant</h3>
                        <p className="text-blue-100 text-sm">AI Layanan Kunjungan</p>
                    </div>
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
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ketik pertanyaan Anda..."
                        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    />
                    <button
                        onClick={handleSend}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Kirim
                    </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {['Jadwal', 'Syarat', 'Barang', 'Kontak'].map((chip) => (
                        <button
                            key={chip}
                            onClick={() => setInput(chip)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
