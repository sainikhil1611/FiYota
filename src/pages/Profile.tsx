import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserFinancialProfile } from "@/types/userProfile";

interface ProfileProps {
  profile: UserFinancialProfile;
  onProfileChange: (profile: UserFinancialProfile) => void;
}

export const Profile = ({ profile, onProfileChange }: ProfileProps) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold">Financial Profile</h1>
          <p className="text-sm text-muted-foreground">This page is a placeholder and will be implemented later.</p>
        </div>
      </header>
      <main className="container mx-auto px-6 py-16">
        <div className="grid place-items-center">
          <div className="text-center space-y-3">
            <div className="text-3xl font-semibold">Coming Soon</div>
            <p className="text-muted-foreground">We’re working on a great financing profile experience.</p>
            <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
