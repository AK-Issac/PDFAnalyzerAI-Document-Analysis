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
  Trash2, // Import the delete icon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  file_url: string; // Add file_url to the type to access it for deletion
};

type FolderWithDocuments = FolderType & { documents: DocumentType[] };

// --- COMPONENT PROPS ---
interface SidebarProps {
  selectedDocument: string | null;
  onSelectDocument: (id: string) => void;
  onNewChat: () => void;
  refreshKey: boolean;
  onDeleteDocument: () => void; // Add a handler for when a document is deleted
}

function Sidebar({ selectedDocument, onSelectDocument, onNewChat, refreshKey, onDeleteDocument }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for raw data from Supabase
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);

  // State for UI and data fetching
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Simplified to fetch only folders and documents
      const [foldersRes, docsRes] = await Promise.all([
        supabase.from('folders').select('id, name, parent_id').eq('user_id', user.id),
        supabase.from('documents').select('id, title, folder_id, file_url').eq('user_id', user.id),
      ]);

      if (foldersRes.error) throw foldersRes.error;
      if (docsRes.error) throw docsRes.error;

      setFolders(foldersRes.data || []);
      setDocuments(docsRes.data || []);
    } catch (err: any) {
      console.error("Error fetching sidebar data:", err);
      setError("Failed to load workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, refreshKey]);

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
        fetchData();
      }
    }
  };

  /**
   * Handles the deletion of a document and all its associated data.
   */
  const handleDeleteDocument = async (docToDelete: DocumentType) => {
    // 1. Confirm with the user
    const isConfirmed = window.confirm(`Are you sure you want to delete "${docToDelete.title}"? This action cannot be undone.`);
    if (!isConfirmed) return;

    try {
      // 2. Delete the file from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('user_documents')
        .remove([docToDelete.file_url]);

      if (storageError) {
        // Log the error but proceed to delete database records, as the file might already be gone
        console.error("Error deleting from storage (might be benign):", storageError);
      }

      // 3. Delete the document record from the 'documents' table.
      // RLS policies should handle cascading deletes to chats and messages if set up.
      // If not, you must delete them manually, starting from messages.
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docToDelete.id);

      if (dbError) throw dbError;

      // 4. Refresh the UI
      alert("Document deleted successfully.");
      onDeleteDocument(); // Notify parent to clear the view
      fetchData(); // Refresh the sidebar

    } catch (error: any) {
      console.error("Failed to delete document:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };

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
    if (loading) return <div className="p-4 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin mr-2" /><span>Loading...</span></div>;
    if (error) return <div className="p-4 text-red-500 flex items-center"><AlertCircle className="mr-2" /><span>{error}</span></div>;
    if (structuredFolders.length === 0 && rootDocuments.length === 0) {
        return <div className="p-4 text-sm text-center text-slate-500 dark:text-slate-400">Your workspace is empty.</div>;
    }
    return (
      <>
        {structuredFolders.map(folder => (
          <FolderItem key={folder.id} name={folder.name} expanded={expandedFolders.has(folder.id)} onToggle={() => toggleFolder(folder.id)}>
            {folder.documents.map(doc => <DocumentItem key={doc.id} document={doc} selected={selectedDocument === doc.id} onSelect={() => onSelectDocument(doc.id)} onDelete={() => handleDeleteDocument(doc)} />)}
          </FolderItem>
        ))}
        {rootDocuments.map(doc => <DocumentItem key={doc.id} document={doc} selected={selectedDocument === doc.id} onSelect={() => onSelectDocument(doc.id)} onDelete={() => handleDeleteDocument(doc)} />)}
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

// Updated DocumentItem to include a delete button
function DocumentItem({ document, selected, onSelect, onDelete }: { document: DocumentType, selected: boolean, onSelect: () => void, onDelete: () => void }) {
  return (
    <div className={`group w-full flex items-center gap-2 pr-2 rounded-lg transition-colors ${selected ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
        <button onClick={onSelect} className={`flex-1 flex items-center gap-2 px-3 py-2 ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            <FileText className="w-4 h-4" />
            <span className="text-sm truncate text-left flex-1">{document.title}</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700">
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
  );
}

export default Sidebar;