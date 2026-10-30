import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { useAssessment } from '../../context/AssessmentContext.jsx';
import { api } from '../../lib/api.js';

// Loads the saved answers into the questionnaire and goes straight there.
export default function EditButton({ applicationId, size = 'md', children = 'Edit and send again' }) {
  const { startEdit } = useAssessment();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      startEdit(await api.application(applicationId));
      navigate('/assessment');
    } catch (e) {
      setError(e);
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button size={size} onClick={go} loading={busy}><Pencil className="h-3.5 w-3.5" aria-hidden="true" />{children}</Button>
      {error && <span role="alert" className="text-[12px] font-semibold text-bad">{error.message}</span>}
    </span>
  );
}
