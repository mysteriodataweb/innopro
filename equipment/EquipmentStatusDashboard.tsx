// Equipment Status Dashboard - Overview of equipment statuses

'use client';

import React from 'react';
import { Equipment, EquipmentStatus } from '../shared/types';
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_COLORS } from '../shared/constants';

interface EquipmentStatusDashboardProps {
  equipment: Equipment[];
  loading?: boolean;
  onStatusClick?: (status: EquipmentStatus) => void;
}

export default function EquipmentStatusDashboard({
  equipment,
  loading = false,
  onStatusClick,
}: EquipmentStatusDashboardProps) {
  // Calculate statistics
  const stats = {
    total: equipment.length,
    operational: equipment.filter(e => e.status === EquipmentStatus.OPERATIONAL).length,
    faulty: equipment.filter(e => e.status === EquipmentStatus.FAULTY).length,
    maintenanceScheduled: equipment.filter(e => e.status === EquipmentStatus.MAINTENANCE_SCHEDULED).length,
    maintenanceInProgress: equipment.filter(e => e.status === EquipmentStatus.MAINTENANCE_IN_PROGRESS).length,
  };

  // Critical equipment (failure rate > 40%)
  const criticalEquipment = equipment
    .filter(e => e.failureRate > 0.4)
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, 5);

  // Recently maintained
  const recentlyMaintained = equipment
    .filter(e => e.lastMaintenanceDate)
    .sort((a, b) => new Date(b.lastMaintenanceDate!).getTime() - new Date(a.lastMaintenanceDate!).getTime())
    .slice(0, 5);

  const getStatusPercentage = (count: number) => {
    return stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0';
  };

  return (
    <div className="space-y-6">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-xs uppercase text-gray-600 font-semibold">Total Equipment</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>

        {/* Operational */}
        <div
          onClick={() => onStatusClick?.(EquipmentStatus.OPERATIONAL)}
          className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition ${
            onStatusClick ? 'hover:border-green-300' : ''
          }`}
        >
          <p className="text-xs uppercase text-gray-600 font-semibold">Operational</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.operational}</p>
          <p className="text-xs text-gray-600 mt-1">{getStatusPercentage(stats.operational)}%</p>
        </div>

        {/* Faulty */}
        <div
          onClick={() => onStatusClick?.(EquipmentStatus.FAULTY)}
          className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition ${
            onStatusClick ? 'hover:border-red-300' : ''
          }`}
        >
          <p className="text-xs uppercase text-gray-600 font-semibold">Faulty</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.faulty}</p>
          <p className="text-xs text-gray-600 mt-1">{getStatusPercentage(stats.faulty)}%</p>
        </div>

        {/* Scheduled */}
        <div
          onClick={() => onStatusClick?.(EquipmentStatus.MAINTENANCE_SCHEDULED)}
          className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition ${
            onStatusClick ? 'hover:border-blue-300' : ''
          }`}
        >
          <p className="text-xs uppercase text-gray-600 font-semibold">Scheduled</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.maintenanceScheduled}</p>
          <p className="text-xs text-gray-600 mt-1">{getStatusPercentage(stats.maintenanceScheduled)}%</p>
        </div>

        {/* In Progress */}
        <div
          onClick={() => onStatusClick?.(EquipmentStatus.MAINTENANCE_IN_PROGRESS)}
          className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 cursor-pointer hover:shadow-md transition ${
            onStatusClick ? 'hover:border-yellow-300' : ''
          }`}
        >
          <p className="text-xs uppercase text-gray-600 font-semibold">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.maintenanceInProgress}</p>
          <p className="text-xs text-gray-600 mt-1">{getStatusPercentage(stats.maintenanceInProgress)}%</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Equipment */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Equipment (Failure Rate &gt; 40%)</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : criticalEquipment.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No critical equipment</div>
          ) : (
            <div className="space-y-3">
              {criticalEquipment.map((item, index) => (
                <div key={item.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.category}</p>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {(item.failureRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-red-600"
                      style={{ width: `${item.failureRate * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Maintained */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Maintained</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : recentlyMaintained.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No maintenance history</div>
          ) : (
            <div className="space-y-3">
              {recentlyMaintained.map((item, index) => (
                <div key={item.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Last maintained: {item.lastMaintenanceDate
                          ? new Date(item.lastMaintenanceDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Never'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${EQUIPMENT_STATUS_COLORS[item.status]}`}>
                      {EQUIPMENT_STATUS_LABELS[item.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution Chart Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">Status Distribution</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-blue-800">Operational:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-blue-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${(stats.operational / stats.total) * 100}%` }}
                />
              </div>
              <span className="text-blue-900 font-semibold w-12 text-right">
                {((stats.operational / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-800">Faulty:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-blue-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{ width: `${(stats.faulty / stats.total) * 100}%` }}
                />
              </div>
              <span className="text-blue-900 font-semibold w-12 text-right">
                {((stats.faulty / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-800">In Maintenance:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-blue-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{ width: `${((stats.maintenanceScheduled + stats.maintenanceInProgress) / stats.total) * 100}%` }}
                />
              </div>
              <span className="text-blue-900 font-semibold w-12 text-right">
                {(((stats.maintenanceScheduled + stats.maintenanceInProgress) / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
