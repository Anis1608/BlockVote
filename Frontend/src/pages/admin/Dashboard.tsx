import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  CalendarRange,
  Clock,
  UserCheck,
  Users,
  Vote,
} from "lucide-react";
import { ElectionPhaseSelector } from "@/components/admin/ElectionPhaseSelector";
import useAxios from "../../axiosInstance";

const Dashboard = () => {
  const [totalVoters, setTotalVoters] = useState(null);
  const [totalVotes, setTotalVotes] = useState(null);
  const [totalCandidates, setTotalCandidates] = useState(null);

  const axios = useAxios();
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      navigate("/login");
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "device-id": localStorage.getItem("deviceId"),
      },
    };

    // Fetch data in parallel
    axios
      .get("http://localhost:5000/api/register-votercount", headers)
      .then((res) => setTotalVoters(res.data.totalVoter))
      .catch((err) => handleAuthError(err));

    axios
      .get("http://localhost:5000/api/total-votes", headers)
      .then((res) => setTotalVotes(res.data.totalVotes))
      .catch((err) => handleAuthError(err));

    axios
      .get("http://localhost:5000/api/total-candidate", headers)
      .then((res) => setTotalCandidates(res.data.totalCandidates))
      .catch((err) => handleAuthError(err));
  }, [navigate, axios]);

  const handleAuthError = (err) => {
    console.error("Dashboard API error:", err);
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("adminToken");
      navigate("/login");
    }
  };

  const stats = [
    {
      title: "Registered Voters",
      value: totalVoters !== null ? totalVoters : "Loading...",
      icon: Users,
      description: "Total registered",
    },
    {
      title: "Votes Cast",
      value: totalVotes !== null ? totalVotes : "Loading...",
      icon: Vote,
      description:
        totalVoters && totalVotes !== null
          ? `${((totalVotes / totalVoters) * 100).toFixed(1)}% turnout`
          : "Calculating...",
    },
    {
      title: "Candidates",
      value: totalCandidates !== null ? totalCandidates : "Loading...",
      icon: UserCheck,
      description: "Presidential election",
    },
    {
      title: "Election Status",
      value: "Active",
      icon: CalendarRange,
      description: "Ends in 2 days, 14 hours",
      change: "Voting phase",
    },
  ];

  const hourlyVotes = [
    { hour: "8 AM", votes: 120 },
    { hour: "9 AM", votes: 170 },
    { hour: "10 AM", votes: 210 },
    { hour: "11 AM", votes: 180 },
    { hour: "12 PM", votes: 190 },
    { hour: "1 PM", votes: 230 },
    { hour: "2 PM", votes: 140 },
  ];

  const locationVotes = [
    { location: "North District", votes: 450 },
    { location: "South District", votes: 380 },
    { location: "East District", votes: 290 },
    { location: "West District", votes: 320 },
    { location: "Central District", votes: 410 },
  ];

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
            <div className="flex flex-col xs:flex-row gap-2">
              <Button 
                size="default" 
                onClick={() => window.location.reload()}
                className="w-full xs:w-auto"
              >
                Refresh
              </Button>
            </div>
          </div>

          <ElectionPhaseSelector />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card 
              key={i} 
              className="animate-in shadow-sm"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Hourly Votes Card */}
          <Card className="animate-in shadow-sm" style={{ animationDelay: "400ms" }}>
            <CardHeader>
              <CardTitle>Hourly Vote Distribution</CardTitle>
              <CardDescription>Total votes received per hour today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end gap-1 sm:gap-2 overflow-x-auto pb-4">
                {hourlyVotes.map((item, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col items-center flex-shrink-0"
                    style={{ width: "40px" }}
                  >
                    <div
                      className="w-6 sm:w-8 rounded-md bg-primary"
                      style={{ height: `${(item.votes / 250) * 100}%` }}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.hour}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Votes Card */}
          <Card className="animate-in shadow-sm" style={{ animationDelay: "500ms" }}>
            <CardHeader>
              <CardTitle>Votes by Location</CardTitle>
              <CardDescription>Distribution across electoral districts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {locationVotes.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <p className="truncate max-w-[120px] sm:max-w-none">
                      {item.location}
                    </p>
                    <p className="font-medium">{item.votes}</p>
                  </div>
                  <Progress value={(item.votes / 500) * 100} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in" 
          style={{ animationDelay: "600ms" }}
        >
          {/* Activity Log */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent system activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  action: "New voter registered",
                  timestamp: "2 minutes ago",
                  details: "Voter ID: V-3842",
                },
                {
                  action: "Vote cast",
                  timestamp: "5 minutes ago",
                  details: "Transaction: 0x7d5...7f6",
                },
                {
                  action: "Admin login",
                  timestamp: "10 minutes ago",
                  details: "User: admin@BlockVote.org",
                },
                {
                  action: "Election phase updated",
                  timestamp: "1 hour ago",
                  details: "Changed from Registration to Voting",
                },
              ].map((log, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-3 rounded-md bg-muted/50 p-3"
                >
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{log.action}</p>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                      <p className="text-xs text-muted-foreground">
                        {log.timestamp}
                      </p>
                      <p className="text-xs truncate">{log.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View All Activities
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="mr-2 h-4 w-4" />
                <span className="truncate">Add Candidate</span>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart className="mr-2 h-4 w-4" />
                <span className="truncate">Generate Reports</span>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CalendarRange className="mr-2 h-4 w-4" />
                <span className="truncate">Manage Election Schedule</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;