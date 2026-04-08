// US public holidays — month is 0-indexed to match JS Date
const HOLIDAYS = {
  '01-01': "New Year's Day",
  '01-15': 'MLK Day',       // approx (3rd Monday Jan)
  '02-14': "Valentine's Day",
  '02-19': "Presidents' Day", // approx (3rd Monday Feb)
  '03-17': "St. Patrick's Day",
  '04-22': 'Earth Day',
  '05-12': "Mother's Day",   // approx (2nd Sunday May)
  '05-27': 'Memorial Day',   // approx (last Monday May)
  '06-16': "Father's Day",   // approx (3rd Sunday Jun)
  '06-19': 'Juneteenth',
  '07-04': 'Independence Day',
  '09-02': 'Labor Day',      // approx (1st Monday Sep)
  '10-14': 'Columbus Day',   // approx (2nd Monday Oct)
  '10-31': 'Halloween',
  '11-11': "Veterans' Day",
  '11-28': 'Thanksgiving',   // approx (4th Thursday Nov)
  '12-24': 'Christmas Eve',
  '12-25': 'Christmas Day',
  '12-31': "New Year's Eve",
}

// Returns the holiday name for a given month (0-indexed) and day, or null
export function getHoliday(month, day) {
  const key = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return HOLIDAYS[key] || null
}
