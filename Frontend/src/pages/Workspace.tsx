// src/pages/Workspace.tsx

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DocumentViewer from '../components/DocumentViewer';
import AIPanel, { AIMode } from '../components/AIPanel'; // Import AIMode type
import { queryDocument, summarizeText } from '../services/apiService';

// Define the structure for a chat message, exported for use in other components
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

function Workspace() {
  // --- STATE FOR SIDEBAR SELECTION ---
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  
  // --- CENTRAL STATE FOR AI & DOCUMENT INTERACTION ---
  const [docId, setDocId] = useState<string | null>(null); // The ID from the backend
  const [messages, setMessages] = useState<Message[]>([]); // The chat history
  const [isLoading, setIsLoading] = useState(false); // For showing loading indicators
  const [aiMode, setAiMode] = useState<AIMode>('chat'); // The active mode of the AI Panel
  const [highlightedText, setHighlightedText] = useState<string>(''); // Stores user-selected text from the PDF

  // --- LOGIC HANDLERS ---

  /**
   * Called from DocumentViewer after a successful PDF upload.
   * Sets the backend document ID and initializes the chat.
   */
  const handleUploadSuccess = (newDocId: string) => {
    setDocId(newDocId);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I've analyzed your document. Ask me anything, or switch to 'Summarize' mode after highlighting some text.",
        timestamp: new Date(),
      }
    ]);
    setAiMode('chat'); // Default to chat mode after upload
  };

  /**
   * Called from AIPanel when the user sends a message in 'chat' mode.
   * Sends the question to the backend and updates the chat with the AI's response.
   */
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
        content: "Sorry, I encountered an error while answering your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Called from DocumentViewer when text is highlighted on the PDF.
   * Captures the selected text and switches the AI Panel to 'summarize' mode.
   */
  const handleTextHighlight = (selectedText: string) => {
    setHighlightedText(selectedText);
    setAiMode('summarize');
    console.log("Captured highlighted text for summary:", selectedText);
  };

  /**
   * Called from AIPanel when a user submits a summary request.
   * Sends the highlighted text and an optional description to the backend.
   */
  const handleRequestSummary = async (description: string) => {
    if (!highlightedText || isLoading) return;
    
    setIsLoading(true);
    // Add a temporary "working" message to the chat
    const summaryRequestMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Summarizing the selected text for you...",
        timestamp: new Date()
    };
    setMessages(prev => [...prev, summaryRequestMessage]);

    try {
        const result = await summarizeText(highlightedText, description);
        const summaryMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `**Summary of your selection:**\n\n${result.summary}`,
            timestamp: new Date()
        };
        // Replace the "Summarizing..." message with the final summary
        setMessages(prev => [...prev.slice(0, -1), summaryMessage]);
    } catch (error) {
        console.error("Error summarizing text:", error);
         const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Sorry, I couldn't summarize that selection. Please try again.",
            timestamp: new Date()
        };
        setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
        setIsLoading(false);
        setHighlightedText(''); // Clear the selection from state
        setAiMode('chat'); // Switch back to chat mode for a smooth UX
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
          onSummarize={handleTextHighlight}
        />
        <AIPanel
          documentId={docId}
          mode={aiMode}
          onModeChange={setAiMode}
          messages={messages}
          onSendMessage={handleSendMessage}
          onRequestSummary={handleRequestSummary}
          highlightedText={highlightedText}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default Workspace;