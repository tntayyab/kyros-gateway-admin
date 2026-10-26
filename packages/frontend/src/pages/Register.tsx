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
import { submitDirectRegistration } from '../services/kyros-auth-flow.js';

type RegistrationStep = 'form' | 'pending_approval';

const Register: Component = () => {
  const [step, setStep] = createSignal<RegistrationStep>('form');
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [showPassword, setShowPassword] = createSignal(false);
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [socialProviders, setSocialProviders] = createSignal<string[]>([]);
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

  // Direct Registration -> Directly pending admin approval (No OTP verification needed)
  const handleRegisterSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await submitDirectRegistration(name(), email(), password());
      if (!result.success) {
        setError(result.error || 'Failed to submit registration');
        setLoading(false);
        return;
      }

      toast.success('Registration submitted! Contact Admin for approval.');
      setStep('pending_approval');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
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

  return (
    <>
      <Title>Sign Up - Writerify Gateway</Title>
      <Meta
        name="description"
        content="Create a Writerify Gateway account to start using unified AI routing and harnesses."
      />

      <Show when={showPlan()}>
        <div class="auth-header">
          <h1 class="auth-header__title">
            {searchParams.context === 'login' ? 'Choose your plan' : 'Create an account'}
          </h1>
          <p class="auth-header__subtitle">
            {searchParams.context === 'login'
              ? 'Writerify Gateway offers Free and Pro plans. Select the one that fits your needs.'
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

      <Show when={!showPlan()}>
        {/* ======================================================== */}
        {/* STEP 3: PENDING ADMIN APPROVAL (Directly as Boss asked)   */}
        {/* ======================================================== */}
        <Show when={step() === 'pending_approval'}>
          <div class="auth-header" style={{ "text-align": 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px auto',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '2px solid rgba(34, 197, 94, 0.4)',
                'border-radius': '50%',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                color: '#22c55e',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <h1 class="auth-header__title" style={{ "font-size": '22px', "margin-bottom": '6px' }}>
              Registration Submitted!
            </h1>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(234, 179, 8, 0.15)',
                color: '#eab308',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                padding: '6px 14px',
                'border-radius': '9999px',
                'font-size': '13px',
                'font-weight': '700',
                'margin-top': '6px',
                'margin-bottom': '12px',
                'letter-spacing': '0.5px'
              }}
            >
              Contact with Admin for Approval
            </div>
            <p class="auth-header__subtitle" style={{ "font-size": '14px', "color": '#94a3b8', "line-height": '1.5' }}>
              আপনার রেজিস্ট্রেশন তথ্য সফলভাবে জমা হয়েছে। একাউন্ট সক্রিয় করতে অ্যাডমিনের অনুমোদন প্রয়োজন।
            </p>
          </div>

          <div
            class="auth-form"
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              'border-radius': '12px',
              padding: '24px',
              'margin-bottom': '20px',
            }}
          >
            <div style={{ "margin-bottom": '16px', "font-size": '13px', "color": '#94a3b8' }}>
              <div style={{ display: 'flex', "justify-content": 'space-between', "margin-bottom": '8px' }}>
                <span style={{ color: '#64748b' }}>Account Name:</span>
                <strong style={{ color: '#f8fafc' }}>{name()}</strong>
              </div>
              <div style={{ display: 'flex', "justify-content": 'space-between', "margin-bottom": '8px' }}>
                <span style={{ color: '#64748b' }}>Registered Email:</span>
                <strong style={{ color: '#38bdf8' }}>{email()}</strong>
              </div>
              <div style={{ display: 'flex', "justify-content": 'space-between', "margin-bottom": '8px' }}>
                <span style={{ color: '#64748b' }}>Approval Status:</span>
                <span style={{ color: '#eab308', "font-weight": '700' }}>⏳ Pending Admin Review</span>
              </div>
              <div style={{ display: 'flex', "justify-content": 'space-between' }}>
                <span style={{ color: '#64748b' }}>Approving Admin:</span>
                <strong style={{ color: '#f8fafc' }}>Boss TN TAYYAB</strong>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                'border-radius': '8px',
                padding: '12px',
                'font-size': '12px',
                color: '#bae6fd',
                'line-height': '1.5',
                'margin-bottom': '20px',
              }}
            >
              📢 অ্যাডমিন অনুমোদন দেওয়া মাত্র আপনি আপনার ইমেল ও পাসওয়ার্ড দিয়ে সরাসরি <strong>gateway.writerify.org</strong> এ লগইন করতে পারবেন।
            </div>

            <a
              href={`mailto:itstasdidnur@gmail.com?subject=Approval%20Request%20for%20Writerify%20Gateway%20-${encodeURIComponent(email())}&body=Hello%20Boss%20TN%20TAYYAB,%0D%0A%0D%0AMy%20name%20is%20${encodeURIComponent(name())}%20and%20I%20have%20registered%20for%20an%20account%20(${encodeURIComponent(email())}).%0D%0APlease%20approve%20my%20account%20on%20Writerify%20Gateway.%0D%0A%0D%0AThank%20you!`}
              class="auth-form__submit"
              style={{
                display: 'block',
                'text-align': 'center',
                'text-decoration': 'none',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#fff',
                'font-weight': '700',
                padding: '12px',
                'border-radius': '8px',
                'margin-bottom': '12px',
              }}
            >
              Contact Admin for Approval (Email)
            </a>

            <A
              href="/login"
              class="auth-form__submit"
              style={{
                display: 'block',
                'text-align': 'center',
                'text-decoration': 'none',
                background: 'transparent',
                border: '1px solid #334155',
                color: '#cbd5e1',
                padding: '10px',
                'border-radius': '8px',
              }}
            >
              Go to Sign In
            </A>
          </div>
        </Show>

        {/* ======================================================== */}
        {/* STEP 1: INITIAL REGISTRATION FORM                        */}
        {/* ======================================================== */}
        <Show when={step() === 'form'}>
          <div class="auth-header">
            <h1 class="auth-header__title">Create an account</h1>
            <p class="auth-header__subtitle">Join Writerify Gateway multi-model AI platform</p>
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

          <form class="auth-form" onSubmit={handleRegisterSubmit}>
            <Show when={error()}>
              <div id={errorId} class="auth-form__error" role="alert">
                {error()}
              </div>
            </Show>

            <label class="auth-form__label" for={nameId}>
              Full Name
              <input
                ref={(el) => requestAnimationFrame(() => el.focus())}
                id={nameId}
                class="auth-form__input"
                type="text"
                autocomplete="name"
                placeholder="e.g. Shika Begum"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                required
              />
            </label>

            <label class="auth-form__label" for={emailId}>
              Email Address
              <input
                id={emailId}
                class="auth-form__input"
                type="email"
                autocomplete="email"
                placeholder="you@gmail.com"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                required
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
                  placeholder="Create a strong password (min 8 chars)"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  required
                  minLength={8}
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
              {loading() ? <span class="spinner" /> : 'Create Account & Request Approval'}
            </button>
          </form>

          <p class="auth-terms">
            By signing up, you agree to Writerify Gateway's terms and community policies.
          </p>
          <div class="auth-footer">
            <span>Already have an approved account? </span>
            <A href={appendSearch('/login', location.search)} class="auth-footer__link">
              Sign in
            </A>
          </div>
        </Show>
      </Show>
    </>
  );
};

export default Register;
