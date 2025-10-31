import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DocumentViewer from '../components/DocumentViewer';
import AIPanel, { AIMode } from '../components/AIPanel';
import { queryDocument, summarizeText } from '../services/apiService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Define the structure for a chat message, exported for use in other components
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

function Workspace() {
  const { user } = useAuth();
  
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
   * EFFECT: Fetches message history from Supabase whenever the selectedChatId changes.
   */
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) {
        setMessages([]); // Clear messages if no chat is selected
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('id, role, content, created_at')
          .eq('chat_id', selectedChatId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const loadedMessages = data.map(msg => ({
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
   * Called from Sidebar: Fetches an existing document's URL and its associated chat.
   */
  const handleSelectDocument = async (docId: string) => {
    // If the same document is clicked again, do nothing.
    if (docId === selectedDocumentId) return;
    
    setIsLoading(true);
    try {
      // 1. Fetch the document details to get its file path.
      const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('file_url')
          .eq('id', docId)
          .single();

      if (docError || !docData) throw new Error(`Could not find document details: ${docError?.message}`);

      // 2. Create a temporary, secure URL for the file.
      const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('user_documents')
          .createSignedUrl(docData.file_url, 3600); // URL is valid for 1 hour
      
      if (signedUrlError) throw new Error(`Could not create signed URL: ${signedUrlError.message}`);

      // 3. Find the chat associated with this document.
      const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('id')
          .eq('document_id', docId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

      if (chatError) throw new Error(`Could not find a chat for this document: ${chatError.message}`);

      // 4. Update all relevant states to display the document and its chat.
      setSelectedDocumentId(docId);
      setAiDocId(docId);
      setDocumentUrl(signedUrlData.signedUrl);
      setSelectedChatId(chatData.id);

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
   * Creates a new, empty chat session that is not associated with any document.
   */
  const handleNewChat = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        const { data, error } = await supabase
            .from('chats')
            .insert({ user_id: user.id, title: 'New Chat' })
            .select()
            .single();
        if (error) throw error;
        
        // Clear any currently viewed document
        handleDeselect(); 
        // Set the new chat as active
        setSelectedChatId(data.id);
        // Trigger a refresh in the sidebar to show the new chat (if chats were visible)
        setRefreshSidebarKey(prev => !prev);
    } catch(error: any) {
        console.error("Error creating new chat:", error);
        alert(`Failed to create a new chat: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  /**
   * Handles the complete upload workflow: Storage, Backend AI processing, and Database records.
   */
  const handleUploadSuccess = async (backendDocId: string, file: File) => {
    if (!user) return;
    try {
      const filePath = `${user.id}/${backendDocId}-${file.name}`;

      const { error: uploadError } = await supabase.storage.from('user_documents').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: docError } = await supabase.from('documents').insert({
        id: backendDocId,
        user_id: user.id,
        title: file.name,
        file_url: filePath,
        file_size: file.size,
      });
      if (docError) throw docError;
      
      const { data: chatData, error: chatError } = await supabase.from('chats').insert({ 
        user_id: user.id, 
        document_id: backendDocId, 
        title: file.name 
      }).select().single();
      if (chatError) throw chatError;

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('user_documents').createSignedUrl(filePath, 3600);
      if (signedUrlError) throw signedUrlError;

      // Set the newly uploaded document as the active one
      setAiDocId(backendDocId);
      setSelectedDocumentId(backendDocId);
      setDocumentUrl(signedUrlData.signedUrl);
      setSelectedChatId(chatData.id);
      setMessages([]);
      setAiMode('chat');
      setRefreshSidebarKey(prev => !prev); // Refresh sidebar to show the new document
    } catch (error) {
      console.error("Error during upload and database insertion:", error);
      alert("An error occurred while saving the document.");
    }
  };

  /**
   * Sends a user's question to the backend and saves the conversation to Supabase.
   */
  const handleSendMessage = async (question: string) => {
    if (!aiDocId || !selectedChatId || isLoading) return;

    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await supabase.from('messages').insert({ chat_id: selectedChatId, role: 'user', content: question });
      
      const result = await queryDocument(aiDocId, question);
      const assistantMessage: Message = { id: `assistant-${Date.now()}`, role: 'assistant', content: result.answer, timestamp: new Date() };
      
      await supabase.from('messages').insert({ chat_id: selectedChatId, role: 'assistant', content: result.answer });
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
   * Sends highlighted text to the backend and saves the summary to the current chat.
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
      
      await supabase.from('messages').insert({ chat_id: selectedChatId, role: 'assistant', content: summaryContent });
      // Replace the "Summarizing..." message with the actual summary
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