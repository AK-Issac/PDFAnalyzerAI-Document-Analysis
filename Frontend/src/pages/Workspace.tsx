import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DocumentViewer from '../components/DocumentViewer';
import AIPanel, { AIMode } from '../components/AIPanel';
import { queryDocument, summarizeText, fetchMessages as fetchMessagesAPI, fetchChatForDocument, getDocumentUrl } from '../services/apiService';

// Define the structure for a chat message, exported for use in other components
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// If a chat without document is needed, you could add an endpoint in apiService, but for now we just reset.
// In the future, if you want "general chats", they would need to be supported by a dedicated endpoint.

function Workspace() {
  
  // --- STATE MANAGEMENT ---
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [aiDocId, setAiDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState<AIMode>('chat');
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [refreshSidebarKey, setRefreshSidebarKey] = useState(false);  
  
  /**
   * EFFECT: Fetches message history from backend whenever the selectedChatId changes.
   */
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) {
        setMessages([]); // Clear messages if no chat is selected
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchMessagesAPI(selectedChatId);
        
        const loadedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([{
          id: 'error-msg-load',
          role: 'assistant',
          content: 'Failed to load message history.',
          timestamp: new Date()
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChatId]);

  /**
   * Called from Sidebar: Fetches an existing document's URL and its associated chat from Postgres via Flask API.
   */
  const handleSelectDocument = async (docId: string) => {
    // If the same document is clicked again, do nothing.
    if (docId === selectedDocumentId) return;
    
    setIsLoading(true);
    try {
      // 1. Fetch the chat associated with this document from our backend.
      const chatData = await fetchChatForDocument(docId);
      
      // 2. Set the document URL to our backend static file endpoint
      const backendDocUrl = getDocumentUrl(docId);

      // 3. Update all relevant states to display the document and its chat.
      setSelectedDocumentId(docId);
      setAiDocId(docId);
      setDocumentUrl(backendDocUrl);
      setSelectedChatId(chatData.chat_id);
      setAiMode('chat');

    } catch (error: any) {
        console.error("Error selecting document:", error);
        alert(`Failed to load document. ${error.message}`);
        // If loading fails, reset the view.
        handleDeselect();
    } finally {
        setIsLoading(false);
    }
  };
  
  /**
   * Clears all active document and chat states to reset the view.
   * This is called when a document is deleted or if loading fails.
   */
  const handleDeselect = () => {
    setSelectedDocumentId(null);
    setSelectedChatId(null);
    setDocumentUrl(null);
    setAiDocId(null);
    setMessages([]);
  };

  /**
   * Creates a new, empty chat session. Since we disabled Supabase,
   * we just clear the view for now, as sending messages requires a selected document right now.
   */
  const handleNewChat = () => {
    handleDeselect(); 
    setRefreshSidebarKey(prev => !prev);
  };

  const handleUploadSuccess = async (backendDocId: string, backendChatId: string, file: File) => {
    try {
      // Create a local URL so the PDF Viewer can show it immediately without waiting for server reload
      const localFileUrl = URL.createObjectURL(file);

      // Set the workspace state with the REAL data from your PostgreSQL backend
      setAiDocId(backendDocId); 
      setSelectedDocumentId(backendDocId);
      setDocumentUrl(localFileUrl);
      setSelectedChatId(backendChatId); 
      setMessages([]);
      setAiMode('chat');
      setRefreshSidebarKey(prev => !prev); 
    } catch (error) {
      console.error("Error setting up local document view:", error);
      alert("An error occurred displaying the document.");
    }
  };

  const handleSendMessage = async (question: string) => {
    if (!aiDocId || !selectedChatId || isLoading) return;

    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // The backend queryDocument route saves BOTH the user message and the assistant message to Postgres automatically
      const result = await queryDocument(aiDocId, selectedChatId, question);
      
      const assistantMessage: Message = { 
        id: `assistant-${Date.now()}`, 
        role: 'assistant', 
        content: result.answer, 
        timestamp: new Date(),
        sources: result.sources 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error querying document:", error);
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: "Sorry, an error occurred while processing your request. Please try again.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Captures highlighted text and switches the AI Panel to summarize mode.
   */
  const handleTextHighlight = (selectedText: string) => {
    if (!selectedChatId) {
        alert("Please select a document or start a new chat before summarizing.");
        return;
    }
    setHighlightedText(selectedText);
    setAiMode('summarize');
  };

  /**
   * Sends highlighted text to the backend. Currently summarizeText doesn't save to postgres,
   * but it functions within the UI session.
   */
  const handleRequestSummary = async (description: string) => {
    if (!highlightedText || !selectedChatId || isLoading) return;
    
    setIsLoading(true);
    const summaryRequestMessage: Message = { id: `pending-${Date.now()}`, role: 'assistant', content: "Summarizing the selected text...", timestamp: new Date() };
    setMessages(prev => [...prev, summaryRequestMessage]);

    try {
      const result = await summarizeText(highlightedText, description);
      const summaryContent = `**Summary of your selection:**\n\n${result.summary}`;
      const summaryMessage: Message = { id: `summary-${Date.now()}`, role: 'assistant', content: summaryContent, timestamp: new Date() };
      
      // Update UI only - you can add a post to a saveMessage endpoint later if you want summaries saved in postgres
      setMessages(prev => [...prev.slice(0, -1), summaryMessage]);
    } catch (error) {
      console.error("Error summarizing text:", error);
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: "Sorry, I couldn't summarize that selection.", timestamp: new Date() };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
      setHighlightedText('');
      setAiMode('chat');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedDocument={selectedDocumentId}
          onSelectDocument={handleSelectDocument}
          onNewChat={handleNewChat}
          refreshKey={refreshSidebarKey}
          onDeleteDocument={handleDeselect} // Pass the deselect handler to clear the view on delete
        />
        <DocumentViewer 
          documentUrl={documentUrl}
          onUploadSuccess={handleUploadSuccess} 
          onSummarize={handleTextHighlight}
        />
        <AIPanel
          documentId={aiDocId}
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