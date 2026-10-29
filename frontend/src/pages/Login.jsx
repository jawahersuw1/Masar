import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { homeFor } from '../components/layout/RequireRole.jsx';
import Button from '../components/ui/Button.jsx';
import { Field, TextInput } from '../components/ui/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await api.login(form.email, form.password);
      login(session);
      navigate(homeFor(session.user.role), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Business owners and bank staff sign in here.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Email">
          <TextInput type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
        </Field>
        <Field label="Password">
          <TextInput type="password" autoComplete="current-password" value={form.password} onChange={set('password')} required />
        </Field>
        {error && <p role="alert" className="text-[12.5px] font-semibold text-bad">{error}</p>}
        <Button type="submit" loading={busy}>Sign in</Button>
        <p className="text-[12.5px] text-muted">
          New here? <Link to="/signup" className="font-bold text-steel hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
