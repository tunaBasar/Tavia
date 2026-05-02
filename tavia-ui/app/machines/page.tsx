"use client";

import { useState } from "react";
import {
  Cpu,
  Loader2,
  AlertCircle,
  Plus,
  Wifi,
  WifiOff,
  Activity,
  Wrench,
  AlertTriangle,
  Monitor,
  Coffee,
  Database,
  Hash,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useMachines, useRegisterMachine } from "@/lib/hooks/use-machines";
import type { Machine, MachineType, MachineStatus } from "@/types";

// ─── Domain Helpers ──────────────────────────────────────────────

const MACHINE_TYPE_CONFIG: Record<
  MachineType,
  { label: string; icon: React.ElementType; color: string }
> = {
  BREWER: { label: "Smart Brewer", icon: Coffee, color: "text-amber-500" },
  FETCHER: { label: "Material Fetcher", icon: Database, color: "text-zinc-500" },
  CLEANER: { label: "Automated Cleaner", icon: Activity, color: "text-cyan-500" },
};

function getMachineConfig(type: MachineType) {
  return MACHINE_TYPE_CONFIG[type] ?? { label: type, icon: Cpu, color: "text-primary" };
}

const MACHINE_STATUS_CONFIG: Record<
  MachineStatus,
  { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  OFFLINE: { label: "Offline", icon: WifiOff, variant: "secondary" },
  IDLE: { label: "Idle", icon: Wifi, variant: "outline" },
  BREWING: { label: "Active", icon: Activity, variant: "default" },
  MAINTENANCE: { label: "Maintenance", icon: Wrench, variant: "secondary" },
  ERROR: { label: "Error", icon: AlertTriangle, variant: "destructive" },
};

function getStatusConfig(status: MachineStatus) {
  return MACHINE_STATUS_CONFIG[status] ?? { label: status, icon: Activity, variant: "secondary" };
}

// ─── Main Page Component ─────────────────────────────────────────

export default function MachinesPage() {
  const { data: machines = [], isLoading, isError, error } = useMachines();
  const registerMutation = useRegisterMachine();
  
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [machineType, setMachineType] = useState<MachineType>("BREWER");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !macAddress || !machineType) {
      toast.error("Please fill in all required fields.");
      return;
    }

    registerMutation.mutate({ name, macAddress, machineType }, {
      onSuccess: () => {
        toast.success("Machine registered successfully");
        setIsRegisterOpen(false);
        setName("");
        setMacAddress("");
        setMachineType("BREWER");
      },
      onError: (err) => {
        toast.error("Failed to register machine", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      },
    });
  }

  const activeMachines = machines.filter(m => m.status === 'BREWING' || m.status === 'IDLE').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            IoT Fleet Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor and manage your connected physical machines.
          </p>
        </div>
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 size-4" />
              Register Machine
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Machine</DialogTitle>
              <DialogDescription>
                Add a new physical machine to your local IoT fleet.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Machine Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Front Bar Espresso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="macAddress">MAC Address</Label>
                <Input
                  id="macAddress"
                  placeholder="00:1B:44:11:3A:B7"
                  className="font-mono text-sm"
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machineType">Machine Type</Label>
                <Select
                  value={machineType}
                  onValueChange={(val) => setMachineType(val as MachineType)}
                >
                  <SelectTrigger id="machineType">
                    <SelectValue placeholder="Select machine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BREWER">Smart Brewer</SelectItem>
                    <SelectItem value="FETCHER">Material Fetcher</SelectItem>
                    <SelectItem value="CLEANER">Automated Cleaner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Register
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Connecting to IoT Registry...</span>
        </div>
      ) : isError ? (
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 py-8">
            <AlertCircle className="size-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Failed to load machines</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : machines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Cpu className="size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">No machines registered in your fleet.</p>
            <Button variant="outline" onClick={() => setIsRegisterOpen(true)} className="mt-2">
              <Plus className="mr-2 size-4" /> Add First Machine
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <p className="text-sm font-medium text-muted-foreground">Total Fleet</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{machines.length}</p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <p className="text-sm font-medium text-muted-foreground">Active Units</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{activeMachines}</p>
            </div>
          </div>

          {/* Machine Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {machines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onSelect={() => setSelectedMachine(machine)}
              />
            ))}
          </div>
        </>
      )}

      {/* Machine Detail Sheet */}
      <Sheet open={selectedMachine !== null} onOpenChange={(open) => !open && setSelectedMachine(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedMachine && (
            <div className="flex h-full flex-col">
              <SheetHeader className="space-y-4 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
                      {(() => {
                        const Icon = getMachineConfig(selectedMachine.machineType).icon;
                        return <Icon className={`size-6 ${getMachineConfig(selectedMachine.machineType).color}`} />;
                      })()}
                    </div>
                    <div>
                      <SheetTitle className="text-lg font-bold">{selectedMachine.name}</SheetTitle>
                      <SheetDescription className="text-sm">
                        {getMachineConfig(selectedMachine.machineType).label}
                      </SheetDescription>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusConfig(selectedMachine.status).variant} className="flex gap-1.5 items-center">
                    {(() => {
                      const StatusIcon = getStatusConfig(selectedMachine.status).icon;
                      return <StatusIcon className="size-3" />;
                    })()}
                    {getStatusConfig(selectedMachine.status).label}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    v{selectedMachine.firmwareVersion}
                  </Badge>
                </div>
              </SheetHeader>

              <Separator />

              <div className="flex-1 py-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Hardware Details</h3>
                  </div>
                  
                  <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">MAC Address</p>
                      <p className="mt-1 font-mono text-sm tracking-widest text-foreground">{selectedMachine.macAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Device ID (UUID)</p>
                      <p className="mt-1 font-mono text-xs text-foreground/70">{selectedMachine.id}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Operational Status</h3>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-card p-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedMachine.status === 'OFFLINE' ? 
                        "Device is currently unreachable. Check power and network connectivity." : 
                        "Device is online and responding to telemetry pings."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Machine Card ────────────────────────────────────────────────

function MachineCard({ machine, onSelect }: { machine: Machine; onSelect: () => void }) {
  const config = getMachineConfig(machine.machineType);
  const statusConfig = getStatusConfig(machine.status);
  const Icon = config.icon;

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-lg">
              <Icon className={`size-5 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold leading-tight">{machine.name}</CardTitle>
              <CardDescription className="mt-0.5 text-xs">{config.label}</CardDescription>
            </div>
          </div>
          <Badge variant={statusConfig.variant} className="capitalize">
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Hash className="size-3.5" />
            <span className="font-mono uppercase">{machine.macAddress}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-accent overflow-hidden">
            <div 
              className={`h-full ${machine.status === 'OFFLINE' ? 'bg-destructive/50' : machine.status === 'BREWING' ? 'bg-emerald-500 animate-pulse' : 'bg-primary/50'}`} 
              style={{ width: machine.status === 'OFFLINE' ? '0%' : '100%' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
