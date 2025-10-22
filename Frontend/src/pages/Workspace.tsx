// src/pages/Workspace.tsx

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DocumentViewer from '../components/DocumentViewer';
import AIPanel from '../components/AIPanel';
import { queryDocument, summarizeText } from '../services/apiService';

// Define the structure for a chat message
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

function Workspace() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'chat' | 'notes' | 'summary'>('chat');
  
  // --- CENTRAL STATE ---
  const [docId, setDocId] = useState<string | null>(null); // The ID from the backend
  const [messages, setMessages] = useState<Message[]>([]); // The chat history
  const [isLoading, setIsLoading] = useState(false); // For showing a loading indicator

  // --- LOGIC FUNCTIONS ---

  // Called from DocumentViewer after a successful upload
  const handleUploadSuccess = (newDocId: string) => {
    setDocId(newDocId);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I've analyzed your document. How can I help you?",
        timestamp: new Date(),
      }
    ]);
  };

  // Called from AIPanel when the user sends a message
  const handleSendMessage = async (question: string) => {
    if (!docId || isLoading) return;

    // Add user's message to chat immediately for a responsive feel
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await queryDocument(docId, question);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error querying document:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Called from PdfViewer when text is selected
  const handleSummarizeSelection = async (selectedText: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    const summaryRequestMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Summarizing the selected text for you...",
        timestamp: new Date()
    };
    setMessages(prev => [...prev, summaryRequestMessage]);

    try {
        const result = await summarizeText(selectedText);
        const summaryMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `**Summary of your selection:**\n\n${result.summary}`,
            timestamp: new Date()
        };
        // Replace "Summarizing..." with the actual summary
        setMessages(prev => [...prev.slice(0, -1), summaryMessage]);
    } catch (error) {
        console.error("Error summarizing text:", error);
         const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Sorry, I couldn't summarize that selection.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedDocument={selectedDocument}
          selectedChat={selectedChat}
          onSelectDocument={setSelectedDocument}
          onSelectChat={setSelectedChat}
        />
        <DocumentViewer 
          onUploadSuccess={handleUploadSuccess} 
        />
        <AIPanel
          documentId={docId}
          mode={aiMode}
          onModeChange={setAiMode}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default Workspace;