export const ADMIN_STORAGE_STATE = 'storage-state/admin.json';

export const ROUTES = {
  login: '/web/index.php/auth/login',
  dashboard: '/web/index.php/dashboard/index',
  adminUsers: '/web/index.php/admin/viewSystemUsers',
  pimEmployeeList: '/web/index.php/pim/viewEmployeeList',
  pimAddEmployee: '/web/index.php/pim/addEmployee',
  leaveApply: '/web/index.php/leave/applyLeave',
  leaveList: '/web/index.php/leave/viewLeaveList',
  leaveMyList: '/web/index.php/leave/viewMyLeaveList',
  timeTimesheet: '/web/index.php/time/viewMyTimesheet',
  timeAttendance: '/web/index.php/time/viewEmployeeAttendanceRecord',
  recruitmentCandidates: '/web/index.php/recruitment/viewCandidates',
  myInfo: '/web/index.php/pim/viewPersonalDetails/empNumber/1',
  performanceTrackers: '/web/index.php/performance/searchEvaluatePerformanceReview',
  directory: '/web/index.php/directory/viewDirectory',
} as const;
