import React, { useRef, useState } from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

export default function AddressWithLocation({ onSelect }) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const autocompleteRef = useRef(null);
  const geocoderRef = useRef(null);
  const [value, setValue] = useState("");
  const [coords, setCoords] = useState(null);

  const extractAddressParts = (results) => {
    if (!results || !results[0]) return {};

    const comp = results[0].address_components;

    const get = (type) =>
      comp.find((c) => c.types.includes(type))?.long_name || "";

    return {
      address: results[0].formatted_address || "",
      city: get("locality") || get("administrative_area_level_2"),
      state: get("administrative_area_level_1"),
      pincode: get("postal_code"),
    };
  };

  const onLoadAutocomplete = (ac) => {
    autocompleteRef.current = ac;

    if (window.google && !geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  };

  const onPlaceChanged = () => {
    const ac = autocompleteRef.current;
    if (!ac) return;

    const place = ac.getPlace();
    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === "OK") {
          const parts = extractAddressParts(results);

          setValue(parts.address);
          setCoords({ lat, lng });

          onSelect({
            ...parts,
            location: { lat, lng },
          });
        }
      }
    );
  };

  const askForLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        if (!geocoderRef.current) return;

        geocoderRef.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === "OK") {
              const parts = extractAddressParts(results);

              setValue(parts.address);

              onSelect({
                ...parts,
                location: { lat, lng },
              });
            }
          }
        );
      },
      () => alert("Permission denied or unavailable")
    );
  };

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Autocomplete
          onLoad={onLoadAutocomplete}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search address..."
            style={{
              width: 320,
              height: 40,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        </Autocomplete>

        <button
          type="button"
          onClick={askForLocation}
          style={{
            height: 40,
            padding: "0 12px",
            borderRadius: 6,
            background: "#7C3AED",
            color: "#fff",
            border: "none",
          }}
        >
          Use My Location
        </button>
      </div>

      <small style={{ marginTop: 8, display: "block", color: "#666" }}>
        {coords
          ? `Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`
          : "Location not fetched yet"}
      </small>
    </LoadScript>
  );
}
