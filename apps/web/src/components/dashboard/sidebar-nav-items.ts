import {
  LayoutDashboard,
  Users,
  Clock,
  Camera,
  CalendarDays,
  BarChart3,
  MapPin,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@attndly/shared";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "hr_admin", "manager", "employee"],
  },
  {
    title: "Employees",
    href: "/dashboard/employees",
    icon: Users,
    roles: ["super_admin", "hr_admin", "manager"],
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
    icon: Clock,
    roles: ["super_admin", "hr_admin", "manager"],
  },
  {
    title: "Cameras",
    href: "/dashboard/cameras",
    icon: Camera,
    roles: ["super_admin"],
  },
  {
    title: "Leaves",
    href: "/dashboard/leaves",
    icon: CalendarDays,
    roles: ["super_admin", "hr_admin", "manager", "employee"],
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ["super_admin", "hr_admin"],
  },
  {
    title: "Locations",
    href: "/dashboard/locations",
    icon: MapPin,
    roles: ["super_admin"],
  },
  {
    title: "Departments",
    href: "/dashboard/departments",
    icon: Building2,
    roles: ["super_admin", "hr_admin"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["super_admin", "hr_admin"],
  },
];
