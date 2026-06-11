"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet.heat";
import type { Dealer } from "@/lib/types";
import { BRAND_CONFIG } from "@/lib/types";

interface MapComponentProps {
  dealers: Dealer[];
  center: [number, number];
  zoom: number;
  selectedBrands: Set<string>;
  mapMode: "dots" | "heatmap";
}

// Zoom-responsive radius calculation
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

export default function MapComponent({
  dealers,
  center,
  zoom,
  selectedBrands,
  mapMode,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.HeatLayer | null>(null);
  const markerMetasRef = useRef<MarkerMeta[]>([]);

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
    const cityState = [
      dealer.city,
      dealer.state,
    ].filter(Boolean).join(", ");
    const pinStr = dealer.pincode ? ` - ${dealer.pincode}` : "";

    if (isContinental) {
      return `
        <div style="font-family: system-ui, sans-serif; min-width: 200px;">
          <div style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a1a1a; padding: 6px 10px; font-weight: 700; font-size: 11px;">
            ⭐ CONTINENTAL
          </div>
          <div style="padding: 6px 10px; background: #1a1a2e;">
            <div style="font-weight: 600; font-size: 12px; margin-bottom: 3px; color: #e5e7eb;">${dealer.name}</div>
            ${dealer.address ? `<div style="font-size: 10px; color: #9ca3af; margin-bottom: 2px;">📍 ${dealer.address}</div>` : ""}
            ${cityState ? `<div style="font-size: 10px; color: #9ca3af;">${cityState}${pinStr}</div>` : ""}
            ${dealer.phone ? `<div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">📞 ${dealer.phone}</div>` : ""}
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
          ${dealer.address ? `<div style="font-size: 10px; color: #9ca3af; margin-bottom: 2px;">📍 ${dealer.address}</div>` : ""}
          ${cityState ? `<div style="font-size: 10px; color: #9ca3af;">${cityState}${pinStr}</div>` : ""}
        </div>
      </div>
    `;
  }

  // Initialize map
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
    };
  }, []);

  // Update center/zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom, { animate: true, duration: 0.8 });
    }
  }, [center, zoom]);

  // Render layers based on mapMode
  useEffect(() => {
    if (!mapRef.current) return;

    // Filter out dealers with invalid coordinates
    const validDealers = dealers.filter(
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

    if (mapMode === "heatmap") {
      // Hide dot markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      }
      markerMetasRef.current = [];

      // Remove existing heatmap
      if (heatmapLayerRef.current) {
        mapRef.current!.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }

      // Build heatmap data — Continental dealers get higher intensity
      const heatData: Array<[number, number, number]> = [];

      // Competitors first — medium intensity
      const competitorDealers = validDealers.filter(
        (d) => d.brandKey !== "continental"
      );
      for (const dealer of competitorDealers) {
        heatData.push([dealer.lat, dealer.lng, 16.0]);
      }

      // Continental — strong intensity
      const continentalDealers = validDealers.filter(
        (d) => d.brandKey === "continental"
      );
      for (const dealer of continentalDealers) {
        heatData.push([dealer.lat, dealer.lng, 30.0]);
      }

      if (heatData.length > 0) {
        const heatLayer = (L as unknown as { heatLayer: typeof import('leaflet').heatLayer }).heatLayer(heatData, {
          radius: 8,
          blur: 10,
          maxZoom: 15,
          max: 1.0,
          minOpacity: 0.15,
          gradient: {
            0.0: "transparent",
            0.05: "#fef9c3",
            0.15: "#fde047",
            0.3: "#facc15",
            0.45: "#f97316",
            0.6: "#ea580c",
            0.75: "#dc2626",
            0.88: "#991b1b",
            1.0: "#450a0a",
          },
        });
        heatLayer.addTo(mapRef.current!);
        heatmapLayerRef.current = heatLayer as unknown as L.HeatLayer;
      }
    } else {
      // Dot mode — remove heatmap, show circle markers
      if (heatmapLayerRef.current) {
        mapRef.current!.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }

      if (!markersLayerRef.current) return;
      markersLayerRef.current.clearLayers();
      markerMetasRef.current = [];

      const currentZoom = mapRef.current.getZoom();

      const competitorDealers = validDealers.filter(
        (d) => d.brandKey !== "continental"
      );
      const continentalDealers = validDealers.filter(
        (d) => d.brandKey === "continental"
      );

      for (const dealer of competitorDealers) {
        const config = BRAND_CONFIG[dealer.brandKey];
        const color = config?.color || "#999";

        const options: L.CircleMarkerOptions = {
          radius: getCompetitorRadius(currentZoom),
          fillColor: color,
          color: color,
          weight: 1,
          opacity: getCompetitorOpacity(currentZoom),
          fillOpacity: getCompetitorFillOpacity(currentZoom),
        };

        const marker = L.circleMarker([dealer.lat, dealer.lng], options);
        marker.bindPopup(buildPopupContent(dealer, false), {
          className: "custom-popup",
          maxWidth: 260,
        });
        markersLayerRef.current.addLayer(marker);

        markerMetasRef.current.push({
          marker,
          isContinental: false,
          brandKey: dealer.brandKey,
        });
      }

      // Add Continental dealers on top
      for (const dealer of continentalDealers) {
        const options: L.CircleMarkerOptions = {
          radius: getContinentalRadius(currentZoom),
          fillColor: "#FFD700",
          color: "#B8860B",
          weight: getContinentalWeight(currentZoom),
          opacity: getContinentalOpacity(currentZoom),
          fillOpacity: getContinentalFillOpacity(currentZoom),
        };

        const marker = L.circleMarker([dealer.lat, dealer.lng], options);
        marker.bindPopup(buildPopupContent(dealer, true), {
          className: "custom-popup",
          maxWidth: 280,
        });
        markersLayerRef.current.addLayer(marker);

        markerMetasRef.current.push({
          marker,
          isContinental: true,
          brandKey: "continental",
        });
      }
    }
  }, [dealers, mapMode]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
