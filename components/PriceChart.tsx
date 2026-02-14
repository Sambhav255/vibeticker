import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { PricePoint } from '../types';

interface PriceChartProps {
  data: PricePoint[];
  symbol: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, symbol }) => {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-slate-100 text-lg font-semibold">Price Action vs. Sentiment</h3>
          <p className="text-slate-400 text-xs">Does the vibe predict the pump?</p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-slate-400">Price ($)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500/50 rounded-sm"></span>
            <span className="text-slate-400">Sentiment Intensity</span>
          </div>
        </div>
      </div>

      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `$${val}`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[-1.2, 1.2]} 
              hide={true} // Hide the scale numbers for cleaner look
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
              formatter={(value: any, name: any) => {
                if (name === 'price') return [`$${value}`, 'Price'];
                if (name === 'sentiment') return [value, 'Vibe Score'];
                return [value, name];
              }}
            />
            
            {/* Sentiment Bars - Invisible mainly, just to show magnitude or background? 
                Actually, let's make them subtle bars behind the line. 
            */}
            <Bar 
              yAxisId="right" 
              dataKey="sentiment" 
              barSize={20} 
              fill="#8b5cf6" 
              opacity={0.3} 
              radius={[4, 4, 0, 0]} 
            />
            
            <ReferenceLine yAxisId="right" y={0} stroke="#475569" strokeDasharray="3 3" />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1e293b', stroke: '#3b82f6', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#60a5fa' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;