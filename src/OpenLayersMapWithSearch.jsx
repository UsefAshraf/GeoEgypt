import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { boundingExtent } from "ol/extent";
import "ol/ol.css";

export default function OpenLayersMapWithSearch() {
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (mapObjRef.current) return; // init once

    // Marker layer (vector)
    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource,
      style: new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: "#10b981" }), // emerald
          stroke: new Stroke({ color: "#064e3b", width: 2 }),
        }),
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        markerLayer,
      ],
      view: new View({
        center: fromLonLat([31.2357, 30.0444]), // Cairo as a friendly default
        zoom: 6,
      }),
    });

    mapObjRef.current = map;
    markerLayerRef.current = markerLayer;

    // Resize map on container size changes
    const resizeObserver = new ResizeObserver(() => {
      map.updateSize();
    });
    if (mapRef.current) resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      map.setTarget(undefined);
    };
  }, []);

  const placeMarker = (lon, lat) => {
    const source = markerLayerRef.current.getSource();
    source.clear();
    const feature = new Feature({ geometry: new Point(fromLonLat([lon, lat])) });
    source.addFeature(feature);
  };

  const fitToBBox = (bbox) => {
    // Nominatim bbox format: [south, north, west, east]
    const [south, north, west, east] = bbox.map(Number);
    const sw = fromLonLat([west, south]);
    const ne = fromLonLat([east, north]);
    const extent = boundingExtent([sw, ne]);
    mapObjRef.current.getView().fit(extent, { padding: [40, 40, 40, 40], duration: 500 });
  };

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;

    setIsSearching(true);
    setErrorMsg("");

    try {
      // Respect Nominatim usage policy by sending a proper header if you proxy.
      // For local demos, this direct call is fine. Consider adding &countrycodes=eg if you want to bias Egypt.
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=1`;
      const res = await fetch(url, {
        headers: {
          // You may set a custom User-Agent via a proxy in production.
        },
      });
      if (!res.ok) throw new Error("Failed to fetch location");
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setErrorMsg("لا توجد نتائج للبحث.");
        return;
      }

      const item = data[0];
      const lat = Number(item.lat);
      const lon = Number(item.lon);

      if (item.boundingbox) {
        fitToBBox(item.boundingbox);
      } else {
        mapObjRef.current.getView().animate({ center: fromLonLat([lon, lat]), zoom: 12, duration: 500 });
      }

      placeMarker(lon, lat);
    } catch (err) {
      console.error(err);
      setErrorMsg("حصل خطأ أثناء البحث. جرب تاني.");
    } finally {
      setIsSearching(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center gap-4 p-4 bg-gray-50">
      <div className="w-full max-w-3xl flex items-center gap-2">
        <input
          className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="ابحث عن منطقة (مثال: القاهرة، الجيزة، الإسكندرية)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="rounded-2xl px-5 py-3 bg-emerald-600 text-white shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSearching ? "...يبحث" : "ابحث"}
        </button>
      </div>

      {errorMsg && (
        <div className="w-full max-w-3xl text-red-600">{errorMsg}</div>
      )}

      <div className="w-full max-w-5xl h-[70vh] rounded-2xl overflow-hidden shadow" ref={mapRef} />

      <div className="w-full max-w-3xl text-sm text-gray-600">
        <p>نصيحة: لو عايز تحصر النتائج داخل مصر، جرّب تضيف كلمات زي "مصر" في البحث أو اعمل فلترة متقدمة بإضافة <code>&countrycodes=eg</code> في رابط نوماتن.</p>
      </div>
    </div>
  );
}
