import { useState } from 'react';
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
} from 'lucide-react';

interface SidebarProps {
  selectedDocument: string | null;
  selectedChat: string | null;
  onSelectDocument: (id: string) => void;
  onSelectChat: (id: string) => void;
}

function Sidebar({ selectedDocument, selectedChat, onSelectDocument, onSelectChat }: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showFolders, setShowFolders] = useState(true);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">LegalAI</h1>
            <p className="text-xs text-slate-500">Document Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Chat</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <FolderPlus className="w-5 h-5" />
            <span className="font-medium">New Folder</span>
          </button>
        </div>

        <div className="px-4 py-3">
          <button
            onClick={() => setShowFolders(!showFolders)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 w-full"
          >
            {showFolders ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span>WORKSPACE</span>
          </button>
        </div>

        {showFolders && (
          <div className="px-4 space-y-1">
            <FolderItem
              id="1"
              name="Contracts"
              expanded={expandedFolders.has('1')}
              onToggle={() => toggleFolder('1')}
            >
              <DocumentItem
                id="doc1"
                name="NDA Agreement.pdf"
                selected={selectedDocument === 'doc1'}
                onSelect={() => onSelectDocument('doc1')}
              />
              <DocumentItem
                id="doc2"
                name="Service Contract.pdf"
                selected={selectedDocument === 'doc2'}
                onSelect={() => onSelectDocument('doc2')}
              />
            </FolderItem>

            <FolderItem
              id="2"
              name="Case Law"
              expanded={expandedFolders.has('2')}
              onToggle={() => toggleFolder('2')}
            >
              <DocumentItem
                id="doc3"
                name="Supreme Court Case.pdf"
                selected={selectedDocument === 'doc3'}
                onSelect={() => onSelectDocument('doc3')}
              />
            </FolderItem>

            <FolderItem
              id="3"
              name="Study Materials"
              expanded={expandedFolders.has('3')}
              onToggle={() => toggleFolder('3')}
            />
          </div>
        )}

        <div className="px-4 py-3 mt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-3">
            <MessageSquare className="w-4 h-4" />
            <span>RECENT CHATS</span>
          </div>
          <div className="space-y-1">
            <ChatItem
              id="chat1"
              name="NDA Questions"
              selected={selectedChat === 'chat1'}
              onSelect={() => onSelectChat('chat1')}
            />
            <ChatItem
              id="chat2"
              name="Contract Analysis"
              selected={selectedChat === 'chat2'}
              onSelect={() => onSelectChat('chat2')}
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
            <p className="text-xs text-slate-500 truncate">john@example.com</p>
          </div>
          <Settings className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}

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
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
        <Folder className="w-4 h-4 text-slate-600" />
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
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        selected
          ? 'bg-slate-100 text-slate-900'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
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
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        selected
          ? 'bg-slate-100 text-slate-900'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <MessageSquare className="w-4 h-4" />
      <span className="text-sm truncate text-left flex-1">{name}</span>
    </button>
  );
}

export default Sidebar;
