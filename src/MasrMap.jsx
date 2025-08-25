import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

// بيانات المحافظات (اسم + إحداثيات)
const egyptRegions = [
  { name: "القاهرة", coords: [31.2357, 30.0444] },
  { name: "الجيزة", coords: [31.1313, 30.0131] },
  { name: "الإسكندرية", coords: [29.9187, 31.2001] },
  { name: "أسوان", coords: [32.8998, 24.0889] },
  { name: "الأقصر", coords: [32.6396, 25.6872] },
  { name: "المنيا", coords: [30.7323, 28.1099] },
  { name: "سوهاج", coords: [31.6948, 26.5560] },
  { name: "قنا", coords: [32.7267, 26.1551] },
  { name: "أسيوط", coords: [31.1820, 27.1801] },
  { name: "بورسعيد", coords: [32.3000, 31.2653] },
  { name: "الإسماعيلية", coords: [32.2715, 30.5965] },
  { name: "دمياط", coords: [31.8144, 31.4165] },
  { name: "سويس", coords: [32.5498, 29.9668] },
  { name: "مطروح", coords: [27.2453, 31.3525] },
  { name: "شمال سيناء", coords: [33.8000, 30.3000] },
  { name: "جنوب سيناء", coords: [34.2167, 28.5000] },
];

const MasrMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([31.2357, 30.0444]), // القاهرة
          zoom: 6,
        }),
      });
    }
  }, []);

  // تحديث الاقتراحات
  useEffect(() => {
    if (search.length > 0) {
      const filtered = egyptRegions.filter((r) =>
        r.name.includes(search)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  // تحريك الخريطة للمحافظة
  const goToRegion = (region) => {
    mapInstance.current.getView().animate({
      center: fromLonLat(region.coords),
      zoom: 8,
      duration: 1000,
    });
    setSearch(region.name);
    setSuggestions([]);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="ابحث عن محافظة..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px",
          zIndex: 1000,
          width: "250px",
        }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            listStyle: "none",
            padding: "0",
            margin: "0",
            width: "250px",
            maxHeight: "150px",
            overflowY: "auto",
            border: "1px solid #ccc",
            zIndex: 1000,
          }}
        >
          {suggestions.map((region, index) => (
            <li
              key={index}
              onClick={() => goToRegion(region)}
              style={{ padding: "8px", cursor: "pointer" }}
            >
              {region.name}
            </li>
          ))}
        </ul>
      )}
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100vh", marginTop: "50px" }}
      />
    </div>
  );
};

export default MasrMap;
