// Equipment Referential - Displays complete equipment inventory

'use client';

import React, { useState } from 'react';
import { Equipment, EquipmentStatus, PaginationParams, FilterParams } from '../shared/types';
import {
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUS_COLORS,
  CRITICALITY_LEVELS,
  formatDate,
  formatPercentage,
} from '../shared/constants';

interface EquipmentReferentialProps {
  equipment: Equipment[];
  loading?: boolean;
  onEquipmentSelect?: (equipment: Equipment) => void;
  onAddEquipment?: () => void;
  onEditEquipment?: (equipment: Equipment) => void;
  onDeleteEquipment?: (id: string) => void;
}

export default function EquipmentReferential({
  equipment,
  loading = false,
  onEquipmentSelect,
  onAddEquipment,
  onEditEquipment,
  onDeleteEquipment,
}: EquipmentReferentialProps) {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCriticality, setFilterCriticality] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'failureRate' | 'category'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter equipment
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !filterStatus || item.status === filterStatus;
    const matchesCriticality = !filterCriticality || item.criticalityLevel === filterCriticality;
    return matchesSearch && matchesStatus && matchesCriticality;
  });

  // Sort equipment
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    switch (sortBy) {
      case 'failureRate':
        return b.failureRate - a.failureRate;
      case 'category':
        return a.category.localeCompare(b.category);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Paginate
  const totalPages = Math.ceil(sortedEquipment.length / itemsPerPage);
  const paginatedEquipment = sortedEquipment.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCriticalityColor = (level: string) => {
    const levelObj = CRITICALITY_LEVELS.find(l => l.value === level);
    return levelObj?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Equipment Referential</h2>
          {onAddEquipment && (
            <button
              onClick={onAddEquipment}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
            >
              Add Equipment
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Name or code..."
              value={searchText}
              onChange={e => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {Object.values(EquipmentStatus).map(status => (
                <option key={status} value={status}>
                  {EQUIPMENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {/* Criticality Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Criticality</label>
            <select
              value={filterCriticality}
              onChange={e => {
                setFilterCriticality(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {CRITICALITY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Equipment Name</option>
              <option value="failureRate">Failure Rate</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : paginatedEquipment.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No equipment found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Criticality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Failure Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEquipment.map(item => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onEquipmentSelect?.(item)}
                >
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.code}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${EQUIPMENT_STATUS_COLORS[item.status]}`}>
                      {EQUIPMENT_STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(item.criticalityLevel)}`}>
                      {item.criticalityLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[80px]">
                        <div
                          className={`h-2 rounded-full ${
                            item.failureRate > 0.5 ? 'bg-red-500' : item.failureRate > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${item.failureRate * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{formatPercentage(item.failureRate, 1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.lastMaintenanceDate ? formatDate(item.lastMaintenanceDate) : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-sm" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      {onEditEquipment && (
                        <button
                          onClick={() => onEditEquipment(item)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          Edit
                        </button>
                      )}
                      {onDeleteEquipment && (
                        <button
                          onClick={() => onDeleteEquipment(item.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedEquipment.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedEquipment.length)} of {sortedEquipment.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
