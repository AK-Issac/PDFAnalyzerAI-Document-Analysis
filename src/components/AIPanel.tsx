import {
  MessageSquare,
  FileText,
  Lightbulb,
  Brain,
  ListChecks,
  Sparkles,
  Send,
  Paperclip,
  Mic,
  MoreVertical,
} from 'lucide-react';
import { useState } from 'react';

interface AIPanelProps {
  documentId: string | null;
  chatId: string | null;
  mode: 'chat' | 'notes' | 'summary' | 'flashcards' | 'quiz' | 'generate';
  onModeChange: (mode: 'chat' | 'notes' | 'summary' | 'flashcards' | 'quiz' | 'generate') => void;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

function AIPanel({ documentId, mode, onModeChange }: AIPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI legal assistant. I've analyzed the NDA Agreement. How can I help you understand this document better?",
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'user',
      content: 'What are the key obligations of the receiving party?',
      timestamp: new Date(),
    },
    {
      id: '3',
      role: 'assistant',
      content:
        'Based on Section 3 of the NDA, the receiving party has several key obligations:\n\n1. **Maintain Strict Confidentiality**: Hold all confidential information in strictest confidence for the sole benefit of the disclosing party.\n\n2. **Restrict Access**: Carefully limit access to confidential information to employees, contractors, and third parties on a need-to-know basis.\n\n3. **Require NDAs**: Ensure anyone with access signs nondisclosure agreements at least as protective as this one.\n\n4. **No Unauthorized Use**: Use the confidential information only for the purposes outlined in the agreement.\n\nWould you like me to explain any of these obligations in more detail?',
      timestamp: new Date(),
    },
  ]);

  const modes = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'notes', icon: FileText, label: 'Notes' },
    { id: 'summary', icon: Lightbulb, label: 'Summary' },
    { id: 'flashcards', icon: Brain, label: 'Flashcards' },
    { id: 'quiz', icon: ListChecks, label: 'Quiz' },
    { id: 'generate', icon: Sparkles, label: 'Generate' },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  if (!documentId) {
    return (
      <aside className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI Assistant Ready</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a document to start analyzing and chatting with AI
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
          <button className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id as typeof mode)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  }`}
                >
                  {message.role === 'user' ? (
                    <span className="text-sm font-medium">U</span>
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`flex-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2.5 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-white focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about this document..."
                className="w-full bg-transparent border-none resize-none focus:outline-none text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span className="text-sm font-medium">Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </>
      )}

      {mode === 'summary' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl p-6 text-white mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5" />
              <h4 className="font-semibold">Document Summary</h4>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              This is a bilateral Non-Disclosure Agreement between TechCorp Industries Inc. and
              Innovation Solutions LLC, effective January 15, 2024.
            </p>
          </div>

          <div className="space-y-4">
            <SummarySection
              title="Key Parties"
              items={['Party A: TechCorp Industries Inc.', 'Party B: Innovation Solutions LLC']}
            />
            <SummarySection
              title="Main Obligations"
              items={[
                'Maintain strict confidentiality',
                'Restrict access to authorized personnel',
                'Require NDAs from anyone with access',
                'No unauthorized disclosure or use',
              ]}
            />
            <SummarySection
              title="Exclusions"
              items={[
                'Publicly available information',
                'Pre-existing knowledge',
                'Legitimately obtained information',
                'Approved disclosures',
              ]}
            />
          </div>
        </div>
      )}

      {mode === 'notes' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <button className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="font-medium">New Note</span>
            </button>
          </div>

          <div className="space-y-3">
            <NoteCard
              title="Definition of Confidential Info"
              content="All information with commercial value must be labeled as 'Confidential'"
              page={1}
            />
            <NoteCard
              title="Key Exclusions"
              content="Public info, pre-existing knowledge, legitimately obtained info"
              page={2}
            />
            <NoteCard
              title="Receiving Party Duties"
              content="Maintain strict confidentiality and restrict access appropriately"
              page={3}
            />
          </div>
        </div>
      )}

      {mode === 'flashcards' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <button className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Generate Flashcards</span>
            </button>
          </div>

          <div className="space-y-3">
            <FlashcardItem
              question="What are the 4 main exclusions from confidential information?"
              answer="1. Publicly known info 2. Pre-existing knowledge 3. Legitimately obtained 4. Approved disclosures"
            />
            <FlashcardItem
              question="What must the receiving party do with confidential information?"
              answer="Hold in strict confidence, restrict access, require NDAs from others"
            />
          </div>
        </div>
      )}

      {mode === 'quiz' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-slate-900 rounded-xl p-6 text-white mb-6">
            <h4 className="font-semibold mb-2">Quiz Mode</h4>
            <p className="text-sm text-slate-300">
              Test your understanding of this NDA Agreement
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div>
                <span className="text-slate-400">Progress:</span>
                <span className="ml-2 font-semibold">3/10</span>
              </div>
              <div>
                <span className="text-slate-400">Score:</span>
                <span className="ml-2 font-semibold">100%</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
            <p className="text-sm font-medium text-slate-900 mb-4">
              Question 4: Which of the following is NOT an exclusion from confidential
              information?
            </p>
            <div className="space-y-2">
              <QuizOption label="A" text="Publicly known information" />
              <QuizOption label="B" text="Information obtained from competitors" selected />
              <QuizOption label="C" text="Pre-existing knowledge" />
              <QuizOption label="D" text="Approved disclosures" />
            </div>
            <button className="w-full mt-4 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              Submit Answer
            </button>
          </div>
        </div>
      )}

      {mode === 'generate' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <GenerateOption
              icon={<FileText className="w-5 h-5" />}
              title="Generate Clause"
              description="Create new contract clauses based on this document"
            />
            <GenerateOption
              icon={<Sparkles className="w-5 h-5" />}
              title="Extract Key Terms"
              description="Pull out parties, dates, and obligations"
            />
            <GenerateOption
              icon={<ListChecks className="w-5 h-5" />}
              title="Compare Documents"
              description="Analyze differences with another contract"
            />
            <GenerateOption
              icon={<Brain className="w-5 h-5" />}
              title="Risk Analysis"
              description="Identify potential legal risks and concerns"
            />
          </div>
        </div>
      )}
    </aside>
  );
}

function SummarySection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
      <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{title}</h5>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <span className="text-slate-400 dark:text-slate-500 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoteCard({
  title,
  content,
  page,
}: {
  title: string;
  content: string;
  page: number;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h5>
        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
          p. {page}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{content}</p>
    </div>
  );
}

function FlashcardItem({ question, answer }: { question: string; answer: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all min-h-[160px] flex items-center justify-center"
    >
      <div className="text-center">
        <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
          {flipped ? 'Answer' : 'Question'}
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300">{flipped ? answer : question}</p>
      </div>
    </div>
  );
}

function QuizOption({
  label,
  text,
  selected = false,
}: {
  label: string;
  text: string;
  selected?: boolean;
}) {
  return (
    <button
      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
        selected
          ? 'border-slate-900 bg-slate-50 dark:bg-slate-800'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <span className="font-semibold text-slate-900 dark:text-white mr-3">{label}.</span>
      <span className="text-sm text-slate-700 dark:text-slate-300">{text}</span>
    </button>
  );
}

function GenerateOption({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button className="w-full text-left bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-all group">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
          {icon}
        </div>
        <div className="flex-1">
          <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{title}</h5>
          <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
    </button>
  );
}

export default AIPanel;
