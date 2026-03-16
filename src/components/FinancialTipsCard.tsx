import { Card } from "@/components/ui/card";
import { UserFinancialProfile } from "@/types/userProfile";
import { getFinancialTips } from "@/utils/affordability";
import { Lightbulb } from "lucide-react";

interface FinancialTipsCardProps {
  profile: UserFinancialProfile;
}

export const FinancialTipsCard = ({ profile }: FinancialTipsCardProps) => {
  const tips = getFinancialTips(profile);

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">Smart Financial Tips</h3>
      </div>
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-2 text-sm">
            <span className="flex-1">{tip}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
