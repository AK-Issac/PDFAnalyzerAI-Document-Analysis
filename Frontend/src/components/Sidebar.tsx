// src/components/Sidebar.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Folder,
  FolderPlus,
  MessageSquare,
  Plus,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../lib/supabase'; // Make sure this path is correct
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an AuthContext

// --- DATA TYPES ---
type FolderType = {
  id: string;
  name: string;
  parent_id: string | null;
};

type DocumentType = {
  id: string;
  title: string;
  folder_id: string | null;
};

type ChatType = {
  id: string;
  title: string;
};

type FolderWithDocuments = FolderType & { documents: DocumentType[] };

// --- COMPONENT PROPS ---
interface SidebarProps {
  selectedDocument: string | null;
  selectedChat: string | null;
  onSelectDocument: (id: string) => void;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  refreshKey: boolean; // A key from the parent to trigger re-fetching
}

function Sidebar({ selectedDocument, selectedChat, onSelectDocument, onSelectChat, onNewChat, refreshKey }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for raw data from Supabase
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);

  // State for UI and data fetching
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all necessary data for the sidebar from Supabase.
   * Can be called manually to refresh.
   */
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [foldersRes, docsRes, chatsRes] = await Promise.all([
        supabase.from('folders').select('id, name, parent_id').eq('user_id', user.id),
        supabase.from('documents').select('id, title, folder_id').eq('user_id', user.id),
        supabase.from('chats').select('id, title').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(10),
      ]);

      if (foldersRes.error) throw foldersRes.error;
      if (docsRes.error) throw docsRes.error;
      if (chatsRes.error) throw chatsRes.error;

      setFolders(foldersRes.data || []);
      setDocuments(docsRes.data || []);
      setChats(chatsRes.data || []);
    } catch (err: any) {
      console.error("Error fetching sidebar data:", err);
      setError("Failed to load workspace.");
    } finally {
      setLoading(false);
    }
  };

  // --- DATA FETCHING EFFECT ---
  // Runs when the component mounts, the user changes, or the refreshKey is toggled.
  useEffect(() => {
    fetchData();
  }, [user, refreshKey]);

  /**
   * Prompts user for a folder name and creates it in Supabase.
   */
  const handleNewFolder = async () => {
    if (!user) return;
    const folderName = prompt("Enter a name for the new folder:");
    if (folderName && folderName.trim()) {
      const { error } = await supabase
        .from('folders')
        .insert({ user_id: user.id, name: folderName.trim() });
      
      if (error) {
        console.error("Error creating folder:", error);
        alert(`Failed to create folder: ${error.message}`);
      } else {
        fetchData(); // Re-fetch data to show the new folder immediately
      }
    }
  };

  // --- DATA STRUCTURING ---
  // Processes the flat lists of folders and documents into a nested structure for rendering.
  const { structuredFolders, rootDocuments } = (() => {
    const folderMap = new Map<string, FolderWithDocuments>();
    folders.forEach(folder => folderMap.set(folder.id, { ...folder, documents: [] }));
    const rootDocs: DocumentType[] = [];
    documents.forEach(doc => {
      if (doc.folder_id && folderMap.has(doc.folder_id)) {
        folderMap.get(doc.folder_id)!.documents.push(doc);
      } else {
        rootDocs.push(doc);
      }
    });
    return { structuredFolders: Array.from(folderMap.values()), rootDocuments: rootDocs };
  })();

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    newExpanded.has(folderId) ? newExpanded.delete(folderId) : newExpanded.add(folderId);
    setExpandedFolders(newExpanded);
  };

  const renderWorkspaceContent = () => {
    if (loading) {
      return <div className="p-4 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin mr-2" /><span>Loading...</span></div>;
    }
    if (error) {
      return <div className="p-4 text-red-500 flex items-center"><AlertCircle className="mr-2" /><span>{error}</span></div>;
    }
    if (structuredFolders.length === 0 && rootDocuments.length === 0) {
        return <div className="p-4 text-sm text-center text-slate-500 dark:text-slate-400">Your workspace is empty.</div>;
    }
    return (
      <>
        {structuredFolders.map(folder => (
          <FolderItem key={folder.id} name={folder.name} expanded={expandedFolders.has(folder.id)} onToggle={() => toggleFolder(folder.id)}>
            {folder.documents.map(doc => <DocumentItem key={doc.id} name={doc.title} selected={selectedDocument === doc.id} onSelect={() => onSelectDocument(doc.id)} />)}
          </FolderItem>
        ))}
        {rootDocuments.map(doc => <DocumentItem key={doc.id} name={doc.title} selected={selectedDocument === doc.id} onSelect={() => onSelectDocument(doc.id)} />)}
      </>
    );
  };

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-lg font-semibold text-slate-900 dark:text-white">LegalAI</h1><p className="text-xs text-slate-500 dark:text-slate-400">Document Assistant</p></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
            <button onClick={onNewChat} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"><Plus className="w-5 h-5" /><span className="font-medium">New Chat</span></button>
            <button onClick={handleNewFolder} className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><FolderPlus className="w-5 h-5" /><span className="font-medium">New Folder</span></button>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white w-full"><ChevronDown className="w-4 h-4" /><span>WORKSPACE</span></button>
            <button onClick={fetchData} title="Refresh Workspace" className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
        <div className="px-4 space-y-1">{renderWorkspaceContent()}</div>

        <div className="px-4 py-3 mt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3"><MessageSquare className="w-4 h-4" /><span>RECENT CHATS</span></div>
          <div className="space-y-1">
            {chats.map(chat => <ChatItem key={chat.id} name={chat.title} selected={selectedChat === chat.id} onSelect={() => onSelectChat(chat.id)} />)}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div onClick={() => navigate('/profile')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-slate-600 dark:text-slate-300" /></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email || 'User'}</p><p className="text-xs text-slate-500 dark:text-slate-400 truncate">View profile settings</p></div>
            <Settings className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}

// --- SUB-COMPONENTS ---

function FolderItem({ name, expanded, onToggle, children }: { name: string, expanded: boolean, onToggle: () => void, children?: React.ReactNode }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        <Folder className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-medium flex-1 text-left">{name}</span>
      </button>
      {expanded && <div className="ml-6 space-y-1 mt-1">{children}</div>}
    </div>
  );
}

function DocumentItem({ name, selected, onSelect }: { name: string, selected: boolean, onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${selected ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
      <FileText className="w-4 h-4" />
      <span className="text-sm truncate text-left flex-1">{name}</span>
    </button>
  );
}

function ChatItem({ name, selected, onSelect }: { name: string, selected: boolean, onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${selected ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
      <MessageSquare className="w-4 h-4" />
      <span className="text-sm truncate text-left flex-1">{name}</span>
    </button>
  );
}

export default Sidebar;