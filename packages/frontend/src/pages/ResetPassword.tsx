import { A, useSearchParams } from '@solidjs/router';
import { Title, Meta } from '@solidjs/meta';
import { type Component, createSignal, createUniqueId, onMount, Show } from 'solid-js';
import { authClient } from '../services/auth-client.js';
import { checkEmailConfigured } from '../services/setup-status.js';

const RequestResetForm: Component = () => {
  const [email, setEmail] = createSignal('');
  const [sent, setSent] = createSignal(false);
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  // Assume email works until the status check says otherwise, so the form
  // renders immediately and only flips to the notice on a confirmed no-provider
  // install (typically self-hosted without EMAIL_PROVIDER set).
  const [emailConfigured, setEmailConfigured] = createSignal(true);
  const emailId = createUniqueId();
  const errorId = createUniqueId();

  onMount(() => {
    void checkEmailConfigured().then(setEmailConfigured);
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await authClient.requestPasswordReset({
      email: email(),
      redirectTo: '/reset-password',
    });

    setLoading(false);

    if (authError) {
      setError(authError.message ?? 'Failed to send reset email');
      return;
    }

    setSent(true);
  };

  return (
    <>
      <div class="auth-header">
        <h1 class="auth-header__title">Reset your password</h1>
        <p class="auth-header__subtitle">
          {!emailConfigured()
            ? "Email isn't set up on this server"
            : sent()
              ? 'Check your email for a reset link'
              : 'Enter your email to receive a reset link'}
        </p>
      </div>

      <Show when={!emailConfigured()}>
        <div class="auth-form">
          <div class="auth-form__notice" role="status">
            Password reset by email isn't available on this install. Ask an admin to reset your
            password, or sign in and update it from your{' '}
            <A href="/account" class="auth-form__notice-link">
              Account
            </A>{' '}
            page.
          </div>
        </div>
      </Show>

      <Show when={emailConfigured() && !sent()}>
        <form class="auth-form" onSubmit={handleSubmit}>
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
          <button class="auth-form__submit" type="submit" disabled={loading()}>
            {loading() ? <span class="spinner" /> : 'Send reset link'}
          </button>
        </form>
      </Show>

      <div class="auth-footer">
        <A href="/login" class="auth-footer__link">
          Back to sign in
        </A>
      </div>
    </>
  );
};

const SetNewPasswordForm: Component<{ token: string }> = (props) => {
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const passwordId = createUniqueId();
  const confirmId = createUniqueId();
  const errorId = createUniqueId();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (password() !== confirmPassword()) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error: authError } = await authClient.resetPassword({
      newPassword: password(),
      token: props.token,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message ?? 'Failed to reset password');
      return;
    }

    setSuccess(true);
  };

  return (
    <>
      <div class="auth-header">
        <h1 class="auth-header__title">Set new password</h1>
        <p class="auth-header__subtitle">
          {success() ? 'Your password has been reset' : 'Enter your new password'}
        </p>
      </div>

      <Show
        when={!success()}
        fallback={
          <>
            <div class="auth-form">
              <div class="auth-form__success">
                Your password has been updated. You can now sign in with your new password.
              </div>
            </div>
            <div class="auth-footer">
              <A href="/login" class="auth-footer__link">
                Sign in
              </A>
            </div>
          </>
        }
      >
        <form class="auth-form" onSubmit={handleSubmit}>
          {error() && (
            <div id={errorId} class="auth-form__error" role="alert">
              {error()}
            </div>
          )}
          <label class="auth-form__label" for={passwordId}>
            New password
            <div class="auth-form__password-wrapper">
              <input
                ref={(el) => requestAnimationFrame(() => el.focus())}
                id={passwordId}
                class="auth-form__input"
                type={showPassword() ? 'text' : 'password'}
                autocomplete="new-password"
                placeholder="Enter new password"
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
          <label class="auth-form__label" for={confirmId}>
            Confirm password
            <div class="auth-form__password-wrapper">
              <input
                id={confirmId}
                class="auth-form__input"
                type={showConfirmPassword() ? 'text' : 'password'}
                autocomplete="new-password"
                placeholder="Confirm new password"
                value={confirmPassword()}
                onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                required
                minLength={8}
                aria-describedby={error() ? errorId : undefined}
              />
              <button
                type="button"
                class="auth-form__eye-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword())}
                aria-label={showConfirmPassword() ? 'Hide password' : 'Show password'}
                tabindex="-1"
              >
                <Show
                  when={showConfirmPassword()}
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
            {loading() ? <span class="spinner" /> : 'Reset password'}
          </button>
        </form>

        <div class="auth-footer">
          <A href="/login" class="auth-footer__link">
            Back to sign in
          </A>
        </div>
      </Show>
    </>
  );
};

const ResetPassword: Component = () => {
  const [searchParams] = useSearchParams();
  const token = () => searchParams.token as string | undefined;

  return (
    <>
      <Title>Reset Password - Manifest</Title>
      <Meta name="description" content="Reset your Manifest account password." />
      <Show when={token()} fallback={<RequestResetForm />}>
        {(t) => <SetNewPasswordForm token={t()} />}
      </Show>
    </>
  );
};

export default ResetPassword;
