export type UserRole = 'student' | 'teacher' | 'hod' | 'admin';

export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type RequestType = 'leave' | 'od';
export type LeaveSubType = 'medical' | 'casual' | 'od';

export interface LeavePolicy {
  id: string;
  type: LeaveSubType;
  label: string;
  maxDaysPerYear: number;
  description?: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'national' | 'regional' | 'college';
}

export interface SystemSettings {
  id: string;
  minAttendancePercent: number;
  academicYear: string;
  semesterStart: string; // YYYY-MM-DD
  semesterEnd: string;   // YYYY-MM-DD
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  year?: string;
  sinNumber?: string;
  attendanceRate?: number; // Calculated percentage
  totalDaysPresent?: number;
  totalWorkingDays?: number;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  hodId?: string;
}

export interface ClassAssignment {
  id: string;
  department: string;
  year: string;
  advisorId: string;
}

export interface RequestRecord {
  id: string;
  studentId: string;
  studentName?: string;
  department: string;
  year: string;
  fromDate: Date;
  toDate: Date;
  reason: string;
  type: RequestType;
  attachmentUrl?: string;
  status: RequestStatus;
  actedBy?: string;
  actedByName?: string;
  actedByRole?: UserRole;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest extends RequestRecord { }

export interface LeaveLog {
  id: string;
  requestId: string;
  studentId: string;
  studentName?: string;
  actionBy: string;
  actionByName?: string;
  actionByRole?: UserRole;
  action: 'approved' | 'rejected';
  comment?: string;
  timestamp: Date;
}

export interface AttendanceEntry {
  id: string;
  studentId: string;
  date: Date;
  status: 'present' | 'absent' | 'leave' | 'od';
}

export interface DailyStats {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'leave' | 'od'; // Indicates what happened on this day
  cumulativeAttendancePercent: number; // Attendance % up to and including this day
  workingDaysToDate: number; // Total working days from semester start to this date
  daysAbsentToDate: number; // Total absence days (leaves) from semester start to this date
  updatedAt: Date;
}
