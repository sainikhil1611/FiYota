import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreApprovalButtonProps {
  onClick: () => void;
}

export function PreApprovalButton({ onClick }: PreApprovalButtonProps) {
  return (
    <div className="fixed top-4 right-20 z-50">
      <Button
        onClick={onClick}
        size="lg"
        variant="secondary"
        className="rounded-full h-14 px-6 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        aria-label="Check pre-approval status"
      >
        <BadgeCheck className="h-5 w-5" />
        <span className="font-semibold hidden sm:inline">Pre-Approval</span>
      </Button>
    </div>
  );
}
