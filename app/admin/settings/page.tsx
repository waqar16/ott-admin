

"use client"
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { BiLogOut } from "react-icons/bi";
import { FiSettings as Settings, FiShield as Shield, FiFilm as Film, FiUsers as Users, FiBell as Bell, FiDatabase as Database } from "react-icons/fi";
import { toast } from "sonner";
import { getPlatformSettings, updatePlatformSettings, uploadPlatformLogo } from '@/lib/platformApi';
import { SettingInput } from "@/components/SettingInput/SettingInput";
 

 
export default function AdminSettingsPage() {
  const [selectedTab, setSelectedTab] = useState('General');
  const [loading, setLoading] = useState(false);
  const [platformSettings, setPlatformSettings] = useState({
    site_name: '',
    support_email: '',
    primary_color: '',
    secondary_color: '',
    currency_default: '',
    logo_s3_key: '',
    logo_url: '',
    maintenance_mode: false,
  });
  const [logoUploading, setLogoUploading] = useState(false);

  // Fetch platform settings on mount
  React.useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const data = await getPlatformSettings();
        setPlatformSettings(prev => ({
          ...prev,
          site_name: data.site_name || '',
          support_email: data.support_email || '',
          primary_color: data.primary_color || '',
          secondary_color: data.secondary_color || '',
          currency_default: data.currency_default || '',
          logo_s3_key: data.logo_s3_key || '',
          logo_url: data.logo_s3_key ? `https://your-cloudfront-domain/${data.logo_s3_key}` : '',
          maintenance_mode: false, // Not in API, placeholder
        }));
      } catch (e) {
        toast.error('Failed to load platform settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Handle logo upload
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const res = await uploadPlatformLogo(file);
      setPlatformSettings(prev => ({
        ...prev,
        logo_s3_key: res.s3_key,
        logo_url: res.logo_url,
      }));
      toast.success('Logo updated');
    } catch (err) {
      toast.error('Logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  }

  // Handle input changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setPlatformSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  // Save changes
  async function handleSave() {
    setLoading(true);
    try {
      const { site_name, support_email, primary_color, secondary_color, currency_default } = platformSettings;
      const data = await updatePlatformSettings({
        site_name,
        support_email,
        primary_color,
        secondary_color,
        currency_default,
      });
      setPlatformSettings(prev => ({ ...prev, ...data }));
      toast.success('Platform settings updated');
    } catch (e) {
      toast.error('Failed to update platform settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-2 md:p-6 mt-16 md:mt-0 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-semibold text-white">Admin Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-blue-100 pb-2">
        {["General", "Security", "System", "Authentication"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 text-sm rounded-md ${selectedTab === tab ? 'bg-blue-700 text-neutral-100' : 'bg-neutral-300 text-blue-600'} transition`}
          >
            {tab}
          </button>
        ))}
      </div>

      {selectedTab === 'General' && (
        <div className="flex w-full flex-col items-center  space-y-8">
         <Section title="Platform Settings">
  <form
    onSubmit={e => {
      e.preventDefault()
      handleSave()
    }}
    className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-6"
  >
    {/* LEFT – BRANDING */}
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
      <h3 className="text-sm font-semibold text-white">Branding</h3>

      {/* Logo */}
      <SettingInput label="Platform Logo">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center overflow-hidden">
            {platformSettings.logo_url ? (
              <img
                src={platformSettings.logo_url}
                alt="Logo"
                className="object-contain"
              />
            ) : (
              <span className="text-xs text-gray-400">No Logo</span>
            )}
          </div>

          <label className="px-3 py-2 text-xs rounded-md bg-neutral-800 hover:bg-neutral-700 cursor-pointer">
            {logoUploading ? 'Uploading…' : 'Change Logo'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleLogoUpload}
              disabled={logoUploading || loading}
            />
          </label>
        </div>
      </SettingInput>

      <SettingInput label="Platform Name">
        <input
          type="text"
          name="site_name"
          value={platformSettings.site_name}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2"
        />
      </SettingInput>

      <SettingInput label="Support Email">
        <input
          type="email"
          name="support_email"
          value={platformSettings.support_email}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2"
        />
      </SettingInput>
    </div>

    {/* RIGHT – APPEARANCE & SYSTEM */}
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
      <h3 className="text-sm font-semibold text-white">Appearance & System</h3>

      {/* Color Preview */}
      <div className="flex gap-4 flex-col items-start w-full">
        <SettingInput label="Primary Color">
          <div className="flex gap-2 items-center">
            <div
              className="w-6 h-6 rounded"
              style={{ background: platformSettings.primary_color }}
            />
            <input
              type="text"
              name="primary_color"
              value={platformSettings.primary_color}
              onChange={handleChange}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2"
            />
          </div>
        </SettingInput>

        <SettingInput label="Secondary Color">
          <div className="flex gap-2 items-center">
            <div
              className="w-6 h-6 rounded"
              style={{ background: platformSettings.secondary_color }}
            />
            <input
              type="text"
              name="secondary_color"
              value={platformSettings.secondary_color}
              onChange={handleChange}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2"
            />
          </div>
        </SettingInput>
      </div>

      <SettingInput label="Default Currency">
        <input
          type="text"
          name="currency_default"
          value={platformSettings.currency_default}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2"
        />
      </SettingInput>

      {/* Maintenance */}
      <div className="flex items-center justify-between border border-red-900/40 bg-red-950/20 rounded-lg p-4">
        <div>
          <p className="text-sm font-medium text-red-400">Maintenance Mode</p>
          <p className="text-xs text-gray-400">
            Platform will be inaccessible to users
          </p>
        </div>
        <Toggle
          checked={platformSettings.maintenance_mode}
          disabled={loading}
          onChange={() =>
            setPlatformSettings(prev => ({
              ...prev,
              maintenance_mode: !prev.maintenance_mode,
            }))
          }
        />
      </div>
    </div>

    {/* SAVE */}
    <div className="col-span-full flex justify-end">
      <button
        type="submit"
        disabled={loading}
        className={clsx(
          'px-6 py-2 rounded-md font-semibold transition',
          loading
            ? 'bg-neutral-700 text-gray-400'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        )}
      >
        {loading ? 'Saving Changes…' : 'Save Changes'}
      </button>
    </div>
  </form>
</Section>

          {/* ...existing code for other sections... */}
        </div>
      )}
      {/* ...existing code for other tabs... */}
      {selectedTab === 'Authentication' && <LogoutSection />}
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full text-neutral-100 bg-black rounded-xl border border-blue-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 text-blue-700 font-medium">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Input({ label }: { label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-neutral-100">{label}</label>
      <input
        className="w-full border   bg-neutral-950 border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder={label}
      />
    </div>
  );
}
 

const Toggle = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onChange}
    className={clsx(
      'w-11 h-6 rounded-full relative transition',
      checked ? 'bg-red-600' : 'bg-neutral-700',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span
      className={clsx(
        'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform',
        checked && 'translate-x-5'
      )}
    />
  </button>
)


function PrimaryButton({ text }: { text: string }) {
  return (
    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
      {text}
    </button>
  );
}

function DangerButton({ text }: { text: string }) {
  return (
    <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
      {text}
    </button>
  );
}

function LogoutSection() {
  const router = useRouter();

  const handleLogout = () => {
    toast.custom((t) => (
      <div className="bg-neutral-950 border border-blue-100 shadow-lg rounded-lg p-4 w-[320px]">
        <h3 className="font-semibold text-white">
          Confirm Logout
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          Are you sure you want to logout from admin panel?
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => toast.dismiss(t)}
            className="text-neutral-400 px-3 py-1.5 text-sm rounded-md border border-slate-300 hover:bg-slate-400 hover:text-slate-900 duration-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              toast.dismiss(t);

              // Clear auth
              document.cookie =
                "access_token=; Max-Age=0; path=/";

              // Redirect
              router.push("/");

              toast.success("Logged out successfully");
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-neutral-950 border border-blue-100 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">
            Logout
          </h2>
          <p className="text-sm text-slate-500">
            End your current admin session securely
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
        >
          <BiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}