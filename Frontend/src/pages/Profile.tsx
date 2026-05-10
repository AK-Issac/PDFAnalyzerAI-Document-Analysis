import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, onboardUser, createPortalSession } from '../services/apiService';
import {
  User,
  Shield,
  CreditCard,
  ArrowLeft,
  Save,
  Camera,
  Key,
  LogOut,
  Loader2,
} from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'billing'>('general');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Billing state — populated from /user/me
  const [billingData, setBillingData] = useState<{
    tier: string;
    usage: { doc_count: number; action_count: number };
    limits: { doc_limit: number; action_limit: number };
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    company: '',
    role: '',
    bio: '',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setFormData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || user?.email || '',
          company: data.company || '',
          role: data.role || '',
          bio: data.bio || '',
        });
        // Populate billing data from the same /user/me response
        setBillingData({
          tier: data.tier || 'free',
          usage: data.usage || { doc_count: 0, action_count: 0 },
          limits: data.limits || { doc_limit: 5, action_limit: 30 },
        });
      } catch (err) {
        console.error('Failed to load profile', err);
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user?.email]);

  const handleOpenPortal = async () => {
    setIsPortalLoading(true);
    try {
      const { portal_url } = await createPortalSession();
      window.location.href = portal_url;
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Could not open billing portal.');
      setIsPortalLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await onboardUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.company,
        role: formData.role,
        bio: formData.bio,
      });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  const initials = `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/workspace')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Workspace</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Account Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {initials}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{formData.firstName} {formData.lastName}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{formData.email}</p>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">General Information</h2>

                  {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                  {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{successMsg}</div>}

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Email Address (Read-only)
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-lg cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                      <textarea
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white resize-none"
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Security Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Key className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">2FA Status</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Not enabled</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                          Enable
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg">
                        <Save className="w-4 h-4" />
                        <span>Update Security</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && billingData && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Billing &amp; Subscription</h2>

                  <div className="space-y-6">
                    {/* Current plan card */}
                    <div className={`p-6 rounded-xl text-white ${
                      billingData.tier === 'pro'
                        ? 'bg-gradient-to-br from-slate-900 to-slate-700'
                        : 'bg-gradient-to-br from-slate-500 to-slate-700'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold capitalize">{billingData.tier} Plan</h3>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                          {billingData.tier === 'free' ? 'Free' : 'Active'}
                        </span>
                      </div>
                      {billingData.tier === 'free' && (
                        <p className="text-slate-200 text-sm">Upgrade to Pro for more documents and AI requests.</p>
                      )}
                      {billingData.tier === 'pro' && (
                        <p className="text-slate-200 text-sm">100 documents/month · 1,000 AI requests/month · Priority support</p>
                      )}
                    </div>

                    {/* Usage counters */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Current Usage</h3>
                      <div className="space-y-4">
                        {/* Documents */}
                        <div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-slate-600 dark:text-slate-400">Documents uploaded</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {billingData.usage.doc_count}
                              {billingData.limits.doc_limit !== -1 && ` / ${billingData.limits.doc_limit}`}
                            </span>
                          </div>
                          {billingData.limits.doc_limit !== -1 && (
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-amber-500 transition-all"
                                style={{ width: `${Math.min(100, (billingData.usage.doc_count / billingData.limits.doc_limit) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                        {/* AI requests */}
                        <div>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-slate-600 dark:text-slate-400">AI requests used</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {billingData.usage.action_count}
                              {billingData.limits.action_limit !== -1 && ` / ${billingData.limits.action_limit}`}
                            </span>
                          </div>
                          {billingData.limits.action_limit !== -1 && (
                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500 transition-all"
                                style={{ width: `${Math.min(100, (billingData.usage.action_count / billingData.limits.action_limit) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
                      {billingData.tier === 'free' ? (
                        <button
                          id="profile-upgrade-btn"
                          onClick={() => navigate('/upgrade')}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Upgrade to Pro</span>
                        </button>
                      ) : (
                        <button
                          id="manage-subscription-btn"
                          onClick={handleOpenPortal}
                          disabled={isPortalLoading}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPortalLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                          <CreditCard className="w-4 h-4" />
                          )}
                          <span>{isPortalLoading ? 'Opening portal...' : 'Manage Subscription'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Billing is securely managed by Stripe. Click "Manage Subscription" to cancel, update payment method, or download invoices.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
