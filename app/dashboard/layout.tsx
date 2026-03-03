
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Building2,
    CalendarDays,
    Users,
    Menu,
    Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "@clerk/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getImpersonationContextUI, exitImpersonationAction } from "@/lib/impersonation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        redirect("/sign-in");
    }

    // Fetch Profile from Supabase using Clerk ID
    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        console.error("Profile not found for Clerk user:", userId);
        // This might happen if webhooks haven't fired/processed yet.
        // We could create a profile on the fly here as a fallback.
    }

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Properties", href: "/dashboard/properties", icon: Building2 },
        { name: "Inbox", href: "/dashboard/inbox", icon: Inbox },
        { name: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
        { name: "Agents", href: "/dashboard/agents", icon: Users },
    ];

    const impersonationContext = await getImpersonationContextUI();

    return (
        <div className={`flex min-h-screen w-full bg-muted/40 font-sans ${impersonationContext?.isImpersonating ? 'pt-12' : ''}`}>
            {/* BANDERÍN DE RESCATE (ESCAPE HATCH) */}
            {impersonationContext?.isImpersonating && (
                <div className="fixed top-0 left-0 w-full z-[100] h-12 bg-[#2a0808] border-b border-red-500/50 shadow-2xl shadow-red-900/20 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <p className="text-red-100 font-bold tracking-wide text-sm flex items-center gap-2">
                            <span>MODO GOD: Suplantando a</span>
                            <span className="text-white font-black underline decoration-red-500">{impersonationContext.targetOrgName}</span>
                        </p>
                    </div>
                    <form action={exitImpersonationAction}>
                        <Button type="submit" variant="destructive" size="sm" className="bg-red-600 hover:bg-red-500 text-white font-bold h-8 px-5 rounded shadow-xl border border-red-400/30 transition-all uppercase text-[10px] tracking-widest">
                            Exit Impersonation
                        </Button>
                    </form>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className={`hidden border-r bg-background md:block md:w-64 lg:w-72 fixed z-10 ${impersonationContext?.isImpersonating ? 'top-12 h-[calc(100vh-48px)]' : 'inset-y-0 h-full'}`}>
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-20 items-center border-b px-4 lg:px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-xs">AI</span>
                            </div>
                            <span className="font-bold tracking-tight text-slate-900">Cyprus Estate OS</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition-all hover:text-blue-600 hover:bg-blue-50/50"
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                <AvatarImage src={user.imageUrl} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                    {(profile?.full_name || user.firstName)?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5 text-xs">
                                <span className="font-bold text-slate-900 truncate max-w-[140px]">
                                    {profile?.full_name || `${user.firstName} ${user.lastName}`}
                                </span>
                                <span className="text-slate-500 capitalize">{profile?.role || 'Agent'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar & Header */}
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-64 lg:pl-72 w-full">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="icon" variant="outline" className="sm:hidden rounded-xl border-slate-200">
                                <Menu className="h-5 w-5 text-slate-600" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="sm:max-w-xs bg-white">
                            <nav className="grid gap-6 text-lg font-medium pt-10">
                                <Link href="/" className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">AI</span>
                                    </div>
                                    <span className="font-bold">Cyprus Estate OS</span>
                                </Link>
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-4 px-2.5 text-slate-600 hover:text-blue-600"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* Title could go here */}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-white shadow-sm h-10 w-10 overflow-hidden">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.imageUrl} />
                                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                                        {(profile?.full_name || user.firstName)?.[0] || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-2 border-slate-200">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold text-slate-900 leading-none">
                                        {profile?.full_name || `${user.firstName} ${user.lastName}`}
                                    </p>
                                    <p className="text-xs leading-none text-slate-500">
                                        {user.emailAddresses[0]?.emailAddress}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem className="rounded-lg cursor-pointer">Settings</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg cursor-pointer">Support</DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2" />
                            <SignOutButton>
                                <DropdownMenuItem className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                    Logout
                                </DropdownMenuItem>
                            </SignOutButton>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
