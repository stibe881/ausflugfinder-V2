import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/Map";
import { Navigation, Clock, MapPin, AlertCircle, Zap } from "lucide-react";
import { useState } from "react";

interface SegmentInfo {
  from: string;
  to: string;
  distance: string;
  duration: string;
  durationInTraffic: string;
  trafficCondition: 'good' | 'moderate' | 'slow' | 'unknown';
}

interface RouteMapProps {
  planItems: any[];
}

export default function RouteMap({ planItems }: RouteMapProps) {
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [segments, setSegments] = useState<SegmentInfo[]>([]);

  const itemsWithCoords = planItems?.filter(
    (item) => item.trip?.latitude && item.trip?.longitude
  ) || [];

  const getTrafficCondition = (
    duration: number,
    durationInTraffic: number
  ): 'good' | 'moderate' | 'slow' | 'unknown' => {
    if (!durationInTraffic) return 'unknown';
    const ratio = durationInTraffic / duration;
    if (ratio <= 1.1) return 'good';
    if (ratio <= 1.5) return 'moderate';
    return 'slow';
  };

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
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
        },
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);

          const route = result.routes[0];
          let totalDistance = 0;
          let totalDuration = 0;
          const segmentInfoList: SegmentInfo[] = [];

          route.legs.forEach((leg, index) => {
            totalDistance += leg.distance?.value || 0;
            totalDuration += leg.duration?.value || 0;

            const durationInTraffic = leg.duration_in_traffic?.value || leg.duration?.value || 0;
            const trafficCondition = getTrafficCondition(leg.duration?.value || 0, durationInTraffic);

            segmentInfoList.push({
              from: itemsWithCoords[index].trip.title,
              to: itemsWithCoords[index + 1].trip.title,
              distance: ((leg.distance?.value || 0) / 1000).toFixed(1) + " km",
              duration: Math.round((leg.duration?.value || 0) / 60) + " Min",
              durationInTraffic: Math.round(durationInTraffic / 60) + " Min",
              trafficCondition,
            });
          });

          setRouteInfo({
            distance: (totalDistance / 1000).toFixed(1) + " km",
            duration: Math.round(totalDuration / 60) + " Min",
          });
          setSegments(segmentInfoList);
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
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-3">Routenpunkte und Fahrtinformationen:</h4>
              <div className="space-y-3">
                {itemsWithCoords?.map((item, index) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="font-medium">{item.trip.title}</span>
                      <span className="text-muted-foreground text-xs">({item.trip.destination})</span>
                    </div>

                    {segments[index] && (
                      <div className="ml-8 bg-muted/50 rounded p-2 border border-border space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span>bis {segments[index].to}</span>
                          <span className="font-medium">{segments[index].distance}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{segments[index].duration}</span>

                          {segments[index].trafficCondition !== 'good' && (
                            <>
                              <span className="text-muted-foreground">|</span>
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span className="font-medium">{segments[index].durationInTraffic}</span>
                                {segments[index].trafficCondition === 'moderate' && (
                                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
                                    Mittelmäßig
                                  </Badge>
                                )}
                                {segments[index].trafficCondition === 'slow' && (
                                  <Badge variant="outline" className="text-xs bg-red-500/10 text-red-700 border-red-500/30">
                                    Zähfließend
                                  </Badge>
                                )}
                              </div>
                            </>
                          )}
                          {segments[index].trafficCondition === 'good' && (
                            <>
                              <span className="text-muted-foreground">|</span>
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/30">
                                ✓ Frei
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {segments.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Mit Verkehrsstatus (basierend auf aktuelle Bedingungen)
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
