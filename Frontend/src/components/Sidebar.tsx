import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Folder,
  FolderPlus,
  Plus,
  ChevronDown,
  ChevronRight,
  User,
  Settings,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { fetchWorkspace, createFolder, deleteDocument, moveDocument, deleteFolder } from '../services/apiService';
import { useTranslation } from 'react-i18next';

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

type FolderWithDocuments = FolderType & { documents: DocumentType[] };

// --- COMPONENT PROPS ---
interface SidebarProps {
  selectedDocument: string | null;
  onSelectDocument: (id: string) => void;
  onNewChat: () => void;
  refreshKey: boolean;
  onDeleteDocument: () => void;
}

function Sidebar({ selectedDocument, onSelectDocument, onNewChat, refreshKey, onDeleteDocument }: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State for raw data from Postgres via API
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);

  // State for UI and data fetching
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkspace();
      setFolders(data.folders || []);
      setDocuments(data.documents || []);
    } catch (err: any) {
      console.error("Error fetching sidebar data:", err);
      setError("Failed to load workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleNewFolder = async () => {
    const folderName = prompt("Enter a name for the new folder:");
    if (folderName && folderName.trim()) {
      try {
        await createFolder(folderName.trim());
        fetchData();
      } catch (error: any) {
        console.error("Error creating folder:", error);
        alert(`Failed to create folder: ${error.message}`);
      }
    }
  };

  const handleDeleteDocument = async (docToDelete: DocumentType) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${docToDelete.title}"? This action cannot be undone.`);
    if (!isConfirmed) return;

    try {
      await deleteDocument(docToDelete.id);
      if (selectedDocument === docToDelete.id) {
         onDeleteDocument();
      }
      fetchData();
    } catch (error: any) {
      console.error("Failed to delete document:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  const handleDeleteFolderAction = async (folder: FolderWithDocuments) => {
    if (folder.documents.length > 0) {
      const input = prompt(`This folder contains ${folder.documents.length} document(s) which will also be deleted.\nType "${folder.name}" to confirm:`);
      if (input !== folder.name) {
        if (input !== null) alert("Folder name did not match. Deletion cancelled.");
        return;
      }
    } else {
      const confirm = window.confirm(`Delete folder "${folder.name}"?`);
      if (!confirm) return;
    }

    try {
      await deleteFolder(folder.id);
      // Deselect if active document was in this folder
      if (folder.documents.some(d => d.id === selectedDocument)) {
         onDeleteDocument();
      }
      fetchData();
    } catch (error: any) {
      alert(`Error deleting folder: ${error.message}`);
    }
  };

  const handleDropToFolder = async (docId: string, folderId: string | null) => {
    // Do not move if it's already there
    const doc = documents.find(d => d.id === docId);
    if (!doc || doc.folder_id === folderId) return;

    try {
      await moveDocument(docId, folderId);
      fetchData();
    } catch (error: any) {
      alert(`Error moving document: ${error.message}`);
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
      <div 
        className="min-h-[100px] pb-10" 
        onDragOver={(e) => { e.preventDefault(); }} 
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const docId = e.dataTransfer.getData('text/plain');
          if (docId) handleDropToFolder(docId, null);
        }}
      >
        {structuredFolders.map(folder => (
          <FolderItem 
            key={folder.id} 
            folder={folder} 
            expanded={expandedFolders.has(folder.id)} 
            onToggle={() => toggleFolder(folder.id)}
            onDropDoc={(docId) => handleDropToFolder(docId, folder.id)}
            onDelete={() => handleDeleteFolderAction(folder)}
          >
            {folder.documents.map(doc => <DocumentItem key={doc.id} document={doc} selected={selectedDocument === doc.id} onSelect={() => onSelectDocument(doc.id)} onDelete={() => handleDeleteDocument(doc)} />)}
          </FolderItem>
        ))}
        {rootDocuments.map(doc => <DocumentItem key={doc.id} document={doc} selected={selectedDocument === doc.id} onSelect={() => onSelectDocument(doc.id)} onDelete={() => handleDeleteDocument(doc)} />)}
      </div>
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
            <button onClick={onNewChat} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"><Plus className="w-5 h-5" /><span className="font-medium">{t('sidebar.new_chat')}</span></button>
            <button onClick={handleNewFolder} className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><FolderPlus className="w-5 h-5" /><span className="font-medium">{t('sidebar.new_folder')}</span></button>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white w-full"><ChevronDown className="w-4 h-4" /><span>{t('sidebar.workspace')}</span></button>
            <button onClick={fetchData} title="Refresh Workspace" className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
        <div className="px-4 space-y-1">{renderWorkspaceContent()}</div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div onClick={() => navigate('/profile')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-slate-600 dark:text-slate-300" /></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900 dark:text-white truncate">{t('sidebar.local_user')}</p><p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t('sidebar.view_profile')}</p></div>
            <Settings className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}

// --- SUB-COMPONENTS ---

function FolderItem({ 
  folder, 
  expanded, 
  onToggle, 
  onDropDoc,
  onDelete,
  children 
}: { 
  folder: FolderType, 
  expanded: boolean, 
  onToggle: () => void, 
  onDropDoc: (docId: string) => void,
  onDelete: () => void,
  children?: React.ReactNode 
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const docId = e.dataTransfer.getData('text/plain');
        if (docId) {
          onDropDoc(docId);
          if (!expanded) onToggle(); // auto-expand on drop
        }
      }}
      className={`rounded-lg transition-colors ${isDragOver ? 'bg-indigo-50 dark:bg-indigo-900/20 outline outline-2 outline-indigo-400' : ''}`}
    >
      <div className="group w-full flex items-center gap-2 pr-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
        <button onClick={onToggle} className="flex-1 flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300">
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          <Folder className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-medium flex-1 text-left">{folder.name}</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {expanded && <div className="ml-6 space-y-1 mt-1 mb-2">{children}</div>}
    </div>
  );
}

function DocumentItem({ document, selected, onSelect, onDelete }: { document: DocumentType, selected: boolean, onSelect: () => void, onDelete: () => void }) {
  return (
    <div 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', document.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={`group w-full flex items-center gap-2 pr-2 rounded-lg transition-colors cursor-grab active:cursor-grabbing ${selected ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
    >
        <button onClick={onSelect} className={`flex-1 flex items-center gap-2 px-3 py-2 ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate text-left flex-1">{document.title}</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700">
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
  );
}

export default Sidebar;