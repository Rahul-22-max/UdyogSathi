'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface GeolocationPickerProps {
  onLocationCaptured: (coords: { latitude: number; longitude: number }) => void;
  initialCoords?: { latitude: number; longitude: number } | null;
}

export const GeolocationPicker: React.FC<GeolocationPickerProps> = ({
  onLocationCaptured,
  initialCoords,
}) => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    initialCoords || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFetchLocation = () => {
    setIsLoading(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation API is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const result = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        };
        setCoords(result);
        onLocationCaptured(result);
        setIsLoading(false);
      },
      err => {
        console.error('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg('Location permission was denied. You can still submit the inspection report without GPS coordinates.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setErrorMsg('Location information is currently unavailable.');
        } else if (err.code === err.TIMEOUT) {
          setErrorMsg('Location request timed out. Please try again.');
        } else {
          setErrorMsg(`Unable to get location: ${err.message}`);
        }
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-saffron" />
          <h4 className="text-xs font-bold text-govBlue">Site Verification Geolocation (GPS)</h4>
        </div>
        {coords && (
          <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Tagged
          </span>
        )}
      </div>

      <p className="text-[11px] text-govMuted mb-3 leading-relaxed">
        Explicit consent is required to log latitude and longitude coordinates for inspection auditability.
      </p>

      {coords ? (
        <div className="bg-white p-2.5 rounded border border-slate-200 text-xs flex items-center justify-between">
          <div className="font-mono text-slate-800 font-medium">
            Lat: <span className="font-bold text-govBlue">{coords.latitude}</span>, Lon:{' '}
            <span className="font-bold text-govBlue">{coords.longitude}</span>
          </div>
          <button
            onClick={handleFetchLocation}
            className="text-[10px] text-saffron hover:underline font-semibold"
          >
            Re-tag GPS
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleFetchLocation}
          isLoading={isLoading}
          leftIcon={<Navigation className="w-3.5 h-3.5 text-saffron" />}
        >
          Tag Current GPS Location
        </Button>
      )}

      {errorMsg && (
        <div className="mt-2 text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-start gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
