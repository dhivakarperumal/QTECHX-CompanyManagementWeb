const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateAttendanceMetrics } = require('../src/utils/attendanceUtils');

test('calculateAttendanceMetrics returns working hours and status values for a normal day', () => {
  const result = calculateAttendanceMetrics({ check_in_time: '09:30', check_out_time: '18:00' });

  assert.equal(result.working_hours, '8h 30m');
  assert.equal(result.attendance_status, 'Present');
  assert.equal(result.late_entry, 'No');
  assert.equal(result.early_exit, 'No');
});

test('calculateAttendanceMetrics marks an absent day when no check-in is provided', () => {
  const result = calculateAttendanceMetrics({ check_in_time: null, check_out_time: null });

  assert.equal(result.working_hours, '0h 0m');
  assert.equal(result.attendance_status, 'Absent');
});
