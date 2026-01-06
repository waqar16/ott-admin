/**
 * Auth Check Page
 * 
 * Development/QA smoke test page for authentication system.
 * Tests login, token refresh, profile fetch, and logout.
 * 
 * Access: /dev/auth-check (not linked in navigation)
 */

'use client';

import { useState } from 'react';
import { USE_MOCK_DATA, API_BASE } from '@/lib/config';
import { login, me, refreshToken as apiRefreshToken, logout as apiLogout } from '@/lib/authApi';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/tokenStore';
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';

export default function AuthCheckPage() {
  const { user, isLoggedIn, logout: contextLogout } = useAuth();
  
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_TEST_USER || '');
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_TEST_PASS || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  const testLogin = async () => {
    clearResult();
    setLoading(true);
    
    try {
      const tokens = await login({ email, password });
      setTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      
      const userData = await me(tokens.access_token);
      
      setResult({
        success: true,
        message: 'Login successful',
        tokens,
        user: userData,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setResult({ success: false, error: err });
    } finally {
      setLoading(false);
    }
  };

  const testRefresh = async () => {
    clearResult();
    setLoading(true);
    
    try {
      const refresh = getRefreshToken();
      if (!refresh) {
        throw new Error('No refresh token found');
      }
      
      const tokens = await apiRefreshToken(refresh);
      setTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      
      setResult({
        success: true,
        message: 'Token refresh successful',
        tokens,
      });
    } catch (err: any) {
      setError(err.message || 'Token refresh failed');
      setResult({ success: false, error: err });
    } finally {
      setLoading(false);
    }
  };

  const testMe = async () => {
    clearResult();
    setLoading(true);
    
    try {
      const access = getAccessToken();
      if (!access) {
        throw new Error('No access token found');
      }
      
      const userData = await me(access);
      
      setResult({
        success: true,
        message: 'Profile fetch successful',
        user: userData,
      });
    } catch (err: any) {
      setError(err.message || 'Profile fetch failed');
      setResult({ success: false, error: err });
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    clearResult();
    setLoading(true);
    
    try {
      const refresh = getRefreshToken();
      if (refresh) {
        await apiLogout(refresh);
      }
      
      clearTokens();
      await contextLogout();
      
      setResult({
        success: true,
        message: 'Logout successful',
      });
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      setResult({ success: false, error: err });
    } finally {
      setLoading(false);
    }
  };

  const tokens = {
    access: getAccessToken(),
    refresh: getRefreshToken(),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-purple-600 hover:text-purple-700 text-sm">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Auth Check</h1>
          <p className="text-gray-600 mb-6">Development smoke test for authentication system</p>

          {/* Configuration Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className={`p-4 rounded-lg border-2 ${USE_MOCK_DATA ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
              <div className="font-semibold text-sm mb-1">Mode</div>
              <div className={`text-lg font-bold ${USE_MOCK_DATA ? 'text-yellow-700' : 'text-green-700'}`}>
                {USE_MOCK_DATA ? '🧪 Mock Mode' : '🌐 Live API'}
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <div className="font-semibold text-sm mb-1">API Base</div>
              <div className="text-xs text-blue-800 font-mono break-all">{API_BASE}</div>
            </div>
          </div>

          {/* Current Context State */}
          <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Current Context State</h3>
            <div className="text-sm text-purple-800">
              <div className="mb-1">
                <strong>Logged In:</strong> {isLoggedIn ? '✅ Yes' : '❌ No'}
              </div>
              {user && (
                <>
                  <div className="mb-1">
                    <strong>User:</strong> {user.name} ({user.email})
                  </div>
                  <div className="mb-1">
                    <strong>Tier:</strong> {user.subscription_tier || 'N/A'}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stored Tokens */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Stored Tokens</h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-semibold text-gray-700 mb-1">Access Token</div>
                <div className="font-mono text-xs text-gray-600 break-all">
                  {tokens.access || <span className="text-red-500">Not found</span>}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-semibold text-gray-700 mb-1">Refresh Token</div>
                <div className="font-mono text-xs text-gray-600 break-all">
                  {tokens.refresh || <span className="text-red-500">Not found</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Manual Login Test */}
          {!USE_MOCK_DATA && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Manual Login Test</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="px-3 py-2 border border-gray-300 rounded"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Env vars: NEXT_PUBLIC_TEST_USER, NEXT_PUBLIC_TEST_PASS
              </p>
            </div>
          )}

          {/* Test Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <button
              onClick={testLogin}
              disabled={loading || (!USE_MOCK_DATA && (!email || !password))}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Login
            </button>
            <button
              onClick={testRefresh}
              disabled={loading || !tokens.refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Refresh
            </button>
            <button
              onClick={testMe}
              disabled={loading || !tokens.access}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Fetch /me
            </button>
            <button
              onClick={testLogout}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Logout
            </button>
          </div>

          {/* Results */}
          {loading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-blue-700 font-medium">Processing...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="font-semibold text-red-900 mb-1">❌ Error</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {result && (
            <div className={`p-4 border-2 rounded-lg ${result.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <div className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? '✅' : '❌'} {result.message}
              </div>
              <pre className="text-xs bg-white p-3 rounded overflow-auto max-h-96 border">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📚 API Documentation</h3>
          <p className="text-sm text-blue-800 mb-2">
            Reference: <code className="bg-blue-100 px-1 py-0.5 rounded">API_DOCS/API_DOCUMENTATION_PART1.pdf</code>
          </p>
          <p className="text-sm text-blue-800">
            This page tests the authentication module endpoints without affecting the main app state.
            Use the buttons above to manually test login, token refresh, profile fetch, and logout flows.
          </p>
        </div>
      </div>
    </div>
  );
}
