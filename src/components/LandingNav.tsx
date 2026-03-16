import { Link, useLocation } from "react-router-dom";

export default function LandingNav() {
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`transition-colors ${pathname === to ? 'text-primary' : 'hover:text-primary'}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="relative z-10 container mx-auto px-6 py-4 flex items-center justify-between">
      <div className="text-sm font-semibold mr-4"><span className="text-primary">TOYOTA</span> Finance</div>
      <nav className="hidden md:flex items-center gap-6 text-sm">
        {link('/', 'Home')}
        {link('/quiz', 'Quiz')}
        {link('/dashboard', 'Dashboard')}
        {link('/inventory', 'Inventory')}
        {link('/preapproval', 'Pre-Approval')}
      </nav>
      <div />
    </header>
  );
}
