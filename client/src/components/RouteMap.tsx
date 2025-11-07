import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/Map";
import { Navigation, Clock, MapPin } from "lucide-react";
import { useState } from "react";

interface RouteMapProps {
  planItems: any[];
}

export default function RouteMap({ planItems }: RouteMapProps) {
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  const itemsWithCoords = planItems?.filter(
    (item) => item.trip?.latitude && item.trip?.longitude
  ) || [];

  const handleMapReady = (map: google.maps.Map) => {
    if (itemsWithCoords.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
    });

    const waypoints = itemsWithCoords.slice(1, -1).map((item) => ({
      location: new window.google.maps.LatLng(
        Number(item.trip.latitude),
        Number(item.trip.longitude)
      ),
      stopover: true,
    }));

    const origin = new window.google.maps.LatLng(
      Number(itemsWithCoords[0].trip.latitude),
      Number(itemsWithCoords[0].trip.longitude)
    );

    const destination = new window.google.maps.LatLng(
      Number(itemsWithCoords[itemsWithCoords.length - 1].trip.latitude),
      Number(itemsWithCoords[itemsWithCoords.length - 1].trip.longitude)
    );

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          
          const route = result.routes[0];
          let totalDistance = 0;
          let totalDuration = 0;

          route.legs.forEach((leg) => {
            totalDistance += leg.distance?.value || 0;
            totalDuration += leg.duration?.value || 0;
          });

          setRouteInfo({
            distance: (totalDistance / 1000).toFixed(1) + " km",
            duration: Math.round(totalDuration / 60) + " Min",
          });
        }
      }
    );
  };

  if (itemsWithCoords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Routenplanung
          </CardTitle>
          <CardDescription>
            Füge Ausflüge mit Standortinformationen hinzu, um die Route zu planen
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (itemsWithCoords.length === 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Routenplanung
          </CardTitle>
          <CardDescription>
            Füge mindestens 2 Ausflüge hinzu, um eine Route zu planen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapView
              onMapReady={(map) => {
                new window.google.maps.Marker({
                  position: {
                    lat: Number(itemsWithCoords[0].trip.latitude),
                    lng: Number(itemsWithCoords[0].trip.longitude),
                  },
                  map,
                  title: itemsWithCoords[0].trip.title,
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Routenplanung
        </CardTitle>
        <CardDescription>
          Route zwischen {itemsWithCoords.length} Ausflügen
        </CardDescription>
        {routeInfo && (
          <div className="flex gap-4 mt-2">
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" />
              {routeInfo.distance}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {routeInfo.duration}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-96 rounded-lg overflow-hidden border">
            <MapView onMapReady={handleMapReady} />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Routenpunkte:</h4>
            {itemsWithCoords.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{index + 1}</Badge>
                <span>{item.trip.title}</span>
                <span className="text-muted-foreground">({item.trip.destination})</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
