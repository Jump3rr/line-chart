import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import data from '../data/data.json';
import { D3ZoomEvent } from 'd3';
import { backgroundColors } from '../data/backgroundColors';
import './LineChart.css';
import { MoonLoader } from 'react-spinners';

interface Datum {
  id: number;
  x: number;
  y: number;
  target: number;
  prediction: number;
  diagnosisGroupId: number;
}

const LineChart = () => {
  const [backgroundColorIndex, setBackgroundColorIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const handleZoom = (e: D3ZoomEvent<SVGElement, unknown>) => {
    d3.select(svgRef.current).attr('transform', e.transform.toString());
  };

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 2])
    .translateExtent([
      [-window.innerWidth / 4, -window.innerHeight / 4],
      [window.innerWidth / 2, window.innerHeight / 2],
    ])
    .on('zoom', handleZoom);

  const initZoom = () => {
    d3.select(svgRef.current!).call(zoom);
  };

  const generateChart = () => {
    const svg = d3.select(svgRef.current);
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = Number(svg.attr('width')) - margin.left - margin.right;
    const height = Number(svg.attr('height')) - margin.top - margin.bottom;
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.x) as Number,
        d3.max(data, (d) => d.x) as Number,
      ])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y) as Number])
      .range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));
    g.append('g').call(d3.axisLeft(yScale));

    const lineGenerator = d3
      .line<Datum>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    g.append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2);

    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => '')
      );
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-height)
          .tickFormat(() => '')
      );

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 5)
      .attr('fill', 'steelblue')
      .on('mouseover', (event, d) => {
        const x = xScale(d.x);
        const y = yScale(d.y);
        g.append('line')
          .attr('class', 'x-line')
          .attr('x1', x)
          .attr('y1', y)
          .attr('x2', x)
          .attr('y2', height)
          .attr('stroke', 'red')
          .attr('stroke-dasharray', '10')
          .attr('stroke-width', '3');
        g.append('line')
          .attr('class', 'y-line')
          .attr('x1', x)
          .attr('y1', y)
          .attr('x2', 0)
          .attr('y2', y)
          .attr('stroke', 'red')
          .attr('stroke-dasharray', '10')
          .attr('stroke-width', '3');
      })
      .on('mouseout', (event) => {
        svg.selectAll('.x-line').remove();
        svg.selectAll('.y-line').remove();
      });
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [data]);

  useEffect(() => {
    if (loading) return;
    generateChart();
    initZoom();
  }, [loading]);

  const handleBackgroundColorChange = () => {
    setBackgroundColorIndex(
      (backgroundColorIndex + 1) % backgroundColors.length
    );
  };

  return (
    <div className='container'>
      {loading ? (
        <>
          <MoonLoader color='#003a61' loading={loading} size={150} />
        </>
      ) : (
        <>
          <div className='svg-con'>
            <svg
              ref={svgRef}
              width={window.innerWidth / 2}
              height={window.innerHeight / 2}
              style={{
                backgroundColor: backgroundColors[backgroundColorIndex],
              }}
            ></svg>
          </div>
          <button id='bg-color-btn' onClick={handleBackgroundColorChange}>
            Change Color
          </button>
        </>
      )}
    </div>
  );
};

export default LineChart;
