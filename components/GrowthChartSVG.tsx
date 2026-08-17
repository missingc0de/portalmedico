import React from 'react';

interface GrowthCurveData {
  sd2minus: [number, number][];
  sd1minus: [number, number][];
  median: [number, number][];
  sd1plus: [number, number][];
  sd2plus: [number, number][];
}

interface GrowthChartSVGProps {
  title: string;
  data: GrowthCurveData;
  xRange: { min: number; max: number; step: number; };
  yRange: { min: number; max: number; step: number; };
  xAxisLabel: string;
  yAxisLabel: string;
  xAxisSubLabels?: Record<number, string>;
  point: { x: number; y: number; } | null;
}

// Helper functions to create a smooth path
const line = (pointA: [number, number], pointB: [number, number]) => {
  const lengthX = pointB[0] - pointA[0]
  const lengthY = pointB[1] - pointA[1]
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  }
}

const controlPoint = (current: [number, number], previous: [number, number] | undefined, next: [number, number] | undefined, reverse?: boolean) => {
  const p = previous || current
  const n = next || current
  const smoothing = 0.2
  const o = line(p, n)
  const angle = o.angle + (reverse ? Math.PI : 0)
  const length = o.length * smoothing
  const x = current[0] + Math.cos(angle) * length
  const y = current[1] + Math.sin(angle) * length
  return [x, y]
}

const bezierCommand = (point: [number, number], i: number, a: [number, number][]) => {
  const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point)
  const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true)
  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`
}

const svgPath = (points: [number, number][], command: (point: [number, number], i: number, a: [number, number][]) => string) => {
  const d = points.reduce((acc, point, i, a) => i === 0
    ? `M ${point[0]},${point[1]}`
    : `${acc} ${command(point, i, a)}`
  , '')
  return d
}


const GrowthChartSVG: React.FC<GrowthChartSVGProps> = ({
  title,
  data,
  xRange,
  yRange,
  xAxisLabel,
  yAxisLabel,
  xAxisSubLabels = {},
  point,
}) => {
  const viewBoxWidth = 800;
  const viewBoxHeight = 600;
  const margin = { top: 40, right: 80, bottom: 80, left: 60 };

  const width = viewBoxWidth - margin.left - margin.right;
  const height = viewBoxHeight - margin.top - margin.bottom;

  const xScale = (x: number) => margin.left + ((x - xRange.min) / (xRange.max - xRange.min)) * width;
  const yScale = (y: number) => margin.top + height - ((y - yRange.min) / (yRange.max - yRange.min)) * height;
  
  const lineGenerator = (curveData: [number, number][]) => {
    if (!curveData || curveData.length === 0) return '';
    const scaledPoints = curveData.map(([x,y]) => [xScale(x), yScale(y)]) as [number, number][];
    return svgPath(scaledPoints, bezierCommand);
  };


  const xTicks = [];
  for (let i = xRange.min; i <= xRange.max; i += xRange.step) {
    if (i % (xRange.step * (xRange.max > 30 ? 2 : 1)) === 0 || xRange.step < 2) {
        xTicks.push(i);
    }
  }

  const yTicks = [];
  for (let i = yRange.min; i <= yRange.max; i += yRange.step) {
    if (i % (yRange.step * (yRange.max > 30 ? 2 : 1)) === 0 || yRange.step < 2) {
        yTicks.push(i);
    }
  }

  const xGridLines = [];
  for (let i = Math.ceil(xRange.min); i <= Math.floor(xRange.max); i += 1) {
    xGridLines.push(i);
  }
  const yGridLines = [];
  for (let i = Math.ceil(yRange.min); i <= Math.floor(yRange.max); i += 1) {
    yGridLines.push(i);
  }

  const curves = [
    { d: lineGenerator(data.sd2plus), stroke: '#00aeef', label: '+2DE' },
    { d: lineGenerator(data.sd1plus), stroke: '#d82787', label: '+1DE' },
    { d: lineGenerator(data.median), stroke: '#000000', label: 'Mediana' },
    { d: lineGenerator(data.sd1minus), stroke: '#d82787', label: '-1DE' },
    { d: lineGenerator(data.sd2minus), stroke: '#00aeef', label: '-2DE' },
  ];
  
  const legendYStart = margin.top + 20;

  return (
    <div className="border border-slate-300 rounded-lg shadow-sm p-2 bg-white">
      <h4 className="text-base font-semibold text-slate-700 text-center mb-1">{title}</h4>
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-auto">
        {/* Grid Lines */}
        <g className="grid">
          {xGridLines.map(tick => (
            <line key={`x-grid-${tick}`} x1={xScale(tick)} y1={margin.top} x2={xScale(tick)} y2={margin.top + height} stroke="#e2e8f0" strokeWidth="0.75" />
          ))}
          {yGridLines.map(tick => (
            <line key={`y-grid-${tick}`} x1={margin.left} y1={yScale(tick)} x2={margin.left + width} y2={yScale(tick)} stroke="#e2e8f0" strokeWidth="0.75" />
          ))}
        </g>
        
        {/* Axes */}
        <g className="axes">
          <line x1={margin.left} y1={margin.top + height} x2={margin.left + width} y2={margin.top + height} stroke="#475569" strokeWidth="1.5" />
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + height} stroke="#475569" strokeWidth="1.5" />
        </g>

        {/* Axis Ticks and Labels */}
        <g className="ticks" fontSize="14" fill="#334155">
          {xTicks.map(tick => (
            <g key={`x-tick-${tick}`} transform={`translate(${xScale(tick)}, ${margin.top + height})`}>
              <line y2="5" stroke="black" />
              <text y="20" textAnchor="middle">{tick}</text>
              {xAxisSubLabels[tick] && <text y="40" textAnchor="middle" fontSize="12" fill="#0f172a">{xAxisSubLabels[tick]}</text>}
            </g>
          ))}
          {yTicks.map(tick => (
            <g key={`y-tick-${tick}`} transform={`translate(${margin.left}, ${yScale(tick)})`}>
              <line x2="-5" stroke="black" />
              <text x="-10" dy="5" textAnchor="end">{tick}</text>
            </g>
          ))}
        </g>

        {/* Axis Titles */}
        <g className="axis-labels" fontSize="16" fill="#1e293b">
            <text x={margin.left + width / 2} y={viewBoxHeight - 10} textAnchor="middle">
                {xAxisLabel}
            </text>
            <text transform={`translate(20, ${margin.top + height / 2}) rotate(-90)`} textAnchor="middle">
                {yAxisLabel}
            </text>
        </g>

        {/* Data Curves */}
        <g className="curves">
          {curves.map(curve => (
            <path key={curve.label} d={curve.d} fill="none" stroke={curve.stroke} strokeWidth="2.5" />
          ))}
        </g>
        
        {/* Legend */}
        <g className="legend" transform={`translate(${margin.left + width + 10}, ${legendYStart})`}>
             {curves.map((curve, index) => (
                <g key={curve.label} transform={`translate(0, ${index * 25})`}>
                    <rect x="0" y="0" width="20" height="10" fill={curve.stroke} />
                    <text x="25" y="9" fontSize="12" fill="#334155">{curve.label}</text>
                </g>
             ))}
        </g>

        {/* Data Point */}
        {point && (
          <circle cx={xScale(point.x)} cy={yScale(point.y)} r="6" fill="red" stroke="white" strokeWidth="2" className="shadow-lg" />
        )}
      </svg>
    </div>
  );
};

export default GrowthChartSVG;

