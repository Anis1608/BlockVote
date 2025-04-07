import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Vote, BarChart3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import useAxios from "@/axiosInstance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

type Phase = "registration" | "voting" | "results";

interface PhaseOption {
  id: Phase;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const phases: PhaseOption[] = [
  {
    id: "registration",
    name: "Registration",
    icon: ClipboardList,
    description: "Allow voters and candidates to register for the election",
  },
  {
    id: "voting",
    name: "Voting",
    icon: Vote,
    description: "Open the election for voting by registered voters",
  },
  {
    id: "results",
    name: "Results",
    icon: BarChart3,
    description: "Close voting and publish the election results",
  },
];

export function ElectionPhaseSelector() {
  const [phase, setPhase] = useState<Phase>("voting");
  const [showDialog, setShowDialog] = useState(false);
  const [pendingPhase, setPendingPhase] = useState<Phase | null>(null);
  const { toast } = useToast();
  const axios = useAxios();

  // Fetch current phase from backend
  useEffect(() => {
    const fetchPhase = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/get-current-phase" , {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "device-id": localStorage.getItem("deviceId"),
          },
        }); // adjust if needed
        setPhase(res.data.currentPhase);
      } catch (err) {
        console.error("Failed to fetch current phase", err);
      }
    };
    fetchPhase();
  }, []);

  const handlePhaseSelect = (selected: Phase) => {
    if (selected === phase) return;
    setPendingPhase(selected);
    setShowDialog(true);
  };

  const confirmPhaseChange = async () => {
    if (!pendingPhase) return;

    try {
      await axios.post("http://localhost:5000/api/changephase" , {
        currentPhase: pendingPhase,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "device-id": localStorage.getItem("deviceId"),
        },
      });
      setPhase(pendingPhase);
      toast({
        title: "Election phase updated",
        description: `The election is now in the ${pendingPhase} phase.`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error updating phase",
        description: "Something went wrong while updating the phase.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setShowDialog(false);
      setPendingPhase(null);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Election Phase</h3>
            <p className="text-sm text-muted-foreground">
              Control the current phase of the election process
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {phases.map((option) => {
              const Icon = option.icon;
              const isActive = phase === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center rounded-lg border bg-background p-4 text-center",
                    isActive
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-muted hover:border-primary"
                  )}
                  onClick={() => handlePhaseSelect(option.id)}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 mb-2",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                  {isActive && (
                    <div className="absolute -right-1 -top-1 rounded-full bg-primary text-primary-foreground p-1">
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Phase Change
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to change the election phase to{" "}
              <span className="font-medium">
                {pendingPhase && phases.find(p => p.id === pendingPhase)?.name}
              </span>
              ? This action will affect the availability of voting and registration features.
            </DialogDescription>
          </DialogHeader>

          {pendingPhase === "results" && (
            <div className="rounded-md bg-warning/10 border-warning/20 border p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning">Warning</h4>
                  <p className="text-sm text-muted-foreground">
                    Moving to the Results phase will permanently close voting. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPhaseChange}>Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
