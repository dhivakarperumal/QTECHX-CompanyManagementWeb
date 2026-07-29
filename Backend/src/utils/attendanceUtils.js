function calculateAttendanceMetrics({ check_in_time, check_out_time }) {
  const parseTime = (value) => {
    if (!value) return null;
    const normalized = String(value).trim();
    if (!normalized) return null;

    const [time, modifier] = normalized.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let total = hours * 60 + minutes;

    if (modifier === 'PM' && hours !== 12) total += 12 * 60;
    if (modifier === 'AM' && hours === 12) total -= 12 * 60;

    return total;
  };

  const officeCheckIn = parseTime('9:30 AM');
  const officeCheckOut = parseTime('6:00 PM');

  const checkInMinutes = parseTime(check_in_time);
  const checkOutMinutes = parseTime(check_out_time);

  let lateEntry = 'No';
  let earlyExit = 'No';
  let overtime = 'No';
  let workingHours = '0h 0m';
  let attendanceStatus = 'Absent';

  if (checkInMinutes !== null) {
    const lateBy = checkInMinutes - officeCheckIn;
    if (lateBy > 0) {
      lateEntry = `${Math.floor(lateBy / 60)}h ${lateBy % 60}m`;
    }
  }

  if (checkOutMinutes !== null) {
    const exitBefore = officeCheckOut - checkOutMinutes;
    if (exitBefore > 0) {
      earlyExit = `${Math.floor(exitBefore / 60)}h ${exitBefore % 60}m`;
    }
  }

  if (checkInMinutes !== null && checkOutMinutes !== null) {
    const durationMinutes = Math.max(0, checkOutMinutes - checkInMinutes);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    workingHours = `${hours}h ${minutes}m`;
    attendanceStatus = 'Present';

    const overtimeMinutes = Math.max(0, checkOutMinutes - officeCheckOut);
    if (overtimeMinutes > 0) {
      overtime = `${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m`;
    }
  }

  return {
    late_entry: lateEntry,
    early_exit: earlyExit,
    overtime,
    working_hours: workingHours,
    attendance_status: attendanceStatus,
  };
}

module.exports = { calculateAttendanceMetrics };
