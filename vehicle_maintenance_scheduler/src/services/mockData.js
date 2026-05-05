/**
 * Mock Data Service
 * Provides realistic test data when external APIs are unavailable
 */

// Mock depot data
const mockDepot = {
  id: "depot-001",
  name: "Main Service Center",
  mechanic_hours: 40,
  location: "New Delhi",
  contact: "+91-9876543210"
};

// Mock vehicles with maintenance tasks
const mockVehicles = [
  {
    id: "VH-001",
    type: "Truck",
    model: "HT-2024",
    Tasks: [
      { TaskID: "T001", Duration: 3, Impact: 8 },
      { TaskID: "T002", Duration: 2, Impact: 5 },
      { TaskID: "T003", Duration: 4, Impact: 12 }
    ]
  },
  {
    id: "VH-002",
    type: "Bus",
    model: "BUS-2023",
    Tasks: [
      { TaskID: "T004", Duration: 5, Impact: 15 },
      { TaskID: "T005", Duration: 2, Impact: 4 },
      { TaskID: "T006", Duration: 3, Impact: 7 }
    ]
  },
  {
    id: "VH-003",
    type: "Van",
    model: "VAN-2024",
    Tasks: [
      { TaskID: "T007", Duration: 2, Impact: 6 },
      { TaskID: "T008", Duration: 4, Impact: 10 },
      { TaskID: "T009", Duration: 3, Impact: 9 }
    ]
  },
  {
    id: "VH-004",
    type: "Car",
    model: "CAR-2024",
    Tasks: [
      { TaskID: "T010", Duration: 1.5, Impact: 3 },
      { TaskID: "T011", Duration: 2.5, Impact: 6 },
      { TaskID: "T012", Duration: 2, Impact: 5 }
    ]
  },
  {
    id: "VH-005",
    type: "Truck",
    model: "HT-2023",
    Tasks: [
      { TaskID: "T013", Duration: 6, Impact: 18 },
      { TaskID: "T014", Duration: 3, Impact: 8 },
      { TaskID: "T015", Duration: 2, Impact: 5 }
    ]
  }
];

/**
 * Get mock depot data
 */
function getMockDepot() {
  return mockDepot;
}

/**
 * Get mock vehicles data (flattened tasks format)
 */
function getMockVehicles() {
  // Return flattened array of all tasks from all vehicles
  return [
    { TaskID: "T001", Duration: 3, Impact: 8, Vehicle: "VH-001" },
    { TaskID: "T002", Duration: 2, Impact: 5, Vehicle: "VH-001" },
    { TaskID: "T003", Duration: 4, Impact: 12, Vehicle: "VH-001" },
    { TaskID: "T004", Duration: 5, Impact: 15, Vehicle: "VH-002" },
    { TaskID: "T005", Duration: 2, Impact: 4, Vehicle: "VH-002" },
    { TaskID: "T006", Duration: 3, Impact: 7, Vehicle: "VH-002" },
    { TaskID: "T007", Duration: 2, Impact: 6, Vehicle: "VH-003" },
    { TaskID: "T008", Duration: 4, Impact: 10, Vehicle: "VH-003" },
    { TaskID: "T009", Duration: 3, Impact: 9, Vehicle: "VH-003" },
    { TaskID: "T010", Duration: 1.5, Impact: 3, Vehicle: "VH-004" },
    { TaskID: "T011", Duration: 2.5, Impact: 6, Vehicle: "VH-004" },
    { TaskID: "T012", Duration: 2, Impact: 5, Vehicle: "VH-004" },
    { TaskID: "T013", Duration: 6, Impact: 18, Vehicle: "VH-005" },
    { TaskID: "T014", Duration: 3, Impact: 8, Vehicle: "VH-005" },
    { TaskID: "T015", Duration: 2, Impact: 5, Vehicle: "VH-005" }
  ];
}

/**
 * Get all mock data
 */
function getAllMockData() {
  return {
    depot: mockDepot,
    vehicles: mockVehicles,
    totalTasks: mockVehicles.reduce((sum, v) => sum + v.Tasks.length, 0)
  };
}

module.exports = {
  getMockDepot,
  getMockVehicles,
  getAllMockData
};
