// src/pages/Subscription.tsx

import { CheckCircle, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { getUserProfile, createCheckoutSession } from '../services/apiService';
import { useTranslation } from 'react-i18next';

function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  // Show success banner if coming back from Stripe checkout
  const paymentSuccess = searchParams.get('payment') === 'success';

  useEffect(() => {
    const fetchTier = async () => {
      try {
        const user = await getUserProfile();
        if (user && user.tier) {
          setCurrentTier(user.tier);
        }
      } catch (err) {
        console.error("Error fetching user profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTier();
  }, []);

  const handleUpgradeClick = async () => {
    setIsUpgrading(true);
    setUpgradeError('');
    try {
      const { checkout_url } = await createCheckoutSession();
      window.location.href = checkout_url;
    } catch (err: unknown) {
      if (err instanceof Error) setUpgradeError(err.message);
      else setUpgradeError('Something went wrong. Please try again.');
      setIsUpgrading(false);
    }
  };

  const plans = {
    free: {
      id: 'free',
      name: t('subscription.free.name'),
      price: '$0',
      description: t('subscription.free.desc'),
      features: [
        t('subscription.free.feat1'),
        t('subscription.free.feat2'),
        t('subscription.free.feat3'),
        t('subscription.free.feat4'),
      ],
    },
    pro: {
      id: 'pro',
      name: t('subscription.pro.name'),
      price: '$6.99',
      description: t('subscription.pro.desc'),
      features: [
        t('subscription.pro.feat1'),
        t('subscription.pro.feat2'),
        t('subscription.pro.feat3'),
        t('subscription.pro.feat4'),
        t('subscription.pro.feat5'),
      ],
      cta: t('subscription.pro.cta'),
    },
    business: {
      id: 'business',
      name: t('subscription.business.name'),
      price: '$99',
      description: t('subscription.business.desc'),
      features: [
        t('subscription.business.feat1'),
        t('subscription.business.feat2'),
        t('subscription.business.feat3'),
        t('subscription.business.feat4'),
        t('subscription.business.feat5'),
      ],
      cta: t('subscription.business.cta'),
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <TopBar />
        <div className="flex-1 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopBar />
      <main className="max-w-6xl mx-auto py-12 px-6">

        {/* Payment success banner */}
        {paymentSuccess && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Payment successful — welcome to Pro!</p>
              <p className="text-sm opacity-80">Your plan is being activated. It may take a few seconds to reflect.</p>
            </div>
          </div>
        )}

        {upgradeError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm text-center">
            {upgradeError}
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            {t('subscription.title')}
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            {t('subscription.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan Card */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col bg-white dark:bg-slate-900">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plans.free.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1">{plans.free.description}</p>
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              {plans.free.price}<span className="text-lg text-slate-600 font-normal"> / month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {plans.free.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full px-6 py-3 border-2 rounded-xl font-medium border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            >
              {currentTier === 'free' ? t('subscription.current_plan') : t('subscription.downgrade')}
            </button>
          </div>

          {/* Pro Plan Card */}
          <div className="relative bg-slate-900 text-white rounded-2xl p-8 shadow-2xl transform md:-translate-y-4 flex flex-col">
            <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium uppercase">
              {t('subscription.main_offer')}
            </div>
            <h3 className="text-2xl font-bold mb-2">{plans.pro.name}</h3>
            <p className="opacity-80 mb-6 flex-1">{plans.pro.description}</p>
            <div className="text-4xl font-bold mb-6">
              {plans.pro.price}<span className="text-lg font-normal opacity-80"> / month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {plans.pro.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            {currentTier === 'pro' ? (
              <button
                disabled
                className="w-full px-6 py-3 rounded-xl font-medium bg-slate-700 text-slate-400 cursor-not-allowed"
              >
                {t('subscription.current_plan')}
              </button>
            ) : (
              <button
                id="upgrade-to-pro-btn"
                onClick={handleUpgradeClick}
                disabled={isUpgrading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-slate-900 transition-colors shadow-lg shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpgrading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>{isUpgrading ? 'Redirecting...' : plans.pro.cta}</span>
              </button>
            )}
          </div>

          {/* Business Plan Card */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col bg-white dark:bg-slate-900">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plans.business.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1">{plans.business.description}</p>
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              {plans.business.price}<span className="text-lg text-slate-600 font-normal"> / month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {plans.business.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full px-6 py-3 border-2 rounded-xl font-medium border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            >
              {currentTier === 'business' ? t('subscription.current_plan') : 'Contact Sales'}
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
            <button
                onClick={() => navigate('/workspace')}
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('subscription.back')}</span>
            </button>
        </div>
      </main>
    </div>
  );
}

export default Subscription;