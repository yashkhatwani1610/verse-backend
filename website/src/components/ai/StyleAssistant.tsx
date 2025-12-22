import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { getStyleAdvice } from '../../lib/gemini';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface StyleAssistantProps {
    productContext?: {
        title?: string;
        color?: string;
        fabric?: string;
        pattern?: string;
    };
}

const StyleAssistant = ({ productContext }: StyleAssistantProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your VERSE style assistant. Ask me anything about styling, occasions, color matching, or fabric care! 👔✨",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const quickQuestions = [
        'How should I style this?',
        'What occasions is this suitable for?',
        'What colors pair well with this?',
        'How do I care for this fabric?',
    ];

    const handleSendMessage = async (question?: string) => {
        const messageText = question || input;
        if (!messageText.trim() || isLoading) return;

        // Add user message
        const userMessage: Message = {
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Get AI response
            const response = await getStyleAdvice(messageText, productContext);

            // Add assistant message
            const assistantMessage: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error getting style advice:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again in a moment!",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-peach-400 to-peach-500 rounded-full shadow-2xl hover:shadow-peach-300/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
                >
                    <MessageCircle className="h-7 w-7 text-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Ask our AI Stylist
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-3xl shadow-2xl z-40 flex flex-col overflow-hidden border-2 border-peach-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-peach-400 to-peach-500 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">AI Style Assistant</h3>
                                <p className="text-xs text-peach-100">Always here to help</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                        >
                            <X className="h-4 w-4 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-peach-50/30 to-white">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                            ? 'bg-gradient-to-r from-peach-400 to-peach-500 text-white'
                                            : 'bg-white border-2 border-gray-200 text-gray-800'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                    <p
                                        className={`text-xs mt-1 ${message.role === 'user' ? 'text-peach-100' : 'text-gray-400'
                                            }`}
                                    >
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border-2 border-gray-200 rounded-2xl px-4 py-3">
                                    <Loader2 className="h-5 w-5 text-peach-500 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Questions */}
                    {messages.length === 1 && (
                        <div className="px-4 py-2 border-t border-gray-200 bg-white">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Quick Questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSendMessage(question)}
                                        className="text-xs px-3 py-1.5 bg-peach-50 hover:bg-peach-100 text-peach-700 rounded-full transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about styling..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors disabled:bg-gray-50"
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!input.trim() || isLoading}
                                className="w-12 h-12 bg-gradient-to-r from-peach-400 to-peach-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StyleAssistant;
