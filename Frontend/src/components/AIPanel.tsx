// src/components/AIPanel.tsx

import { MessageSquare, Send, Lightbulb, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Message } from '../pages/Workspace';

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
                <p className="text-sm text-slate-500 dark:text-slate-400">Selection captured! Add an optional request below (e.g., "explain this to a 5-year-old") and press Enter.</p>
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
                className="w-full ..."
                disabled={isLoading || !highlightedText}
              />
              <button onClick={handleSend} disabled={isLoading || !highlightedText} className="...">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
                className="w-full ..."
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading || !inputMessage.trim()} className="...">
                 {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        );
    }
  };

  if (!documentId) { /* ... (placeholder UI) ... */ }

  const modeButtons = [
      { id: 'chat', icon: MessageSquare, label: 'Chat' },
      { id: 'summarize', icon: Lightbulb, label: 'Summarize' },
      { id: 'notes', icon: FileText, label: 'Notes' },
  ];

  return (
    <aside className="w-96 bg-white dark:bg-slate-900 ... flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-2">
            {modeButtons.map(btn => {
                const isActive = mode === btn.id;
                return (
                    <button
                        key={btn.id}
                        onClick={() => onModeChange(btn.id as AIMode)}
                        disabled={btn.id === 'notes'} // Disable notes for now
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all ${
                            isActive ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-700' : '... hover:bg-slate-100 dark:hover:bg-slate-800'
                        } ${btn.id === 'notes' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <btn.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{btn.label}</span>
                    </button>
                )
            })}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => ( /* ... message rendering logic ... */ ))}
      </div>

      {renderPanelContent()}
    </aside>
  );
}

export default AIPanel;