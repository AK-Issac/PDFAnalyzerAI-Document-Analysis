
// src/components/Sidebar.tsx

import { useState, useEffect } from 'react';
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
  Loader2, // For loading state
  AlertCircle, // For error state
} from 'lucide-react';
import { supabase } from '../lib/supabase'; // Make sure this path is correct
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an AuthContext

// --- DATA TYPES (can be moved to a separate file) ---
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

// A combined type for our structured data
type FolderWithDocuments = FolderType & { documents: DocumentType[] };


// --- COMPONENT PROPS ---
interface SidebarProps {
  selectedDocument: string | null;
  selectedChat: string | null;
  onSelectDocument: (id: string) => void;
  onSelectChat: (id: string) => void;
}


function Sidebar({ selectedDocument, selectedChat, onSelectDocument, onSelectChat }: SidebarProps) {
  // --- STATE MANAGEMENT ---
  const { user } = useAuth(); // Get the current user from your auth context

  // State for raw data from Supabase
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);

  // State for UI
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showFolders, setShowFolders] = useState(true);

  // State for data fetching status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- DATA FETCHING EFFECT ---
  useEffect(() => {
    if (!user) return; // Don't fetch if user is not logged in

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch folders, documents, and recent chats in parallel for efficiency
        const [foldersResponse, documentsResponse, chatsResponse] = await Promise.all([
          supabase.from('folders').select('id, name, parent_id').eq('user_id', user.id),
          supabase.from('documents').select('id, title, folder_id').eq('user_id', user.id),
          supabase.from('chats').select('id, title').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
        ]);

        // Error handling
        if (foldersResponse.error) throw foldersResponse.error;
        if (documentsResponse.error) throw documentsResponse.error;
        if (chatsResponse.error) throw chatsResponse.error;

        // Update state with fetched data
        setFolders(foldersResponse.data || []);
        setDocuments(documentsResponse.data || []);
        setChats(chatsResponse.data || []);

      } catch (err: any) {
        console.error("Error fetching sidebar data:", err);
        setError("Failed to load workspace data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Re-fetch data if the user changes

  // --- DATA STRUCTURING ---
  // Memoize this calculation to avoid re-computing on every render
  const { structuredFolders, rootDocuments } = (() => {
    const folderMap = new Map<string, FolderWithDocuments>();
    
    // Initialize map with all folders
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, documents: [] });
    });

    const rootDocs: DocumentType[] = [];

    // Place each document into its corresponding folder or the root list
    documents.forEach(doc => {
      if (doc.folder_id && folderMap.has(doc.folder_id)) {
        folderMap.get(doc.folder_id)!.documents.push(doc);
      } else {
        rootDocs.push(doc);
      }
    });

    return {
      structuredFolders: Array.from(folderMap.values()),
      rootDocuments: rootDocs
    };
  })();


  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // --- RENDER LOGIC ---
  const renderWorkspaceContent = () => {
    if (loading) {
      return <div className="p-4 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin mr-2" /><span>Loading...</span></div>;
    }
    if (error) {
      return <div className="p-4 text-red-500 flex items-center"><AlertCircle className="mr-2" /><span>{error}</span></div>;
    }
    return (
      <>
        {/* Render folders with their documents */}
        {structuredFolders.map(folder => (
          <FolderItem
            key={folder.id}
            id={folder.id}
            name={folder.name}
            expanded={expandedFolders.has(folder.id)}
            onToggle={() => toggleFolder(folder.id)}
          >
            {folder.documents.map(doc => (
              <DocumentItem
                key={doc.id}
                id={doc.id}
                name={doc.title}
                selected={selectedDocument === doc.id}
                onSelect={() => onSelectDocument(doc.id)}
              />
            ))}
          </FolderItem>
        ))}
        {/* Render documents that are not in any folder */}
        {rootDocuments.map(doc => (
           <DocumentItem
              key={doc.id}
              id={doc.id}
              name={doc.title}
              selected={selectedDocument === doc.id}
              onSelect={() => onSelectDocument(doc.id)}
            />
        ))}
      </>
    );
  };


  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header and New Chat/Folder buttons remain the same */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">LegalAI</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Document Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Chat</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <FolderPlus className="w-5 h-5" />
                <span className="font-medium">New Folder</span>
            </button>
        </div>

        {/* Dynamic Workspace Section */}
        <div className="px-4 py-3">
          <button onClick={() => setShowFolders(!showFolders)} className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white w-full">
            {showFolders ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>WORKSPACE</span>
          </button>
        </div>
        {showFolders && <div className="px-4 space-y-1">{renderWorkspaceContent()}</div>}

        {/* Dynamic Recent Chats Section */}
        <div className="px-4 py-3 mt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            <MessageSquare className="w-4 h-4" />
            <span>RECENT CHATS</span>
          </div>
          <div className="space-y-1">
            {chats.map(chat => (
                <ChatItem
                    key={chat.id}
                    id={chat.id}
                    name={chat.title}
                    selected={selectedChat === chat.id}
                    onSelect={() => onSelectChat(chat.id)}
                />
            ))}
          </div>
        </div>
      </div>

      {/* User profile section remains the same */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">john@example.com</p>
            </div>
            <Settings className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}


// --- SUB-COMPONENTS (remain the same) ---

interface FolderItemProps {
  id: string;
  name: string;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

function FolderItem({ name, expanded, onToggle, children }: FolderItemProps) {
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

interface DocumentItemProps {
  id: string;
  name: string;
  selected: boolean;
  onSelect: () => void;
}

function DocumentItem({ name, selected, onSelect }: DocumentItemProps) {
  return (
    <button onClick={onSelect} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${selected ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
      <FileText className="w-4 h-4" />
      <span className="text-sm truncate text-left flex-1">{name}</span>
    </button>
  );
}

interface ChatItemProps {
  id: string;
  name: string;
  selected: boolean;
  onSelect: () => void;
}

function ChatItem({ name, selected, onSelect }: ChatItemProps) {
  return (
    <button onClick={onSelect} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${selected ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
      <MessageSquare className="w-4 h-4" />
      <span className="text-sm truncate text-left flex-1">{name}</span>
    </button>
  );
}

export default Sidebar;