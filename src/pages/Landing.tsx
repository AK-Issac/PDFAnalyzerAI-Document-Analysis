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
  Users,
  TrendingUp,
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
      title: 'AI-Powered Analysis',
      description: 'Advanced AI understands and analyzes your documents with unprecedented accuracy',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process documents in seconds, not hours. Experience real-time insights',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption ensures your documents are always protected',
    },
    {
      icon: FileText,
      title: 'Smart Organization',
      description: 'Intelligent document management that learns from your workflow',
    },
  ];

  const benefits = [
    'Unlimited document uploads',
    'AI-powered chat & summaries',
    'Real-time collaboration',
    'Advanced search capabilities',
    'Custom integrations',
    'Priority support',
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
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-slate-600 hover:text-slate-900 transition-colors">
                Benefits
              </a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </a>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>

            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4 animate-fadeIn">
              <a
                href="#features"
                className="block text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#benefits"
                className="block text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <a
                href="#pricing"
                className="block text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute top-20 left-20 w-72 h-72 bg-slate-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 rounded-full border border-slate-200 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">
                Transform Your Legal Workflow
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight">
              AI-Powered Document
              <br />
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Upload, analyze, and extract insights from legal documents with cutting-edge AI
              technology. Work smarter, not harder.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate('/login')}
                className="group px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2"
              >
                <span className="text-lg font-medium">Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-slate-900 rounded-xl hover:bg-slate-50 transition-all shadow-lg border border-slate-200">
                <span className="text-lg font-medium">Watch Demo</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>14-day free trial</span>
              </div>
            </div>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 transform hover:scale-105 transition-transform duration-500">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-2xl shadow-lg mb-4">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Experience the Future of Legal Tech
                </h3>
                <p className="text-slate-600">
                  Join thousands of professionals already transforming their workflow
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-600">Everything you need to work smarter</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
                  activeFeature === index
                    ? 'border-slate-900 bg-slate-900 text-white shadow-2xl scale-105'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <feature.icon
                  className={`w-12 h-12 mb-4 ${
                    activeFeature === index ? 'text-white' : 'text-slate-900'
                  }`}
                />
                <h3
                  className={`text-xl font-bold mb-2 ${
                    activeFeature === index ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`${
                    activeFeature === index ? 'text-slate-200' : 'text-slate-600'
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Why Choose LegalAI?
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Built for modern legal professionals who demand excellence and efficiency.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/login')}
                className="mt-8 group px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
              >
                <span className="font-medium">Get Started Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl blur-3xl opacity-30"></div>
              <div className="relative space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">10K+</div>
                      <div className="text-sm text-slate-600">Active Users</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">98%</div>
                      <div className="text-sm text-slate-600">Satisfaction Rate</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-900">1M+</div>
                      <div className="text-sm text-slate-600">Documents Processed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            Start free, upgrade as you grow
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 border-2 border-slate-200 rounded-2xl hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-slate-900 mb-6">
                $0<span className="text-lg text-slate-600 font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">5 documents per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Basic AI analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700">Community support</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 border-2 border-slate-900 text-slate-900 rounded-xl hover:bg-slate-50 transition-all font-medium"
              >
                Get Started
              </button>
            </div>

            <div className="p-8 bg-slate-900 text-white rounded-2xl shadow-2xl transform hover:scale-105 transition-all relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">
                $29<span className="text-lg font-normal opacity-80">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Unlimited documents</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Advanced AI features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>API access</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 py-3 bg-white text-slate-900 rounded-xl hover:bg-slate-50 transition-all font-medium"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-slate-900" />
                </div>
                <span className="text-xl font-bold">LegalAI</span>
              </div>
              <p className="text-slate-400 text-sm">
                Transform your legal workflow with AI-powered intelligence.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 LegalAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
