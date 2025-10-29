// src/pages/Subscription.tsx

import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar'; // Re-use the TopBar for consistent UI

function Subscription() {
  const navigate = useNavigate();

  const plans = {
    free: {
      name: 'Free',
      price: '$0',
      description: 'For individuals starting out.',
      features: [
        '5 document uploads per month',
        'Basic AI analysis & chat',
        'Standard document viewer',
        'Community support',
      ],
      cta: 'Current Plan',
      isCurrent: true,
    },
    pro: {
      name: 'Pro',
      price: '$29',
      description: 'For professionals and teams.',
      features: [
        'Unlimited document uploads',
        'Advanced AI features (summarization, analysis, superior models)',
        'Highlighting and notes functionality',
        'Priority email support',
        'Early access to new features',
      ],
      cta: 'Upgrade to Pro',
      isCurrent: false,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopBar />
      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Unlock powerful features and supercharge your workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan Card */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plans.free.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{plans.free.description}</p>
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              {plans.free.price}<span className="text-lg text-slate-600 font-normal"> / month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {plans.free.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 rounded-xl font-medium cursor-not-allowed"
            >
              {plans.free.cta}
            </button>
          </div>

          {/* Pro Plan Card */}
          <div className="relative bg-slate-900 text-white rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all">
            <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">{plans.pro.name}</h3>
            <p className="opacity-80 mb-6">{plans.pro.description}</p>
            <div className="text-4xl font-bold mb-6">
              {plans.pro.price}<span className="text-lg font-normal opacity-80"> / month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {plans.pro.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-medium transition-colors"
            >
              {plans.pro.cta}
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
            <button
                onClick={() => navigate('/workspace')}
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Workspace</span>
            </button>
        </div>
      </main>
    </div>
  );
}

export default Subscription;