import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Message } from '../pages/Workspace'; // Import the Message type

interface AIPanelProps {
  documentId: string | null;
  messages: Message[];
  onSendMessage: (question: string) => void;
  isLoading: boolean;
  // Make sure you add mode and onModeChange back if you use them
}

function AIPanel({ documentId, messages, onSendMessage, isLoading }: AIPanelProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  if (!documentId) {
    // This component also needs dark mode classes
    return (
      <aside className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI Assistant Ready</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a document to start chatting with the AI.
          </p>
        </div>
      </aside>
    );
  }

  return (
    // Add dark mode classes to the main container
    <aside className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Example for a header if you have one */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
      </div>
      
      {/* Add dark mode classes to the message area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          // Example of message styling
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${
              message.role === 'user' 
              ? 'bg-slate-900 text-white dark:bg-slate-700' 
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    AI is thinking...
                </div>
            </div>
        )}
      </div>

      {/* Add dark mode classes to the input area */}
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
          <button onClick={handleSend} disabled={isLoading || !input-message.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AIPanel;