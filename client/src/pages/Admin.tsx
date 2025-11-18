import { useQuery, useMutation } from "@tanstack/react-query";
import { Incident } from "@shared/schema";
import { ArrowLeft, MapPin, Clock, Camera, FileText, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { toast } = useToast();
  
  const { data: incidents, isLoading } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/incidents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Incident Deleted",
        description: "The incident has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the incident. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this incident?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    const priorityConfig: Record<string, { label: string; color: string }> = {
      priority1: { label: "Priority 1 (24hrs)", color: "#dc2626" },
      priority2: { label: "Priority 2 (48hrs)", color: "#ea580c" },
      priority3: { label: "Priority 3 (7 days)", color: "#ca8a04" },
    };

    const config = priorityConfig[priority] || { label: priority, color: "#1E88E5" };

    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: config.color }}
        data-testid={`badge-${priority}`}
      >
        {config.label}
      </span>
    );
  };

  // Calculate incident counts by type
  const getIncidentCounts = () => {
    if (!incidents) return { graffiti: 0, syringe: 0, dogWaste: 0 };
    
    return {
      graffiti: incidents.filter(i => i.objectType === "Graffiti").length,
      syringe: incidents.filter(i => i.objectType === "Syringe").length,
      dogWaste: incidents.filter(i => i.objectType === "Dog Waste").length,
    };
  };

  const counts = getIncidentCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="rounded-3xl p-6 mb-6"
          style={{
            background: "#1E88E5",
            backdropFilter: "blur(20px)",
            border: "1px solid white",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white" data-testid="text-admin-title">
                  Admin Dashboard
                </h1>
                <p className="text-white/90 mt-1">Incident Reports</p>
              </div>
            </div>
            {incidents && (
              <div className="text-white flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-center px-3 py-2 rounded-lg bg-white/10">
                    <div className="text-xl font-bold" data-testid="text-graffiti-count">
                      {counts.graffiti}
                    </div>
                    <div className="text-xs text-white/90">Graffiti</div>
                  </div>
                  <div className="text-center px-3 py-2 rounded-lg bg-white/10">
                    <div className="text-xl font-bold" data-testid="text-syringe-count">
                      {counts.syringe}
                    </div>
                    <div className="text-xs text-white/90">Syringe</div>
                  </div>
                  <div className="text-center px-3 py-2 rounded-lg bg-white/10">
                    <div className="text-xl font-bold" data-testid="text-dogwaste-count">
                      {counts.dogWaste}
                    </div>
                    <div className="text-xs text-white/90">Dog Waste</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" data-testid="text-incident-count">
                    {incidents.length}
                  </div>
                  <div className="text-sm text-white/90">Total</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-white text-lg">Loading incidents...</div>
          </div>
        )}

        {/* Incidents List */}
        {!isLoading && incidents && incidents.length === 0 && (
          <div 
            className="rounded-3xl p-12 text-center"
            style={{
              background: "#1E88E5",
              backdropFilter: "blur(20px)",
              border: "1px solid white",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
            }}
          >
            <AlertCircle className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Incidents Yet</h2>
            <p className="text-white/90">Submit your first incident report to see it here.</p>
          </div>
        )}

        {!isLoading && incidents && incidents.length > 0 && (
          <div className="grid gap-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-3xl p-6 bg-white"
                style={{
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)"
                }}
                data-testid={`incident-card-${incident.id}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Photo Section */}
                  <div className="lg:col-span-1">
                    {incident.photoUrl ? (
                      <img
                        src={incident.photoUrl}
                        alt="Incident"
                        className="w-full h-48 object-cover rounded-xl"
                        data-testid={`incident-photo-${incident.id}`}
                      />
                    ) : (
                      <div
                        className="w-full h-48 rounded-xl flex items-center justify-center"
                        style={{ background: "#f5f5f5", border: "1px solid #e0e0e0" }}
                        data-testid={`incident-no-photo-${incident.id}`}
                      >
                        <div className="text-center text-gray-400">
                          <Camera className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">No photo captured</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: "#1E88E5" }} data-testid={`incident-type-${incident.id}`}>
                          {incident.objectType}
                        </h3>
                        {incident.priority && getPriorityBadge(incident.priority)}
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="text-right text-sm text-gray-500">
                          <div className="flex items-center gap-2 justify-end">
                            <Clock className="w-4 h-4" />
                            <span data-testid={`incident-date-${incident.id}`}>
                              {formatDate(incident.timestamp)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {incident.id}
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(incident.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-${incident.id}`}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Location */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4" style={{ color: "#1E88E5" }} />
                          <span className="font-semibold text-gray-700">Location</span>
                        </div>
                        <p className="text-gray-900 ml-6" data-testid={`incident-location-${incident.id}`}>
                          {incident.locationName}
                        </p>
                      </div>

                      {/* GPS Coordinates */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4" style={{ color: "#1E88E5" }} />
                          <span className="font-semibold text-gray-700">GPS</span>
                        </div>
                        <p className="text-gray-900 font-mono text-sm ml-6" data-testid={`incident-gps-${incident.id}`}>
                          {incident.gpsCoordinates}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    {incident.details && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4" style={{ color: "#1E88E5" }} />
                          <span className="font-semibold text-gray-700">Details</span>
                        </div>
                        <p className="text-gray-700 ml-6 bg-gray-50 p-3 rounded-lg" data-testid={`incident-details-${incident.id}`}>
                          {incident.details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
