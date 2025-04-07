import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    candidateId: "",
    name: "",
    profilePic: "",
    age: "",
    qualification: "",
    locationCity: "",
    locationState: "",
    party: "",
  });

 const navigate = useNavigate();



  const fetchCandidates = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/all-candidate");
      setCandidates(res.data.getDetails || []);
    } catch (error) {
      console.error("Error fetching candidates", error);
    }
  };
  
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      navigate("/login");
      return;
    }})

  useEffect(() => {  
      fetchCandidates();
  }, []);

  const handleAddCandidate = async () => {
    try {
      const token = localStorage.getItem("adminToken"); // Get token from localStorage

      const payload = {
        candidateId: form.candidateId,
        name: form.name,
        profilePic: form.profilePic,
        age: Number(form.age),
        qualification: form.qualification,
        location: {
          city: form.locationCity,
          state: form.locationState,
        },
        party: form.party,
      };

      const res = await axios.post(
        "http://localhost:5000/api/register-candidate",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "device-id": localStorage.getItem("deviceId")
          },
        } 
      );

      if (res.data.success) {
        alert("Candidate registered successfully");
        fetchCandidates();
        setOpen(false);
        setForm({
          candidateId: "",
          name: "",
          profilePic: "",
          age: "",
          qualification: "",
          locationCity: "",
          locationState: "",
          party: "",
        });
      } else {
        alert(res.data.message || "Failed to register");
      }
    } catch (error) {
      console.error("Error registering candidate", error);
      alert("Error registering candidate");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Candidate Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Candidate</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Candidate</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="candidateId">Candidate ID</Label>
                <Input
                  id="candidateId"
                  value={form.candidateId}
                  onChange={(e) =>
                    setForm({ ...form, candidateId: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="party">Party</Label>
                <Input
                  id="party"
                  value={form.party}
                  onChange={(e) =>
                    setForm({ ...form, party: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) =>
                    setForm({ ...form, age: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={form.qualification}
                  onChange={(e) =>
                    setForm({ ...form, qualification: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="profilePic">Profile Picture URL</Label>
                <Input
                  id="profilePic"
                  value={form.profilePic}
                  onChange={(e) =>
                    setForm({ ...form, profilePic: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="locationCity">City</Label>
                <Input
                  id="locationCity"
                  value={form.locationCity}
                  onChange={(e) =>
                    setForm({ ...form, locationCity: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="locationState">State</Label>
                <Input
                  id="locationState"
                  value={form.locationState}
                  onChange={(e) =>
                    setForm({ ...form, locationState: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleAddCandidate}>Add Candidate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((candidate, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-md">
            <img
              src={candidate.profilePic}
              alt={candidate.name}
              className="h-32 w-32 object-cover rounded-full mx-auto mb-2"
            />
            <h3 className="text-lg font-semibold text-center">
              {candidate.name}
            </h3>
            <p className="text-sm text-center">Party: {candidate.party}</p>
            <p className="text-sm text-center">Age: {candidate.age}</p>
            <p className="text-sm text-center">City: {candidate.location.city}</p>
            <p className="text-sm text-center">State: {candidate.location.state}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateManagement;
