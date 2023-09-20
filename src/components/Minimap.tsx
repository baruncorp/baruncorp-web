"use client";

import { MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl";

interface Props {
  longitude?: number;
  latitude?: number;
}

export default function Minimap({ longitude, latitude }: Props) {
  const [viewState, setViewState] = useState({
    longitude: -73.985542,
    latitude: 40.748466500000006,
    zoom: 10,
  });

  useEffect(() => {
    if (latitude && longitude) {
      setViewState({ longitude, latitude, zoom: 16 });
    }
  }, [latitude, longitude]);

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_API_KEY}
      {...viewState}
      onMove={(event) => setViewState(event.viewState)}
      style={{ width: "100%", height: "100%", borderRadius: "6px" }}
      mapStyle="mapbox://styles/mapbox/satellite-v9"
    >
      {longitude && latitude && (
        <Marker longitude={longitude} latitude={latitude} anchor="bottom">
          <MapPin color="white" fill="blue" />
        </Marker>
      )}
    </Map>
  );
}