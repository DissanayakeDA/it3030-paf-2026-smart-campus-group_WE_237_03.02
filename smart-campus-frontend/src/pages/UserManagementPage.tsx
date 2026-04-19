import { useEffect, useMemo, useState, type FormEvent } from 'react';
import PageContainer from '../components/common/PageContainer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/user.service';
import type { CreateUserRequest, Role, UserResponse } from '../types/auth.types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'USER', label: 'Staff (User)' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'ADMIN', label: 'Admin' },
];

function isGmailAddress(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}

function getErrorMessage(error: unknown, fallback: string): string {
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const INITIAL_FORM: CreateUserRequest = {
  name: '',
  email: '',
  empId: '',
  phoneNumber: '',
  password: '',
  role: 'USER',
};

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CreateUserRequest>({ ...INITIAL_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    userService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setUsers(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Failed to load users.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    return users.reduce<Record<Role, number>>(
      (acc, current) => {
        acc[current.role] += 1;
        return acc;
      },
      { USER: 0, TECHNICIAN: 0, ADMIN: 0 }
    );
  }, [users]);

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    const payload: CreateUserRequest = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      empId: form.empId.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password,
      role: form.role,
    };

    if (!payload.name || !payload.email || !payload.empId || !payload.phoneNumber || !payload.password) {
      setError('All fields are required.');
      setSuccess(null);
      return;
    }

    if (!isGmailAddress(payload.email)) {
      setError('Email must be a valid @gmail.com address.');
      setSuccess(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await userService.create(payload);
      setUsers((prev) => [created, ...prev]);
      setForm({ ...INITIAL_FORM });
      setSuccess(`User "${created.name}" created successfully.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create user.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(target: UserResponse) {
    if (target.role === 'ADMIN') {
      setError('Admin users cannot be deleted from user management.');
      setSuccess(null);
      return;
    }

    const confirmed = window.confirm(`Delete ${target.role.toLowerCase()} "${target.name}"?`);
    if (!confirmed) return;

    setError(null);
    setSuccess(null);
    try {
      await userService.deleteUser(target.id);
      setUsers((prev) => prev.filter((item) => item.id !== target.id));
      setSuccess(`Deleted ${target.role.toLowerCase()} "${target.name}" successfully.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete user.'));
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
          <p className="text-sm text-red-600">Only admins can access user management.</p>
        </div>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <LoadingSpinner message="Loading users…" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionTitle
        title="User Management"
        subtitle={`${users.length} total users • ${counts.ADMIN} admins • ${counts.TECHNICIAN} technicians • ${counts.USER} staff`}
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

      <form onSubmit={handleCreateUser} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700">Create New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              maxLength={120}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
            <input
              id="phone"
              value={form.phoneNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="empId" className="block text-xs font-medium text-gray-600 mb-1">Employee ID</label>
            <input
              id="empId"
              value={form.empId}
              onChange={(e) => setForm((prev) => ({ ...prev, empId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">Email (@gmail.com)</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1">Temporary Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
              minLength={8}
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as Role }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0353A4] focus:border-transparent"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-[#0353A4] text-white text-sm font-medium hover:bg-[#003559] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#B9D6F2] text-[#003559]">
                      {item.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.empId ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{item.email}</td>
                  <td className="px-6 py-4 text-gray-600">{item.phoneNumber ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    {item.role === 'ADMIN' ? (
                      <span className="text-xs text-gray-400">Not allowed</span>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-150"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
