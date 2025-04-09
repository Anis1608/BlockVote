"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { Medal } from "lucide-react";

interface CandidateResult {
  _id: string;
  name: string;
  party: string;
  votes: number;
}

interface Admin {
  name: string;
  walletAddress: string;
  _id: string;
}

export default function PublicResultPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Get admins on mount
  useEffect(() => {
    axios.get("http://localhost:5000/api/admins")
      .then(res => setAdmins(res.data.admins))
      .catch(console.error);
  }, []);

  // Get public result when admin changes
  useEffect(() => {
    if (!selectedAdmin) return;
  
    setCandidates([]);
    setFilteredCandidates([]);
    setLoading(true);
  
    axios.get(`http://localhost:5000/api/public-result?adminId=${selectedAdmin._id}`)
      .then(res => {
        const allCandidates: CandidateResult[] = res.data.allCandidates.map((c: any) => ({
          _id: c.candidateId,
          name: c.name,
          party: c.party,
          votes: c.voteCount,
        }));
  
        setCandidates(allCandidates);
        setFilteredCandidates(allCandidates);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedAdmin]);

    // Filter candidates based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCandidates(candidates);
    } else {
      const filtered = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  }, [searchTerm, candidates]);

  // Get top 5 candidates by votes
  const topCandidates = [...candidates]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Election Results</h1>
            <p className="text-sm md:text-base text-gray-600">View candidate performance and voting statistics</p>
          </div>
          <Select
            value={selectedAdmin?._id || ""}
            onValueChange={(value) => {
              const admin = admins.find((a) => a._id === value);
              setSelectedAdmin(admin || null);
            }}
          >
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Select Admin" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((admin) => (
                <SelectItem key={admin._id} value={admin._id}>
                  {admin.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* No Admin Selected */}
        {!selectedAdmin && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Please select an admin to view election results.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Loading results...</p>
          </div>
        )}

        {/* Results Display */}
        {selectedAdmin && !loading && (
          <>
            {candidates.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No voting data found for the selected admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Top Candidates and Search */}
                <div className="space-y-6">
                  {/* Top Candidates Card */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Medal className="h-5 w-5 text-amber-500" />
                        <span>Top Candidates</span>
                      </CardTitle>
                      <CardDescription>Leading by vote count</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {topCandidates.map((candidate, index) => (
                          <div 
                            key={candidate._id} 
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold 
                              ${index === 0 ? 'bg-amber-100 text-amber-800' : 
                                index === 1 ? 'bg-gray-200 text-gray-800' : 
                                index === 2 ? 'bg-amber-50 text-amber-700' : 
                                'bg-gray-100 text-gray-600'}`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-medium truncate">{candidate.name}</p>
                              <p className="text-xs text-gray-500 truncate">{candidate.party}</p>
                            </div>
                            <div className="font-semibold text-primary">{candidate.votes.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Search Card */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>All Candidates</CardTitle>
                      <CardDescription>Search and filter candidates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        placeholder="Search by name or party..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                      />
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((candidate) => (
                            <div 
                              key={candidate._id} 
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="min-w-0">
                                <p className="font-medium truncate">{candidate.name}</p>
                                <p className="text-xs text-gray-500 truncate">{candidate.party}</p>
                              </div>
                              <div className="font-semibold">{candidate.votes.toLocaleString()}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            {searchTerm.trim() ? "No matching candidates" : "No candidates available"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Charts */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Pie Chart Card */}
                  {candidates.length > 0 && (
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle>Vote Distribution</CardTitle>
                        <CardDescription>Percentage of total votes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] md:h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={filteredCandidates.slice(0, 6).map(candidate => ({
                                  name: candidate.name,
                                  value: candidate.votes,
                                  party: candidate.party
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={40}
                                paddingAngle={2}
                                label={({ name, percent }) => 
                                  `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`
                                }
                                labelLine={false}
                                dataKey="value"
                              >
                                {filteredCandidates.slice(0, 6).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value: number, name: string, props: any) => [
                                  value.toLocaleString(), 
                                  `${props.payload.name} (${props.payload.party})`
                                ]}
                              />
                              <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom"
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value, entry, index) => 
                                  filteredCandidates[index]?.name.split(' ')[0]
                                }
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Bar Chart Card */}
                  {candidates.length > 0 && (
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle>Vote Comparison</CardTitle>
                        <CardDescription>Total votes per candidate</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] md:h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={filteredCandidates.slice(0, 10).map(candidate => ({
                                name: candidate.name.length > 15 
                                  ? `${candidate.name.substring(0, 12)}...` 
                                  : candidate.name,
                                votes: candidate.votes,
                                party: candidate.party
                              }))}
                              layout="vertical"
                              margin={{ left: 30, right: 20 }}
                            >
                              <XAxis 
                                type="number" 
                                tickFormatter={(value) => value.toLocaleString()}
                              />
                              <YAxis 
                                type="category" 
                                dataKey="name" 
                                width={90}
                                tick={{ fontSize: 12 }}
                              />
                              <Tooltip 
                                formatter={(value: number, name: string, props: any) => [
                                  value.toLocaleString(), 
                                  `${props.payload.party}`
                                ]}
                                labelFormatter={(label) => `Candidate: ${label}`}
                              />
                              <Legend />
                              <Bar 
                                dataKey="votes" 
                                name="Votes" 
                                fill="#0088FE" 
                                radius={[0, 4, 4, 0]}
                                animationDuration={1500}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}