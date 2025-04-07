
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Home,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="font-bold text-xl flex items-center">
            <span className="text-white">Block</span>
            <span className="text-secondary">Vote</span>
          </a>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="space-y-1 px-2 py-3">
          <NavItem href="/admin/dashboard" icon={Home}>
            Dashboard
          </NavItem>
          <NavItem href="/admin/voters" icon={Users}>
            Voters
          </NavItem>
          <NavItem href="/admin/candidates" icon={ClipboardList}>
            Candidates
          </NavItem>
          <NavItem href="/admin/settings" icon={Settings}>
            Election Settings
          </NavItem>
          <NavItem href="/results" icon={BarChart3}>
            Results
          </NavItem>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-6 py-3">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
            A
          </div>
          <div className="ml-3">
            <p className="text-xs text-sidebar-foreground">Admin User</p>
            <p className="text-xs text-sidebar-foreground/70">admin@BlockVote.org</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function NavItem({ href, icon: Icon, children }: NavItemProps) {
  return (
    <NavLink
      to={href}
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
