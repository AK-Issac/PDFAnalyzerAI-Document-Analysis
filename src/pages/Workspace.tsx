import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import DocumentViewer from '../components/DocumentViewer';
import AIPanel from '../components/AIPanel';

function Workspace() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'chat' | 'notes' | 'summary' | 'flashcards' | 'quiz' | 'generate'>('chat');

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

        <DocumentViewer documentId={selectedDocument} />

        <AIPanel
          documentId={selectedDocument}
          chatId={selectedChat}
          mode={aiMode}
          onModeChange={setAiMode}
        />
      </div>
    </div>
  );
}

export default Workspace;
