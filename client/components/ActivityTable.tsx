"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { format, differenceInDays, parseISO } from "date-fns";
import { ActivityEvent } from "@/types/activity";
import { debounce } from "@/utils/debounce";

interface ActivityTableProps {
  activities: ActivityEvent[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  onVisibleRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
  scrollToDate?: Date | null;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  onLoadMore,
  hasMore,
  loading,
  onVisibleRangeChange,
  scrollToDate,
}) => {
  const [hoveredPersonKey, setHoveredPersonKey] = useState<string | null>(null);
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  // Debounced version of the visible range change callback
  const debouncedOnVisibleRangeChange = useMemo(
    () =>
      onVisibleRangeChange ? debounce(onVisibleRangeChange, 150) : undefined,
    [onVisibleRangeChange]
  );

  // Track visible date range
  useEffect(() => {
    if (activities.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleActivities: ActivityEvent[] = [];

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activityId = entry.target.getAttribute("data-activity-id");
            const activity = activities.find(
              (a) => a.touchpoint_id === activityId
            );
            if (activity) {
              visibleActivities.push(activity);
            }
          }
        });

        if (visibleActivities.length > 0) {
          const dates = visibleActivities.map((a) => parseISO(a.timestamp));
          const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
          debouncedOnVisibleRangeChange?.(minDate, maxDate);
        }
      },
      {
        root: null, // Use viewport instead of table container
        rootMargin: "0px",
        threshold: 0,
      }
    );

    // Observe all rows
    activities.forEach((activity) => {
      const row = rowRefs.current[activity.touchpoint_id];
      if (row) {
        observer.observe(row);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [activities, debouncedOnVisibleRangeChange]);

  // Handle scroll to date
  useEffect(() => {
    if (!scrollToDate) return;

    // Find the activity closest to the target date
    const targetTime = scrollToDate.getTime();
    let closestActivity: ActivityEvent | null = null;
    let closestDiff = Infinity;

    activities.forEach((activity) => {
      const activityTime = parseISO(activity.timestamp).getTime();
      const diff = Math.abs(activityTime - targetTime);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestActivity = activity;
      }
    });

    if (closestActivity) {
      const row =
        rowRefs.current[(closestActivity as ActivityEvent).touchpoint_id];
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [scrollToDate, activities]);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasMore && !loading) {
      onLoadMore();
    }
  }, [inView, hasMore, loading, onLoadMore]);

  const calculateDateGap = (
    currentDate: Date,
    previousDate: Date | null
  ): string | null => {
    if (!previousDate) return null;
    const days = differenceInDays(previousDate, currentDate);
    if (days > 1) {
      return `${days} day gap`;
    }
    return null;
  };

  const formatTeams = (teamIds: string[]): string => {
    return teamIds.map((id) => id.replace("team_", "")).join(", ");
  };

  return (
    <div className="w-full border border-gray-200 rounded-lg mb-8 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[180px]">
              Date & Time
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Activity
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              People
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Channel
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Teams
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {activities.map((activity, index) => {
            const activityDate = parseISO(activity.timestamp);
            const previousDate =
              index > 0 ? parseISO(activities[index - 1].timestamp) : null;
            const dateGap = calculateDateGap(activityDate, previousDate);

            return (
              <React.Fragment key={activity.touchpoint_id}>
                {dateGap && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-2 text-center text-sm text-gray-500 bg-gray-50"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="h-px flex-1 bg-gray-300"></span>
                        <span>{dateGap}</span>
                        <span className="h-px flex-1 bg-gray-300"></span>
                      </div>
                    </td>
                  </tr>
                )}
                <tr
                  ref={(el) => {
                    rowRefs.current[activity.touchpoint_id] = el;
                  }}
                  data-activity-id={activity.touchpoint_id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {format(activityDate, "MMM dd, yyyy")}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {format(activityDate, "h:mm a")} local
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                    <div
                      className="max-w-md truncate"
                      title={activity.activity}
                    >
                      {activity.activity}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                    <div className="flex flex-wrap gap-1">
                      {activity.people_details.map((person) => (
                        <span
                          key={person.id}
                          className="relative inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
                          onMouseEnter={() =>
                            setHoveredPersonKey(
                              `${activity.touchpoint_id}-${person.id}`
                            )
                          }
                          onMouseLeave={() => setHoveredPersonKey(null)}
                        >
                          {person.first_name} {person.last_name}
                          {hoveredPersonKey ===
                            `${activity.touchpoint_id}-${person.id}` && (
                            <div className="absolute bottom-full left-0 mb-1 z-20">
                              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                {person.email_address}
                                {person.job_title && (
                                  <div className="text-gray-300">
                                    {person.job_title}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                      {activity.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span
                      className={`inline-flex font-mono capitalize lowercase items-center px-2 py-1 text-xs rounded ${
                        activity.status === "OPENED"
                          ? "bg-green-100 text-green-800"
                          : activity.status === "CLICKED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 ">
                    {formatTeams(activity.involved_team_ids)}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Load more trigger */}
      <div
        ref={loadMoreRef}
        className="h-12 flex items-center justify-center bg-gray-50 border-t border-gray-200"
      >
        {loading && (
          <div className="text-sm text-gray-500">
            Loading more activities...
          </div>
        )}
        {!hasMore && activities.length > 0 && (
          <div className="text-sm text-gray-500">No more activities</div>
        )}
      </div>
    </div>
  );
};
