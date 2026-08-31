import { useMemo } from 'react';
import { eachDayOfInterval, getDay, format } from 'date-fns';
import type { LeaveRequest, Holiday } from '../types';

interface SemesterConfig {
  start: string;
  threshold: number;
}

interface AttendancePredictionProps {
  approvedRequests: LeaveRequest[];
  holidays: Holiday[];
  semesterConfig: SemesterConfig;
  proposedFromDate?: Date;
  proposedToDate?: Date;
}

export const useAttendancePrediction = ({
  approvedRequests,
  holidays,
  semesterConfig,
  proposedFromDate,
  proposedToDate
}: AttendancePredictionProps) => {
  return useMemo(() => {
    try {
      const semStart = new Date(semesterConfig.start);
      const today = new Date();
      if (today < semStart) return { currentPct: 100, projectedPct: 100, wouldDropBelowThreshold: false };

      const workingDays = eachDayOfInterval({ start: semStart, end: today }).filter(d => {
        const dow = getDay(d);
        const dateKey = format(d, 'yyyy-MM-dd');
        return dow !== 0 && dow !== 6 && !holidays.some(h => h.date === dateKey);
      });

      const absentDays = approvedRequests.filter(r => r.type === 'leave').reduce((acc, r) => {
        try {
          return acc + eachDayOfInterval({ start: r.fromDate, end: r.toDate })
            .filter(d => d >= semStart && d <= today && getDay(d) !== 0 && getDay(d) !== 6 && !holidays.some(h => h.date === format(d, 'yyyy-MM-dd'))).length;
        } catch (_) { return acc; }
      }, 0);

      const currentPct = workingDays.length > 0 ? Math.round(((workingDays.length - absentDays) / workingDays.length) * 100) : 100;

      let projectedPct = currentPct;
      let wouldDropBelowThreshold = false;

      if (proposedFromDate && proposedToDate) {
        const proposedAbsentDays = eachDayOfInterval({ start: proposedFromDate, end: proposedToDate })
          .filter(d => d >= semStart && d <= today && getDay(d) !== 0 && getDay(d) !== 6 && !holidays.some(h => h.date === format(d, 'yyyy-MM-dd'))).length;

        const totalAbsentDays = absentDays + proposedAbsentDays;
        projectedPct = workingDays.length > 0 ? Math.round(((workingDays.length - totalAbsentDays) / workingDays.length) * 100) : 100;
        wouldDropBelowThreshold = projectedPct < semesterConfig.threshold;
      }

      return { currentPct, projectedPct, wouldDropBelowThreshold };
    } catch (_) {
      return { currentPct: 100, projectedPct: 100, wouldDropBelowThreshold: false };
    }
  }, [approvedRequests, holidays, semesterConfig, proposedFromDate, proposedToDate]);
};
