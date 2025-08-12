'use client';

import Navbar from '@/components/navbarLink/nav';
import { useState, FormEvent, ChangeEvent } from 'react';

interface Message {
  id: number;
  sender: 'Vous' | 'ChatGPT';
  text: string;
  timestamp: string;
}

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newMessage.trim()) {
      const userMsg: Message = {
        id: Date.now(),
        sender: 'Vous',
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setNewMessage('');
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('http://127.0.0.1:8000/chat-gpt5', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMsg.text }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erreur lors de la connexion');
        }

        const data = await response.json();

        const aiMsg: Message = {
          id: Date.now() + 1,
          sender: 'ChatGPT',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (error: any) {
        setError(error.message || 'Désolé, une erreur est survenue.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 max-w-sm bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Discussions</h2>
        </div>
        <div className="p-6 flex items-center cursor-pointer hover:bg-blue-100 transition rounded-lg">
          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-extrabold text-lg shadow">
            AI
          </div>
          <div className="ml-4 flex-1">
            <h3 className="font-semibold text-gray-800 text-lg">ChatGPT</h3>
            <p className="text-sm text-gray-500 truncate">Discussion avec l'IA</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center p-6 bg-white border-b shadow-sm">
          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-extrabold text-xl shadow">
            AI
          </div>
          <h1 className="ml-4 text-xl font-semibold text-gray-900">ChatGPT</h1>
        </header>

        {/* Messages */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-5 flex ${
                msg.sender === 'Vous' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xl px-5 py-3 rounded-2xl shadow-md whitespace-pre-wrap break-words ${
                  msg.sender === 'Vous'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                }`}
              >
                <p className="text-base leading-relaxed">{msg.text}</p>
                <time className="block text-xs text-gray-400 mt-1 text-right">
                  {msg.timestamp}
                </time>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-5 flex justify-start">
              <div className="max-w-xl px-5 py-3 rounded-2xl bg-white italic text-gray-500 shadow-sm">
                En train de taper...
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 flex justify-center">
              <div className="max-w-xl px-5 py-3 rounded-lg bg-red-100 text-red-700 border border-red-400 shadow">
                {error}
              </div>
            </div>
          )}
        </main>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-6 bg-white border-t flex items-center space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Écrire un message..."
            className="flex-1 rounded-full border border-gray-300 px-5 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={isLoading}
            aria-label="Message à envoyer"
          />
          <button
            type="submit"
            disabled={isLoading}
            aria-label="Envoyer le message"
            className="rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main>
      <div className="flex min-h-screen bg-gray-100 text-gray-800">
        <Navbar />
        <ChatApp />
      </div>
    </main>
  );
}
