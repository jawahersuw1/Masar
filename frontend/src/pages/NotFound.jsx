import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { EmptyBlock } from '../components/ui/Feedback.jsx';

export default function NotFound() {
  return <EmptyBlock title="This page does not exist" description="Check the address, or go back to the start." action={<Button as={Link} to="/">Go to start</Button>} />;
}