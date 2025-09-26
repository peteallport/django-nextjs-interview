"use client";

import React from "react";

export const ActivityTableSkeleton: React.FC = () => {
  return (
    <div className="w-full border border-gray-200 rounded-lg mb-8">
      <table className="w-full">
        <thead className="bg-white border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Date
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
          {[...Array(10)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-full max-w-md"></div>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const MinimapSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg mb-4 animate-pulse">
      <div className="px-4 pt-4 pb-2">
        <div className="h-6 bg-gray-200 rounded w-40"></div>
      </div>
      <div className="px-2">
        <div className="h-[220px] bg-gray-100 rounded m-2"></div>
      </div>
      <div className="px-4 pb-4">
        <div className="flex gap-6">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};
