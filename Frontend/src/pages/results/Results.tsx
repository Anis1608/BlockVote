"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink, Download } from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

interface CityWinner {
  winner: string;
  party: string;
  votes: number;
}

interface StateWinner {
  winningParty: string;
  votes: number;
}

export default function Results() {
  const [cityWinners, setCityWinners] = useState<Record<string, CityWinner>>({});
  const [stateWinner, setStateWinner] = useState<StateWinner | null>(null);
  const walletAddress = localStorage.getItem("walletAddress");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const { data } = await axios.get("http://localhost:5000/api/result", {
          headers: {
            Authorization: `Bearer ${token}`,
            "device-id": localStorage.getItem("deviceId"),
          },
        });

        setCityWinners(data.cityWinners);
        setStateWinner(data.stateWinners["Maharashtra"]);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      }
    };

    fetchResults();
  }, []);

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/downloadStellar", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "device-id": localStorage.getItem("deviceId"),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "BlockChain_transactions.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading file:", error.message);
    }
  };

  const exportResults = () => {
    if (!cityWinners || Object.keys(cityWinners).length === 0) {
      console.warn("No results to export.");
      return;
    }

    const headers = ["City", "Winner", "Party", "Votes"];
    const rows = Object.entries(cityWinners).map(([city, data]) => [
      city,
      data.winner,
      data.party,
      data.votes,
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "citywise_results.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const shareResults = () => {
    const shareText = `🏆 Election Results\nState Winner: ${stateWinner?.winningParty} with ${stateWinner?.votes} votes.\nView on Blockchain: https://stellar.expert/explorer/testnet/search?term=${walletAddress}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Blockchain Election Results",
          text: shareText,
          url: window.location.href,
        })
        .then(() => console.log("Shared successfully"))
        .catch(err => console.error("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Results copied to clipboard. Share it anywhere!");
      });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 animate-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Election Results</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Blockchain Election • Final Results</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={shareResults} className="flex-1 sm:flex-none">
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={exportResults} className="flex-1 sm:flex-none">
            Export
          </Button>
        </div>
      </div>

      {/* State Result */}
      {stateWinner && (
        <Card>
          <CardHeader>
            <CardTitle>State Result</CardTitle>
            <CardDescription>Overall winner for Maharashtra</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-lg font-semibold">
              Winning Party: <span className="text-primary">{stateWinner.winningParty}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Total Votes: {stateWinner.votes}
            </div>
          </CardContent>
        </Card>
      )}

      {/* City Wise Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>City-wise Winners</CardTitle>
              <CardDescription>Breakdown of winners by city</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(cityWinners).map(([city, data]) => (
              <div key={city} className="space-y-1 p-3 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h3 className="font-semibold text-sm sm:text-base">{city}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{data.votes} votes</p>
                </div>
                <div className="text-xs sm:text-sm">
                  Winner: <span className="font-medium">{data.winner}</span> ({data.party})
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Show All Cities
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Blockchain Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Verification</CardTitle>
          <CardDescription>
            Verify the integrity of the election results on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-3 sm:p-4">
            <h4 className="font-medium text-sm sm:text-base mb-2">Election Smart Contract Address</h4>
            <p className="font-mono text-xs break-all">{walletAddress}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              className="flex-1"
              to={`https://stellar.expert/explorer/testnet/search?term=${walletAddress}`}
              target="_blank"
            >
              <Button className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span className="truncate">Verify on Blockchain Explorer</span>
              </Button>
            </Link>
            <Button onClick={handleDownloadCSV} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              <span className="truncate">Download Verification Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}