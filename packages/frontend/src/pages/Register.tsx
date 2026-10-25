import { A, useLocation, useNavigate, useSearchParams } from '@solidjs/router';
import { Title, Meta } from '@solidjs/meta';
import {
  type Component,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import SocialButtons from '../components/SocialButtons.jsx';
import PlanPicker, { type PlanId } from '../components/PlanPicker.jsx';
import { authClient } from '../services/auth-client.js';
import { appendSearch } from '../services/auth-redirects.js';
import { getLastAuthMethod, setLastAuthMethod } from '../services/last-auth-method.js';
import { checkIsSelfHosted, checkSocialProviders } from '../services/setup-status.js';
import { getBillingStatus } from '../services/api/billing.js';
import { markPlanChosen } from '../services/plan-selection.js';
import { formatBillingPrice } from '../services/billing-display.js';
import { toast } from '../services/toast-store.js';
import { markDiscoveryPending } from '../services/discovery.js';

const RESEND_COOLDOWN_SECONDS = 60;

const Register: Component = () => {
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [showPassword, setShowPassword] = createSignal(false);
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [emailSent, setEmailSent] = createSignal(false);
  const [alreadyExists, setAlreadyExists] = createSignal(false);
  const [resendCooldown, setResendCooldown] = createSignal(0);
  const [socialProviders, setSocialProviders] = createSignal<string[]>([]);
  // Self-hosted signups pass through the one-time discovery step first.
  const [postSignupUrl, setPostSignupUrl] = createSignal('/welcome');
  const [lastAuthMethod] = createSignal(getLastAuthMethod());
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [proPrice, setProPrice] = createSignal<string | null>(null);
  const [planBusy, setPlanBusy] = createSignal(false);
  const location = useLocation();
  const session = authClient.useSession();
  const userId = () => session()?.data?.user?.id ?? '';
  const showPlan = () => searchParams.step === 'plan';
  const nameId = createUniqueId();
  const emailId = createUniqueId();
  const passwordId = createUniqueId();
  const errorId = createUniqueId();
  const socialSignupUrl = () =>
    postSignupUrl().startsWith('/discovery') ? `${postSignupUrl()}&signup=1` : undefined;

  onMount(async () => {
    setSocialProviders(await checkSocialProviders());
    if (await checkIsSelfHosted()) {
      setPostSignupUrl('/discovery?next=%2Fwelcome');
    }
  });

  createEffect(() => {
    if (!showPlan()) return;
    getBillingStatus({ cache: false })
      .then((status) => {
        if (status?.plan === 'pro') {
          markPlanChosen(userId());
          navigate('/', { replace: true });
        } else {
          setProPrice(formatBillingPrice(status?.priceMonthly));
        }
      })
      .catch(() => {});
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
    setLoading(true);

    const { data, error: authError } = await authClient.signUp.email({
      name: name(),
      email: email(),
      password: password(),
      callbackURL: postSignupUrl(),
    });

    setLoading(false);

    if (authError) {
      if (authError.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        setAlreadyExists(true);
      }
      setError(authError.message ?? 'Registration failed');
      return;
    }
    setAlreadyExists(false);
    setLastAuthMethod('email');

    // Self-hosted: remember the discovery step is pending so the guards keep
    // routing this user back to it until it is completed or skipped.
    if (postSignupUrl().startsWith('/discovery')) {
      markDiscoveryPending(data?.user?.id ?? '', '/welcome');
    }

    if (data?.token) {
      window.location.href = postSignupUrl();
      return;
    }

    setEmailSent(true);
    startCooldown();
  };

  const handlePlanSelect = async (plan: PlanId) => {
    if (plan === 'free') {
      markPlanChosen(userId());
      window.location.replace('/');
      return;
    }
    if (plan === 'enterprise') {
      return;
    }
    setPlanBusy(true);
    try {
      const origin = window.location.origin;
      const res = await authClient.subscription.upgrade({
        plan: 'pro',
        successUrl: `${origin}/overview?upgraded=1`,
        cancelUrl: `${origin}/ninjas?step=plan`,
      });
      const error = (res as { error?: unknown } | undefined)?.error;
      if (error) throw error;
      markPlanChosen(userId());
    } catch {
      toast.error('Could not start the upgrade. Please try again.');
      setPlanBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown() > 0) return;

    const { error: resendError } = await authClient.sendVerificationEmail({
      email: email(),
      callbackURL: postSignupUrl(),
    });

    if (resendError) {
      setError(resendError.message ?? 'Failed to resend verification email');
      return;
    }

    startCooldown();
  };

  return (
    <>
      <Title>Sign Up - Manifest</Title>
      <Meta
        name="description"
        content="Create a Manifest account to start monitoring your AI harnesses."
      />
      <Show
        when={!emailSent()}
        fallback={
          <>
            <div class="auth-header">
              <h1 class="auth-header__title">Check your email</h1>
              <p class="auth-header__subtitle">
                We sent a verification link to <strong>{email()}</strong>
              </p>
            </div>

            <div class="auth-form">
              {error() && (
                <div class="auth-form__error" role="alert">
                  {error()}
                </div>
              )}
              <div class="auth-form__success">
                Click the link in your email to verify your account and get started.
              </div>
              <button
                class="auth-form__link-btn"
                onClick={handleResend}
                disabled={resendCooldown() > 0}
              >
                {resendCooldown() > 0
                  ? `Resend in ${resendCooldown()}s`
                  : 'Resend verification email'}
              </button>
            </div>

            <div class="auth-footer">
              <A href={appendSearch('/login', location.search)} class="auth-footer__link">
                Back to sign in
              </A>
            </div>
          </>
        }
      >
        <Show
          when={showPlan()}
          fallback={
            <>
              <div class="auth-header">
                <h1 class="auth-header__title">Create an account</h1>
                <p class="auth-header__subtitle">Monitor your AI harnesses' costs and usage</p>
              </div>

              <SocialButtons
                enabledProviders={socialProviders()}
                lastUsed={lastAuthMethod()}
                callbackURL={socialSignupUrl()}
              />

              <Show when={socialProviders().length > 0}>
                <div class="auth-divider">
                  <span class="auth-divider__text">or</span>
                </div>
              </Show>

              <form class="auth-form" onSubmit={handleSubmit}>
                <Show when={alreadyExists()}>
                  <div id={errorId} class="auth-form__error" role="alert">
                    An account with this email already exists.{' '}
                    <A href={appendSearch('/login', location.search)} class="auth-form__error-link">
                      Sign in
                    </A>{' '}
                    or{' '}
                    <A href="/reset-password" class="auth-form__error-link">
                      reset your password
                    </A>
                    .
                  </div>
                </Show>
                <Show when={error() && !alreadyExists()}>
                  <div id={errorId} class="auth-form__error" role="alert">
                    {error()}
                  </div>
                </Show>
                <label class="auth-form__label" for={nameId}>
                  Name
                  <input
                    ref={(el) => requestAnimationFrame(() => el.focus())}
                    id={nameId}
                    class="auth-form__input"
                    type="text"
                    autocomplete="name"
                    placeholder="Your name"
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                    required
                    aria-describedby={error() ? errorId : undefined}
                  />
                </label>
                <label class="auth-form__label" for={emailId}>
                  Email
                  <input
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
                <label class="auth-form__label" for={passwordId}>
                  Password
                  <div class="auth-form__password-wrapper">
                    <input
                      id={passwordId}
                      class="auth-form__input"
                      type={showPassword() ? 'text' : 'password'}
                      autocomplete="new-password"
                      placeholder="Create a password"
                      value={password()}
                      onInput={(e) => setPassword(e.currentTarget.value)}
                      required
                      minLength={8}
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
                <button class="auth-form__submit" type="submit" disabled={loading()}>
                  {loading() ? <span class="spinner" /> : 'Create account'}
                </button>
              </form>
              <p class="auth-terms">
                By signing up, you agree to our{' '}
                <a
                  href="https://manifest.build/terms"
                  class="auth-terms__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms
                </a>{' '}
                and{' '}
                <a
                  href="https://manifest.build/privacy"
                  class="auth-terms__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </p>
              <div class="auth-footer">
                <span>Already have an account? </span>
                <A href={appendSearch('/login', location.search)} class="auth-footer__link">
                  Sign in
                </A>
              </div>
            </>
          }
        >
          <div class="auth-header">
            <h1 class="auth-header__title">
              {searchParams.context === 'login' ? 'Choose your plan' : 'Create an account'}
            </h1>
            <p class="auth-header__subtitle">
              {searchParams.context === 'login'
                ? 'Manifest now offers Free and Pro plans. Select the one that fits your needs.'
                : "Monitor your AI harnesses' costs and usage"}
            </p>
          </div>

          <Show when={searchParams.context !== 'login'}>
            <div class="plan-picker__section-header">
              <h2 class="plan-picker__section-title">Choose your plan</h2>
              <p class="plan-picker__section-subtitle">You can change your plan anytime</p>
            </div>
          </Show>

          <PlanPicker proPrice={proPrice()} onSelect={handlePlanSelect} busy={planBusy()} />
        </Show>
      </Show>
    </>
  );
};

export default Register;
