'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { ExpenseStats } from '@/types/expense';
import {
  ExpenseCategoryLabels,
  ExpenseCategoryColors,
  CurrencySymbols,
} from '@/types/expense';

interface ExpenseChartProps {
  stats: ExpenseStats | null;
  isLoading?: boolean;
}

export function ExpenseChart({ stats, isLoading }: ExpenseChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>费用分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <div className="h-32 w-32 animate-pulse rounded-full bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>费用分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-500">暂无费用数据</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 准备图表数据
  const chartData = stats.breakdown.map((item) => ({
    name: ExpenseCategoryLabels[item.category],
    value: item.total,
    category: item.category,
    percentage: item.percentage,
  }));

  // 自定义 Tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            金额: {CurrencySymbols.CNY}
            {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            占比: {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>费用分布</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 饼图 */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: { percentage: number }) =>
                `${entry.percentage.toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.category}`}
                  fill={ExpenseCategoryColors[entry.category]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* 分类详情列表 */}
        <div className="mt-6 space-y-2">
          {stats.breakdown.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded"
                  style={{
                    backgroundColor: ExpenseCategoryColors[item.category],
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {ExpenseCategoryLabels[item.category]}
                  </p>
                  <p className="text-sm text-gray-500">{item.count} 笔</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {CurrencySymbols.CNY}
                  {item.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
