import { CheckCircle, Clock, Calendar, RefreshCw } from "lucide-react";

const frequencies = [
  { label: "Daily", color: "bg-emerald-100 text-emerald-700" },
  { label: "Weekly", color: "bg-blue-100 text-blue-700" },
  { label: "Monthly", color: "bg-purple-100 text-purple-700" },
  { label: "Quarterly", color: "bg-amber-100 text-amber-700" },
  { label: "Semi-Annual", color: "bg-orange-100 text-orange-700" },
  { label: "Annual", color: "bg-rose-100 text-rose-700" },
];

const tasks = [
  {
    task: "Dust your keyboard",
    schedule: ["Weekly"],
    category: "Hardware",
    priority: "Medium",
  },
  {
    task: "Wipe down your monitor",
    schedule: ["Weekly"],
    category: "Hardware",
    priority: "Medium",
  },
  {
    task: "Clean your mouse",
    schedule: ["Weekly"],
    category: "Hardware",
    priority: "Medium",
  },
  {
    task: "Reboot your device",
    schedule: ["Daily"],
    category: "System",
    priority: "High",
  },
  {
    task: "Backup data",
    schedule: ["Daily"],
    category: "Data",
    priority: "Critical",
  },
  {
    task: "Run disk cleanup",
    schedule: ["Monthly"],
    category: "System",
    priority: "Medium",
  },
  {
    task: "Check firmware updates",
    schedule: ["Quarterly"],
    category: "Software",
    priority: "Low",
  },
  {
    task: "Change passwords",
    schedule: ["Semi-Annual"],
    category: "Security",
    priority: "High",
  },
  {
    task: "Full system hardware inspection",
    schedule: ["Annual"],
    category: "Hardware",
    priority: "Medium",
  },
];

const getPriorityColor = (priority) => {
  const colors = {
    Critical: "bg-red-100 text-red-700 border-red-200",
    High: "bg-orange-100 text-orange-700 border-orange-200",
    Medium: "bg-blue-100 text-blue-700 border-blue-200",
    Low: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return colors[priority] || colors.Medium;
};

export default function MaintenanceMatrix() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">

      {/* PAGE HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
          <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">
            System Maintenance Schedule 
          </h1>
        </div>
        <p className="text-slate-500 ml-4 text-base">
          Follow the maintenance matrix to ensure system reliability and performance
        </p>
      </div>

      {/* STATS CARD */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total Tasks</p>
              <p className="text-2xl font-semibold text-slate-800">{tasks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <RefreshCw className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Daily Tasks</p>
              <p className="text-2xl font-semibold text-slate-800">
                {tasks.filter(t => t.schedule.includes("Daily")).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Weekly Tasks</p>
              <p className="text-2xl font-semibold text-slate-800">
                {tasks.filter(t => t.schedule.includes("Weekly")).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Calendar className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Monthly+ Tasks</p>
              <p className="text-2xl font-semibold text-slate-800">
                {tasks.filter(t => !t.schedule.includes("Daily") && !t.schedule.includes("Weekly")).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

          {/* CARD HEADER */}
          <div className="px-8 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
                  Maintenance Checklist
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Click on any checkmark to mark task as completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">
                  Q1 2024
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
                  Last updated: Today
                </span>
              </div>
            </div>
          </div>

          {/* FREQUENCY LEGEND */}
          <div className="px-8 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-6 flex-wrap">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Frequency:</span>
              {frequencies.map((freq) => (
                <div key={freq.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${freq.color.split(' ')[0]}`}></div>
                  <span className="text-xs text-slate-600">{freq.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-8 py-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Details</span>
                  </th>
                  {frequencies.map((freq) => (
                    <th key={freq.label} className="text-center px-4 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${freq.color}`}>
                        {freq.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {tasks.map((item, index) => (
                  <tr 
                    key={index} 
                    className="group hover:bg-slate-50/80 transition-all duration-200"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                          {item.task}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{item.category}</span>
                          <span className="text-slate-300">•</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    </td>

                    {frequencies.map((freq) => (
                      <td key={freq.label} className="text-center px-4 py-5">
                        {item.schedule.includes(freq.label) ? (
                          <button className="transform transition-all duration-200 hover:scale-110">
                            <CheckCircle
                              className="text-emerald-500 mx-auto hover:text-emerald-600"
                              size={22}
                              strokeWidth={2}
                            />
                          </button>
                        ) : (
                          <span className="text-slate-200 text-xs">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Average completion time: 15-30 minutes</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                  8 completed today
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                  3 pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}