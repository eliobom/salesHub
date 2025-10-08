import React, { useMemo, ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  gradient: string;
}

export const StatCard = React.memo(({ title, value, change, icon, gradient }: StatCardProps) => {
  const isPositive = useMemo(() => change ? change > 0 : true, [change]);

  return (
    <Card hover className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center`}>
            <div className="text-white">{icon}</div>
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
});
