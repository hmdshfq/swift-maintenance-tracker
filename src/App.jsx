import { useState, useEffect } from 'react';
import { Calendar, Download, Upload, AlertCircle } from 'lucide-react';

const App = () => {
  const maintenanceItems = [
    { category: 'Engine Oil & Filter', item: 'Engine Oil', intervalKm: 10000, intervalMonths: 6 },
    { category: 'Engine Oil & Filter', item: 'Oil Filter', intervalKm: 10000, intervalMonths: 6 },
    { category: 'Air & Fuel System', item: 'Air Filter', intervalKm: 40000, intervalMonths: null },
    { category: 'Air & Fuel System', item: 'Fuel Filter', intervalKm: 40000, intervalMonths: null },
    { category: 'Air & Fuel System', item: 'Spark Plugs', intervalKm: 40000, intervalMonths: null },
    { category: 'Cooling System', item: 'Coolant', intervalKm: 40000, intervalMonths: 24 },
    { category: 'Cooling System', item: 'Radiator Hoses', intervalKm: null, intervalMonths: 48 },
    { category: 'Drive Belts', item: 'Timing Belt', intervalKm: 100000, intervalMonths: 60 },
    { category: 'Drive Belts', item: 'Drive Belts', intervalKm: 80000, intervalMonths: null },
    { category: 'Transmission & Drivetrain', item: 'Manual Transmission Oil', intervalKm: 40000, intervalMonths: 24 },
    { category: 'Transmission & Drivetrain', item: 'Transfer Case Oil', intervalKm: 40000, intervalMonths: null },
    { category: 'Transmission & Drivetrain', item: 'Front Differential Oil', intervalKm: 40000, intervalMonths: null },
    { category: 'Transmission & Drivetrain', item: 'Rear Differential Oil', intervalKm: 40000, intervalMonths: null },
    { category: 'Brakes', item: 'Brake Fluid', intervalKm: 40000, intervalMonths: 24 },
    { category: 'Brakes', item: 'Brake Pads (Front)', intervalKm: 40000, intervalMonths: null },
    { category: 'Brakes', item: 'Brake Pads (Rear)', intervalKm: 40000, intervalMonths: null },
    { category: 'Brakes', item: 'Brake Discs (Front)', intervalKm: 80000, intervalMonths: null },
    { category: 'Brakes', item: 'Brake Discs (Rear)', intervalKm: 80000, intervalMonths: null },
    { category: 'Other Components', item: 'Battery', intervalKm: null, intervalMonths: 48 },
    { category: 'Other Components', item: 'Cabin Air Filter', intervalKm: 20000, intervalMonths: null },
    { category: 'Other Components', item: 'PCV Valve', intervalKm: 40000, intervalMonths: null },
    { category: 'Other Components', item: 'Valve Clearance Check', intervalKm: 100000, intervalMonths: null },
    { category: 'Tires', item: 'Tire Rotation', intervalKm: 10000, intervalMonths: null },
    { category: 'Tires', item: 'Tire Replacement', intervalKm: 60000, intervalMonths: null },
    { category: 'Fluids', item: 'Power Steering Fluid', intervalKm: 60000, intervalMonths: null },
    { category: 'Ignition System', item: 'Ignition Coils/Leads', intervalKm: 100000, intervalMonths: null },
    { category: 'Suspension & Steering', item: 'Shock Absorbers', intervalKm: 90000, intervalMonths: null },
    { category: 'Suspension & Steering', item: 'Ball Joints', intervalKm: 100000, intervalMonths: null },
    { category: 'Suspension & Steering', item: 'Tie Rod Ends', intervalKm: 100000, intervalMonths: null },
    { category: 'Suspension & Steering', item: 'Control Arm Bushings', intervalKm: 100000, intervalMonths: null },
    { category: 'Suspension & Steering', item: 'Wheel Bearings', intervalKm: 100000, intervalMonths: null },
    { category: 'Suspension & Steering', item: 'CV Joint Boots', intervalKm: 80000, intervalMonths: null },
    { category: 'Exhaust System', item: 'Oxygen Sensors', intervalKm: 120000, intervalMonths: null },
    { category: 'Exhaust System', item: 'Catalytic Converter', intervalKm: 150000, intervalMonths: null },
    { category: 'Other Items', item: 'Water Pump', intervalKm: 100000, intervalMonths: 60 },
    { category: 'Other Items', item: 'Thermostat', intervalKm: 90000, intervalMonths: null },
    { category: 'Other Items', item: 'Clutch', intervalKm: 120000, intervalMonths: null },
    { category: 'Other Items', item: 'Wiper Blades', intervalKm: null, intervalMonths: 12 },
    { category: 'Inspections', item: 'Wheel Alignment', intervalKm: null, intervalMonths: 12 },
  ];

  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('suzukiMaintenance');
    return saved ? JSON.parse(saved) : maintenanceItems.map((item, idx) => ({
      id: idx,
      ...item,
      lastChangedKm: '',
      lastChangedDate: '',
      notes: ''
    }));
  });

  const [currentKm, setCurrentKm] = useState(() => {
    return localStorage.getItem('currentKm') || '';
  });

  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    localStorage.setItem('suzukiMaintenance', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('currentKm', currentKm);
  }, [currentKm]);

  const categories = ['All', ...new Set(maintenanceItems.map(item => item.category))];

  const updateRecord = (id, field, value) => {
    setRecords(records.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ));
  };

  const calculateNextService = (record) => {
    const currentMileage = parseInt(currentKm) || 0;
    const lastChanged = parseInt(record.lastChangedKm) || 0;
    
    let nextKm = null;
    let nextDate = null;
    let dueStatus = 'ok';

    if (record.intervalKm && lastChanged) {
      nextKm = lastChanged + record.intervalKm;
      const kmRemaining = nextKm - currentMileage;
      if (kmRemaining < 0) dueStatus = 'overdue';
      else if (kmRemaining < record.intervalKm * 0.1) dueStatus = 'due';
    }

    if (record.intervalMonths && record.lastChangedDate) {
      const lastDate = new Date(record.lastChangedDate);
      nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + record.intervalMonths);
      
      const today = new Date();
      const monthsRemaining = (nextDate - today) / (1000 * 60 * 60 * 24 * 30);
      if (monthsRemaining < 0) dueStatus = 'overdue';
      else if (monthsRemaining < 1) dueStatus = 'due';
    }

    return { nextKm, nextDate, dueStatus };
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ records, currentKm }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'suzuki-maintenance-backup.json';
    link.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.records) setRecords(data.records);
          if (data.currentKm) setCurrentKm(data.currentKm);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredRecords = filterCategory === 'All' 
    ? records 
    : records.filter(r => r.category === filterCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-blue-600" />
                Suzuki Swift 2007 4x4 Maintenance Tracker
              </h1>
              <p className="text-gray-600 mt-1">1.3L Petrol Engine</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download size={18} />
                Export
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
                <Upload size={18} />
                Import
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Odometer (km)
              </label>
              <input
                type="number"
                value={currentKm}
                onChange={(e) => setCurrentKm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current mileage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 text-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>OK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Due Soon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Overdue</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Interval</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Changed (km)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Changed (Date)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Next Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const { nextKm, nextDate, dueStatus } = calculateNextService(record);
                  const statusColor = dueStatus === 'overdue' ? 'bg-red-100' : dueStatus === 'due' ? 'bg-yellow-100' : 'bg-green-50';
                  
                  return (
                    <tr key={record.id} className={`hover:bg-gray-50 ${statusColor}`}>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.category}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.item}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {record.intervalKm && `${record.intervalKm.toLocaleString()} km`}
                        {record.intervalKm && record.intervalMonths && ' / '}
                        {record.intervalMonths && `${record.intervalMonths} mo`}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={record.lastChangedKm}
                          onChange={(e) => updateRecord(record.id, 'lastChangedKm', e.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="km"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={record.lastChangedDate}
                          onChange={(e) => updateRecord(record.id, 'lastChangedDate', e.target.value)}
                          className="w-36 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {nextKm && <div className="text-gray-700">{nextKm.toLocaleString()} km</div>}
                        {nextDate && <div className="text-gray-600">{nextDate.toLocaleDateString()}</div>}
                        {!nextKm && !nextDate && <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={record.notes}
                          onChange={(e) => updateRecord(record.id, 'notes', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder="Add notes..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Enter your current odometer reading to track upcoming services</li>
              <li>Fill in the last changed date and mileage to calculate next service</li>
              <li>Use Export to backup your data, Import to restore it</li>
              <li>Items highlighted in yellow are due soon, red items are overdue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;