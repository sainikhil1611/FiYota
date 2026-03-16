import React from "react";

export function ApprovalRing({
  value,
  size = 160,
  stroke = 14,
  label = "Approval Confidence",
  strokeColor,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
  strokeColor?: string; // CSS color string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const angle = (clamped / 100) * 360;
  const fill = strokeColor || "hsl(var(--primary))";
  const track = "hsl(var(--muted))";

  const outerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: `conic-gradient(${fill} ${angle}deg, ${track} 0deg)`,
    position: "relative",
    transition: "background 0.4s ease",
  };

  const innerStyle: React.CSSProperties = {
    position: "absolute",
    inset: stroke,
    borderRadius: "50%",
    background: "hsl(var(--card))",
    display: "grid",
    placeItems: "center",
  };

  return (
    <div className="flex flex-col items-center">
      <div style={outerStyle}>
        <div style={innerStyle}>
          <div className="text-center">
            <div className="text-3xl font-bold">{clamped}%</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
