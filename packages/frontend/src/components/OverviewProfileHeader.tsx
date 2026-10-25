import { createSignal, createEffect, onMount, onCleanup, Show, type Component } from 'solid-js';
import { A } from '@solidjs/router';
import { authClient } from '../services/auth-client.js';
import { getUserProfile, type UserProfile } from '../services/user-profile.js';
import '../styles/profile.css';

const OverviewProfileHeader: Component = () => {
  const session = authClient.useSession();
  const [profile, setProfile] = createSignal<UserProfile | null>(null);

  const userEmail = () => session()?.data?.user?.email ?? '';
  const userName = () => session()?.data?.user?.name ?? '';

  const loadProfile = async (email: string, name: string) => {
    if (!email) {
      setProfile(null);
      return;
    }
    const prof = await getUserProfile(email, name);
    // Only show if the user has explicitly configured their profile in Account settings
    if (prof && prof.is_configured) {
      setProfile(prof);
    } else {
      setProfile(null);
    }
  };

  createEffect(() => {
    const email = userEmail();
    const name = userName();
    if (email) {
      void loadProfile(email, name);
    } else {
      setProfile(null);
    }
  });

  onMount(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<UserProfile>).detail;
      if (detail && detail.is_configured) {
        setProfile(detail);
      }
    };
    window.addEventListener('kyros-profile-updated', handleUpdate);
    onCleanup(() => {
      window.removeEventListener('kyros-profile-updated', handleUpdate);
    });
  });

  const isSuperAdmin = () => {
    const email = (profile()?.email || userEmail()).toLowerCase();
    const name = (profile()?.display_name || '').toUpperCase();
    return email === 'itstasdidnur@gmail.com' || name.includes('TN TAYYAB');
  };

  // Only render if profile is explicitly configured by user in Account settings
  return (
    <Show when={profile() && profile()?.is_configured}>
      {(prof) => (
        <section class="yt-profile-card" aria-label="User Profile Overview">
          {/* Cover Banner */}
          <div
            class="yt-profile-banner"
            style={{
              'background-image': `url("${prof().banner_url}")`,
            }}
          >
            <div class="yt-profile-banner__overlay" />
            <div class="yt-profile-banner__floating-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>KYROS Enterprise Gateway</span>
            </div>
          </div>

          {/* Profile Body */}
          <div class="yt-profile-body">
            <div class="yt-profile-avatar-row">
              <div class="yt-profile-avatar-wrapper">
                <img
                  src={prof().avatar_url}
                  alt={prof().display_name}
                  class="yt-profile-avatar-img"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';
                  }}
                />
                <span class="yt-profile-online-badge" title="Active on Gateway" />
              </div>

              <div class="yt-profile-actions">
                <A href="/account" class="yt-btn-customize">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Customize Profile
                </A>
              </div>
            </div>

            <div class="yt-profile-info">
              <div class="yt-profile-name-row">
                <h2 class="yt-profile-name">{prof().display_name}</h2>
                <Show
                  when={isSuperAdmin()}
                  fallback={
                    <span class="yt-profile-badge-member">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Verified Member
                    </span>
                  }
                >
                  <span class="yt-profile-badge-superadmin">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                    </svg>
                    👑 Super Admin
                  </span>
                </Show>
              </div>

              <Show when={prof().headline}>
                <p class="yt-profile-headline">{prof().headline}</p>
              </Show>

              <Show when={prof().bio}>
                <p class="yt-profile-bio">{prof().bio}</p>
              </Show>

              <div class="yt-profile-meta-row">
                <Show when={prof().location}>
                  <div class="yt-profile-meta-item">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{prof().location}</span>
                  </div>
                </Show>

                <Show when={prof().website}>
                  <div class="yt-profile-meta-item">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <a
                      href={prof().website}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="yt-profile-meta-link"
                    >
                      {prof().website?.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </Show>

                <Show when={prof().email}>
                  <div class="yt-profile-meta-item">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <span>{prof().email}</span>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </section>
      )}
    </Show>
  );
};

export default OverviewProfileHeader;
