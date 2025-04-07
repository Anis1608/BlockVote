import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, CalendarRange, Clock, UserCheck, Users, Vote,
} from "lucide-react";
import { ElectionPhaseSelector } from "@/components/admin/ElectionPhaseSelector";
import useAxios  from "../../axiosInstance";

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

    const fetchDashboardStats = async () => {
      try {
        const headers = {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        };

        const voterRes = await axios.get("http://localhost:5000/api/register-votercount", headers);
        const voteRes = await axios.get("http://localhost:5000/api/total-votes", headers);
        const candidateRes = await axios.get("http://localhost:5000/api/total-candidate", headers);

        setTotalVoters(voterRes.data.totalVoter);
        setTotalVotes(voteRes.data.totalVotes);
        setTotalCandidates(candidateRes.data.totalCandidates);
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          navigate("/login");
        }
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  const stats = [
    {
      title: "Registered Voters",
      value: totalVoters !== null ? totalVoters : "Loading...",
      icon: Users,
      description: "Total registered",
      // change: "+5.2% from last hour",
    },
    {
      title: "Votes Cast",
      value: totalVotes !== null ? totalVotes : "Loading...",
      icon: Vote,
      description: totalVoters
        ? `${((totalVotes / totalVoters) * 100).toFixed(1)}% turnout`
        : "Calculating...",
      // change: "+12.3% from last hour",
    },
    {
      title: "Candidates",
      value: totalCandidates !== null ? totalCandidates : "Loading...",
      icon: UserCheck,
      description: "Presidential election",
      // change: "No change",
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
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            <span>Last updated: Just now</span>
          </Button>
          <Button size="sm" onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>

      <ElectionPhaseSelector />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="animate-in" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
            {/* <CardFooter> */}
              {/* <p className="text-xs text-muted-foreground">{stat.change}</p> */}
            {/* </CardFooter> */}
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-in" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle>Hourly Vote Distribution</CardTitle>
            <CardDescription>Total votes received per hour today</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-end gap-2">
              {hourlyVotes.map((item, i) => (
                <div key={i} className="relative flex flex-col justify-end">
                  <div
                    className="w-9 rounded-md bg-primary"
                    style={{ height: `${(item.votes / 250) * 100}%` }}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{item.hour}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle>Votes by Location</CardTitle>
            <CardDescription>Distribution across electoral districts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {locationVotes.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <p>{item.location}</p>
                  <p className="font-medium">{item.votes}</p>
                </div>
                <Progress value={(item.votes / 500) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 animate-in" style={{ animationDelay: "600ms" }}>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent system activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div key={i} className="flex items-start gap-4 rounded-md bg-muted p-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">{log.action}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                    <p className="text-xs">{log.details}</p>
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

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <UserCheck className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart className="mr-2 h-4 w-4" />
              Generate Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CalendarRange className="mr-2 h-4 w-4" />
              Manage Election Schedule
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
