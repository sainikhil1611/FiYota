import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ProfileButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/profile")}
      variant="ghost"
      size="lg"
      className="rounded-full h-12 w-12"
      aria-label="View profile"
    >
      <UserCircle className="h-8 w-8" />
    </Button>
  );
}
