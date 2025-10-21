// src/pages/Workspace.tsx

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DocumentViewer from '../components/DocumentViewer';
import AIPanel from '../components/AIPanel';

function Workspace() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'chat' | 'notes' | 'summary' | 'flashcards' | 'quiz' | 'generate'>('chat');
  
  // --- NEW STATE ---
  // This state will track if any document is currently being viewed,
  // whether it's from the sidebar or a local upload.
  const [isDocumentActive, setIsDocumentActive] = useState(false);

  // When a document is selected from the sidebar, we set both states
  const handleSelectDocument = (docId: string) => {
    setSelectedDocument(docId);
    setIsDocumentActive(true);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedDocument={selectedDocument}
          selectedChat={selectedChat}
          onSelectDocument={handleSelectDocument} // Use our new handler
          onSelectChat={setSelectedChat}
        />

        {/* We now pass the original documentId AND the new callback function */}
        <DocumentViewer 
          documentId={selectedDocument} 
          onDocumentLoad={setIsDocumentActive} // This is the key for communication
        />

        {/* The AI Panel now appears if isDocumentActive is true */}
        <AIPanel
          documentId={isDocumentActive ? (selectedDocument || 'local') : null}
          chatId={selectedChat}
          mode={aiMode}
          onModeChange={setAiMode}
        />
      </div>
    </div>
  );
}

export default Workspace;