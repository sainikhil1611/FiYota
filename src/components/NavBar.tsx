import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home" },
  { to: "/quiz", label: "Quiz" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/inventory", label: "Inventory" },
  { to: "/profile", label: "Profile" },
];

export default function NavBar() {
  const { pathname } = useLocation();
  return (
    <nav className="w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 h-12 flex items-center gap-2">
        <div className="text-sm font-semibold mr-4"><span className="text-primary">TOYOTA</span> Finance</div>
        <div className="flex items-center gap-1 text-sm">
          {tabs.map(t => (
            <Link key={t.to} to={t.to}
              className={cn(
                "px-3 py-1.5 rounded-md hover:bg-muted transition-colors",
                pathname === t.to ? "bg-primary text-primary-foreground hover:bg-primary" : "text-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
