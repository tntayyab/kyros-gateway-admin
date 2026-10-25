import { createSignal, onMount, onCleanup, Show, For, type Component } from 'solid-js';
import { Title } from '@solidjs/meta';
import { A, useNavigate } from '@solidjs/router';
import { authClient } from '../services/auth-client.js';
import { toast } from '../services/toast-store.js';
import { getAllMembers, updateMemberAsset, type GatewayMember } from '../services/admin-neon.js';
import '../styles/admin.css';

export const AdminAssets: Component = () => {
  const navigate = useNavigate();
  const session = authClient.useSession();
  const currentUserEmail = () => session()?.data?.user?.email?.toLowerCase() ?? '';
  const isBoss = () => currentUserEmail() === 'itstasdidnur@gmail.com';

  const [members, setMembers] = createSignal<GatewayMember[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [refreshing, setRefreshing] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [timeRange, setTimeRange] = createSignal<'lifetime' | '30d' | 'year' | 'last_year'>(
    'lifetime',
  );

  // Inline assets state map
  const [anydeskMap, setAnydeskMap] = createSignal<Record<string, string>>({});
  const [earningMap, setEarningMap] = createSignal<Record<string, boolean>>({});
  const [supportMap, setSupportMap] = createSignal<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = createSignal<string | null>(null);

  async function loadData() {
    try {
      setRefreshing(true);
      const data = await getAllMembers();
      setMembers(data);

      const anydesks: Record<string, string> = {};
      const earnings: Record<string, boolean> = {};
      const supports: Record<string, boolean> = {};

      for (const m of data) {
        anydesks[m.email] = m.anydesk_id ?? '';
        earnings[m.email] = !!m.is_earning;
        supports[m.email] = !!m.is_supported;
      }
      setAnydeskMap(anydesks);
      setEarningMap(earnings);
      setSupportMap(supports);
    } catch (err: any) {
      console.error('Failed to load assets data:', err);
      toast.error('Failed to load assets from Neon DB');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  onMount(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    onCleanup(() => clearInterval(interval));
  });

  // Filter paid users: all users or those with paid/plan
  const paidMembers = () =>
    members().filter((m) => m.status === 'approved' || m.plan !== 'free_trial');

  const filteredList = () => {
    let list = paidMembers().length > 0 ? paidMembers() : members();
    const q = searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.mobile && m.mobile.toLowerCase().includes(q)) ||
          (anydeskMap()[m.email] && anydeskMap()[m.email].toLowerCase().includes(q)),
      );
    }
    return list;
  };

  // KPIs
  const totalPaid = () => (paidMembers().length > 0 ? paidMembers().length : members().length);
  const earningCount = () => Object.values(earningMap()).filter(Boolean).length;
  const supportCount = () => Object.values(supportMap()).filter(Boolean).length;
  const earningPercent = () => {
    const total = totalPaid();
    if (total === 0) return 0;
    return Math.round((earningCount() / total) * 100);
  };
  const supportPercent = () => {
    const total = totalPaid();
    if (total === 0) return 0;
    return Math.round((supportCount() / total) * 100);
  };

  async function handleToggleEarning(m: GatewayMember) {
    const current = !!earningMap()[m.email];
    const next = !current;
    setEarningMap((prev) => ({ ...prev, [m.email]: next }));
    try {
      setSavingKey(`${m.email}-earning`);
      await updateMemberAsset(
        m.email,
        anydeskMap()[m.email] ?? m.anydesk_id,
        next,
        !!supportMap()[m.email],
      );
      toast.success(`${m.name || m.email} earning status set to ${next ? 'YES' : 'NO'}`);
    } catch (err: any) {
      setEarningMap((prev) => ({ ...prev, [m.email]: current }));
      toast.error(err.message || 'Failed to update earning');
    } finally {
      setSavingKey(null);
    }
  }

  async function handleToggleSupport(m: GatewayMember) {
    const current = !!supportMap()[m.email];
    const next = !current;
    setSupportMap((prev) => ({ ...prev, [m.email]: next }));
    try {
      setSavingKey(`${m.email}-support`);
      await updateMemberAsset(
        m.email,
        anydeskMap()[m.email] ?? m.anydesk_id,
        !!earningMap()[m.email],
        next,
      );
      toast.success(`${m.name || m.email} support status set to ${next ? 'YES' : 'NO'}`);
    } catch (err: any) {
      setSupportMap((prev) => ({ ...prev, [m.email]: current }));
      toast.error(err.message || 'Failed to update support');
    } finally {
      setSavingKey(null);
    }
  }

  async function handleAnydeskBlur(m: GatewayMember) {
    const val = anydeskMap()[m.email];
    if (val === m.anydesk_id) return;
    try {
      setSavingKey(`${m.email}-anydesk`);
      await updateMemberAsset(m.email, val, !!earningMap()[m.email], !!supportMap()[m.email]);
      toast.success(`AnyDesk ID saved for ${m.name || m.email}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save AnyDesk ID');
    } finally {
      setSavingKey(null);
    }
  }

  function getTenure(created_at?: string) {
    if (!created_at) return '1 day with us';
    const diffMs = Date.now() - new Date(created_at).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Joined today';
    if (diffDays === 1) return '1 day with us';
    if (diffDays < 30) return `${diffDays} days with us`;
    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths === 1 ? '1 month with us' : `${diffMonths} months with us`;
  }

  return (
    <div class="admin-container">
      <Title>Assets — KYROS Gateway</Title>

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
              Assets view is strictly restricted to Boss TN TAYYAB (
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
              <span class="admin-header__icon">💼</span>
              <h1 class="admin-header__title">Assets</h1>
              <span class="admin-header__badge">REMOTE ASSETS</span>
            </div>
            <p class="admin-header__subtitle">
              Paid users — contact details, AnyDesk access, and who's earning online.
            </p>
          </div>

          {/* Time range dropdown & refresh matching Writerify */}
          <div class="admin-header__actions">
            <select
              value={timeRange()}
              onChange={(e) => setTimeRange(e.currentTarget.value as any)}
              class="admin-select"
            >
              <option value="lifetime">Lifetime</option>
              <option value="30d">Last 30 days</option>
              <option value="year">This year</option>
              <option value="last_year">Last year</option>
            </select>

            <button
              type="button"
              onClick={loadData}
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

        {/* Analytics Cards: Earning online & Support coverage */}
        <div class="admin-grid-2">
          {/* Card 1: Earning online */}
          <div
            class="admin-panel"
            style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              gap: '16px',
              'margin-bottom': '0',
            }}
          >
            <div>
              <div
                style={{
                  'font-size': '12px',
                  'font-weight': '700',
                  color: '#059669',
                  'letter-spacing': '0.05em',
                }}
              >
                EARNING ONLINE
              </div>
              <div
                style={{
                  'font-size': '28px',
                  'font-weight': '800',
                  color: 'hsl(var(--foreground))',
                  'margin-top': '6px',
                }}
              >
                {earningCount()} / {totalPaid()}
              </div>
              <div
                style={{
                  'font-size': '12px',
                  color: 'hsl(var(--muted-foreground))',
                  'margin-top': '4px',
                }}
              >
                <span style={{ color: '#059669', 'font-weight': '700' }}>{earningPercent()}%</span>{' '}
                earning, {Math.max(0, totalPaid() - earningCount())} not yet
              </div>
            </div>

            {/* Circular Gauge Representation */}
            <div
              style={{
                width: '64px',
                height: '64px',
                'border-radius': '50%',
                background: `conic-gradient(#10b981 ${earningPercent()}%, hsl(var(--muted)) 0%)`,
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                padding: '6px',
                'flex-shrink': '0',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  'border-radius': '50%',
                  background: 'hsl(var(--card))',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'font-size': '12px',
                  'font-weight': '800',
                  color: '#059669',
                }}
              >
                {earningPercent()}%
              </div>
            </div>
          </div>

          {/* Card 2: Support coverage */}
          <div
            class="admin-panel"
            style={{
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              gap: '16px',
              'margin-bottom': '0',
            }}
          >
            <div>
              <div
                style={{
                  'font-size': '12px',
                  'font-weight': '700',
                  color: '#0284c7',
                  'letter-spacing': '0.05em',
                }}
              >
                SUPPORT COVERAGE
              </div>
              <div
                style={{
                  'font-size': '28px',
                  'font-weight': '800',
                  color: 'hsl(var(--foreground))',
                  'margin-top': '6px',
                }}
              >
                {supportCount()} / {totalPaid()}
              </div>
              <div
                style={{
                  'font-size': '12px',
                  color: 'hsl(var(--muted-foreground))',
                  'margin-top': '4px',
                }}
              >
                <span style={{ color: '#0284c7', 'font-weight': '700' }}>{supportPercent()}%</span>{' '}
                supported, {Math.max(0, totalPaid() - supportCount())} not yet
              </div>
            </div>

            {/* Circular Gauge Representation */}
            <div
              style={{
                width: '64px',
                height: '64px',
                'border-radius': '50%',
                background: `conic-gradient(#0284c7 ${supportPercent()}%, hsl(var(--muted)) 0%)`,
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                padding: '6px',
                'flex-shrink': '0',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  'border-radius': '50%',
                  background: 'hsl(var(--card))',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'font-size': '12px',
                  'font-weight': '800',
                  color: '#0284c7',
                }}
              >
                {supportPercent()}%
              </div>
            </div>
          </div>
        </div>

        {/* Data Table: PAID USERS & ASSETS */}
        <div class="admin-panel" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Table Header Controls */}
          <div
            style={{
              padding: '18px 24px',
              'border-bottom': '1px solid hsl(var(--border))',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'space-between',
              'flex-wrap': 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                <h2 class="admin-panel__title" style={{ 'font-size': '16px' }}>
                  PAID USERS & ASSETS ({paidMembers().length})
                </h2>
                <span class="badge-approved" style={{ 'font-size': '11px', padding: '2px 8px' }}>
                  Auto-Save Active
                </span>
              </div>
              <p class="admin-panel__desc">
                Toggles and AnyDesk edits save automatically to Neon Cloud DB.
              </p>
            </div>

            {/* Search Box */}
            <input
              type="text"
              placeholder="Search user, mobile, AnyDesk..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="admin-input"
              style={{ width: '240px' }}
            />
          </div>

          {/* Table Container */}
          <div class="admin-table-container" style={{ border: 'none', 'border-radius': '0' }}>
            <table class="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>MOBILE</th>
                  <th>ANYDESK ID</th>
                  <th>Earning</th>
                  <th>Support</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={!loading() && filteredList().length > 0}
                  fallback={
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: '40px 18px',
                          'text-align': 'center',
                          color: 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {loading() ? 'Loading user assets...' : 'No users match criteria.'}
                      </td>
                    </tr>
                  }
                >
                  <For each={filteredList()}>
                    {(m) => {
                      const isEarning = () => !!earningMap()[m.email];
                      const isSupported = () => !!supportMap()[m.email];
                      const anydesk = () => anydeskMap()[m.email] ?? m.anydesk_id ?? '';
                      const joinedFormatted = m.created_at
                        ? new Date(m.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Oct 24, 2026';

                      return (
                        <tr>
                          {/* User */}
                          <td>
                            <div style={{ 'font-weight': '600', color: 'hsl(var(--foreground))' }}>
                              {m.name || m.email.split('@')[0]}
                            </div>
                            <div style={{ 'font-size': '12px', color: '#0284c7' }}>{m.email}</div>
                          </td>

                          {/* Mobile */}
                          <td>
                            <Show
                              when={m.mobile}
                              fallback={
                                <span
                                  style={{
                                    'font-size': '12px',
                                    color: 'hsl(var(--muted-foreground))',
                                  }}
                                >
                                  —
                                </span>
                              }
                            >
                              <a
                                href={`https://wa.me/${m.mobile?.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  'font-size': '12px',
                                  color: '#059669',
                                  'text-decoration': 'none',
                                  display: 'inline-flex',
                                  'align-items': 'center',
                                  gap: '5px',
                                  'font-weight': '600',
                                }}
                              >
                                <span>💬</span> {m.mobile}
                              </a>
                            </Show>
                          </td>

                          {/* AnyDesk ID Input */}
                          <td>
                            <div style={{ display: 'flex', 'align-items': 'center', gap: '6px' }}>
                              <input
                                type="text"
                                placeholder="e.g. 123 456 789"
                                value={anydesk()}
                                onInput={(e) => {
                                  const val = e.currentTarget.value;
                                  setAnydeskMap((prev) => ({ ...prev, [m.email]: val }));
                                }}
                                onBlur={() => handleAnydeskBlur(m)}
                                class="admin-input"
                                style={{ width: '140px', padding: '5px 10px' }}
                              />
                              <Show when={savingKey() === `${m.email}-anydesk`}>
                                <span style={{ 'font-size': '10px', color: '#0284c7' }}>
                                  saving...
                                </span>
                              </Show>
                            </div>
                          </td>

                          {/* Earning Interactive Toggle Switch */}
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleEarning(m)}
                              style={{
                                display: 'inline-flex',
                                'align-items': 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                'border-radius': '9999px',
                                border: '1px solid',
                                cursor: 'pointer',
                                'font-size': '11px',
                                'font-weight': '700',
                                background: isEarning() ? '#d1fae5' : 'hsl(var(--muted))',
                                color: isEarning() ? '#047857' : 'hsl(var(--muted-foreground))',
                                borderColor: isEarning() ? '#6ee7b7' : 'hsl(var(--border))',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  'border-radius': '50%',
                                  background: isEarning() ? '#059669' : '#94a3b8',
                                }}
                              />
                              {isEarning() ? 'Yes' : 'No'}
                            </button>
                          </td>

                          {/* Support Interactive Toggle Switch */}
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleSupport(m)}
                              style={{
                                display: 'inline-flex',
                                'align-items': 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                'border-radius': '9999px',
                                border: '1px solid',
                                cursor: 'pointer',
                                'font-size': '11px',
                                'font-weight': '700',
                                background: isSupported() ? '#dbeafe' : 'hsl(var(--muted))',
                                color: isSupported() ? '#1d4ed8' : 'hsl(var(--muted-foreground))',
                                borderColor: isSupported() ? '#93c5fd' : 'hsl(var(--border))',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  'border-radius': '50%',
                                  background: isSupported() ? '#2563eb' : '#94a3b8',
                                }}
                              />
                              {isSupported() ? 'Yes' : 'No'}
                            </button>
                          </td>

                          {/* Joined + Tenure Pill matching Writerify */}
                          <td>
                            <div style={{ 'font-size': '12px', color: 'hsl(var(--foreground))' }}>
                              {joinedFormatted}
                            </div>
                            <div
                              style={{
                                display: 'inline-block',
                                'font-size': '10px',
                                color: 'hsl(var(--muted-foreground))',
                                background: 'hsl(var(--muted))',
                                padding: '2px 6px',
                                'border-radius': '4px',
                                'margin-top': '3px',
                                border: '1px solid hsl(var(--border))',
                                'font-weight': '600',
                              }}
                            >
                              {getTenure(m.created_at)}
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
      </Show>
    </div>
  );
};

export default AdminAssets;
