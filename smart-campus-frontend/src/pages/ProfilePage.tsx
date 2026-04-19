import { useEffect, useState, type FormEvent } from 'react';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import type { ChangePasswordRequest, UpdateProfileRequest, UserResponse } from '../types/auth.types';

function extractError(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      message?: string;
      response?: { data?: { message?: string } };
    };
    const apiMessage = err.response?.data?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage;
    if (typeof err.message === 'string' && err.message.trim()) return err.message;
  }
  return fallback;
}

export default function ProfilePage() {
  const { user, setCurrentUser } = useAuth();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UpdateProfileRequest>({
    name: '',
    phoneNumber: '',
  });
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    userService
      .getMe()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setForm({
          name: data.name ?? '',
          phoneNumber: data.phoneNumber ?? '',
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(extractError(err, 'Failed to load profile details.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const payload: UpdateProfileRequest = {
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
    };

    if (!payload.name || !payload.phoneNumber) {
      setError('Name and phone number are required.');
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await userService.updateMe(payload);
      setProfile(updated);
      setForm({
        name: updated.name ?? '',
        phoneNumber: updated.phoneNumber ?? '',
      });
      setCurrentUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        empId: updated.empId,
        phoneNumber: updated.phoneNumber,
      });
      setSuccess('Profile updated successfully.');
    } catch (err: unknown) {
      setError(extractError(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !confirmPassword) {
      setError('Current password, new password, and confirm password are required.');
      setSuccess(null);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      setSuccess(null);
      return;
    }

    if (passwordForm.newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      setSuccess(null);
      return;
    }

    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      setSuccess('Password changed successfully.');
    } catch (err: unknown) {
      setError(extractError(err, 'Failed to change password.'));
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <LoadingSpinner message="Loading your profile…" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionTitle
        title="My Profile"
        subtitle={user ? `Signed in as ${user.role}` : 'Profile details'}
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <input
              id="profile-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              maxLength={120}
              required
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-xs font-medium text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              id="profile-phone"
              value={form.phoneNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-email" className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={profile?.email ?? '—'}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label htmlFor="profile-emp-id" className="block text-xs font-medium text-gray-600 mb-1">
              Employee ID
            </label>
            <input
              id="profile-emp-id"
              value={profile?.empId ?? '—'}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Employee ID cannot be changed.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-medium hover:bg-[#003559] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>

      <form onSubmit={handleChangePassword} className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Change Password</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="current-password" className="block text-xs font-medium text-gray-600 mb-1">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-xs font-medium text-gray-600 mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              minLength={8}
              required
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-600 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              minLength={8}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={changingPassword}
            className="px-4 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-medium hover:bg-[#003559] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {changingPassword ? 'Updating…' : 'Change Password'}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
