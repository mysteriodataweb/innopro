// Equipment Detail - Digital Life File (Fiche de Vie Numérique)

'use client';

import React, { useState } from 'react';
import { Equipment, MaintenanceIntervention, EquipmentStatus } from '../shared/types';
import {
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUS_COLORS,
  formatDate,
  formatDateTime,
  formatDuration,
  formatCurrency,
  daysUntil,
  isOverdue,
} from '../shared/constants';

interface EquipmentDetailProps {
  equipment: Equipment;
  maintenanceHistory?: MaintenanceIntervention[];
  loading?: boolean;
  onStatusChange?: (newStatus: EquipmentStatus) => void;
  onScheduleMaintenance?: () => void;
  onViewReport?: () => void;
}

export default function EquipmentDetail({
  equipment,
  maintenanceHistory = [],
  loading = false,
  onStatusChange,
  onScheduleMaintenance,
  onViewReport,
}: EquipmentDetailProps) {
  const [showFullHistory, setShowFullHistory] = useState(false);
  const displayedHistory = showFullHistory ? maintenanceHistory : maintenanceHistory.slice(0, 5);

  const getNextMaintenanceStatus = () => {
    if (!equipment.nextScheduledMaintenance) {
      return { label: 'Not Scheduled', color: 'bg-gray-100 text-gray-800' };
    }
    const daysRemaining = daysUntil(equipment.nextScheduledMaintenance);
    if (daysRemaining < 0) {
      return { label: 'Overdue', color: 'bg-red-100 text-red-800' };
    }
    if (daysRemaining <= 7) {
      return { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'On Schedule', color: 'bg-green-100 text-green-800' };
  };

  const nextMaintenanceStatus = getNextMaintenanceStatus();

  return (
    <div className="space-y-6">
      {/* Equipment Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="text-gray-600 text-sm mt-1">Code: {equipment.code}</p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${EQUIPMENT_STATUS_COLORS[equipment.status]}`}>
              {EQUIPMENT_STATUS_LABELS[equipment.status]}
            </span>
            {onStatusChange && (
              <button
                onClick={() => onStatusChange(EquipmentStatus.OPERATIONAL)}
                className="block mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                Change Status
              </button>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs uppercase text-gray-600 font-semibold">Category</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{equipment.category}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs uppercase text-gray-600 font-semibold">Manufacturer</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{equipment.manufacturer}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs uppercase text-gray-600 font-semibold">Model</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{equipment.model}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs uppercase text-gray-600 font-semibold">Serial</p>
            <p className="text-lg font-semibold text-gray-900 mt-1 font-mono">{equipment.serialNumber}</p>
          </div>
        </div>
      </div>

      {/* Operational Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 text-sm">Location</span>
              <span className="font-semibold text-gray-900">{equipment.location}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 text-sm">Installation Date</span>
              <span className="font-semibold text-gray-900">{formatDate(equipment.installationDate)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600 text-sm">Last Maintenance</span>
              <span className="font-semibold text-gray-900">
                {equipment.lastMaintenanceDate ? formatDate(equipment.lastMaintenanceDate) : 'Never'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Next Scheduled</span>
              <div className="text-right">
                {equipment.nextScheduledMaintenance ? (
                  <>
                    <span className="font-semibold text-gray-900">
                      {formatDate(equipment.nextScheduledMaintenance)}
                    </span>
                    <span className={`block text-xs mt-1 px-2 py-1 rounded ${nextMaintenanceStatus.color}`}>
                      {nextMaintenanceStatus.label}
                      {nextMaintenanceStatus.label !== 'Not Scheduled' && (
                        <span className="ml-1">
                          ({Math.abs(daysUntil(equipment.nextScheduledMaintenance))} days)
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">Not scheduled</span>
                )}
              </div>
            </div>
          </div>
          {onScheduleMaintenance && (
            <button
              onClick={onScheduleMaintenance}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
            >
              Schedule Maintenance
            </button>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Failure Rate</span>
                <span className="text-sm font-bold text-gray-900">{(equipment.failureRate * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    equipment.failureRate > 0.5 ? 'bg-red-500' : equipment.failureRate > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${equipment.failureRate * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 uppercase font-semibold">MTBF</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatDuration(equipment.mtbf)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Mean Time Between Failures</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 uppercase font-semibold">MTTR</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatDuration(equipment.mttr)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Mean Time To Repair</p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Criticality Level:</span> {equipment.criticalityLevel.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance History */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Maintenance History</h3>
          {onViewReport && maintenanceHistory.length > 0 && (
            <button
              onClick={onViewReport}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Full Report
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading history...</div>
        ) : maintenanceHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No maintenance history</div>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayedHistory.map(intervention => (
                <div
                  key={intervention.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {intervention.type === 'preventive' ? 'Preventive' : 'Corrective'} Maintenance
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDateTime(intervention.startDate)}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      intervention.type === 'preventive'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {intervention.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{intervention.description}</p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-900 block">{formatDuration(intervention.durationHours)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Technician:</span>
                      <span className="font-semibold text-gray-900 block">{intervention.technicianName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-semibold text-gray-900 block">{formatCurrency(intervention.totalCost)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {maintenanceHistory.length > 5 && (
              <button
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="mt-4 w-full px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition text-sm font-medium"
              >
                {showFullHistory ? 'Show Less' : `View All (${maintenanceHistory.length} records)`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
