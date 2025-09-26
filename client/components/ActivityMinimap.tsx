"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceDot,
} from "recharts";
import { format, parseISO } from "date-fns";
import { DailyActivityCount, FirstTouchpoint } from "@/types/activity";

interface ActivityMinimapProps {
  dailyCounts: DailyActivityCount[];
  firstTouchpoints: FirstTouchpoint[];
  visibleRange: {
    start: Date | null;
    end: Date | null;
  };
  onDateClick: (date: Date) => void;
}

export const ActivityMinimap: React.FC<ActivityMinimapProps> = ({
  dailyCounts,
  firstTouchpoints,
  visibleRange,
  onDateClick,
}) => {
  // Prepare data for the chart
  const chartData = dailyCounts.map((item) => ({
    date: item.date,
    count: item.count,
    timestamp: parseISO(item.date).getTime(),
  }));

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const dateStr = data.activePayload[0].payload.date;
      onDateClick(parseISO(dateStr));
    }
  };

  // Format tick for X axis
  const formatXAxisTick = (tickItem: string) => {
    const date = parseISO(tickItem);
    return format(date, "MMM dd");
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const date = parseISO(label);
      const touchpointsOnDate = firstTouchpoints.filter(
        (tp) => tp.date === label
      );

      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{format(date, "MMM dd, yyyy")}</p>
          <p className="text-sm text-gray-600">
            Activities: <span className="font-medium">{payload[0].value}</span>
          </p>
          {touchpointsOnDate.length > 0 && (
            <div className="mt-2 text-sm">
              <p className="text-gray-600">First touchpoints:</p>
              {touchpointsOnDate.map((tp) => (
                <p key={tp.person_id} className="text-gray-800 ml-2">
                  • {tp.person_name}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate visible range coordinates for the blue bars
  const getVisibleRangeCoords = () => {
    if (!visibleRange.start || !visibleRange.end || chartData.length === 0) {
      return null;
    }

    const startTime = visibleRange.start.getTime();
    const endTime = visibleRange.end.getTime();

    // Find the closest data points to our visible range
    let startIdx = 0;
    let endIdx = chartData.length - 1;

    for (let i = 0; i < chartData.length; i++) {
      if (chartData[i].timestamp <= startTime) {
        startIdx = i;
      }
      if (chartData[i].timestamp <= endTime) {
        endIdx = i;
      }
    }

    return {
      x1: chartData[startIdx]?.date,
      x2: chartData[endIdx]?.date,
    };
  };

  const visibleRangeCoords = getVisibleRangeCoords();

  return (
    <div className="w-full h-80 p-4 bg-white border border-gray-200 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Activity Timeline</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 50, bottom: 50 }}
          onClick={handleChartClick}
          className="cursor-pointer"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisTick}
            stroke="#6b7280"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={11}
            tick={{ fontSize: 10 }}
            label={{
              value: "Activities",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: 12 },
              offset: 10,
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Line chart */}
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />

          {/* Visible range indicators (blue vertical bars) */}
          {visibleRangeCoords && (
            <>
              <ReferenceArea
                x1={visibleRangeCoords.x1}
                x2={visibleRangeCoords.x2}
                fill="#3b82f6"
                fillOpacity={0.1}
                stroke="#3b82f6"
                strokeOpacity={0.5}
              />
              {/* Left bar */}
              <ReferenceDot
                x={visibleRangeCoords.x1}
                y={0}
                r={0}
                stroke="#3b82f6"
                strokeWidth={2}
                fill="transparent"
              />
              {/* Right bar */}
              <ReferenceDot
                x={visibleRangeCoords.x2}
                y={0}
                r={0}
                stroke="#3b82f6"
                strokeWidth={2}
                fill="transparent"
              />
            </>
          )}

          {/* First touchpoint markers */}
          {firstTouchpoints.map((tp) => (
            <ReferenceDot
              key={tp.person_id}
              x={tp.date}
              y={dailyCounts.find((d) => d.date === tp.date)?.count || 0}
              r={5}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={2}
            >
              <title>{`${tp.person_name} - First touchpoint`}</title>
            </ReferenceDot>
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span>Daily IN Activities</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>First Touchpoint</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-blue-500 opacity-20 border border-blue-500"></div>
          <span>Visible Range</span>
        </div>
      </div>
    </div>
  );
};
