"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ActivityTable } from "@/components/ActivityTable";
import { ActivityMinimap } from "@/components/ActivityMinimap";
import { api } from "@/services/api";
import {
  ActivityEvent,
  DailyActivityCount,
  FirstTouchpoint,
} from "@/types/activity";

export default function Home() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [dailyCounts, setDailyCounts] = useState<DailyActivityCount[]>([]);
  const [firstTouchpoints, setFirstTouchpoints] = useState<FirstTouchpoint[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Start at 0 since we'll load page 1 first
  const [totalCount, setTotalCount] = useState(0);
  const [visibleRange, setVisibleRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [scrollToDate, setScrollToDate] = useState<Date | null>(null);

  // Initial load - get minimap data and first page of activities
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Load all data for the minimap and initial activities
        const data = await api.getAllActivityData();
        setActivities(data.activities);
        setDailyCounts(data.daily_counts);
        setFirstTouchpoints(data.first_touchpoints);
        setTotalCount(data.total_count);

        // Since all-data returns first 500 items, calculate what page we're on
        const itemsPerPage = 100;
        const loadedPages = Math.ceil(data.activities.length / itemsPerPage);
        setCurrentPage(loadedPages);

        // Only set hasMore if there are more items beyond what we loaded
        setHasMore(data.activities.length < data.total_count);
      } catch (error) {
        console.error("Failed to load activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load more activities for infinite scroll
  const loadMoreActivities = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const data = await api.getActivities(nextPage, 100);

      // Only add new activities if we got results
      if (data.results && data.results.length > 0) {
        setActivities((prev) => [...prev, ...data.results]);
        setCurrentPage(nextPage);
        setHasMore(data.next !== null);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more activities:", error);
      setHasMore(false); // Stop trying if there's an error
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, loading]);

  // Handle visible range change from table
  const handleVisibleRangeChange = useCallback(
    (start: Date | null, end: Date | null) => {
      setVisibleRange({ start, end });
    },
    []
  );

  // Handle date click on minimap
  const handleDateClick = useCallback((date: Date) => {
    setScrollToDate(date);
    // Clear the scroll target after a short delay
    setTimeout(() => setScrollToDate(null), 100);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading activity data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Activity Timeline
          </h1>
          <p className="mt-2 text-gray-600">
            Showing {activities.length} of {totalCount} total activities
          </p>
        </div>

        {/* Minimap */}
        <ActivityMinimap
          dailyCounts={dailyCounts}
          firstTouchpoints={firstTouchpoints}
          visibleRange={visibleRange}
          onDateClick={handleDateClick}
        />

        {/* Activity Table */}
        <ActivityTable
          activities={activities}
          onLoadMore={loadMoreActivities}
          hasMore={hasMore}
          loading={loadingMore}
          onVisibleRangeChange={handleVisibleRangeChange}
          scrollToDate={scrollToDate}
        />

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Activity Timeline - Upside Take-Home
            Assignment
          </p>
        </div>
      </div>
    </main>
  );
}
