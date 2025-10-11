import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const [showCustom, setShowCustom] = useState(false);

  const presets = [
    { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
    { label: 'Yesterday', getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }},
    { label: 'Last 7 Days', getValue: () => ({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    })},
    { label: 'Last 30 Days', getValue: () => ({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    })},
    { label: 'Last 90 Days', getValue: () => ({
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date()
    })},
    { label: 'This Month', getValue: () => {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      };
    }},
    { label: 'Last Month', getValue: () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: lastMonth, end: lastDayOfLastMonth };
    }},
  ];

  const [selectedPreset, setSelectedPreset] = useState('Last 30 Days');

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getValue();
    setSelectedPreset(preset.label);
    setShowCustom(false);
    onChange({ startDate: start, endDate: end });
  };

  const formatDateInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCustomDateChange = (type, value) => {
    const newDate = new Date(value);
    if (type === 'start') {
      onChange({ startDate: newDate, endDate });
    } else {
      onChange({ startDate, endDate: newDate });
    }
    setSelectedPreset('Custom');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Date Range:</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedPreset === preset.label
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => {
              setShowCustom(!showCustom);
              setSelectedPreset('Custom');
            }}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedPreset === 'Custom'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom
          </button>
        </div>

        {(showCustom || selectedPreset === 'Custom') && (
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={formatDateInput(startDate)}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              max={formatDateInput(new Date())}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={formatDateInput(endDate)}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              min={formatDateInput(startDate)}
              max={formatDateInput(new Date())}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-600">
        Showing data from <span className="font-medium">{startDate.toLocaleDateString()}</span> to{' '}
        <span className="font-medium">{endDate.toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default DateRangePicker;

