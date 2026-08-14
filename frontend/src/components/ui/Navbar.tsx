import { Link, NavLink, useNavigate } from "react-router-dom";
import { Compass, ListChecks, LogOut, Map, Sparkles } from "lucide-react";
import { LogoWordmark } from "./LogoWordmark";
import { Button } from "./Button";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { to: "/destinations", label: "Destinations", icon: Compass },
  { to: "/recommendations", label: "For You", icon: Sparkles },
  { to: "/itineraries", label: "Itineraries", icon: ListChecks },
  { to: "/map", label: "Map", icon: Map },
];

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/">
          <LogoWordmark />
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-black/5 hover:text-ink"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-muted sm:inline">Hi, {user?.full_name.split(" ")[0]}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} /> Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted hover:text-ink">
                Log in
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted"
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
