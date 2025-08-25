import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

function App() {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return; // ✅ prevent creating multiple maps

    mapObj.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0], // world center
        zoom: 2,
      }),
    });
  }, []);

  // Function to handle search
  const handleSearch = async (e) => {
    e.preventDefault(); // ✅ stops page reload
    if (!search) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const lon = parseFloat(data[0].lon);
        const lat = parseFloat(data[0].lat);

        mapObj.current.getView().animate({
          center: fromLonLat([lon, lat]),
          zoom: 12,
          duration: 1000,
        });
      } else {
        alert("Location not found!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Search box */}
      <form
        onSubmit={handleSearch}
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: "white",
          padding: "5px 10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search location..."
          style={{
            padding: "5px",
            fontSize: "14px",
            width: "200px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </form>

      {/* Map */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default App;
