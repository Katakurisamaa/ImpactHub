"use client";

import { useEffect, useRef, useState } from "react";
import { HomeCell } from "./HomeCellsList";
import { Loader2, MapPin, Navigation, Compass, CheckCircle2 } from "lucide-react";

interface CellsMapViewProps {
  cells: HomeCell[];
  userCoords?: { lat: number; lon: number } | null;
  selectedCell?: HomeCell | null;
  onSelectCell: (cell: HomeCell) => void;
  onGeolocateUser?: () => void;
  isGeolocating?: boolean;
}

export default function CellsMapView({
  cells,
  userCoords,
  selectedCell,
  onSelectCell,
  onGeolocateUser,
  isGeolocating,
}: CellsMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if Leaflet CSS exists
    const cssId = "leaflet-css-cdn";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Check if Leaflet JS exists
    const scriptId = "leaflet-js-cdn";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center: Europe / Belgium or first cell
      const firstValidCell = cells.find(c => c.latitude || c.lat);
      const defaultLat = firstValidCell?.latitude || firstValidCell?.lat || 50.47;
      const defaultLon = firstValidCell?.longitude || firstValidCell?.lng || 4.43;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLon],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // CartoDB Dark Matter Tiles (matches #06061a)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setMapLoaded(true);
    };

    if (!(window as any).L) {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => setTimeout(initMap, 100);
        script.onerror = () => setLoadingError(true);
        document.body.appendChild(script);
      } else {
        script.addEventListener("load", () => setTimeout(initMap, 100));
      }
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when cells or user coords change
  useEffect(() => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!L || !map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds: [number, number][] = [];

    // 1. Plot Cells
    cells.forEach((cell) => {
      const lat = cell.latitude || cell.lat;
      const lon = cell.longitude || cell.lng;

      if (!lat || !lon) return;

      bounds.push([lat, lon]);

      const isSelected = selectedCell?.id === cell.id;

      // Custom Gold Sanctuary Pin
      const iconHtml = `
        <div style="
          width: 34px; 
          height: 34px; 
          border-radius: 50%; 
          background: ${isSelected ? '#f5d77f' : 'rgba(6,6,26,0.9)'}; 
          border: 2px solid ${isSelected ? '#ffffff' : '#d4a843'}; 
          box-shadow: 0 0 ${isSelected ? '16px rgba(245,215,127,0.9)' : '10px rgba(212,168,67,0.4)'}; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: all 0.2s ease;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#06061a' : '#d4a843'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-cell-pin",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(markersLayerRef.current);

      marker.on("click", () => {
        onSelectCell(cell);
      });
    });

    // 2. Plot User Location if available
    if (userCoords) {
      bounds.push([userCoords.lat, userCoords.lon]);

      const userIconHtml = `
        <div style="
          width: 22px; 
          height: 22px; 
          border-radius: 50%; 
          background: #38bdf8; 
          border: 3px solid #ffffff; 
          box-shadow: 0 0 14px rgba(56,189,248,0.8);
          animation: pulse 2s infinite;
        "></div>
      `;

      const userIcon = L.divIcon({
        html: userIconHtml,
        className: "custom-user-pin",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      L.marker([userCoords.lat, userCoords.lon], { icon: userIcon }).addTo(markersLayerRef.current);
    }

    // Fit map bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [cells, userCoords, selectedCell, mapLoaded]);

  if (loadingError) {
    return (
      <div className="h-72 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-6 text-center text-sm text-[var(--text-muted)]">
        <MapPin className="w-8 h-8 text-[var(--gold)] mb-2 opacity-50" />
        <p>Impossible de charger la carte en ligne pour le moment.</p>
        <p className="text-xs text-white/40 mt-1">Veuillez utiliser la vue liste ci-dessous.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-xl bg-navy">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-80 md:h-96 z-10" />

      {/* Map Controls Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full bg-navy/80 backdrop-blur-md border border-white/10 text-xs text-[var(--gold-light)] flex items-center gap-1.5 shadow-lg">
          <Compass size={14} className="text-[var(--gold)]" />
          <span>{cells.length} cellule(s) sur la carte</span>
        </div>
      </div>

      {onGeolocateUser && (
        <button
          onClick={onGeolocateUser}
          disabled={isGeolocating}
          className="absolute top-3 right-3 z-20 p-2.5 rounded-xl bg-navy/80 backdrop-blur-md border border-white/10 text-[var(--text)] hover:text-[var(--gold)] hover:border-[var(--gold)]/40 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          title="Centrer sur ma position"
        >
          {isGeolocating ? <Loader2 size={16} className="animate-spin text-[var(--gold)]" /> : <Navigation size={16} />}
        </button>
      )}

      {/* Selected Cell Floating Card on Map */}
      {selectedCell && (
        <div className="absolute bottom-3 left-3 right-3 md:left-6 md:right-auto md:max-w-sm z-20 p-4 rounded-xl bg-navy/95 backdrop-blur-md border border-[var(--gold)]/40 shadow-2xl space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gold-light)]">Cellule sélectionnée</span>
              <h4 className="text-sm font-bold text-white">{selectedCell.name}</h4>
            </div>
            <span className="text-xs text-white/60 font-medium">{selectedCell.meeting_time}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] line-clamp-1 flex items-center gap-1">
            <MapPin size={12} className="text-[var(--gold)]" />
            {selectedCell.address.includes(',') ? selectedCell.address.split(',').slice(-1)[0].trim() : "Secteur confidentiel"}
          </p>
          <button
            onClick={() => onSelectCell(selectedCell)}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-[var(--gold-pale)] border border-[var(--gold)] text-[var(--gold-light)] hover:bg-[var(--gold)] hover:text-navy font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Rejoindre cette cellule</span>
            <CheckCircle2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
