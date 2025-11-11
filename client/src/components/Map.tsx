import { useRef, useEffect } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: any) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  const init = usePersistFn(async () => {
    // Placeholder map component - Google Maps integration disabled
    if (mapContainer.current) {
      mapContainer.current.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #f0f0f0; color: #666; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <p>Map functionality is currently disabled</p>
          </div>
        </div>
      `;
    }
    if (onMapReady) {
      onMapReady(null);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
  );
}
