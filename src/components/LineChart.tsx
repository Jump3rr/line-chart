import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import data from '../data/data.json';
import './LineChart.css';

interface Datum {
  id: number;
  x: number;
  y: number;
  target: number;
  prediction: number;
  diagnosisGroupId: number;
}

const LineChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
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
      .on('mouseout', (event, d) => {
        svg.selectAll('.x-line').remove();
        svg.selectAll('.y-line').remove();
      });
  }, [data]);

  return (
    <>
      <div className='svg-con'>
        <svg
          ref={svgRef}
          width={window.innerWidth / 2}
          height={window.innerHeight / 2}
        ></svg>
      </div>
    </>
  );
};

export default LineChart;
