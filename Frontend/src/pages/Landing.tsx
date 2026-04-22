import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Brain,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'RAG Pipeline',
      description:
        'Chunks documents, generates embeddings, and retrieves relevant context before querying the LLM',
    },
    {
      icon: Zap,
      title: 'Fast Semantic Search',
      description:
        'Vector similarity search enables instant retrieval across large PDFs',
    },
    {
      icon: FileText,
      title: 'Multi-page PDF Support',
      description:
        'Handles long documents with efficient chunking and context management',
    },
    {
      icon: Shield,
      title: 'Citation-Based Answers',
      description:
        'Responses are grounded in retrieved document chunks to reduce hallucinations',
    },
  ];

  const benefits = [
    'Upload and query your own PDFs',
    'Context-aware answers using RAG',
    'Handles long documents efficiently',
    'Simple and fast UI for testing',
    'Extensible backend architecture',
    'Built as a full-stack project',
  ];

  const stats = [
    { label: 'Max PDF Size', value: '100+ pages' },
    { label: 'Avg Processing Time', value: '~5–10s' },
    { label: 'Embedding Search', value: 'Vector-based' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                LegalAI
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900">
                Features
              </a>
              <a href="#benefits" className="text-slate-600 hover:text-slate-900">
                Benefits
              </a>
              <a href="#tech" className="text-slate-600 hover:text-slate-900">
                Tech
              </a>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Try Demo
              </button>
            </div>

            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-4">
              <a href="#features">Features</a>
              <a href="#benefits">Benefits</a>
              <a href="#tech">Tech</a>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-2.5 bg-slate-900 text-white rounded-lg"
              >
                Try Demo
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Built with RAG + Vector Search + LLMs</span>
          </div>

          <h1 className="text-5xl font-bold text-slate-900">
            AI Document Intelligence
          </h1>

          <p className="text-xl text-slate-600">
            Upload multi-page PDFs, ask questions, and get answers grounded in your documents using retrieval-augmented generation.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-slate-900 text-white rounded-xl"
            >
              Try Demo
            </button>
          </div>

          <p className="text-sm text-slate-500">
            Built as a full-stack AI project to demonstrate real-world document intelligence systems
          </p>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 border rounded-xl">
              <f.icon className="w-10 h-10 mb-4" />
              <h3 className="font-bold">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="benefits" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="p-6 border rounded-xl text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="tech" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border rounded-xl">
            <h3 className="font-semibold">Frontend</h3>
            <p className="text-slate-600">React, TailwindCSS</p>
          </div>
          <div className="p-6 bg-white border rounded-xl">
            <h3 className="font-semibold">Backend</h3>
            <p className="text-slate-600">FastAPI / Node.js</p>
          </div>
          <div className="p-6 bg-white border rounded-xl">
            <h3 className="font-semibold">AI Pipeline</h3>
            <p className="text-slate-600">Embeddings + Vector DB + LLM</p>
          </div>
          <div className="p-6 bg-white border rounded-xl">
            <h3 className="font-semibold">Deployment</h3>
            <p className="text-slate-600">Netlify + backend hosting</p>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-8 text-center">
        <p className="text-sm">LegalAI personal project</p>
      </footer>
    </div>
  );
}

export default Landing;