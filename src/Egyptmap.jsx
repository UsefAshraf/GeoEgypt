import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

export default function EgyptMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // List of Egyptian cities
  const cities = [
    "Cairo","Alexandria","Giza","Shubra El Kheima","Port Said","Suez","Mansoura",
    "El Mahalla El Kubra","Tanta","Asyut","Faiyum","Khusus","Zagazig","Ismailia",
    "Aswan","6th of October City","New Cairo","Damietta","Minya","Beni Suef","Luxor",
    "Sohag","Shibin El Kom","Qena","10th of Ramadan City","Mallawi","Hurghada",
    "Arish","Kafr El Sheikh","Bilbeis","Marsa Matruh","Banha","Sharm El Sheikh",
    "Marsa Alam","Siwa"
  ];

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
      const filtered = cities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // When user clicks a suggestion
  const handleSelect = async (city) => {
    setQuery(city);
    setSuggestions([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${city},Egypt`
      );
      const data = await response.json();

      if (data && data.length > 0 && mapInstance.current) {
        const lon = parseFloat(data[0].lon);
        const lat = parseFloat(data[0].lat);
        mapInstance.current.getView().animate({
          center: fromLonLat([lon, lat]),
          zoom: 10,
          duration: 1000,
        });
      }
    } catch (err) {
      console.error("Error fetching location:", err);
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
