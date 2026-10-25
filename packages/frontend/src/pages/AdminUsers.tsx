import { createSignal, onMount, onCleanup, Show, For, type Component } from 'solid-js';
import { Title } from '@solidjs/meta';
import { A, useNavigate } from '@solidjs/router';
import { authClient } from '../services/auth-client.js';
import { toast } from '../services/toast-store.js';
import {
  getAllMembers,
  updateMemberStatus,
  updateMemberRole,
  updateMemberPlan,
  updateMemberFinancials,
  whitelistNewMember,
  deleteMember,
  type GatewayMember,
} from '../services/admin-neon.js';
import '../styles/admin.css';

export const AdminUsers: Component = () => {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const currentUserEmail = () => session()?.data?.user?.email?.toLowerCase() ?? '';
  const isBoss = () => currentUserEmail() === 'itstasdidnur@gmail.com';

  const [members, setMembers] = createSignal<GatewayMember[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [refreshing, setRefreshing] = createSignal(false);
  const [actionBusy, setActionBusy] = createSignal(false);

  // Filters matching Writerify
  const [searchQuery, setSearchQuery] = createSignal('');
  const [planFilter, setPlanFilter] = createSignal<string>('all');
  const [statusFilter, setStatusFilter] = createSignal<string>('all');
  const [period, setPeriod] = createSignal<'lifetime' | '30d' | 'year' | 'last_year'>('lifetime');

  // Whitelist modal state
  const [modalOpen, setModalOpen] = createSignal(false);
  const [newEmail, setNewEmail] = createSignal('');
  const [newName, setNewName] = createSignal('');
  const [newRole, setNewRole] = createSignal('member');
  const [newPlan, setNewPlan] = createSignal('free_trial');

  // Inline edits cache
  const [editedPlans, setEditedPlans] = createSignal<Record<string, string>>({});
  const [editedAgreed, setEditedAgreed] = createSignal<Record<string, number>>({});
  const [editedPaid, setEditedPaid] = createSignal<Record<string, number>>({});

  async function loadMembers() {
    try {
      setRefreshing(true);
      const data = await getAllMembers();
      setMembers(data);
    } catch (err: any) {
      console.error('Failed to load members:', err);
      toast.error('Failed to connect to Neon PostgreSQL');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  onMount(() => {
    loadMembers();
    const interval = setInterval(loadMembers, 15000);
    onCleanup(() => clearInterval(interval));
  });

  // KPI counts
  const totalCount = () => members().length;
  const freeTrialCount = () => members().filter((m) => m.plan === 'free_trial' || !m.plan).length;
  const monthlyCount = () => members().filter((m) => m.plan === 'monthly').length;
  const starterCount = () => members().filter((m) => m.plan === 'starter').length;
  const growthCount = () => members().filter((m) => m.plan === 'growth').length;
  const maxCount = () => members().filter((m) => m.plan === 'max').length;
  const ownerCount = () => members().filter((m) => m.plan === 'owner').length;
  const pendingCount = () => members().filter((m) => m.status === 'pending').length;

  const filteredMembers = () => {
    let list = members();
    const plan = planFilter();
    if (plan !== 'all') {
      list = list.filter((m) => (m.plan || 'free_trial') === plan);
    }
    const status = statusFilter();
    if (status !== 'all') {
      list = list.filter((m) => m.status === status);
    }
    const q = searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.mobile && m.mobile.toLowerCase().includes(q)),
      );
    }
    return list;
  };

  async function handleApprove(email: string) {
    try {
      setActionBusy(true);
      await updateMemberStatus(email, 'approved');
      toast.success(`Approved ${email} for Gateway access!`);
      await loadMembers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve');
    } finally {
      setActionBusy(false);
    }
  }

  async function handleRevoke(email: string) {
    if (email === 'itstasdidnur@gmail.com') {
      toast.error('Cannot revoke Master Admin Boss!');
      return;
    }
    try {
      setActionBusy(true);
      await updateMemberStatus(email, 'revoked');
      toast.success(`Revoked access for ${email}`);
      await loadMembers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke');
    } finally {
      setActionBusy(false);
    }
  }

  async function handleSaveRow(m: GatewayMember) {
    try {
      setActionBusy(true);
      const plan = editedPlans()[m.email] ?? m.plan;
      const agreed = editedAgreed()[m.email] ?? Number(m.agreed_price) ?? 0;
      const paid = editedPaid()[m.email] ?? Number(m.paid_amount) ?? 0;

      if (plan && plan !== m.plan) {
        await updateMemberPlan(m.email, plan);
      }
      await updateMemberFinancials(m.email, agreed, paid);

      toast.success(`Updated settings for ${m.name || m.email}!`);
      await loadMembers();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDelete(m: GatewayMember) {
    if (m.email === 'itstasdidnur@gmail.com') {
      toast.error('Cannot delete Master Admin Boss!');
      return;
    }
    if (!confirm(`Permanently remove ${m.email} from access list?`)) return;
    try {
      setActionBusy(true);
      await deleteMember(m.email);
      toast.success(`Removed ${m.email}`);
      await loadMembers();
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
    } finally {
      setActionBusy(false);
    }
  }

  async function handleWhitelistSubmit(e: Event) {
    e.preventDefault();
    if (!newEmail()) {
      toast.error('Email is required');
      return;
    }
    try {
      setActionBusy(true);
      await whitelistNewMember(
        newEmail(),
        newName() || newEmail().split('@')[0],
        newRole(),
        newPlan(),
      );
      toast.success(`Whitelisted ${newEmail()} successfully!`);
      setModalOpen(false);
      setNewEmail('');
      setNewName('');
      await loadMembers();
    } catch (err: any) {
      toast.error(err.message || 'Whitelisting failed');
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div class="admin-container">
      <Title>User Management — KYROS Gateway</Title>

      {/* Permission Check */}
      <Show
        when={isBoss()}
        fallback={
          <div
            class="admin-panel"
            style={{
              'text-align': 'center',
              padding: '60px 20px',
              'max-width': '600px',
              margin: '40px auto',
            }}
          >
            <div style={{ 'font-size': '48px', 'margin-bottom': '16px' }}>🔒</div>
            <h2 class="admin-header__title" style={{ 'font-size': '22px' }}>
              Access Denied
            </h2>
            <p class="admin-header__subtitle" style={{ 'margin-top': '8px', 'font-size': '14px' }}>
              User management is strictly restricted to Boss TN TAYYAB (
              <span style={{ color: '#2563eb', 'font-weight': '600' }}>itstasdidnur@gmail.com</span>
              ).
            </p>
            <A
              href="/overview"
              class="admin-btn-primary"
              style={{
                display: 'inline-flex',
                'margin-top': '20px',
                'text-decoration': 'none',
                padding: '10px 22px',
              }}
            >
              Return to Gateway Overview
            </A>
          </div>
        }
      >
        {/* Top Header matching Writerify */}
        <div class="admin-header">
          <div>
            <div class="admin-header__title-group">
              <span class="admin-header__icon">👥</span>
              <h1 class="admin-header__title">User management</h1>
              <span class="admin-header__badge">ZERO-TRUST GATEKEEPER</span>
            </div>
            <p class="admin-header__subtitle">
              Everyone who signed up for KYROS Gateway. Approve team members and configure plans.
            </p>
          </div>

          <div class="admin-header__actions">
            <button type="button" onClick={() => setModalOpen(true)} class="admin-btn-primary">
              + Whitelist Team Member
            </button>

            <button
              type="button"
              onClick={loadMembers}
              disabled={refreshing()}
              class="admin-btn-secondary"
            >
              <span
                style={{
                  transform: refreshing() ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.4s ease',
                  display: 'inline-block',
                }}
              >
                🔄
              </span>
              Refresh
            </button>
          </div>
        </div>

        {/* Section 1: Subscriptions & Revenue Badges */}
        <div class="admin-panel">
          <div
            style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              'margin-bottom': '16px',
              'flex-wrap': 'wrap',
              gap: '10px',
            }}
          >
            <div
              style={{
                'font-size': '12px',
                'font-weight': '700',
                color: 'hsl(var(--muted-foreground))',
                'letter-spacing': '0.05em',
              }}
            >
              SUBSCRIPTIONS & REVENUE OVERVIEW
            </div>

            <select
              value={period()}
              onChange={(e) => setPeriod(e.currentTarget.value as any)}
              class="admin-select"
              style={{ padding: '4px 10px', 'font-size': '11px' }}
            >
              <option value="lifetime">Lifetime</option>
              <option value="30d">Last 30 days</option>
              <option value="year">This year</option>
              <option value="last_year">Last year</option>
            </select>
          </div>

          {/* Badges Grid matching Writerify */}
          <div style={{ display: 'flex', gap: '10px', 'flex-wrap': 'wrap' }}>
            <div
              style={{
                background: 'hsl(var(--muted) / 0.5)',
                border: '1px solid hsl(var(--border))',
                padding: '10px 16px',
                'border-radius': '10px',
              }}
            >
              <div
                style={{
                  'font-size': '10px',
                  color: 'hsl(var(--muted-foreground))',
                  'font-weight': '700',
                }}
              >
                TOTAL USERS
              </div>
              <div
                style={{
                  'font-size': '20px',
                  'font-weight': '800',
                  color: 'hsl(var(--foreground))',
                }}
              >
                {totalCount()}
              </div>
            </div>

            <div
              style={{
                background: 'hsl(var(--muted) / 0.5)',
                border: '1px solid hsl(var(--border))',
                padding: '10px 16px',
                'border-radius': '10px',
              }}
            >
              <div
                style={{
                  'font-size': '10px',
                  color: 'hsl(var(--muted-foreground))',
                  'font-weight': '700',
                }}
              >
                FREE TRIAL
              </div>
              <div
                style={{
                  'font-size': '20px',
                  'font-weight': '800',
                  color: 'hsl(var(--foreground))',
                }}
              >
                {freeTrialCount()}
              </div>
            </div>

            <div
              style={{
                background: 'hsl(var(--muted) / 0.5)',
                border: '1px solid hsl(var(--border))',
                padding: '10px 16px',
                'border-radius': '10px',
              }}
            >
              <div style={{ 'font-size': '10px', color: '#0284c7', 'font-weight': '700' }}>
                MONTHLY
              </div>
              <div style={{ 'font-size': '20px', 'font-weight': '800', color: '#0284c7' }}>
                {monthlyCount()}
              </div>
            </div>

            <div
              style={{
                background: 'hsl(var(--muted) / 0.5)',
                border: '1px solid hsl(var(--border))',
                padding: '10px 16px',
                'border-radius': '10px',
              }}
            >
              <div style={{ 'font-size': '10px', color: '#d97706', 'font-weight': '700' }}>
                STARTER
              </div>
              <div style={{ 'font-size': '20px', 'font-weight': '800', color: '#d97706' }}>
                {starterCount()}
              </div>
            </div>

            <div
              style={{
                background: 'hsl(var(--muted) / 0.5)',
                border: '1px solid hsl(var(--border))',
                padding: '10px 16px',
                'border-radius': '10px',
              }}
            >
              <div style={{ 'font-size': '10px', color: '#059669', 'font-weight': '700' }}>
                GROWTH
              </div>
              <div style={{ 'font-size': '20px', 'font-weight': '800', color: '#059669' }}>
                {growthCount()}
              </div>
            </div>

            <div
              style={{
                background: 'hsl(var(--muted) / 0.5)',
                border: '1px solid hsl(var(--border))',
                padding: '10px 16px',
                'border-radius': '10px',
              }}
            >
              <div style={{ 'font-size': '10px', color: '#2563eb', 'font-weight': '700' }}>MAX</div>
              <div style={{ 'font-size': '20px', 'font-weight': '800', color: '#2563eb' }}>
                {maxCount()}
              </div>
            </div>

            <div
              style={{
                background: 'hsl(var(--muted) / 0.5)',
                border: '1px solid hsl(var(--border))',
                padding: '10px 16px',
                'border-radius': '10px',
              }}
            >
              <div style={{ 'font-size': '10px', color: '#7c3aed', 'font-weight': '700' }}>
                OWNER
              </div>
              <div style={{ 'font-size': '20px', 'font-weight': '800', color: '#7c3aed' }}>
                {ownerCount()}
              </div>
            </div>

            <Show when={pendingCount() > 0}>
              <div
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  padding: '10px 16px',
                  'border-radius': '10px',
                }}
              >
                <div style={{ 'font-size': '10px', color: '#b45309', 'font-weight': '700' }}>
                  ⚠️ PENDING APPROVAL
                </div>
                <div style={{ 'font-size': '20px', 'font-weight': '800', color: '#b45309' }}>
                  {pendingCount()}
                </div>
              </div>
            </Show>
          </div>
        </div>

        {/* Section 2: Users Management Table */}
        <div class="admin-panel" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Filters Bar */}
          <div
            style={{
              padding: '16px 22px',
              'border-bottom': '1px solid hsl(var(--border))',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              'flex-wrap': 'wrap',
              gap: '12px',
            }}
          >
            <div
              style={{ display: 'flex', 'align-items': 'center', gap: '10px', 'flex-wrap': 'wrap' }}
            >
              {/* Search input */}
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                class="admin-input"
                style={{ width: '240px' }}
              />

              {/* Plan filter */}
              <select
                value={planFilter()}
                onChange={(e) => setPlanFilter(e.currentTarget.value)}
                class="admin-select"
              >
                <option value="all">All plans</option>
                <option value="owner">Owner</option>
                <option value="max">Max</option>
                <option value="growth">Growth</option>
                <option value="starter">Starter</option>
                <option value="monthly">Monthly</option>
                <option value="free_trial">Free trial</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter()}
                onChange={(e) => setStatusFilter(e.currentTarget.value)}
                class="admin-select"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="revoked">Revoked / Suspended</option>
              </select>
            </div>

            <div style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))' }}>
              Showing {filteredMembers().length} of {members().length} accounts
            </div>
          </div>

          {/* Table Container */}
          <div class="admin-table-container" style={{ border: 'none', 'border-radius': '0' }}>
            <table class="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Status / Access</th>
                  <th>Agreed ($)</th>
                  <th>Paid ($)</th>
                  <th>Due ($)</th>
                  <th>Joined</th>
                  <th style={{ 'text-align': 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={!loading() && filteredMembers().length > 0}
                  fallback={
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          padding: '40px 18px',
                          'text-align': 'center',
                          color: 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {loading() ? 'Loading users...' : 'No users match criteria.'}
                      </td>
                    </tr>
                  }
                >
                  <For each={filteredMembers()}>
                    {(m) => {
                      const agreed = () => (editedAgreed()[m.email] ?? Number(m.agreed_price)) || 0;
                      const paid = () => (editedPaid()[m.email] ?? Number(m.paid_amount)) || 0;
                      const due = () => Math.max(0, agreed() - paid());
                      const joinedDate = m.created_at
                        ? new Date(m.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Oct 24, 2026';

                      return (
                        <tr
                          style={{
                            background:
                              m.status === 'pending' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                          }}
                        >
                          {/* User */}
                          <td>
                            <div style={{ 'font-weight': '600', color: 'hsl(var(--foreground))' }}>
                              {m.name || m.email.split('@')[0]}
                            </div>
                            <div style={{ 'font-size': '12px', color: '#0284c7' }}>{m.email}</div>
                            <Show when={m.mobile}>
                              <a
                                href={`https://wa.me/${m.mobile?.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  'font-size': '11px',
                                  color: '#059669',
                                  'text-decoration': 'none',
                                  display: 'inline-flex',
                                  'align-items': 'center',
                                  gap: '4px',
                                  'margin-top': '2px',
                                  'font-weight': '600',
                                }}
                              >
                                💬 WhatsApp ({m.mobile})
                              </a>
                            </Show>
                          </td>

                          {/* Plan selector matching Writerify */}
                          <td>
                            <select
                              value={editedPlans()[m.email] ?? m.plan ?? 'free_trial'}
                              onChange={(e) =>
                                setEditedPlans({
                                  ...editedPlans(),
                                  [m.email]: e.currentTarget.value,
                                })
                              }
                              class="admin-select"
                              style={{ padding: '5px 8px', 'font-size': '12px' }}
                            >
                              <option value="free_trial">free_trial</option>
                              <option value="monthly">monthly</option>
                              <option value="starter">starter</option>
                              <option value="growth">growth</option>
                              <option value="max">max</option>
                              <option value="owner">owner</option>
                            </select>
                          </td>

                          {/* Status / Access Actions */}
                          <td>
                            <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                              <span
                                class={
                                  m.status === 'approved'
                                    ? 'badge-approved'
                                    : m.status === 'pending'
                                      ? 'badge-pending'
                                      : 'badge-revoked'
                                }
                              >
                                {m.status || 'pending'}
                              </span>

                              <Show when={m.status !== 'approved'}>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(m.email)}
                                  disabled={actionBusy()}
                                  style={{
                                    background: '#059669',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '4px 10px',
                                    'border-radius': '6px',
                                    'font-size': '11px',
                                    'font-weight': '700',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Approve
                                </button>
                              </Show>

                              <Show
                                when={
                                  m.status === 'approved' && m.email !== 'itstasdidnur@gmail.com'
                                }
                              >
                                <button
                                  type="button"
                                  onClick={() => handleRevoke(m.email)}
                                  disabled={actionBusy()}
                                  style={{
                                    background: '#dc2626',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '4px 8px',
                                    'border-radius': '6px',
                                    'font-size': '11px',
                                    'font-weight': '600',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Revoke
                                </button>
                              </Show>
                            </div>
                          </td>

                          {/* Agreed Price */}
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={editedAgreed()[m.email] ?? Number(m.agreed_price) ?? 0}
                              onInput={(e) =>
                                setEditedAgreed({
                                  ...editedAgreed(),
                                  [m.email]: parseFloat(e.currentTarget.value) || 0,
                                })
                              }
                              class="admin-input"
                              style={{ width: '75px', padding: '5px 8px' }}
                            />
                          </td>

                          {/* Paid Amount */}
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={editedPaid()[m.email] ?? Number(m.paid_amount) ?? 0}
                              onInput={(e) =>
                                setEditedPaid({
                                  ...editedPaid(),
                                  [m.email]: parseFloat(e.currentTarget.value) || 0,
                                })
                              }
                              class="admin-input"
                              style={{ width: '75px', padding: '5px 8px' }}
                            />
                          </td>

                          {/* Due */}
                          <td>
                            <span class={due() <= 0 ? 'badge-approved' : 'badge-revoked'}>
                              {due() <= 0 ? 'settled' : `$${due()}`}
                            </span>
                          </td>

                          {/* Joined */}
                          <td
                            style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))' }}
                          >
                            {joinedDate}
                          </td>

                          {/* Actions */}
                          <td style={{ 'text-align': 'right' }}>
                            <div
                              style={{
                                display: 'flex',
                                'align-items': 'center',
                                'justify-content': 'flex-end',
                                gap: '8px',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleSaveRow(m)}
                                disabled={actionBusy()}
                                class="admin-btn-primary"
                                style={{ padding: '5px 12px', 'font-size': '11px' }}
                              >
                                Save
                              </button>
                              <Show when={m.email !== 'itstasdidnur@gmail.com'}>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(m)}
                                  disabled={actionBusy()}
                                  title="Delete user"
                                  style={{
                                    background: 'transparent',
                                    color: '#dc2626',
                                    border: 'none',
                                    cursor: 'pointer',
                                    'font-size': '15px',
                                    padding: '4px',
                                  }}
                                >
                                  🗑️
                                </button>
                              </Show>
                            </div>
                          </td>
                        </tr>
                      );
                    }}
                  </For>
                </Show>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Whitelist Team Member */}
        <Show when={modalOpen()}>
          <div class="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
            <div class="admin-modal" onClick={(e) => e.stopPropagation()}>
              <h3 class="admin-modal__title">+ Whitelist Team Member</h3>
              <p class="admin-modal__desc">
                Pre-authorize a team member so they can access Gateway without waiting for approval.
              </p>

              <form onSubmit={handleWhitelistSubmit}>
                <div style={{ 'margin-bottom': '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      'font-size': '12px',
                      'font-weight': '600',
                      'margin-bottom': '6px',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    Team Member Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="teammate@gmail.com"
                    value={newEmail()}
                    onInput={(e) => setNewEmail(e.currentTarget.value)}
                    class="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ 'margin-bottom': '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      'font-size': '12px',
                      'font-weight': '600',
                      'margin-bottom': '6px',
                      color: 'hsl(var(--foreground))',
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newName()}
                    onInput={(e) => setNewName(e.currentTarget.value)}
                    class="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    'grid-template-columns': '1fr 1fr',
                    gap: '12px',
                    'margin-bottom': '20px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        'font-size': '12px',
                        'font-weight': '600',
                        'margin-bottom': '6px',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      Role
                    </label>
                    <select
                      value={newRole()}
                      onChange={(e) => setNewRole(e.currentTarget.value)}
                      class="admin-select"
                      style={{ width: '100%' }}
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        'font-size': '12px',
                        'font-weight': '600',
                        'margin-bottom': '6px',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      Plan
                    </label>
                    <select
                      value={newPlan()}
                      onChange={(e) => setNewPlan(e.currentTarget.value)}
                      class="admin-select"
                      style={{ width: '100%' }}
                    >
                      <option value="free_trial">free_trial</option>
                      <option value="monthly">monthly</option>
                      <option value="starter">starter</option>
                      <option value="growth">growth</option>
                      <option value="max">max</option>
                      <option value="owner">owner</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', 'justify-content': 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    class="admin-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={actionBusy()} class="admin-btn-primary">
                    {actionBusy() ? 'Whitelisting...' : 'Whitelist Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default AdminUsers;
