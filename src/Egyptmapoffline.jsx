import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
// استورد ملف JSON المحلي
import egyptCities from "../egyptCities.json";

export default function Egyptmapoffline() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [new TileLayer({ source: new OSM() })],
        view: new View({
          center: fromLonLat([31.2357, 30.0444]), // Cairo
          zoom: 6,
        }),
      });
    }
  }, []);

  // Filter suggestions as user types
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 0) {
      const filtered = egyptCities
        .map((city) => city.name)
        .filter((city) =>
          city.toLowerCase().includes(value.toLowerCase())
        );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // When user clicks a suggestion (offline search)
  const handleSelect = (cityName) => {
    setQuery(cityName);
    setSuggestions([]);

    const city = egyptCities.find((c) => c.name === cityName);

    if (city && mapInstance.current) {
      mapInstance.current.getView().animate({
        center: fromLonLat([city.lon, city.lat]),
        zoom: 10,
        duration: 1000,
      });
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Search box */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "300px",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search Egyptian city..."
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginTop: "4px",
              maxHeight: "150px",
              overflowY: "auto",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              listStyle: "none",
              padding: 0,
            }}
          >
            {suggestions.map((city, index) => (
              <li
                key={index}
                onClick={() => handleSelect(city)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                onMouseLeave={(e) => (e.target.style.background = "white")}
              >
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
}

