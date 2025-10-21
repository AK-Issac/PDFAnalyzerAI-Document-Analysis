import { MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';
import { Message } from '../pages/Workspace'; // Import the Message type

interface AIPanelProps {
  documentId: string | null;
  messages: Message[];
  onSendMessage: (question: string) => void;
  isLoading: boolean;
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
    return <aside className="w-96 bg-white flex items-center justify-center">...</aside>;
  }

  return (
    <aside className="w-96 bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>... {message.content} ...</div>
        ))}
        {isLoading && <div>... AI is thinking ...</div>}
      </div>
      <div className="p-4 border-t">
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
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AIPanel;
