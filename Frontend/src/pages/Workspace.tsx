// src/pages/Workspace.tsx

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DocumentViewer from '../components/DocumentViewer';
import AIPanel, { AIMode } from '../components/AIPanel';
import { queryDocument, summarizeText } from '../services/apiService';
import { supabase } from '../lib/supabase'; // Ensure this path is correct
import { useAuth } from '../contexts/AuthContext'; // Ensure this path is correct

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
  
  // This state holds the public URL of the document to be viewed in the PDF viewer
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  
  // This state is for the AI backend, which uses the UUID as the docId
  const [aiDocId, setAiDocId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState<AIMode>('chat');
  const [highlightedText, setHighlightedText] = useState<string>('');
  
  // A simple state to trigger a refresh in the sidebar when new data is created
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
      const { data, error } = await supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('chat_id', selectedChatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setMessages([{
          id: 'error-msg-load',
          role: 'assistant',
          content: 'Failed to load message history.',
          timestamp: new Date()
        }]);
      } else {
        const loadedMessages = data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [selectedChatId]);

  // --- LOGIC HANDLERS ---

  /**
   * Called from Sidebar: Fetches an existing document's URL and its associated chat.
   */
  const handleSelectDocument = async (docId: string) => {
    setIsLoading(true);

    try {
        // 1. Fetch the document details to get its FILE PATH (not the public URL).
        const { data: docData, error: docError } = await supabase
            .from('documents')
            .select('file_url') // Assuming file_url stores the path like 'user_id/file-name.pdf'
            .eq('id', docId)
            .single();

        if (docError || !docData) {
            throw new Error(`Could not find document details: ${docError?.message}`);
        }

        const filePath = docData.file_url;

        // --- THE FIX: Create a Signed URL ---
        // This creates a temporary, authenticated URL that is valid for 1 hour (3600 seconds).
        const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('user_documents')
            .createSignedUrl(filePath, 3600); 
        
        if (signedUrlError) {
            throw new Error(`Could not create signed URL: ${signedUrlError.message}`);
        }

        // 2. Find the most recent chat associated with this document.
        const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .select('id')
            .eq('document_id', docId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (chatError) {
            throw new Error(`Could not find chat for document: ${chatError.message}`);
        }

        // 3. Update all relevant states with the new, secure URL.
        setSelectedDocumentId(docId);
        setAiDocId(docId);
        setDocumentUrl(signedUrlData.signedUrl); // Use the secure signed URL
        setSelectedChatId(chatData.id);

    } catch (error: any) {
        console.error("Error selecting document:", error);
        alert(error.message);
    } finally {
        setIsLoading(false);
    }
};
  
  /**
   * Called from Sidebar: Fetches an existing chat's details and loads its associated document, if any.
   */
  const handleSelectChat = async (chatId: string) => {
    setIsLoading(true);
    const { data: chatData, error: chatError } = await supabase
      .from('chats').select('document_id').eq('id', chatId).single();

    if (chatError || !chatData) {
      console.error("Error fetching chat details:", chatError);
      setIsLoading(false);
      return;
    }

    setSelectedChatId(chatId);

    if (chatData.document_id) {
      await handleSelectDocument(chatData.document_id);
    } else {
      setSelectedDocumentId(null);
      setAiDocId(null);
      setDocumentUrl(null);
    }
    setIsLoading(false);
  };

  /**
   * Creates a new, empty chat session in Supabase and activates it.
   */
  const handleNewChat = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('chats').insert({ user_id: user.id, title: 'New Chat' }).select().single();
    if (error) { console.error("Error creating new chat:", error); return; }
    
    setSelectedDocumentId(null);
    setAiDocId(null);
    setDocumentUrl(null);
    setSelectedChatId(data.id);
    setRefreshSidebarKey(prev => !prev);
  };

  /**
   * Handles the complete upload workflow: Storage, Backend AI, and Database records.
   */
  const handleUploadSuccess = async (backendDocId: string, file: File) => {
    if (!user) return;
    try {
      // The file path is the unique identifier within storage
      const filePath = `${user.id}/${backendDocId}-${file.name}`;

      const { error: uploadError } = await supabase.storage.from('user_documents').upload(filePath, file);
      if (uploadError) throw uploadError;

      // --- THE FIX ---
      // We will now store the PATH in the database, not the public URL.
      const { error: docError } = await supabase.from('documents').insert({
        id: backendDocId,
        user_id: user.id,
        title: file.name,
        file_url: filePath, // <-- STORE THE PATH
        file_size: file.size,
      });
      if (docError) throw docError;
      
      const { data: chatData, error: chatError } = await supabase.from('chats').insert({ user_id: user.id, document_id: backendDocId, title: file.name }).select().single();
      if (chatError) throw chatError;

      // Now, for immediate viewing, we create a signed URL for the just-uploaded file
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('user_documents').createSignedUrl(filePath, 3600);
      if (signedUrlError) throw signedUrlError;

      setAiDocId(backendDocId);
      setSelectedDocumentId(backendDocId);
      setDocumentUrl(signedUrlData.signedUrl); // Use the new signed URL
      setSelectedChatId(chatData.id);
      setMessages([ /* ... */ ]);
      setAiMode('chat');
      setRefreshSidebarKey(prev => !prev);
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

    await supabase.from('messages').insert({ chat_id: selectedChatId, role: 'user', content: question });

    try {
      const result = await queryDocument(aiDocId, question);
      const assistantMessage: Message = { id: `assistant-${Date.now()}`, role: 'assistant', content: result.answer, timestamp: new Date() };
      
      await supabase.from('messages').insert({ chat_id: selectedChatId, role: 'assistant', content: result.answer });
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error querying document:", error);
      const errorMessage: Message = { id: `error-${Date.now()}`, role: 'assistant', content: "Sorry, an error occurred. Please try again.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Captures highlighted text and switches the AI Panel to summarize mode.
   */
  const handleTextHighlight = (selectedText: string) => {
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
          selectedChat={selectedChatId}
          onSelectDocument={handleSelectDocument}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          refreshKey={refreshSidebarKey}
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