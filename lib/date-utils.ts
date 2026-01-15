/**
 * Returns the current date in Indian Standard Time (IST) in YYYY-MM-DD format.
 * This is crucial for synchronizing daily events like Game of the Day and Streaks.
 */
export function getISTDate(): Date {
  // Create a date object from the current time
  const now = new Date();
  
  // Convert into IST (UTC+5:30)
  // We use Intl.DateTimeFormat to reliably get the time in a specific timezone
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  return new Date(istString);
}

/**
 * Returns the current date string in IST (YYYY-MM-DD).
 */
export function getServerTodayString(): string {
  const istDate = getISTDate();
  
  // Format to YYYY-MM-DD
  // Note: getFullYear etc will return the components of the date object we just created.
  // Since we created 'istDate' by parsing the IST string, its "local" components 
  // actually represent the IST time (conceptually).
  // 
  // Wait, `new Date(string)` parses it in local time or UTC?
  // `toLocaleString` returns "M/D/YYYY, H:MM:SS PM".
  // `new Date("M/D/YYYY, H:MM:SS PM")` creates a Date object.
  // The Date object itself is just a timestamp. 
  // If we access .getDate(), it uses the system's local timezone.
  //
  // A safer, more robust approach specifically for "YYYY-MM-DD" string:
  
  return new Intl.DateTimeFormat("en-CA", { // en-CA gives YYYY-MM-DD
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

/**
 * Returns yesterday's date string in IST (YYYY-MM-DD).
 */
export function getServerYesterdayString(): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Subtract 24 hours
  
  return new Intl.DateTimeFormat("en-CA", { 
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(yesterday);
}

/**
 * Checks if two dates (strings or Date objects) represent the same day in IST.
 */
export function isSameDayIST(date1: string | Date | null | undefined, date2: string | Date | null | undefined): boolean {
  if (!date1 || !date2) return false;
  
  // Normalize to strings if needed, assuming the inputs might be ISO strings or YYYY-MM-DD
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  // This comparison is tricky if we don't strictly control the input format.
  // If we assume inputs are "YYYY-MM-DD" strings already, we can just compare strings.
  // But if inputs are timestamps, we need to convert to IST YYYY-MM-DD.
  
  // Let's rely on the string converter for robust comparison
  const str1 = typeof date1 === 'string' && date1.length === 10 ? date1 : convertToISTDateString(date1);
  const str2 = typeof date2 === 'string' && date2.length === 10 ? date2 : convertToISTDateString(date2);
  
  return str1 === str2;
}


function convertToISTDateString(input: string | Date): string {
  const d = new Date(input);
   return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
}

/**
 * Calculates the difference in calendar days between two dates in IST.
 * Returns (date2 - date1) in days.
 * Example: if d1=2026-01-01 and d2=2026-01-02, returns 1.
 */
export function getDaysDifference(date1: string | Date, date2: string | Date): number {
  const str1 = typeof date1 === 'string' && date1.length === 10 ? date1 : convertToISTDateString(date1);
  const str2 = typeof date2 === 'string' && date2.length === 10 ? date2 : convertToISTDateString(date2);

  const d1 = new Date(str1);
  const d2 = new Date(str2);

  // UTC conversion to allow simple subtraction
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utc2 - utc1) / msPerDay);
}
