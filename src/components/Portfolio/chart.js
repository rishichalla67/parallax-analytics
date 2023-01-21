import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const PortfolioChart = ({ data }) => {
  const svgRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)))
      .range([20, width - 20]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([480, 20]);
    const line = d3
      .line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.value));

    svg
      .selectAll('.line-chart-path')
      .datum(data)
      .attr('d', line);

    svg
      .selectAll('.x-axis')
      .attr('transform', `translate(0, ${480})`)
      .call(d3.axisBottom(xScale));

    svg
      .selectAll('.y-axis')
      .attr('transform', `translate(20, 0)`)
      .call(d3.axisLeft(yScale));
  }, [data, width]);

  useEffect(() => {
    const handleResize = () => {
      setWidth(svgRef.current.parentNode.clientWidth);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={svgRef} className="relative">
      <svg className="w-full h-64">
      </svg>
    </div>
  );
};

export default PortfolioChart;
