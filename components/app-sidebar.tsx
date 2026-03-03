
import * as React from "react"
import { GalleryVerticalEnd, SquareTerminal, Users, Building2, LayoutDashboard, Settings, Inbox } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ isAdmin, ...props }: React.ComponentProps<typeof Sidebar> & { isAdmin?: boolean }) {
    return (
        <Sidebar collapsible="icon" {...props} className={isAdmin ? "border-r border-neutral-800" : ""}>
            <SidebarHeader className={isAdmin ? "bg-neutral-900 text-white" : ""}>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href={isAdmin ? "/admin" : "/dashboard"}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <GalleryVerticalEnd className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">{isAdmin ? "The Factory" : "Cyprus Estate"}</span>
                                    <span className="">{isAdmin ? "v1.0.0" : "Enterprise"}</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className={isAdmin ? "bg-neutral-900 text-white" : ""}>
                <SidebarGroup>
                    <SidebarMenu>
                        {isAdmin ? (
                            <>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Factory Floor">
                                        <a href="/admin">
                                            <SquareTerminal />
                                            <span>Factory Floor</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Agencies (Tenants)">
                                        <a href="/admin/agencies">
                                            <Building2 />
                                            <span>Agencies (Tenants)</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Logs">
                                        <a href="/admin/logs">
                                            <SquareTerminal />
                                            <span>Global Logs</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </>
                        ) : (
                            <>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Properties">
                                        <a href="/dashboard/properties">
                                            <Building2 />
                                            <span>Properties</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Inbox">
                                        <a href="/dashboard/inbox">
                                            <Inbox />
                                            <span>Inbox</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Bookings">
                                        <a href="/dashboard/bookings">
                                            <LayoutDashboard />
                                            <span>Bookings</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Agents">
                                        <a href="/dashboard/agents">
                                            <Users />
                                            <span>Agents</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild tooltip="Settings">
                                        <a href="/dashboard/settings">
                                            <Settings />
                                            <span>Settings</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </>
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
