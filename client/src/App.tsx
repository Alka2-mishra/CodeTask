import { AuthPanel } from "./components/AuthPanel";
import { Dashboard } from "./components/Dashboard";
import { useAuth } from "./context/AuthContext";

export const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell loading-screen">
        <div className="brand-mark" />
        <p>Loading CodeTask...</p>
      </div>
    );
  }

  return <div className="app-shell">{user ? <Dashboard /> : <AuthPanel />}</div>;
};
