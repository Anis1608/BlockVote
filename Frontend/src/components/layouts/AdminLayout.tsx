import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "../admin/AdminSidebar";
import { ThemeToggle } from "../theme-toggle";
import { Bell, User } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [devices, setDevices] = useState([]);
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
  }, [isProfileOpen]);

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
  }, [isDeviceDialogOpen]);

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
      <div className="min-h-screen flex w-full animate-in">
        <AdminSidebar />
        <div className="flex-1">
          <header className="border-b bg-background">
            <div className="container flex h-16 items-center justify-between">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <div className="flex items-center gap-4">
                <Button size="icon" variant="outline">
                  <Bell className="h-4 w-4" />
                </Button>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="outline">
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

                {/* Profile Dialog */}
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Admin Profile</DialogTitle>
                    </DialogHeader>
                    {admin ? (
                      <div className="space-y-2">
                        <p><strong>ID:</strong> {admin.id_no}</p>
                        <p><strong>Name:</strong> {admin.name}</p>
                        <p><strong>Email:</strong> {admin.email}</p>
                        <p className="text-sm text-foreground"><strong>Wallet:</strong> {admin.walletAddress}</p>
                      </div>
                    ) : <p>Loading...</p>}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Device Dialog */}
                <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Logged In Devices</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
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
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeviceDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>
          <main className="container py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
