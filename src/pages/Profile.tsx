import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  ArrowLeft,
  Save,
  Camera,
  Key,
  LogOut,
} from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'billing' | 'notifications'>(
    'general'
  );

  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: user?.email || 'john.doe@example.com',
    company: 'Legal Tech Inc.',
    role: 'Senior Attorney',
  });

  const handleSave = () => {
    console.log('Saving profile:', formData);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

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
                    JD
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{formData.name}</h3>
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

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
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
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
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

              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Billing & Subscription</h2>

                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">Pro Plan</h3>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                          Active
                        </span>
                      </div>
                      <p className="text-slate-200 mb-4">
                        Unlimited documents, advanced AI features, priority support
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">$29</span>
                        <span className="text-slate-300">/month</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment Method</h3>
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-slate-900 rounded flex items-center justify-center text-white text-xs font-bold">
                            VISA
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">•••• •••• •••• 4242</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Expires 12/25</p>
                          </div>
                        </div>
                        <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                          Update
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Billing History
                      </h3>
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">Pro Plan - Monthly</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Jan {i}, 2025</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900 dark:text-white">$29.00</p>
                              <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Document analysis complete', enabled: true },
                          { label: 'New chat messages', enabled: true },
                          { label: 'Weekly summary reports', enabled: false },
                          { label: 'Product updates', enabled: true },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={item.enabled}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 dark:peer-focus:ring-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Push Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Browser notifications', enabled: false },
                          { label: 'Mobile notifications', enabled: false },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={item.enabled}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 dark:peer-focus:ring-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg">
                        <Save className="w-4 h-4" />
                        <span>Save Preferences</span>
                      </button>
                    </div>
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
