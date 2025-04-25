import { Snapshot } from "@/types";
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, TooltipProps } from "recharts";

interface MemoryChartProps {
  snapshots: Snapshot[];
}

// Define proper types for the tooltip component
type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
};

export default function MemoryChart({ snapshots }: MemoryChartProps) {
  // Create a map of daily activity for the past 14 days
  const days = 14;
  const today = new Date();
  const activityData = [];
  
  // Create base data structure for the past 14 days
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    activityData.push({
      date: format(date, "MMM d"),
      rawDate: date,
      created: 0,
      reviewed: 0,
    });
  }
  
  // Fill with actual data
  snapshots.forEach(snapshot => {
    const createdDate = snapshot.createdAt;
    const reviewDates = snapshot.review.lastReviewDate;
    
    // Count creations
    const createdIndex = activityData.findIndex(
      data => format(data.rawDate, "yyyy-MM-dd") === format(createdDate, "yyyy-MM-dd")
    );
    
    if (createdIndex >= 0) {
      activityData[createdIndex].created++;
    }
    
    // Count reviews
    if (snapshot.review.reviewCount > 0 && reviewDates) {
      const reviewIndex = activityData.findIndex(
        data => format(data.rawDate, "yyyy-MM-dd") === format(reviewDates, "yyyy-MM-dd")
      );
      
      if (reviewIndex >= 0) {
        activityData[reviewIndex].reviewed++;
      }
    }
  });
  
  // If we have no data, show empty state
  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-center p-4 text-gray-500 dark:text-gray-400 border rounded-md">
        No data to display yet. Create and review snapshots to see your progress.
      </div>
    );
  }

  // Color constants with better contrast
  const CREATED_COLOR = "#6b46c1"; // Darker purple for better visibility
  const REVIEWED_COLOR = "#0284c7"; // Darker blue for better visibility
  const GRID_COLOR = "#d1d5db"; // Medium gray for grid lines
  const AXIS_COLOR = "#4b5563"; // Darker gray for axes

  // Create custom tooltip component with proper TypeScript types
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md border dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} className="flex items-center mt-2">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={activityData}
          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis 
            dataKey="date" 
            stroke={AXIS_COLOR} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: AXIS_COLOR }}
          />
          <YAxis 
            stroke={AXIS_COLOR} 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: AXIS_COLOR }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            wrapperStyle={{ paddingBottom: "10px" }}
          />
          <Line
            name="Created"
            dataKey="created"
            type="monotone"
            strokeWidth={3}
            stroke={CREATED_COLOR}
            activeDot={{ r: 8, fill: CREATED_COLOR, stroke: "#ffffff" }}
            dot={{ r: 4, fill: CREATED_COLOR, stroke: "#ffffff", strokeWidth: 2 }}
          />
          <Line
            name="Reviewed"
            dataKey="reviewed"
            type="monotone"
            strokeWidth={3}
            stroke={REVIEWED_COLOR}
            activeDot={{ r: 8, fill: REVIEWED_COLOR, stroke: "#ffffff" }}
            dot={{ r: 4, fill: REVIEWED_COLOR, stroke: "#ffffff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}