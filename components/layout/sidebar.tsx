"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconFolder,
  IconStar,
  IconTrash,
  IconCloud,
  IconLogout,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";
import { signOut } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";

const navItems = [
  { href: "/drive", label: "My Drive", icon: IconFolder },
  { href: "/starred", label: "Starred", icon: IconStar },
  { href: "/trash", label: "Trash", icon: IconTrash },
];

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const MAX_STORAGE = 5 * 1024 * 1024 * 1024; // 5 GB

export const AppSidebar = () => {
  const pathname = usePathname();
  const { data: usage } = useQuery(orpc.storage.getUsage.queryOptions({}));

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/sign-in";
  };

  const usagePercent = usage
    ? Math.min((usage.totalSize / MAX_STORAGE) * 100, 100)
    : 0;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <IconCloud className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Simple Drive</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">
                {usage ? formatBytes(usage.totalSize) : "..."} / 5 GB
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {usage?.fileCount ?? 0} files
            </p>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut}>
                <IconLogout />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
