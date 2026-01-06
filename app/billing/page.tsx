import { requireAuth } from '@/lib/guards/membership';
import { getDevicesByUserId } from '@/lib/db/adapter';
import { getMembershipDisplayName, DEVICE_LIMITS } from '@/lib/auth';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export const metadata = {
  title: 'Billing & Membership',
  description: 'Manage your subscription and devices',
};

export default async function BillingPage() {
  // Require authentication
  const session = await requireAuth();
  const user = session.user;

  // Get user's devices
  const devices = await getDevicesByUserId(user.id);
  const deviceCount = devices.length;
  const deviceLimit = user.deviceLimit;

  // Membership details
  const membershipName = getMembershipDisplayName(user.membershipType);
  const isKidsRingfenced = user.isKidsRingfenced;
  const subscriptionStatus = user.subscriptionStatus;

  // Calculate days until renewal (mock)
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">Billing & Membership</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Plan Card */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Current Plan</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Membership Type</p>
              <p className="text-xl font-bold">{membershipName}</p>
              {isKidsRingfenced && (
                <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  Kids Ringfenced
                </span>
              )}
            </div>

            {subscriptionStatus && (
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-lg capitalize">
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      subscriptionStatus === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscriptionStatus === 'past_due'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {subscriptionStatus}
                  </span>
                </p>
              </div>
            )}

            {user.stripeSubscriptionId && (
              <div>
                <p className="text-gray-600 text-sm">Next Billing Date</p>
                <p className="text-lg">{nextBillingDate.toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">
            {user.membershipType !== 'FULL' && (
              <Button variant="primary" className="w-full">
                Upgrade Plan
              </Button>
            )}
            {user.stripeSubscriptionId && (
              <Button variant="secondary" className="w-full">
                Manage Subscription
              </Button>
            )}
          </div>
        </Card>

        {/* Device Management Card */}
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Device Management</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Devices Connected</p>
              <p className="text-xl font-bold">
                {deviceCount} / {deviceLimit}
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    deviceCount >= deviceLimit
                      ? 'bg-red-500'
                      : deviceCount >= deviceLimit * 0.8
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${(deviceCount / deviceLimit) * 100}%` }}
                ></div>
              </div>
            </div>

            {deviceCount >= deviceLimit && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  You've reached your device limit. Remove a device or upgrade your plan to
                  add more devices.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button variant="secondary" className="w-full">
              Manage Devices
            </Button>
          </div>
        </Card>
      </div>

      {/* Devices List */}
      <Card>
        <h2 className="text-2xl font-semibold mb-4">Your Devices</h2>
        {devices.length === 0 ? (
          <p className="text-gray-600">No devices registered yet.</p>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      device.deviceType === 'web'
                        ? 'bg-blue-100 text-blue-600'
                        : device.deviceType === 'mobile'
                        ? 'bg-green-100 text-green-600'
                        : device.deviceType === 'tv'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {device.deviceType === 'web' && '💻'}
                    {device.deviceType === 'mobile' && '📱'}
                    {device.deviceType === 'tv' && '📺'}
                    {device.deviceType === 'tablet' && '📱'}
                  </div>
                  <div>
                    <p className="font-medium">{device.deviceName}</p>
                    <p className="text-sm text-gray-600">
                      Last active: {new Date(device.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Plan Comparison */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <Card className={user.membershipType === 'FREE' ? 'border-2 border-blue-500' : ''}>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Free Tier</h3>
              <p className="text-3xl font-bold mb-4">$0</p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>1 device</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Access to kids content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">✗</span>
                  <span>Limited content library</span>
                </li>
              </ul>
              {user.membershipType !== 'FREE' && (
                <Button variant="secondary" className="w-full">
                  Downgrade
                </Button>
              )}
            </div>
          </Card>

          {/* Kids Plan */}
          <Card className={user.membershipType === 'KIDS' ? 'border-2 border-blue-500' : ''}>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Kids Plan</h3>
              <p className="text-3xl font-bold mb-4">
                $9.99<span className="text-sm font-normal">/month</span>
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>2 devices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Kids content ringfenced</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Parental controls</span>
                </li>
              </ul>
              {user.membershipType === 'KIDS' ? (
                <Button variant="secondary" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button variant="primary" className="w-full">
                  {user.membershipType === 'FREE' ? 'Upgrade' : 'Switch Plan'}
                </Button>
              )}
            </div>
          </Card>

          {/* Full Plan */}
          <Card className={user.membershipType === 'FULL' ? 'border-2 border-blue-500' : ''}>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Full Access</h3>
              <p className="text-3xl font-bold mb-4">
                $14.99<span className="text-sm font-normal">/month</span>
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>5 devices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Full content library</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>4K streaming</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Offline downloads</span>
                </li>
              </ul>
              {user.membershipType === 'FULL' ? (
                <Button variant="secondary" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button variant="primary" className="w-full">
                  Upgrade
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
