import React, { useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function hasAdminAccess(roles) {
  if (!Array.isArray(roles)) return false;
  return roles.some((role) => ['admin', 'vice_doyen'].includes(role));
}

function getInitials(prenom, nom) {
  return `${prenom?.[0] || '?'}${nom?.[0] || '?'}`.toUpperCase();
}

const inputClassName = 'w-full rounded-xl border border-edge bg-canvas px-3.5 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';
const sectionClassName = 'rounded-2xl border border-edge bg-surface shadow-card';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingByUserId, setSavingByUserId] = useState({});
  const [editingRolesByUserId, setEditingRolesByUserId] = useState({});
  const [editingStatusByUserId, setEditingStatusByUserId] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState(null);

  const [createForm, setCreateForm] = useState({
    email: '',
    nom: '',
    prenom: '',
    sexe: '',
    telephone: '',
    roleNames: [],
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const canAccess = useMemo(() => hasAdminAccess(user?.roles), [user?.roles]);
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((entry) => entry.status === 'active').length;
    const adminUsers = users.filter((entry) => hasAdminAccess(entry.roles || [])).length;
    const suspendedUsers = users.filter((entry) => entry.status === 'suspended').length;

    return [
      { label: 'Total Users', value: totalUsers, tone: 'text-ink' },
      { label: 'Active Accounts', value: activeUsers, tone: 'text-success' },
      { label: 'Admin Accounts', value: adminUsers, tone: 'text-brand' },
      { label: 'Suspended', value: suspendedUsers, tone: 'text-danger' },
    ];
  }, [users]);

  useEffect(() => {
    if (!lastCreatedCredentials) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLastCreatedCredentials(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastCreatedCredentials]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersRes, rolesRes] = await Promise.all([
        authAPI.adminGetUsers(),
        authAPI.adminGetRoles(),
      ]);

      const usersData = usersRes?.data?.users || [];
      const rolesData = rolesRes?.data?.roles || [];

      setUsers(usersData);
      setRoles(rolesData);
      setEditingRolesByUserId(
        Object.fromEntries(usersData.map((u) => [u.id, [...(u.roles || [])]]))
      );
      setEditingStatusByUserId(
        Object.fromEntries(usersData.map((u) => [u.id, u.status || 'active']))
      );
    } catch (err) {
      setError(err.message || 'Failed to load admin users data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canAccess) return;
    loadData();
  }, [canAccess]);

  const toggleCreateRole = (roleName) => {
    setCreateForm((prev) => {
      const selected = prev.roleNames.includes(roleName)
        ? prev.roleNames.filter((r) => r !== roleName)
        : [...prev.roleNames, roleName];
      return { ...prev, roleNames: selected };
    });
  };

  const toggleUserRole = (userId, roleName) => {
    setEditingRolesByUserId((prev) => {
      const current = prev[userId] || [];
      const next = current.includes(roleName)
        ? current.filter((r) => r !== roleName)
        : [...current, roleName];
      return { ...prev, [userId]: next };
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!createForm.roleNames.length) {
      setError('Please select at least one role for the new user.');
      return;
    }

    setCreatingUser(true);
    try {
      const payload = {
        email: createForm.email.trim(),
        nom: createForm.nom.trim(),
        prenom: createForm.prenom.trim(),
        roleNames: createForm.roleNames,
        sexe: createForm.sexe || undefined,
        telephone: createForm.telephone.trim() || undefined,
      };

      const res = await authAPI.adminCreateUser(payload);
      const createdUser = res?.data?.user;
      const tempPassword = res?.data?.tempPassword;

      if (createdUser?.email && tempPassword) {
        setLastCreatedCredentials({
          email: createdUser.email,
          fullName: `${createdUser.prenom || payload.prenom} ${createdUser.nom || payload.nom}`.trim(),
          roles: createdUser.roles || payload.roleNames,
          tempPassword,
          createdAt: new Date().toLocaleString(),
        });
      }

      setMessage('User created successfully. The temporary credentials window is now open.');

      setCreateForm({
        email: '',
        nom: '',
        prenom: '',
        sexe: '',
        telephone: '',
        roleNames: [],
      });

      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setCreatingUser(false);
    }
  };

  const saveUserRoles = async (userId) => {
    const roleNames = editingRolesByUserId[userId] || [];
    if (!roleNames.length) {
      setError('Each user must have at least one role.');
      return;
    }

    setSavingByUserId((prev) => ({ ...prev, [userId]: true }));
    setError('');
    setMessage('');

    try {
      const res = await authAPI.adminUpdateUserRoles(userId, roleNames);
      const updatedUser = res?.data?.user;
      if (updatedUser?.id) {
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, roles: updatedUser.roles } : u)));
      }
      setMessage('User roles updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update user roles.');
    } finally {
      setSavingByUserId((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const saveUserStatus = async (userId) => {
    const status = editingStatusByUserId[userId] || 'active';

    setSavingByUserId((prev) => ({ ...prev, [userId]: true }));
    setError('');
    setMessage('');

    try {
      const res = await authAPI.adminUpdateUserStatus(userId, status);
      const updatedUser = res?.data?.user;
      if (updatedUser?.id) {
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, status: updatedUser.status } : u)));
      }
      setMessage('User status updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    } finally {
      setSavingByUserId((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const copyToClipboard = async (text, successLabel) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(successLabel);
    } catch {
      setError('Unable to copy automatically. Please copy it manually.');
    }
  };

  if (!canAccess) {
    return (
      <div className="rounded-2xl border border-edge bg-surface p-8 shadow-card">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-danger">Restricted Area</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">User management is not available for this account.</h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Only administrators and vice deans can create accounts, assign roles, and manage access.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-edge bg-surface p-8 shadow-card">
        <div className="flex items-center gap-3 text-ink-secondary">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
          <span>Loading admin user management...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl min-w-0">
      <section className="relative overflow-hidden rounded-3xl border border-edge bg-surface shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_28%)]" />
        <div className="relative px-6 py-7 md:px-7 md:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Administration</p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink md:text-3xl">Admin User Management</h1>
              <p className="mt-2 text-sm leading-6 text-ink-secondary md:text-base">
                Create institutional accounts, assign multiple roles, and keep access clean across the platform.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[440px]">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-edge bg-canvas/90 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-ink-tertiary">{stat.label}</p>
                  <p className={`mt-2 text-2xl font-bold tracking-tight ${stat.tone}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {message ? <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success shadow-card">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger shadow-card">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className={`${sectionClassName} p-6`}>
          <div className="flex flex-col gap-2 border-b border-edge-subtle pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">Create New User</h2>
              <p className="mt-1 text-sm text-ink-secondary">Fill the identity details, choose one or more roles, then generate secure first-login credentials.</p>
            </div>
            <div className="rounded-full border border-brand/20 bg-brand-light px-3 py-1 text-xs font-medium text-brand">
              {roles.length} roles available
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Email</span>
                <input
                  type="email"
                  placeholder="name@univ-ibn-khaldoun.dz"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClassName}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">First Name</span>
                <input
                  type="text"
                  placeholder="Prenom"
                  value={createForm.prenom}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, prenom: e.target.value }))}
                  className={inputClassName}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Last Name</span>
                <input
                  type="text"
                  placeholder="Nom"
                  value={createForm.nom}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, nom: e.target.value }))}
                  className={inputClassName}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink">Phone</span>
                <input
                  type="text"
                  placeholder="Optional"
                  value={createForm.telephone}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, telephone: e.target.value }))}
                  className={inputClassName}
                />
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">Sexe</label>
              <div className="flex flex-wrap gap-2">
                {['', 'H', 'F'].map((value) => (
                  <button
                    key={value || 'none'}
                    type="button"
                    onClick={() => setCreateForm((prev) => ({ ...prev, sexe: value }))}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      createForm.sexe === value
                        ? 'border-brand bg-brand-light text-brand shadow-sm'
                        : 'border-edge bg-canvas text-ink-secondary hover:border-brand/30 hover:text-ink'
                    }`}
                  >
                    {value || 'Not set'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-ink">Roles</label>
                <span className="text-xs text-ink-tertiary">{createForm.roleNames.length} selected</span>
              </div>
              {!roles.length ? (
                <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                  No roles found. Make sure your backend has roles data and your account has admin access.
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {roles.map((role) => {
                  const selected = createForm.roleNames.includes(role.nom);
                  return (
                    <label
                      key={role.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                        selected
                          ? 'border-brand bg-brand-light/70 text-ink shadow-sm'
                          : 'border-edge bg-canvas text-ink-secondary hover:border-brand/30 hover:text-ink'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-brand"
                        checked={selected}
                        onChange={() => toggleCreateRole(role.nom)}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink">{role.nom}</span>
                        <span className="mt-1 block text-xs text-ink-tertiary">{role.description || 'Institutional access role'}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-edge-subtle pt-5">
              <button
                type="submit"
                disabled={creatingUser}
                className="inline-flex items-center rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-hover disabled:opacity-60"
              >
                {creatingUser ? 'Creating...' : 'Create User'}
              </button>
              <p className="text-sm text-ink-tertiary">The temporary password will appear in a secure pop-up after creation.</p>
            </div>
          </form>
        </div>

        <aside className={`${sectionClassName} p-6`}>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Admin Checklist</h2>
          <p className="mt-1 text-sm text-ink-secondary">A quick reference so account creation stays consistent.</p>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-edge bg-canvas px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Before Creating</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
                <li>Use the institutional email address.</li>
                <li>Assign all required roles now to avoid partial access.</li>
                <li>Only fill phone and sexe when that data is known.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-edge bg-canvas px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Role Coverage</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {roles.map((role) => (
                  <span key={`catalog-${role.id}`} className="rounded-full border border-edge bg-surface px-2.5 py-1 text-xs font-medium text-ink-secondary">
                    {role.nom}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-4">
              <p className="text-sm font-semibold text-ink">Password Handling</p>
              <p className="mt-2 text-sm leading-6 text-ink-secondary">
                The temporary password is displayed once. Copy it from the modal window and deliver it securely to the user.
              </p>
            </div>
          </div>
        </aside>
      </section>

      {lastCreatedCredentials ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 py-6 backdrop-blur-sm"
          onClick={() => setLastCreatedCredentials(null)}
        >
          <section
            className="w-full max-w-2xl rounded-2xl border border-warning/40 bg-surface shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-edge px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">New User Credentials</h2>
                <p className="mt-1 text-sm text-ink-secondary">
                  Save this password now. It is shown once and cannot be read later from the database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLastCreatedCredentials(null)}
                className="rounded-md border border-edge bg-canvas px-3 py-1.5 text-sm font-medium text-ink-secondary hover:text-ink"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
                <div className="rounded-md border border-edge bg-canvas px-3 py-3">
                  <p className="text-xs text-ink-tertiary">Full Name</p>
                  <p className="font-medium text-ink break-words">{lastCreatedCredentials.fullName || 'Not available'}</p>
                </div>
                <div className="rounded-md border border-edge bg-canvas px-3 py-3">
                  <p className="text-xs text-ink-tertiary">User Email</p>
                  <p className="font-medium text-ink break-all">{lastCreatedCredentials.email}</p>
                </div>
                <div className="rounded-md border border-edge bg-canvas px-3 py-3">
                  <p className="text-xs text-ink-tertiary">Assigned Roles</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(lastCreatedCredentials.roles || []).map((roleName) => (
                      <span key={roleName} className="rounded-full border border-brand/25 bg-brand-light px-2 py-1 text-xs font-medium text-brand">
                        {roleName}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-edge bg-canvas px-3 py-3">
                  <p className="text-xs text-ink-tertiary">Generated At</p>
                  <p className="font-medium text-ink">{lastCreatedCredentials.createdAt}</p>
                </div>
              </div>

              <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Temporary Password</p>
                <p className="mt-2 break-all font-mono text-lg text-ink">{lastCreatedCredentials.tempPassword}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(lastCreatedCredentials.tempPassword, 'Temporary password copied to clipboard.')}
                  className="px-3 py-2 rounded-md bg-brand text-white text-sm font-medium"
                >
                  Copy Password
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(lastCreatedCredentials.email, 'User email copied to clipboard.')}
                  className="px-3 py-2 rounded-md bg-surface-200 text-ink text-sm font-medium border border-edge"
                >
                  Copy Email
                </button>
                <button
                  type="button"
                  onClick={() => setLastCreatedCredentials(null)}
                  className="px-3 py-2 rounded-md bg-canvas text-ink text-sm font-medium border border-edge"
                >
                  Done
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <section className={`${sectionClassName} p-6`}>
        <div className="flex flex-col gap-2 border-b border-edge-subtle pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">Existing Users</h2>
            <p className="mt-1 text-sm text-ink-secondary">Review account status and adjust role assignments without leaving the page.</p>
          </div>
          <div className="rounded-full border border-edge bg-canvas px-3 py-1 text-xs font-medium text-ink-secondary">
            {users.length} managed accounts
          </div>
        </div>

        {users.length ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {users.map((u) => (
              <div key={u.id} className="rounded-2xl border border-edge bg-canvas p-5 shadow-sm transition hover:border-brand/25">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-sm font-bold text-brand">
                      {getInitials(u.prenom, u.nom)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-ink">{u.prenom} {u.nom}</p>
                      <p className="truncate text-sm text-ink-secondary">{u.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium border ${
                          u.status === 'active'
                            ? 'border-success/25 bg-success/10 text-success'
                            : u.status === 'suspended'
                              ? 'border-danger/25 bg-danger/10 text-danger'
                              : 'border-edge bg-surface text-ink-secondary'
                        }`}>
                          {u.status || 'unknown'}
                        </span>
                        <span className="text-xs text-ink-tertiary">
                          Last login: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {(u.roles || []).map((r) => (
                      <span key={`${u.id}-${r}`} className="rounded-full border border-brand/25 bg-brand-light px-2.5 py-1 text-xs font-medium text-brand">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 rounded-2xl border border-edge bg-surface px-4 py-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-tertiary">Phone</p>
                    <p className="mt-1 text-sm font-medium text-ink">{u.telephone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-tertiary">Created</p>
                    <p className="mt-1 text-sm font-medium text-ink">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-edge bg-surface px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink">Account Status</p>
                    <span className="text-xs text-ink-tertiary">Change access availability</span>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <select
                      value={editingStatusByUserId[u.id] || u.status || 'active'}
                      onChange={(event) => setEditingStatusByUserId((prev) => ({ ...prev, [u.id]: event.target.value }))}
                      className="rounded-xl border border-edge bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                      <option value="suspended">suspended</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => saveUserStatus(u.id)}
                      disabled={!!savingByUserId[u.id]}
                      className="rounded-xl border border-edge bg-surface-200 px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface disabled:opacity-60"
                    >
                      {savingByUserId[u.id] ? 'Saving...' : 'Save Status'}
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink">Edit Roles</p>
                    <span className="text-xs text-ink-tertiary">{(editingRolesByUserId[u.id] || []).length} selected</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {roles.map((role) => {
                      const checked = (editingRolesByUserId[u.id] || []).includes(role.nom);
                      return (
                        <label
                          key={`${u.id}-${role.id}`}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                            checked
                              ? 'border-brand bg-brand-light/70 text-ink'
                              : 'border-edge bg-surface text-ink-secondary hover:border-brand/30 hover:text-ink'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-brand"
                            checked={checked}
                            onChange={() => toggleUserRole(u.id, role.nom)}
                          />
                          <span>{role.nom}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-edge-subtle pt-4">
                  <p className="text-xs text-ink-tertiary">Changes apply immediately after saving.</p>
                  <button
                    type="button"
                    onClick={() => saveUserRoles(u.id)}
                    disabled={!!savingByUserId[u.id]}
                    className="rounded-xl border border-edge bg-surface-200 px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface disabled:opacity-60"
                  >
                    {savingByUserId[u.id] ? 'Saving...' : 'Save Roles'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-edge bg-canvas px-6 py-10 text-center">
            <p className="text-base font-medium text-ink">No users found.</p>
            <p className="mt-2 text-sm text-ink-secondary">Create the first account from the form above to start managing access.</p>
          </div>
        )}
      </section>
    </div>
  );
}
