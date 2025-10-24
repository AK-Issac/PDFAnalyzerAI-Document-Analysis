// src/components/AIPanel.tsx

import { MessageSquare, Send, Lightbulb, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Message } from '../pages/Workspace';
import ReactMarkdown from 'react-markdown'; // A good library for rendering AI responses

export type AIMode = 'chat' | 'summarize' | 'notes';

interface AIPanelProps {
  documentId: string | null;
  messages: Message[];
  onSendMessage: (question: string) => void;
  onRequestSummary: (description: string) => void;
  isLoading: boolean;
  mode: AIMode;
  onModeChange: (mode: AIMode) => void;
  highlightedText: string;
}

function AIPanel({ documentId, messages, onSendMessage, onRequestSummary, isLoading, mode, onModeChange, highlightedText }: AIPanelProps) {
  const [inputMessage, setInputMessage] = useState('');

  // Clear input when switching modes
  useEffect(() => {
    setInputMessage('');
  }, [mode]);

  const handleSend = () => {
    if (mode === 'chat' && inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    } else if (mode === 'summarize' && highlightedText) {
      onRequestSummary(inputMessage); // inputMessage here is the description
      setInputMessage('');
    }
  };
  
  const renderPanelContent = () => {
    switch (mode) {
      case 'summarize':
        return (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Lightbulb className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Summarize Selection</h4>
              {highlightedText ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Selection captured! Add an optional request below and press Send.</p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Please highlight a section of the document to summarize it.</p>
              )}
            </div>
            <div className="relative mt-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Optional: What should I focus on?"
                className="w-full p-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 outline-none"
                disabled={isLoading || !highlightedText}
              />
              <button onClick={handleSend} disabled={isLoading || !highlightedText} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        );
      case 'chat':
      default:
        return (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask about this document..."
                className="w-full p-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 outline-none"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading || !inputMessage.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50">
                 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        );
    }
  };

  // The placeholder UI for when no document is active
  if (!documentId) {
    return (
        <aside className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <div className="text-center px-6">
                <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload a document to begin.</p>
            </div>
        </aside>
    );
  }

  const modeButtons = [
      { id: 'chat', icon: MessageSquare, label: 'Chat' },
      { id: 'summarize', icon: Lightbulb, label: 'Summarize' },
      { id: 'notes', icon: FileText, label: 'Notes' },
  ];

  return (
    <aside className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-2">
            {modeButtons.map(btn => {
                const isActive = mode === btn.id;
                return (
                    <button
                        key={btn.id}
                        onClick={() => onModeChange(btn.id as AIMode)}
                        disabled={btn.id === 'notes'}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all ${
                            isActive ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        } ${btn.id === 'notes' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <btn.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{btn.label}</span>
                    </button>
                )
            })}
        </div>
      </div>
      
      {/* --- THIS IS THE CORRECTED SECTION --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`prose prose-sm max-w-xs md:max-w-md p-3 rounded-lg whitespace-pre-wrap ${
              message.role === 'user' 
              ? 'bg-slate-900 text-white dark:bg-slate-700' 
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
            }`}>
              {/* Using ReactMarkdown to render **bold** text from the AI */}
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
        )}
      </div>

      {renderPanelContent()}
    </aside>
  );
}

export default AIPanel;