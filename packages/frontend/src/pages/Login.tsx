import { A, useLocation, useSearchParams } from '@solidjs/router';
import { Title, Meta } from '@solidjs/meta';
import { type Component, createSignal, createUniqueId, onCleanup, onMount, Show } from 'solid-js';
import SocialButtons from '../components/SocialButtons.jsx';
import { authClient } from '../services/auth-client.js';
import { appendSearch, getAuthDestination } from '../services/auth-redirects.js';
import { getLastAuthMethod, setLastAuthMethod } from '../services/last-auth-method.js';
import { checkSocialProviders } from '../services/setup-status.js';

const RESEND_COOLDOWN_SECONDS = 60;

// Dev-only seed credentials (see packages/backend/src/database/database-seeder.service.ts,
// seeded only when SEED_DATA=true / non-production). Referenced solely inside the
// `import.meta.env.DEV` branch below, so Vite strips both the button and these literals
// from production builds — they never ship. The account exists only in a dev database.
const DEV_EMAIL = 'admin@manifest.build';
const DEV_PASSWORD = 'manifest';

const Login: Component = () => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [showPassword, setShowPassword] = createSignal(false);
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [needsVerification, setNeedsVerification] = createSignal(false);
  const [resendCooldown, setResendCooldown] = createSignal(0);
  const [socialProviders, setSocialProviders] = createSignal<string[]>([]);
  const [lastAuthMethod] = createSignal(getLastAuthMethod());
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const emailId = createUniqueId();
  const passwordId = createUniqueId();
  const errorId = createUniqueId();

  onMount(async () => {
    if (searchParams.error === 'account_not_linked') {
      setNeedsVerification(true);
      setError('This email already has an account. Enter it below to get a verification link.');
    } else if (searchParams.error || searchParams.oauth === 'failed') {
      setError('Login failed. Please try again or use a different method.');
    }
    setSocialProviders(await checkSocialProviders());
  });

  let cooldownInterval: ReturnType<typeof setInterval> | undefined;

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownInterval);
          cooldownInterval = undefined;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  onCleanup(() => {
    if (cooldownInterval) clearInterval(cooldownInterval);
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email: email(),
      password: password(),
    });

    setLoading(false);

    if (authError) {
      const msg = authError.message ?? '';
      const lowMsg = msg.toLowerCase();
      if (
        lowMsg.includes('not approved') ||
        lowMsg.includes('access denied') ||
        lowMsg.includes('pending')
      ) {
        setError('Your account is pending Admin approval. Please contact Writerify (itsinjamul@gmail.com) for activation.');
        return;
      }
      if (
        lowMsg.includes('email is not verified') ||
        authError.code === 'EMAIL_NOT_VERIFIED'
      ) {
        setNeedsVerification(true);
        setError('Please verify your email before signing in.');
        return;
      }
      setError(msg || 'Invalid email or password');
      return;
    }

    setLastAuthMethod('email');
    window.location.href = getAuthDestination(searchParams, location.search);
  };

  // Dev shortcut: fill + submit the seed admin. One click, no credentials in the URL;
  // compiled out of production (see DEV_EMAIL/DEV_PASSWORD).
  const signInAsDev = async () => {
    setEmail(DEV_EMAIL);
    setPassword(DEV_PASSWORD);
    setError('');
    setLoading(true);
    const { error: authError } = await authClient.signIn.email({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message ?? 'Dev sign-in failed');
      return;
    }
    setLastAuthMethod('email');
    window.location.href = '/';
  };

  const handleResendVerification = async () => {
    if (resendCooldown() > 0) return;
    if (!email().trim()) {
      setError('Enter your email address to receive a verification link.');
      return;
    }

    const { error: resendError } = await authClient.sendVerificationEmail({
      email: email(),
      callbackURL: getAuthDestination(searchParams, location.search),
    });

    if (resendError) {
      setError(resendError.message ?? 'Failed to resend verification email');
      return;
    }

    startCooldown();
    setError('Verification email sent! Check your inbox.');
  };

  return (
    <>
      <Title>Sign In - Manifest</Title>
      <Meta name="description" content="Sign in to Manifest to monitor your AI harnesses." />
      <div class="auth-header">
        <h1 class="auth-header__title">Welcome back</h1>
        <p class="auth-header__subtitle">Take control of your AI harness costs</p>
      </div>

      <SocialButtons enabledProviders={socialProviders()} lastUsed={lastAuthMethod()} />

      <Show when={socialProviders().length > 0}>
        <div class="auth-divider">
          <span class="auth-divider__text">or</span>
        </div>
      </Show>

      <form class="auth-form" onSubmit={handleSubmit}>
        {import.meta.env.DEV && (
          <button
            type="button"
            class="auth-form__submit"
            onClick={signInAsDev}
            disabled={loading()}
            style="background:#f59e0b;color:#1f1400;font-weight:700;margin-bottom:0.75rem;"
          >
            ⚡ Sign in as dev, admin@manifest.build
          </button>
        )}
        {error() && (
          <div id={errorId} class="auth-form__error" role="alert">
            {error()}
          </div>
        )}
        <label class="auth-form__label" for={emailId}>
          Email
          <input
            ref={(el) => requestAnimationFrame(() => el.focus())}
            id={emailId}
            class="auth-form__input"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            aria-describedby={error() ? errorId : undefined}
          />
        </label>
        <Show when={needsVerification()}>
          <button
            type="button"
            class="auth-form__link-btn"
            onClick={handleResendVerification}
            disabled={resendCooldown() > 0}
          >
            {resendCooldown() > 0 ? `Resend in ${resendCooldown()}s` : 'Send verification email'}
          </button>
        </Show>
        <label class="auth-form__label" for={passwordId}>
          Password
          <div class="auth-form__password-wrapper">
            <input
              id={passwordId}
              class="auth-form__input"
              type={showPassword() ? 'text' : 'password'}
              autocomplete="current-password"
              placeholder="Enter your password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
              aria-describedby={error() ? errorId : undefined}
            />
            <button
              type="button"
              class="auth-form__eye-btn"
              onClick={() => setShowPassword(!showPassword())}
              aria-label={showPassword() ? 'Hide password' : 'Show password'}
              tabindex="-1"
            >
              <Show
                when={showPassword()}
                fallback={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
              </Show>
            </button>
          </div>
        </label>
        <div class="auth-form__actions">
          <A href="/reset-password" class="auth-form__forgot">
            Forgot password?
          </A>
        </div>
        <button class="auth-form__submit" type="submit" disabled={loading()}>
          {loading() ? <span class="spinner" /> : 'Sign in'}
        </button>
      </form>

    </>
  );
};

export default Login;
