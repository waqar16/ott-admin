'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { useUserPlaybackPreference, type BitratePreset } from '@/hooks/useUserPlaybackPreference';
import type { Device } from '@/lib/types';
import { USE_MOCK_DATA } from '@/lib/config';
import ProfilesList from '@/components/profiles/ProfilesList.client';

interface DeviceResponse {
  devices: Device[];
  total: number;
  currentDevice?: string;
  limits: {
    max: number;
    current: number;
    remaining: number;
  };
}

export default function SettingsPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    preferences,
    isLoaded: prefsLoaded,
    setBitratePreset,
    setCustomBitrate,
    getPresetLabel,
    resetPreferences,
  } = useUserPlaybackPreference();

  const [activeTab, setActiveTab] = useState<'playback' | 'devices' | 'profiles'>('playback');
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceLimits, setDeviceLimits] = useState<DeviceResponse['limits'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingDevice, setRemovingDevice] = useState<string | null>(null);
  const [showCustomBitrate, setShowCustomBitrate] = useState(false);
  const [customBitrateInput, setCustomBitrateInput] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?redirect=/settings');
    } else if (isLoggedIn) {
      fetchDevices();
    }
  }, [authLoading, isLoggedIn, router]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/settings/devices');
      if (response.ok) {
        const data: DeviceResponse = await response.json();
        setDevices(data.devices);
        setDeviceLimits(data.limits);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to remove this device?')) {
      return;
    }

    setRemovingDevice(deviceId);
    try {
      const response = await fetch(`/api/settings/devices?id=${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDevices();
      }
    } catch (error) {
      console.error('Failed to remove device:', error);
    } finally {
      setRemovingDevice(null);
    }
  };

  const removeAllOtherDevices = async () => {
    if (
      !confirm(
        'Are you sure you want to remove all other devices? This will sign them out.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/settings/devices/remove-all', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchDevices();
      }
    } catch (error) {
      console.error('Failed to remove devices:', error);
    }
  };

  const handleBitratePresetChange = (preset: BitratePreset) => {
    setBitratePreset(preset);
    if (preset !== 'custom') {
      setShowCustomBitrate(false);
    } else {
      setShowCustomBitrate(true);
      setCustomBitrateInput(preferences.customBitrate?.toString() || '2500');
    }
  };

  const handleCustomBitrateSubmit = () => {
    const value = parseInt(customBitrateInput);
    if (!isNaN(value) && value > 0 && value <= 50000) {
      setCustomBitrate(value);
      setShowCustomBitrate(false);
    }
  };

  const getDeviceIcon = (type: Device['deviceType']) => {
    switch (type) {
      case 'web':
        return '💻';
      case 'mobile':
        return '📱';
      case 'tv':
        return '📺';
      case 'tablet':
        return '📲';
      default:
        return '🖥️';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading || !prefsLoaded) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account preferences and devices</p>
            </div>
            <Link
              href="/catalog"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              ← Back to Catalog
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('playback')}
              className={`${
                activeTab === 'playback'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Playback
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`${
                activeTab === 'devices'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Devices
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`${
                activeTab === 'profiles'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Profiles
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profiles Tab */}
            {activeTab === 'profiles' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <ProfilesList />
              </div>
            )}

            {/* Playback Preferences */}
            {activeTab === 'playback' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Playback Preferences</h2>
              <p className="text-gray-600 mb-6">
                Choose your preferred video quality and bitrate. These settings will be saved and
                applied to all video playback.
              </p>

              {/* Bitrate Presets */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Video Quality</label>
                
                <div className="space-y-2">
                  {[
                    { value: 'auto', label: 'Auto (Adaptive)', desc: 'Automatically adjust based on connection' },
                    { value: 'high', label: 'High Quality (5 Mbps)', desc: 'Best quality, requires fast internet' },
                    { value: 'medium', label: 'Medium Quality (2.5 Mbps)', desc: 'Balanced quality and data usage' },
                    { value: 'low', label: 'Low Quality (1 Mbps)', desc: 'Lower quality, minimal data usage' },
                    { value: 'custom', label: 'Custom Bitrate', desc: 'Set your own bitrate manually' },
                  ].map((preset) => (
                    <label
                      key={preset.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                        preferences.bitratePreset === preset.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bitratePreset"
                        value={preset.value}
                        checked={preferences.bitratePreset === preset.value}
                        onChange={(e) => handleBitratePresetChange(e.target.value as BitratePreset)}
                        className="mt-1 w-4 h-4 text-purple-600"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">{preset.label}</div>
                        <div className="text-sm text-gray-600">{preset.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Custom Bitrate Input */}
                {showCustomBitrate && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Bitrate (kbps)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="100"
                        max="50000"
                        step="100"
                        value={customBitrateInput}
                        onChange={(e) => setCustomBitrateInput(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., 2500"
                      />
                      <button
                        onClick={handleCustomBitrateSubmit}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Range: 100 - 50,000 kbps. Higher values require faster internet.
                    </p>
                  </div>
                )}

                {/* Current Setting Display */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-sm">
                      <span className="text-blue-900 font-medium">Current: </span>
                      <span className="text-blue-700">
                        {getPresetLabel(preferences.bitratePreset)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetPreferences}
                  className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
            )}

            {/* Device Management */}
            {activeTab === 'devices' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Active Devices</h2>
                {devices.length > 1 && (
                  <button
                    onClick={removeAllOtherDevices}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove All Others
                  </button>
                )}
              </div>

              <p className="text-gray-600 mb-6">
                Manage devices that have access to your account. Remove devices to free up slots.
              </p>

              {/* Device Limit Info */}
              {deviceLimits && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-purple-700 font-medium">Device Limit</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {deviceLimits.current} / {deviceLimits.max}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-700">Remaining</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {deviceLimits.remaining}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/billing"
                    className="mt-3 inline-block text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Upgrade for more devices →
                  </Link>
                </div>
              )}

              {/* Devices List */}
              <div className="space-y-3">
                {devices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active devices found</p>
                  </div>
                ) : (
                  devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center flex-1">
                        <div className="text-3xl mr-4">{getDeviceIcon(device.deviceType)}</div>
                        <div>
                          <div className="font-medium text-gray-900">{device.deviceName}</div>
                          <div className="text-sm text-gray-600">
                            Last active: {formatDate(device.lastActive)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Added: {formatDate(device.createdAt)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDevice(device.id)}
                        disabled={removingDevice === device.id}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        {removingDevice === device.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-900">{user?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium text-gray-900">
                    {user?.name || 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Membership</div>
                  <div className="font-medium text-purple-600">
                    {user?.subscription_tier?.toUpperCase() || 'FREE'}
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm font-semibold text-yellow-800 mb-1">Kids Profiles (Coming Soon)</div>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Multi-user profiles & full parental controls will be managed here. You will be able to
                  create separate kid profiles with immersive content restrictions and PIN-gated exits.
                  <span className="block mt-1">TODO: Implement backend user profiles & parental control policies.</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/billing"
                  className="block w-full px-4 py-2 text-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Manage Subscription
                </Link>
                <Link
                  href="/kids-zone"
                  className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Kids Zone
                </Link>
                <Link
                  href="/admin/content"
                  className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Admin Panel
                </Link>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Contact support if you need assistance with your account or settings.
              </p>
              <a
                href="mailto:support@ott-platform.com"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                support@ott-platform.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
