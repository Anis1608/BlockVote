import { NavLink } from "react-router-dom";
import { Home, Users, ClipboardList, Settings, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <div className="h-full flex flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--sidebar-border))] px-6 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="font-bold text-xl flex items-center">
            <span className="text-white">Block</span>
            <span className="text-primary">Vote</span>
          </a>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-1">
          <NavItem href="/admin/dashboard" icon={Home} onClick={onNavigate}>
            Dashboard
          </NavItem>
          <NavItem href="/admin/voters" icon={Users} onClick={onNavigate}>
            Voters
          </NavItem>
          <NavItem href="/admin/candidates" icon={ClipboardList} onClick={onNavigate}>
            Candidates
          </NavItem>
          <NavItem href="/admin/settings" icon={Settings} onClick={onNavigate}>
            Election Settings
          </NavItem>
          <NavItem href="/results" icon={BarChart3} onClick={onNavigate}>
            Results
          </NavItem>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-[hsl(var(--sidebar-border))] px-6 py-3">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]">
            A
          </div>
          <div className="ml-3">
            <p className="text-xs">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@BlockVote.org</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// NavItem component remains the same

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavItem({ href, icon: Icon, children, onClick }: NavItemProps) {
  return (
    <NavLink
      to={href}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {children}
    </NavLink>
  );
}