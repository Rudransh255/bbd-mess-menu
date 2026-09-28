import { signInWithGoogle } from './actions';

const errors: Record<string, string> = {
  login_failed: 'Google sign-in could not be started. Please try again.',
  callback_failed: 'Google sign-in could not be completed. Please try again.',
  not_authorised: 'This Google account is not approved for mess administration.',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return <main className="admin-login">
    <section className="admin-login-card" aria-labelledby="admin-login-title">
      <p className="eyebrow">BBD MESS / ADMIN</p>
      <h1 id="admin-login-title">Admin access</h1>
      <p>Sign in with an approved Google account. Google sign-in alone does not grant admin access.</p>
      {error && <p className="form-error" role="alert">{errors[error] ?? 'Sign-in failed.'}</p>}
      <form action={signInWithGoogle}>
        <button className="primary-button" type="submit">CONTINUE WITH GOOGLE</button>
      </form>
    </section>
  </main>;
}
