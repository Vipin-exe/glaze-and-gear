"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface TopProductData {
  id: string;
  name: string;
  revenue: number;
  sales: number;
}

interface DashboardChartsProps {
  revenueData: RevenueDataPoint[];
  topProducts: TopProductData[];
}

export default function DashboardCharts({ revenueData, topProducts }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 w-full bg-gray-100 animate-pulse rounded-2xl"></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-6">
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend (Last 7 Days)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#888' }} 
                tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#98202E" 
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6, fill: "#98202E", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products (30 Days)</h3>
        {topProducts.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-xs text-gray-400">
                    {index + 1}
                  </div>
                  <p className="font-bold text-sm text-gray-900 truncate group-hover:text-[#98202E] transition-colors">{product.name}</p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 ml-2">
                  <span className="font-black text-sm">₹{product.revenue.toLocaleString()}</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400">{product.sales} sales</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
