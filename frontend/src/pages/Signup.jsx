import { useState } from 'react';
import { Briefcase, Landmark } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import { homeFor } from '../components/layout/RequireRole.jsx';
import Button from '../components/ui/Button.jsx';
import { Field, SelectInput, TextInput } from '../components/ui/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useAsync from '../hooks/useAsync.js';
import { api } from '../lib/api.js';

const ROLES = [
  { value: 'client', label: 'Business owner', hint: 'I want to check my financing plan', Icon: Briefcase },
  { value: 'reviewer', label: 'Bank staff', hint: 'I review applications for my bank', Icon: Landmark },
];

export default function Signup() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const banks = useAsync(() => api.banks(), []);
  const [form, setForm] = useState({ role: 'client', name: '', email: '', password: '', confirm: '', bankId: '', accessCode: '' });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const isBank = form.role === 'reviewer';

  async function submit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return setErrors(['The two passwords are not the same']);
    setBusy(true);
    setErrors([]);
    try {
      const body = { role: form.role, name: form.name, email: form.email, password: form.password };
      if (isBank) Object.assign(body, { bankId: form.bankId, accessCode: form.accessCode });
      const session = await api.signup(body);
      login(session);
      navigate(homeFor(session.user.role), { replace: true });
    } catch (err) {
      setErrors(err.details?.length ? err.details : [err.message]);
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Choose who you are. You can sign in with your email afterwards.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
          {ROLES.map(({ value, label, hint, Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={form.role === value}
              onClick={() => setForm({ ...form, role: value })}
              className={`rounded-xl border p-3 text-left transition ${form.role === value ? 'border-accent bg-surface-2' : 'border-line-soft bg-surface hover:border-accent'}`}
            >
              <Icon className="mb-1 h-4 w-4 text-steel" aria-hidden="true" />
              <span className="block text-[13px] font-bold">{label}</span>
              <span className="text-[11px] text-muted">{hint}</span>
            </button>
          ))}
        </div>

        <Field label="Full name">
          <TextInput autoComplete="name" value={form.name} onChange={set('name')} required />
        </Field>
        <Field label="Email">
          <TextInput type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
        </Field>

        {isBank && (
          <>
            <Field label="Your bank">
              <SelectInput
                placeholder="Choose your bank…"
                value={form.bankId}
                onChange={set('bankId')}
                options={(banks.data ?? []).map((b) => ({ value: b.bankId, label: `${b.name} (${b.profile})` }))}
                required
              />
            </Field>
            <Field label="Bank staff code" hint="Your bank gives you this code. Without it a reviewer account cannot be created.">
              <TextInput value={form.accessCode} onChange={set('accessCode')} autoComplete="off" required />
            </Field>
          </>
        )}

        <Field label="Password" hint="At least 8 characters.">
          <TextInput type="password" autoComplete="new-password" value={form.password} onChange={set('password')} required />
        </Field>
        <Field label="Repeat the password">
          <TextInput type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} required />
        </Field>

        {errors.length > 0 && (
          <ul role="alert" className="list-disc pl-5 text-[12.5px] font-semibold text-bad">
            {errors.map((m) => <li key={m}>{m}</li>)}
          </ul>
        )}
        <Button type="submit" loading={busy}>Create account</Button>
        <p className="text-[12.5px] text-muted">
          Already have an account? <Link to="/login" className="font-bold text-steel hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
