import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import RequireRole, { RequireAuth } from './components/layout/RequireRole.jsx';
import { AssessmentProvider } from './context/AssessmentContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Inbox from './pages/bank/Inbox.jsx';
import Report from './pages/bank/Report.jsx';
import Review from './pages/bank/Review.jsx';
import Settings from './pages/bank/Settings.jsx';
import Analysis from './pages/client/Analysis.jsx';
import ApplicationDetail from './pages/client/ApplicationDetail.jsx';
import Landing from './pages/client/Landing.jsx';
import MyApplications from './pages/client/MyApplications.jsx';
import PlanFixPage from './pages/client/PlanFixPage.jsx';
import Questionnaire from './pages/client/Questionnaire.jsx';
import Simulator from './pages/client/Simulator.jsx';
import StressTestPage from './pages/client/StressTest.jsx';
import Submit from './pages/client/Submit.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

function Home() {
  const { user } = useAuth();
  return user.role === 'reviewer' ? <Navigate to="/bank" replace /> : <Landing />;
}

function Routed() {
  const { user } = useAuth();
  // key resets the questionnaire state when someone else signs in
  return (
    <AssessmentProvider key={user?.id ?? 'anon'} userId={user?.id}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="/" element={<Home />} />
          <Route element={<RequireRole role="client" />}>
            <Route path="/assessment" element={<Questionnaire />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/stress" element={<StressTestPage />} />
            <Route path="/plan" element={<PlanFixPage />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
          </Route>
          <Route element={<RequireRole role="reviewer" />}>
            <Route path="/bank" element={<Inbox />} />
            <Route path="/bank/applications/:id" element={<Review />} />
            <Route path="/bank/applications/:id/report" element={<Report />} />
            <Route path="/bank/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AssessmentProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider><Routed /></AuthProvider>
    </BrowserRouter>
  );
}