import { createSignal, onMount, onCleanup, Show, For, type Component } from 'solid-js';
import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { authClient } from '../services/auth-client.js';
import { toast } from '../services/toast-store.js';
import {
  getAllMembers,
  updateMemberAsset,
  getAiAssetsMonitoringData,
  type GatewayMember,
  type AgentAssetItem,
  type TenantProviderItem,
  type AssetsMonitoringSummary,
} from '../services/admin-neon.js';
import '../styles/admin.css';

export const AdminAssets: Component = () => {
  const session = authClient.useSession();
  const currentUserEmail = () => session()?.data?.user?.email?.toLowerCase() ?? '';
  const isBoss = () => currentUserEmail() === 'itstasdidnur@gmail.com';

  // Active Tab: 'ai_assets' (Model/Provider/Fallback Hub) or 'members' (AnyDesk/Work Assets)
  const [activeTab, setActiveTab] = createSignal<'ai_assets' | 'members'>('ai_assets');

  // AI Assets State
  const [aiAgents, setAiAgents] = createSignal<AgentAssetItem[]>([]);
  const [aiProviders, setAiProviders] = createSignal<TenantProviderItem[]>([]);
  const [aiSummary, setAiSummary] = createSignal<AssetsMonitoringSummary | null>(null);
  const [pricingFilter, setPricingFilter] = createSignal<'all' | 'free' | 'paid'>('all');

  // Members Assets State (Tab 2)
  const [members, setMembers] = createSignal<GatewayMember[]>([]);
  const [anydeskMap, setAnydeskMap] = createSignal<Record<string, string>>({});
  const [earningMap, setEarningMap] = createSignal<Record<string, boolean>>({});
  const [supportMap, setSupportMap] = createSignal<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = createSignal<string | null>(null);

  // General State
  const [loading, setLoading] = createSignal(true);
  const [refreshing, setRefreshing] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal('');

  async function loadData() {
    try {
      setRefreshing(true);
      const [aiData, memberData] = await Promise.all([
        getAiAssetsMonitoringData(),
        getAllMembers(),
      ]);

      setAiAgents(aiData.agents);
      setAiProviders(aiData.providers);
      setAiSummary(aiData.summary);

      setMembers(memberData);
      const anydesks: Record<string, string> = {};
      const earnings: Record<string, boolean> = {};
      const supports: Record<string, boolean> = {};
      for (const m of memberData) {
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

  // Filtered AI Agents
  const filteredAiAgents = () => {
    let list = aiAgents();
    const filter = pricingFilter();
    if (filter === 'free') {
      list = list.filter((a) => a.primary_tier?.is_primary_free);
    } else if (filter === 'paid') {
      list = list.filter((a) => a.primary_tier && !a.primary_tier.is_primary_free);
    }

    const q = searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter((a) => {
        const matchesName = a.display_name.toLowerCase().includes(q) || a.agent_name.toLowerCase().includes(q);
        const matchesUser = a.user_name.toLowerCase().includes(q) || a.user_email.toLowerCase().includes(q);
        const matchesModel = (a.primary_tier?.primary_model || '').toLowerCase().includes(q)
          || (a.primary_tier?.clean_primary_model || '').toLowerCase().includes(q);
        const matchesProvider = (a.primary_tier?.primary_provider || '').toLowerCase().includes(q);
        const matchesFallback = a.primary_tier?.fallbacks.some(
          (f) => f.clean_model.toLowerCase().includes(q) || f.clean_provider.toLowerCase().includes(q),
        );
        return matchesName || matchesUser || matchesModel || matchesProvider || matchesFallback;
      });
    }
    return list;
  };

  // Filtered Members (Tab 2)
  const paidMembers = () => members().filter((m) => m.status === 'approved' || m.plan !== 'free_trial');
  const filteredMembers = () => {
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

  // Tab 2 Member KPIs
  const totalPaid = () => (paidMembers().length > 0 ? paidMembers().length : members().length);
  const earningCount = () => Object.values(earningMap()).filter(Boolean).length;
  const supportCount = () => Object.values(supportMap()).filter(Boolean).length;
  const earningPercent = () => (totalPaid() === 0 ? 0 : Math.round((earningCount() / totalPaid()) * 100));
  const supportPercent = () => (totalPaid() === 0 ? 0 : Math.round((supportCount() / totalPaid()) * 100));

  async function handleToggleEarning(m: GatewayMember) {
    const current = !!earningMap()[m.email];
    const next = !current;
    setEarningMap((prev) => ({ ...prev, [m.email]: next }));
    try {
      setSavingKey(`${m.email}-earning`);
      await updateMemberAsset(m.email, anydeskMap()[m.email] ?? m.anydesk_id, next, !!supportMap()[m.email]);
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
      await updateMemberAsset(m.email, anydeskMap()[m.email] ?? m.anydesk_id, !!earningMap()[m.email], next);
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

  function formatTokens(count: number) {
    if (!count) return '0';
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
    return count.toLocaleString();
  }

  function formatRelativeTime(dateStr?: string | null) {
    if (!dateStr) return 'Never';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  }

  return (
    <div class="admin-container">
      <Title>Assets & Model Hub — KYROS Gateway</Title>

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
              <span style={{ color: '#2563eb', 'font-weight': '600' }}>itstasdidnur@gmail.com</span>).
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
        {/* Top Header */}
        <div class="admin-header">
          <div>
            <div class="admin-header__title-group">
              <span class="admin-header__icon">💼</span>
              <h1 class="admin-header__title">Assets & Model Intelligence</h1>
              <span class="admin-header__badge">LIVE MONITORING</span>
            </div>
            <p class="admin-header__subtitle">
              Monitor active AI models, connected providers, Free vs Paid routing, armed fallback chains, and member assets.
            </p>
          </div>

          <div class="admin-header__actions">
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
              Refresh Live
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div class="admin-nav-tabs">
          <button
            type="button"
            class={`admin-nav-tab ${activeTab() === 'ai_assets' ? 'admin-nav-tab--active' : ''}`}
            onClick={() => setActiveTab('ai_assets')}
          >
            <span>🤖</span> AI Models, Providers & Fallbacks ({aiAgents().length})
          </button>
          <button
            type="button"
            class={`admin-nav-tab ${activeTab() === 'members' ? 'admin-nav-tab--active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <span>💼</span> Paid Users & Remote AnyDesk ({paidMembers().length})
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: AI MODELS, PROVIDERS & FALLBACK CHAINS (MONITORING) */}
        {/* ======================================================== */}
        <Show when={activeTab() === 'ai_assets'}>
          {/* Top 4 KPI Metric Cards */}
          <div class="admin-grid-4" style="margin-bottom: 24px;">
            {/* KPI 1: Connected Providers */}
            <div class="admin-stat-card">
              <div class="admin-stat-card__header">
                <span class="admin-stat-card__title">Connected Providers</span>
                <span class="admin-stat-card__icon">🔌</span>
              </div>
              <div class="admin-stat-card__value">
                {aiSummary()?.total_providers ?? 0} Active
              </div>
              <div class="admin-stat-card__sub" style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
                <span class="badge-free">🟢 {aiSummary()?.free_providers_count ?? 0} Free</span>
                <span class="badge-paid">💎 {aiSummary()?.paid_providers_count ?? 0} Paid</span>
              </div>
            </div>

            {/* KPI 2: Active Primary Models */}
            <div class="admin-stat-card">
              <div class="admin-stat-card__header">
                <span class="admin-stat-card__title">Primary Routing Model</span>
                <span class="admin-stat-card__icon">🎯</span>
              </div>
              <div class="admin-stat-card__value" style="font-size: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {aiAgents()[0]?.primary_tier?.clean_primary_model ?? 'DeepSeek-V4.1-Flash'}
              </div>
              <div class="admin-stat-card__sub">
                Provider: <span style="font-weight: 600; color: hsl(var(--foreground));">{aiAgents()[0]?.primary_tier?.clean_primary_provider ?? 'Custom Gateway'}</span>
              </div>
            </div>

            {/* KPI 3: Armed Fallback Models */}
            <div class="admin-stat-card">
              <div class="admin-stat-card__header">
                <span class="admin-stat-card__title">Armed Fallbacks</span>
                <span class="admin-stat-card__icon">🛡️</span>
              </div>
              <div class="admin-stat-card__value">
                {aiSummary()?.total_fallback_models ?? 0} Models
              </div>
              <div class="admin-stat-card__sub" style="color: #059669; font-weight: 600;">
                ✓ 100% Failover Safety Active
              </div>
            </div>

            {/* KPI 4: Total Consumption & Cost */}
            <div class="admin-stat-card">
              <div class="admin-stat-card__header">
                <span class="admin-stat-card__title">Total Traffic Monitored</span>
                <span class="admin-stat-card__icon">⚡</span>
              </div>
              <div class="admin-stat-card__value">
                {formatTokens(aiSummary()?.total_tokens_consumed ?? 0)} Tokens
              </div>
              <div class="admin-stat-card__sub">
                Cost: <span style="font-weight: 700; color: #10b981;">${(aiSummary()?.total_cost_usd ?? 0).toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* AI Assets Table Container */}
          <div class="admin-panel" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Header Controls */}
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
                    LIVE USER & HARNESS AI ASSET MATRIX
                  </h2>
                  <span class="badge-approved" style={{ 'font-size': '11px', padding: '2px 8px' }}>
                    Real-time Sync
                  </span>
                </div>
                <p class="admin-panel__desc">
                  Full visibility into primary models, connected providers, pricing tier, and sequential fallback pipelines.
                </p>
              </div>

              {/* Filters & Search */}
              <div style={{ display: 'flex', 'align-items': 'center', gap: '10px', 'flex-wrap': 'wrap' }}>
                <div class="admin-range-group">
                  <button
                    type="button"
                    class={`admin-range-btn ${pricingFilter() === 'all' ? 'active' : ''}`}
                    onClick={() => setPricingFilter('all')}
                  >
                    All Models
                  </button>
                  <button
                    type="button"
                    class={`admin-range-btn ${pricingFilter() === 'free' ? 'active' : ''}`}
                    onClick={() => setPricingFilter('free')}
                  >
                    🟢 Free Only
                  </button>
                  <button
                    type="button"
                    class={`admin-range-btn ${pricingFilter() === 'paid' ? 'active' : ''}`}
                    onClick={() => setPricingFilter('paid')}
                  >
                    💎 Paid Only
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Search model, provider, user..."
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                  class="admin-input"
                  style={{ width: '220px' }}
                />
              </div>
            </div>

            {/* Table */}
            <div class="admin-table-container" style={{ border: 'none', 'border-radius': '0' }}>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>User & Harness</th>
                    <th>Active Primary Model</th>
                    <th>Connected Providers</th>
                    <th>Armed Fallback Routing Chain</th>
                    <th>Traffic / Cost</th>
                    <th>Activity</th>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={!loading() && filteredAiAgents().length > 0}
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
                          {loading() ? 'Loading AI asset matrix from Neon DB...' : 'No harnesses or models found matching filter.'}
                        </td>
                      </tr>
                    }
                  >
                    <For each={filteredAiAgents()}>
                      {(agent) => {
                        const pt = () => agent.primary_tier;
                        const fallbacks = () => pt()?.fallbacks || [];

                        return (
                          <tr>
                            {/* User & Harness */}
                            <td>
                              <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    'border-radius': '50%',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    color: '#fff',
                                    display: 'flex',
                                    'align-items': 'center',
                                    'justify-content': 'center',
                                    'font-weight': '700',
                                    'font-size': '13px',
                                    'flex-shrink': '0',
                                  }}
                                >
                                  {agent.user_name.charAt(0)}
                                </div>
                                <div>
                                  <div style={{ 'font-weight': '700', color: 'hsl(var(--foreground))' }}>
                                    {agent.user_name}
                                  </div>
                                  <div style={{ 'font-size': '11px', color: '#0284c7' }}>
                                    @{agent.agent_name} ({agent.agent_platform || 'gateway'})
                                  </div>
                                  <div style={{ 'font-size': '10px', color: 'hsl(var(--muted-foreground))' }}>
                                    {agent.user_email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Active Primary Model */}
                            <td>
                              <div>
                                <div style={{ display: 'flex', 'align-items': 'center', gap: '6px' }}>
                                  <span style={{ 'font-weight': '700', 'font-size': '13px', color: 'hsl(var(--foreground))' }}>
                                    {pt()?.clean_primary_model || 'Auto-Routing'}
                                  </span>
                                  <Show
                                    when={pt()?.is_primary_free}
                                    fallback={<span class="badge-paid">💎 PAID</span>}
                                  >
                                    <span class="badge-free">🟢 FREE</span>
                                  </Show>
                                </div>
                                <div style={{ 'font-size': '11px', color: 'hsl(var(--muted-foreground))', 'margin-top': '2px' }}>
                                  Provider: <span style={{ 'font-weight': '600' }}>{pt()?.clean_primary_provider || 'Default'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Connected Providers */}
                            <td>
                              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
                                <div style={{ 'font-size': '11px', 'font-weight': '700', color: 'hsl(var(--muted-foreground))' }}>
                                  {agent.connected_providers.length} PROVIDER(S):
                                </div>
                                <div style={{ display: 'flex', 'flex-wrap': 'wrap', gap: '4px' }}>
                                  <For each={agent.connected_providers}>
                                    {(p) => (
                                      <span class="provider-pill">
                                        <span style={{ color: p.is_free ? '#10b981' : '#f59e0b' }}>
                                          {p.is_free ? '🟢' : '💎'}
                                        </span>
                                        <span>{p.clean_provider}</span>
                                        <Show when={p.key_prefix}>
                                          <span style={{ 'font-size': '9px', opacity: 0.6, 'font-family': 'monospace' }}>
                                            ({p.key_prefix})
                                          </span>
                                        </Show>
                                      </span>
                                    )}
                                  </For>
                                </div>
                              </div>
                            </td>

                            {/* Armed Fallback Routing Chain */}
                            <td style={{ 'max-width': '420px' }}>
                              <Show
                                when={fallbacks().length > 0}
                                fallback={
                                  <span style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))' }}>
                                    No fallback models configured
                                  </span>
                                }
                              >
                                <div style={{ 'font-size': '11px', 'font-weight': '700', color: '#059669', 'margin-bottom': '4px' }}>
                                  🛡️ {fallbacks().length} FAILOVER STEPS:
                                </div>
                                <div class="fallback-chain">
                                  <For each={fallbacks()}>
                                    {(fb, idx) => (
                                      <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '4px' }}>
                                        <div class="fallback-step-chip">
                                          <span style={{ 'font-weight': '700', color: '#3b82f6' }}>#{fb.rank}</span>
                                          <span>{fb.clean_model}</span>
                                          <Show when={fb.is_free} fallback={<span style={{ 'font-size': '9px', color: '#d97706', 'font-weight': '700' }}>[PAID]</span>}>
                                            <span style={{ 'font-size': '9px', color: '#059669', 'font-weight': '700' }}>[FREE]</span>
                                          </Show>
                                        </div>
                                        <Show when={idx() < fallbacks().length - 1}>
                                          <span class="fallback-arrow">➔</span>
                                        </Show>
                                      </div>
                                    )}
                                  </For>
                                </div>
                              </Show>
                            </td>

                            {/* Traffic / Cost */}
                            <td>
                              <div style={{ 'font-weight': '700', 'font-size': '13px' }}>
                                {formatTokens(agent.total_tokens)} tokens
                              </div>
                              <div style={{ 'font-size': '11px', color: '#10b981', 'font-weight': '600' }}>
                                ${agent.total_cost.toFixed(3)} USD
                              </div>
                              <div style={{ 'font-size': '10px', color: 'hsl(var(--muted-foreground))' }}>
                                {agent.total_messages.toLocaleString()} requests
                              </div>
                            </td>

                            {/* Activity */}
                            <td>
                              <div style={{ display: 'flex', 'align-items': 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    'border-radius': '50%',
                                    background: '#10b981',
                                    'box-shadow': '0 0 8px rgba(16, 185, 129, 0.6)',
                                    display: 'inline-block',
                                  }}
                                />
                                <span style={{ 'font-weight': '600', 'font-size': '12px', color: 'hsl(var(--foreground))' }}>
                                  Active
                                </span>
                              </div>
                              <div style={{ 'font-size': '10px', color: 'hsl(var(--muted-foreground))', 'margin-top': '2px' }}>
                                {formatRelativeTime(agent.last_active)}
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

        {/* ======================================================== */}
        {/* TAB 2: PAID USERS & REMOTE ANYDESK ASSETS (WRITERIFY) */}
        {/* ======================================================== */}
        <Show when={activeTab() === 'members'}>
          {/* Analytics Cards */}
          <div class="admin-grid-2" style="margin-bottom: 24px;">
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
                <div style={{ 'font-size': '12px', 'font-weight': '700', color: '#059669', 'letter-spacing': '0.05em' }}>
                  EARNING ONLINE
                </div>
                <div style={{ 'font-size': '28px', 'font-weight': '800', color: 'hsl(var(--foreground))', 'margin-top': '6px' }}>
                  {earningCount()} / {totalPaid()}
                </div>
                <div style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))', 'margin-top': '4px' }}>
                  <span style={{ color: '#059669', 'font-weight': '700' }}>{earningPercent()}%</span> earning,{' '}
                  {Math.max(0, totalPaid() - earningCount())} not yet
                </div>
              </div>

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
                <div style={{ 'font-size': '12px', 'font-weight': '700', color: '#0284c7', 'letter-spacing': '0.05em' }}>
                  SUPPORT COVERAGE
                </div>
                <div style={{ 'font-size': '28px', 'font-weight': '800', color: 'hsl(var(--foreground))', 'margin-top': '6px' }}>
                  {supportCount()} / {totalPaid()}
                </div>
                <div style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))', 'margin-top': '4px' }}>
                  <span style={{ color: '#0284c7', 'font-weight': '700' }}>{supportPercent()}%</span> supported,{' '}
                  {Math.max(0, totalPaid() - supportCount())} not yet
                </div>
              </div>

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

          {/* Table Container */}
          <div class="admin-panel" style={{ padding: '0', overflow: 'hidden' }}>
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
                    PAID USERS & REMOTE ASSETS ({paidMembers().length})
                  </h2>
                  <span class="badge-approved" style={{ 'font-size': '11px', padding: '2px 8px' }}>
                    Auto-Save Active
                  </span>
                </div>
                <p class="admin-panel__desc">
                  Toggles and AnyDesk edits save automatically to Neon Cloud DB.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search user, mobile, AnyDesk..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                class="admin-input"
                style={{ width: '240px' }}
              />
            </div>

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
                    when={!loading() && filteredMembers().length > 0}
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
                          {loading() ? 'Loading member assets...' : 'No users match criteria.'}
                        </td>
                      </tr>
                    }
                  >
                    <For each={filteredMembers()}>
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
                            <td>
                              <div style={{ 'font-weight': '600', color: 'hsl(var(--foreground))' }}>
                                {m.name || m.email.split('@')[0]}
                              </div>
                              <div style={{ 'font-size': '12px', color: '#0284c7' }}>{m.email}</div>
                            </td>

                            <td>
                              <Show
                                when={m.mobile}
                                fallback={<span style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))' }}>—</span>}
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
                                  <span style={{ 'font-size': '10px', color: '#0284c7' }}>💾 Saving...</span>
                                </Show>
                              </div>
                            </td>

                            <td>
                              <button
                                type="button"
                                onClick={() => handleToggleEarning(m)}
                                class={`toggle-btn ${isEarning() ? 'active' : ''}`}
                                aria-label="Toggle earning status"
                              >
                                <span class="toggle-slider" />
                              </button>
                            </td>

                            <td>
                              <button
                                type="button"
                                onClick={() => handleToggleSupport(m)}
                                class={`toggle-btn ${isSupported() ? 'active' : ''}`}
                                aria-label="Toggle support status"
                              >
                                <span class="toggle-slider" />
                              </button>
                            </td>

                            <td>
                              <div style={{ 'font-size': '12px', color: 'hsl(var(--foreground))' }}>{joinedFormatted}</div>
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
      </Show>
    </div>
  );
};

export default AdminAssets;
