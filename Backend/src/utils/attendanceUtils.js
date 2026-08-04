function calculateAttendanceMetrics({ check_in_time, check_out_time, break_start_time, break_end_time }) {
  const parseTime = (value) => {
    if (!value) return null;
    const normalized = String(value).trim();
    if (!normalized) return null;

    // Handle HH:MM AM/PM format or HH:MM format
    if (normalized.includes(' ')) {
      const [time, modifier] = normalized.split(' ');
      const [hoursStr, minutesStr] = time.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      if (modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    } else {
      const [hours, minutes] = normalized.split(':').map(Number);
      return hours * 60 + minutes;
    }
  };

  const formatMinutesToTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const officeCheckIn = parseTime('09:30');
  const officeCheckOut = parseTime('18:00');
  const autoBreakStart = parseTime('14:00'); // 2 PM
  const autoBreakEnd = parseTime('15:00'); // 3 PM

  const checkInMinutes = parseTime(check_in_time);
  let checkOutMinutes = parseTime(check_out_time);
  let breakStartMinutes = parseTime(break_start_time);
  let breakEndMinutes = parseTime(break_end_time);

  let lateEntry = 'No';
  let earlyExit = 'No';
  let overtime = 'No';
  let workingHoursStr = '0h 0m';
  let attendanceStatus = 'Absent';
  
  if (checkInMinutes !== null) {
    const lateBy = checkInMinutes - officeCheckIn;
    if (lateBy > 0) {
      lateEntry = formatMinutesToTime(lateBy);
    }
    attendanceStatus = 'Present';
  }

  // If clock out is present, calculate full metrics
  if (checkInMinutes !== null && checkOutMinutes !== null) {
    const exitBefore = officeCheckOut - checkOutMinutes;
    if (exitBefore > 0) {
      earlyExit = formatMinutesToTime(exitBefore);
    }

    let durationMinutes = Math.max(0, checkOutMinutes - checkInMinutes);

    // Break logic
    let breakDuration = 0;
    if (breakStartMinutes !== null && breakEndMinutes !== null) {
      breakDuration = Math.max(0, breakEndMinutes - breakStartMinutes);
    } else if (breakStartMinutes !== null && breakEndMinutes === null) {
       // On break currently, assume break continues until check out or max 1 hour
       breakDuration = Math.max(0, checkOutMinutes - breakStartMinutes);
    } else if (checkInMinutes <= autoBreakStart && checkOutMinutes >= autoBreakEnd) {
      // Auto deduct 1 hour break if they worked across the 2-3 PM window
      breakDuration = 60;
    }

    durationMinutes = Math.max(0, durationMinutes - breakDuration);
    workingHoursStr = formatMinutesToTime(durationMinutes);

    // Overtime
    const overtimeMinutes = Math.max(0, checkOutMinutes - officeCheckOut);
    if (overtimeMinutes > 0) {
      overtime = formatMinutesToTime(overtimeMinutes);
    }

    // Half Day logic: If they worked less than or equal to 4.5 hours (270 minutes)
    if (durationMinutes <= 270 && durationMinutes > 0) {
      attendanceStatus = 'Half Day';
    }
  }

  return {
    late_entry: lateEntry,
    early_exit: earlyExit,
    overtime,
    working_hours: workingHoursStr,
    attendance_status: attendanceStatus,
  };
}

module.exports = { calculateAttendanceMetrics };
