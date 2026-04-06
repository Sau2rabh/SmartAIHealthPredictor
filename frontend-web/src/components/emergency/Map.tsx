'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2, Navigation } from 'lucide-react';

// Fix for default Leaflet icon not appearing in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RedIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  center: [number, number];
  hospitals: any[];
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function Map({ center, hospitals }: MapProps) {
  return (
    <div className='h-[320px] md:h-[450px] w-full rounded-2xl overflow-hidden border border-white/10 relative'>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className='h-full w-full'
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <RecenterMap center={center} />

        {/* User Location */}
        <Marker position={center} icon={RedIcon}>
          <Popup>
            <div className='p-2'>
              <p className='font-bold text-red-600'>Your Location</p>
              <p className='text-xs'>Emergency Alert Location</p>
            </div>
          </Popup>
        </Marker>

        {/* Hospitals */}
        {hospitals.map((h, i) => (
          <Marker key={i} position={[h.lat, h.lon]}>
            <Popup>
              <div className='p-2 min-w-[150px]'>
                <h4 className='font-bold text-gray-900'>
                  {h.tags.name || 'Hospital'}
                </h4>
                <p className='text-xs text-gray-600 mt-1'>
                  {h.tags['addr:street'] || 'Near your location'}
                </p>
                <div className='flex gap-2 mt-2'>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                    target='_blank'
                    className='bg-cyan-600 text-white text-[10px] px-2 py-1 rounded font-bold hover:bg-cyan-500'
                  >
                    Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
