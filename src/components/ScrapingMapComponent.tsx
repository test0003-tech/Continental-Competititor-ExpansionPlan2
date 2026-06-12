"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet.heat";
import type { Dealer } from "@/lib/types";
import { BRAND_CONFIG } from "@/lib/types";

interface ScrapingMapProps {
  dealers: Dealer[];
  center: [number, number];
  zoom: number;
  selectedBrands: Set<string>;
  mapMode: "dots" | "heatmap";
}

function getCompetitorRadius(zoom: number): number {
  const baseFactor = 3;
  const radius = baseFactor * Math.pow(2, (zoom - 10) * 0.28);
  return Math.max(1, Math.min(8, radius));
}

function getContinentalRadius(zoom: number): number {
  const baseFactor = 5;
  const radius = baseFactor * Math.pow(2, (zoom - 10) * 0.28);
  return Math.max(1.5, Math.min(12, radius));
}

function getCompetitorOpacity(zoom: number): number {
  if (zoom <= 5) return 0.75;
  if (zoom <= 8) return 0.65;
  return 0.55;
}

function getContinentalOpacity(zoom: number): number {
  if (zoom <= 5) return 0.95;
  if (zoom <= 8) return 0.9;
  return 0.85;
}

function getCompetitorFillOpacity(zoom: number): number {
  if (zoom <= 5) return 0.65;
  if (zoom <= 8) return 0.55;
  return 0.5;
}

function getContinentalFillOpacity(zoom: number): number {
  if (zoom <= 5) return 0.85;
  if (zoom <= 8) return 0.8;
  return 0.75;
}

function getContinentalWeight(zoom: number): number {
  if (zoom <= 5) return 1.5;
  if (zoom <= 8) return 2;
  return 2.5;
}

interface MarkerMeta {
  marker: L.CircleMarker;
  isContinental: boolean;
  brandKey: string;
}

export default function ScrapingMapComponent({
  dealers,
  center,
  zoom,
  selectedBrands,
  mapMode,
}: ScrapingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMetasRef = useRef<MarkerMeta[]>([]);
  const lastDealerCountRef = useRef<number>(0);

  const updateMarkerSizes = useCallback(() => {
    if (!mapRef.current) return;
    const currentZoom = mapRef.current.getZoom();
    for (const meta of markerMetasRef.current) {
      if (meta.isContinental) {
        meta.marker.setRadius(getContinentalRadius(currentZoom));
        meta.marker.setStyle({
          opacity: getContinentalOpacity(currentZoom),
          fillOpacity: getContinentalFillOpacity(currentZoom),
          weight: getContinentalWeight(currentZoom),
        });
      } else {
        meta.marker.setRadius(getCompetitorRadius(currentZoom));
        meta.marker.setStyle({
          opacity: getCompetitorOpacity(currentZoom),
          fillOpacity: getCompetitorFillOpacity(currentZoom),
        });
      }
    }
  }, []);

  function buildPopupContent(dealer: Dealer, isContinental: boolean): string {
    const cityState = [dealer.city, dealer.state].filter(Boolean).join(", ");
    const pinStr = dealer.pincode ? ` - ${dealer.pincode}` : "";

    if (isContinental) {
      return `
        <div style="font-family: system-ui, sans-serif; min-width: 200px;">
          <div style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a1a1a; padding: 6px 10px; font-weight: 700; font-size: 11px;">
            CONTINENTAL
          </div>
          <div style="padding: 6px 10px; background: #1a1a2e;">
            <div style="font-weight: 600; font-size: 12px; margin-bottom: 3px; color: #e5e7eb;">${dealer.name}</div>
            ${dealer.address ? `<div style="font-size: 10px; color: #9ca3af; margin-bottom: 2px;">${dealer.address}</div>` : ""}
            ${cityState ? `<div style="font-size: 10px; color: #9ca3af;">${cityState}${pinStr}</div>` : ""}
            ${dealer.phone ? `<div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">${dealer.phone}</div>` : ""}
          </div>
        </div>
      `;
    }

    const config = BRAND_CONFIG[dealer.brandKey];
    const color = config?.color || "#999";
    return `
      <div style="font-family: system-ui, sans-serif; min-width: 180px;">
        <div style="background: ${color}; color: white; padding: 5px 10px; font-weight: 600; font-size: 11px;">
          ${dealer.brand}
        </div>
        <div style="padding: 6px 10px; background: #1a1a2e;">
          <div style="font-weight: 600; font-size: 12px; margin-bottom: 3px; color: #e5e7eb;">${dealer.name}</div>
          ${dealer.address ? `<div style="font-size: 10px; color: #9ca3af; margin-bottom: 2px;">${dealer.address}</div>` : ""}
          ${cityState ? `<div style="font-size: 10px; color: #9ca3af;">${cityState}${pinStr}</div>` : ""}
        </div>
      </div>
    `;
  }

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 18,
      }
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    map.on("zoomend", () => {
      updateMarkerSizes();
    });

    return () => {
      map.remove();
      mapRef.current = null;
      lastDealerCountRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center/zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom, { animate: true, duration: 0.8 });
    }
  }, [center, zoom]);

  // Incrementally add new dealers (only add the diff)
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const startIdx = lastDealerCountRef.current;
    if (startIdx >= dealers.length) return;

    const currentZoom = mapRef.current.getZoom();
    const newDealers = dealers.slice(startIdx);

    const validNewDealers = newDealers.filter(
      (d) =>
        d.lat !== 0 &&
        d.lng !== 0 &&
        !isNaN(d.lat) &&
        !isNaN(d.lng) &&
        d.lat >= 6 &&
        d.lat <= 37 &&
        d.lng >= 68 &&
        d.lng <= 98
    );

    for (const dealer of validNewDealers) {
      if (!selectedBrands.has(dealer.brandKey)) continue;

      const isContinental = dealer.brandKey === "continental";

      if (mapMode === "dots") {
        let options: L.CircleMarkerOptions;
        if (isContinental) {
          options = {
            radius: getContinentalRadius(currentZoom),
            fillColor: "#FFD700",
            color: "#B8860B",
            weight: getContinentalWeight(currentZoom),
            opacity: getContinentalOpacity(currentZoom),
            fillOpacity: getContinentalFillOpacity(currentZoom),
          };
        } else {
          const config = BRAND_CONFIG[dealer.brandKey];
          const color = config?.color || "#999";
          options = {
            radius: getCompetitorRadius(currentZoom),
            fillColor: color,
            color: color,
            weight: 1,
            opacity: getCompetitorOpacity(currentZoom),
            fillOpacity: getCompetitorFillOpacity(currentZoom),
          };
        }

        const marker = L.circleMarker([dealer.lat, dealer.lng], options);
        marker.bindPopup(buildPopupContent(dealer, isContinental), {
          className: "custom-popup",
          maxWidth: 260,
        });
        markersLayerRef.current!.addLayer(marker);

        markerMetasRef.current.push({
          marker,
          isContinental,
          brandKey: dealer.brandKey,
        });
      }
    }

    lastDealerCountRef.current = dealers.length;
  }, [dealers, selectedBrands, mapMode]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
