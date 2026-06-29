import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  onTime: number;
  overdue: number;
}

export default function PieChartStatus({ onTime, overdue }: Props) {
  const data = [
    { name: 'A Tiempo', value: onTime },
    { name: 'Vencidos', value: overdue },
  ];

  const COLORS = ['#10b981', '#ef4444']; // Green for On Time, Red for Overdue

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '120px', display: 'flex', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={50}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
