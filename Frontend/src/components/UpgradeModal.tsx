// src/components/UpgradeModal.tsx
// Shown when a user hits their free-tier document or action limit.

import { useState } from 'react';
import { Zap, X, Loader2, FileX, MessageSquareX } from 'lucide-react';
import { createCheckoutSession } from '../services/apiService';

interface UpgradeModalProps {
  isOpen: boolean;
  limitType: 'documents' | 'actions' | null;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, limitType, onClose }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const content = {
    documents: {
      icon: <FileX className="w-10 h-10 text-amber-500" />,
      title: 'Document limit reached',
      description:
        "You've used all 5 documents on the Free plan. Upgrade to Pro to upload up to 100 documents per month.",
    },
    actions: {
      icon: <MessageSquareX className="w-10 h-10 text-amber-500" />,
      title: 'AI request limit reached',
      description:
        "Youve used all 30 AI requests on the Free plan. Upgrade to Pro to get 1,000 requests per month.",
    },
  };

  const display = limitType ? content[limitType] : content.documents;

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { checkout_url } = await createCheckoutSession();
      window.location.href = checkout_url;
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="upgrade-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gradient header strip */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-5">
              {display.icon}
            </div>
            <h2
              id="upgrade-modal-title"
              className="text-2xl font-bold text-slate-900 dark:text-white mb-2"
            >
              {display.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {display.description}
            </p>
          </div>

          {/* Pro plan highlights */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">What you get with Pro</p>
            {[
              '100 documents / month',
              '1,000 AI requests / month',
              'Priority support',
              'Full chat history',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 text-center">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              id="upgrade-modal-cta"
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Redirecting to Stripe...' : 'Upgrade to Pro — $6.99/mo'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Continue with Free plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
