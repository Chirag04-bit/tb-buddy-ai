import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hospital, ArrowLeft, MapPin, Phone, Navigation, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

const Hospitals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const requestLocation = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
          toast({
            title: "Location obtained",
            description: "Showing nearby hospitals based on your location"
          });
        },
        (error) => {
          setIsLoadingLocation(false);
          toast({
            title: "Location error",
            description: "Unable to get your location. Showing example hospitals.",
            variant: "destructive"
          });
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive"
      });
    }
  };

  if (!session) return null;

  // Example hospitals (in production, these would come from a real API based on location)
  const exampleHospitals = [
    {
      name: "City General Hospital",
      distance: "1.2 km",
      type: "Multi-specialty",
      emergency: true,
      phone: "+1-234-567-8900",
      address: "123 Main Street, Downtown",
      available247: true,
      services: ["Emergency", "ICU", "Surgery", "Radiology"]
    },
    {
      name: "St. Mary's Medical Center",
      distance: "2.5 km",
      type: "Teaching Hospital",
      emergency: true,
      phone: "+1-234-567-8901",
      address: "456 Oak Avenue, Medical District",
      available247: true,
      services: ["Emergency", "Cardiology", "Neurology", "Pediatrics"]
    },
    {
      name: "Community Health Clinic",
      distance: "0.8 km",
      type: "Clinic",
      emergency: false,
      phone: "+1-234-567-8902",
      address: "789 Elm Street, Riverside",
      available247: false,
      services: ["Primary Care", "Lab Tests", "Vaccinations"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/")} variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg">
                <Hospital className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Nearby Hospitals</h1>
                <p className="text-sm text-muted-foreground">Find emergency care facilities near you</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Location Request */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Enable Location Services</p>
                  <p className="text-sm text-muted-foreground">
                    {location 
                      ? "Showing hospitals near your location" 
                      : "Allow access to find hospitals near you"}
                  </p>
                </div>
              </div>
              {!location && (
                <Button 
                  onClick={requestLocation} 
                  disabled={isLoadingLocation}
                  className="gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  {isLoadingLocation ? "Getting location..." : "Enable Location"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hospitals List */}
        <div className="space-y-6">
          {exampleHospitals.map((hospital, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-elevated transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{hospital.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3" />
                      {hospital.distance} away
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={hospital.emergency ? "destructive" : "secondary"}>
                      {hospital.type}
                    </Badge>
                    {hospital.available247 && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        24/7
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Address */}
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{hospital.address}</p>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${hospital.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {hospital.phone}
                  </a>
                </div>

                {/* Services */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Available Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.services.map((service, idx) => (
                      <Badge key={idx} variant="outline">{service}</Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="default" 
                    className="gap-2"
                    onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(hospital.name + " " + hospital.address)}`, '_blank')}
                  >
                    <Navigation className="h-4 w-4" />
                    Directions
                  </Button>
                  <Button 
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(`tel:${hospital.phone}`)}
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Note:</strong> This is example data. In production, this would show real hospitals near your location using a maps API.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Hospitals;
