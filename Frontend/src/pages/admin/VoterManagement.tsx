import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, Filter, Plus, Search } from "lucide-react";
import useAxios from "@/axiosInstance";

interface Voter {
  _id: string;
  voterId: string;
  name: string;
  dob: string;
  location: {
    city: string;
    state: string;
  };
  voteCast: boolean;
}

const VoterManagement = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVoter, setNewVoter] = useState({
    name: "",
    dob: "",
    city: "",
    state: "",
  });

  const axios = useAxios();
  const navigate = useNavigate();

  // ✅ Redirect to login if not authenticated
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Fetch all voters
  const fetchVoters = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/allvoter", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "device-id": localStorage.getItem("deviceId") || "",
        },
      });

      const data = res.data;
      if (data.Success) {
        setVoters(data.getDetails);
      } else {
        toast({ title: "Error fetching voters", description: data.message });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Server Error", description: "Failed to load voters" });
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  // ✅ Register new voter
  const handleRegisterVoter = async () => {
    const voterId = `VOTER${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
      voterId,
      name: newVoter.name,
      dob: new Date(newVoter.dob).toISOString(),
      location: {
        city: newVoter.city,
        state: newVoter.state,
      },
    };

    try {
      const res = await axios.post("http://localhost:5000/api/register-voter", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = res.data;
      if (data.Success) {
        toast({
          title: "Voter registered successfully",
          description: `Voter ID ${voterId} has been assigned to ${payload.name}`,
        });
        setNewVoter({ name: "", dob: "", city: "", state: "" });
        setIsDialogOpen(false);
        fetchVoters();
      } else {
        toast({ title: "Registration Failed", description: data.message });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Something went wrong." });
    }
  };

  const filteredVoters = voters.filter((voter) => {
    const query = searchQuery.toLowerCase();
    return (
      voter.name.toLowerCase().includes(query) ||
      voter.voterId.toLowerCase().includes(query) ||
      voter.location.city.toLowerCase().includes(query) ||
      voter.location.state.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Voter Management</h2>
          <p className="text-muted-foreground">Register and manage voters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Register Voter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Voter</DialogTitle>
              <DialogDescription>
                Add a new voter to the system. They will receive a unique voter ID.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Name</Label>
              <Input
                placeholder="Full name"
                value={newVoter.name}
                onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
              />
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={newVoter.dob}
                onChange={(e) => setNewVoter({ ...newVoter, dob: e.target.value })}
              />
              <Label>City</Label>
              <Input
                value={newVoter.city}
                onChange={(e) => setNewVoter({ ...newVoter, city: e.target.value })}
              />
              <Label>State</Label>
              <Input
                value={newVoter.state}
                onChange={(e) => setNewVoter({ ...newVoter, state: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRegisterVoter}
                disabled={!newVoter.name || !newVoter.dob || !newVoter.city || !newVoter.state}
              >
                Register
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Registered Voters</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="flex items-center rounded-md border px-3 py-1 text-sm">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Total: {voters.length}
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Voter ID</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVoters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No voters found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVoters.map((voter) => (
                    <TableRow key={voter._id}>
                      <TableCell>{voter.name}</TableCell>
                      <TableCell>{voter.voterId}</TableCell>
                      <TableCell>{voter.location.city}</TableCell>
                      <TableCell>{voter.location.state}</TableCell>
                      <TableCell>{new Date(voter.dob).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {voter.voteCast ? "Voted" : "Not Voted"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {filteredVoters.length} of {voters.length} voters
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VoterManagement;
