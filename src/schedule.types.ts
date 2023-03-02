import { TemplateResult } from 'lit';
import { ColorTypesV2 } from '@cortex-ui/core/cx/types/colors.v2.type';
import { IconSrcTypes } from '@cortex-ui/core/cx/components/icon/types/icon.types';

export interface Weather {
  data: SchedulingData;
}
export interface SchedulingData {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy?: null;
  id: string;
  json: string;
  scheduleGroupId: string;
  startDate: string;
  endDate: string;
  startRequestDate: string;
  endRequestDate: string;
  modelTaskName?: null;
  templateId: string;
  organizationId: string;
  scheduleShifts?: ScheduleShiftsEntity[] | null;
  schedulePractitioner?: SchedulePractitionerEntity[] | null;
}
export interface ScheduleShiftsEntity {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  scheduleId: string;
  shiftSlotId: string;
  organizationId?: null;
  scheduleStaffings?: ScheduleStaffingsEntity[] | null;
}
export interface ScheduleStaffingsEntity {
  id: string;
  practitionerLevelId: string;
  planDate: string;
  scheduleShiftId: string;
  shift?: null;
  minStaff: number;
  organizationId?: null;
  practitionerLevel: PractitionerLevel;
}
export interface PractitionerLevel {
  id: string;
  name: string;
}
export interface SchedulePractitionerEntity {
  id: string;
  practitionerId: string;
  hardConstraints?: null;
  dayOff: number;
  vacation: number;
  organizationId?: null;
  schedulePractitionerPlan?: null[] | null;
  schedulePractitionerRequest?: (SchedulePractitionerRequestEntity | null)[] | null;
  practitioner: Practitioner;
}
export interface SchedulePractitionerRequestEntity {
  id: string;
  schedulePractitionerId: string;
  requestTypeId: string;
  requestDate: string;
  requestShift: string;
  organizationId?: null;
  requestType: RequestType;
}

export interface Practitioner {
  nameGiven: string;
  nameFamily: string;
  gender: string;
  practitionerLevel: PractitionerLevelOrPractitionerRole;
  practitionerRole: PractitionerLevelOrPractitionerRole;
}
export interface PractitionerLevelOrPractitionerRole {
  name: string;
}

export interface RequestType {
  id: string;
  name: string;
  abbr: 'sr' | 'sem' | 'off' | 'vac' | 'woff';
}

export type DayPart = 'morning' | 'afternoon' | 'evening';
export const requestTypeStyles: Record<
  RequestType['abbr'],
  {
    iconSrc: IconSrcTypes;
    accentColor: ColorTypesV2;
    iconBgColor: ColorTypesV2;
  }
> = {
  sr: {
    iconSrc: 'favorite-line',
    accentColor: 'primary-500',
    iconBgColor: 'primary-100',
  },
  sem: {
    iconSrc: 'favorite-line',
    accentColor: 'modern-green-500',
    iconBgColor: 'modern-green-100',
  },
  off: {
    iconSrc: 'pause-circle-line',
    accentColor: 'alarm-orange-500',
    iconBgColor: 'alarm-orange-200',
  },
  vac: {
    iconSrc: 'favorite-line',
    accentColor: 'warning-500',
    iconBgColor: 'warning-200',
  },
  woff: {
    iconSrc: 'favorite-line',
    accentColor: 'gray-500',
    iconBgColor: 'gray-100',
  },
} as const;

export type DateBetweenData = { currentMonth: string; dateBetween: Date[][] };
export type ScheduleDataWithRender = SchedulePractitionerRequestEntity & {
  render: (() => TemplateResult) | null;
};
