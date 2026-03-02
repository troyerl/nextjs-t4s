"use client";

import { useEffect, useState } from "react";
import { latLng } from "@/lib/constants";

declare global {
  interface Window {
    google?: {
      maps?: {
        Map: new (element: HTMLElement, options: unknown) => unknown;
        marker?: {
          AdvancedMarkerElement: new (options: unknown) => unknown;
        };
      };
    };
  }
}

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.PUBLIC_GOOGLE_MAPS_API_KEY ??
  "";
const GOOGLE_MAP_ID =
  process.env.NEXT_PUBLIC_MAP_ID ?? process.env.PUBLIC_MAP_ID ?? "";

export default function GoogleMap() {
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      return;
    }

    let mounted = true;
    const mapId = "map";
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-t4s-google-maps="true"]',
    );

    function initializeMap() {
      if (!mounted) {
        return;
      }
      const mapRoot = document.getElementById(mapId);
      if (!mapRoot || !window.google?.maps?.Map) {
        return;
      }

      const map = new window.google.maps.Map(mapRoot, {
        center: latLng,
        zoom: 16,
        mapId: GOOGLE_MAP_ID || undefined,
      });

      if (window.google.maps.marker?.AdvancedMarkerElement) {
        const markerBadge = document.createElement("div");
        markerBadge.className =
          "rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white";
        markerBadge.textContent = "T4S";

        new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: latLng,
          title: "T4S Location",
          content: markerBadge,
        });
      }
    }

    if (existingScript) {
      initializeMap();
      return () => {
        mounted = false;
      };
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.dataset.t4sGoogleMaps = "true";
    script.onload = initializeMap;
    script.onerror = () => {
      if (mounted) {
        setScriptError(true);
      }
    };
    document.head.appendChild(script);

    return () => {
      mounted = false;
    };
  }, []);

  if (!GOOGLE_MAPS_API_KEY || scriptError) {
    return (
      <iframe
        title="Tools-4-Schools location"
        src={`https://maps.google.com/maps?q=${latLng.lat},${latLng.lng}&z=15&output=embed`}
        className="h-87.5 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return <div id="map" className="h-87.5 w-full rounded-lg" />;
}
