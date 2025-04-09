import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "../admin/AdminSidebar";
import { ThemeToggle } from "../theme-toggle";
import { Bell, Menu, User } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import axios from "axios";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";

const AdminLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [devices, setDevices] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const currentDeviceId = localStorage.getItem("deviceId");

  useEffect(() => {
    if (isProfileOpen) {
      const token = localStorage.getItem("adminToken");
      axios.get("http://localhost:5000/api/get-details", {
        headers: {
          Authorization: `Bearer ${token}`,
          "device-id": currentDeviceId,
        },
      }).then(res => {
        if (res.data.Success) setAdmin(res.data.adminDetails[0]);
      }).catch(err => console.error("Profile fetch error:", err));
    }
  }, [isProfileOpen, currentDeviceId]);

  useEffect(() => {
    if (isDeviceDialogOpen) {
      const token = localStorage.getItem("adminToken");
      axios.get("http://localhost:5000/api/get-active-devices", {
        headers: {
          Authorization: `Bearer ${token}`,
          "device-id": currentDeviceId,
        },
      }).then(res => {
        if (res.data.success) setDevices(res.data.devices);
      }).catch(err => console.error("Device fetch error:", err));
    }
  }, [isDeviceDialogOpen, currentDeviceId]);

  const logoutDevice = async (deviceId, token) => {
    try {
      const res = await axios.post("http://localhost:5000/api/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          "device-id": deviceId,
        },
      });

      if (res.data.Success) {
        alert("Device logged out");
        setDevices(devices.filter((d) => d.deviceId !== deviceId));
      }
    } catch (error) {
      console.error("Logout device error:", error);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar - Fixed position */}
        {isDesktop && (
          <div className="hidden lg:block w-64 border-r bg-background fixed h-screen overflow-y-auto z-40">
            <AdminSidebar />
          </div>
        )}
        
        {/* Mobile Sidebar - Sheet component */}
        {!isDesktop && (
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetOverlay className="bg-black/80" />
            <SheetContent 
              side="left" 
              className="w-[280px] p-0 z-50"
            >
              <AdminSidebar onNavigate={() => setMobileSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content Area - Offset for fixed sidebar */}
        <div className={`flex-1 flex flex-col ${isDesktop ? 'lg:ml-64' : ''}`}>
          <header className="border-b bg-background sticky top-0 z-30">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-4">
                {!isDesktop && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <Button size="icon" variant="ghost" className="hidden sm:inline-flex">
                  <Bell className="h-4 w-4" />
                </Button>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeviceDialogOpen(true)}>
                      Logged in Devices
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      localStorage.removeItem("adminToken");
                      localStorage.removeItem("deviceId");
                      window.location.href = "/login";
                    }}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 container py-4 sm:py-6 px-4 sm:px-6 overflow-auto">
            <Outlet />
          </main>
        </div>

        {/* Profile Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Admin Profile</DialogTitle>
            </DialogHeader>
            {admin ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">ID</p>
                    <p className="text-sm">{admin.id_no}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm">{admin.name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm">{admin.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Wallet Address</p>
                  <p className="text-sm break-all font-mono">{admin.walletAddress}</p>
                </div>
              </div>
            ) : <p>Loading...</p>}
          </DialogContent>
        </Dialog>

        {/* Device Dialog */}
        <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Logged In Devices</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {devices.length > 0 ? (
                devices.map((d, idx) => (
                  <div key={idx} className="border p-2 rounded-md">
                    <p><strong>Device ID:</strong> {d.deviceId}</p>
                    <p><strong>OS:</strong> {d.deviceInfo?.os || "N/A"}</p>
                    <p><strong>Browser:</strong> {d.deviceInfo?.browser || "N/A"}</p>
                    {d.deviceId !== currentDeviceId && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-2"
                        onClick={() => logoutDevice(d.deviceId, d.token)}
                      >
                        Logout this device
                      </Button>
                    )}
                    {d.deviceId === currentDeviceId && (
                      <p className="text-sm text-green-600 mt-2">Current Device</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No devices logged in.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;