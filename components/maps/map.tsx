"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
// @ts-ignore (esta librería a veces no trae tipos, lo ignoramos por ahora)
import { geoConicConformalSpain } from "d3-composite-projections";

export function ElectionMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch("/maps/regions.json")
      .then((res) => res.json())
      .then((data) => {
        const featureCollection = topojson.feature(
          data,
          data.objects.autonomous_regions
        );
        setGeoData(featureCollection);
      })
      .catch((err) => console.error("Error cargando mapa:", err));
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500; // Ajustamos altura para mejor aspecto (más apaisado)

    // MAGIA AQUI: Usamos la proyección compuesta para España
    // Esta proyección ya sabe dónde colocar Canarias y las ajusta automáticamente.
    const projection = geoConicConformalSpain()
      .translate([width / 2, height / 2])
      // Usamos fitExtent para añadir un margen (padding) de 20px
      // [[x0, y0], [x1, y1]]
      .fitExtent(
        [
          [20, 20],
          [width - 20, height - 20],
        ],
        geoData
      );

    const pathGenerator = d3.geoPath().projection(projection);

    svg.selectAll("*").remove();

    svg
      .selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGenerator as any)
      .attr("fill", "#e5e7eb")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.5) // Borde un poco más fino
      .attr("class", "hover:fill-gray-400 transition-colors cursor-pointer");
  }, [geoData]);

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 rounded-xl overflow-hidden p-2">
      <svg
        ref={svgRef}
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      />
    </div>
  );
}
