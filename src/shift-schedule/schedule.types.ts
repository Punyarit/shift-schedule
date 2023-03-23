import { TemplateResult } from 'lit';
import { ColorTypes } from '@cortex-ui/core/cx/types/colors.type';
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
  remark?: string;
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

export type DayPart = 'm' | 'a' | 'n';
export const requestTypeStyles: Record<
  RequestType['abbr'],
  {
    iconSrc: IconSrcTypes;
    accentColor: ColorTypes;
    iconBgColor: ColorTypes;
  }
> = {
  sr: {
    iconSrc: 'emoji-wink-custom',
    accentColor: 'primary-500',
    iconBgColor: 'primary-100',
  },
  sem: {
    iconSrc: 'exit-right-custom',
    accentColor: 'modern-green-500',
    iconBgColor: 'modern-green-100',
  },
  off: {
    iconSrc: 'block-custom',
    accentColor: 'alarm-orange-500',
    iconBgColor: 'alarm-orange-100',
  },
  vac: {
    iconSrc: 'vacation-custom',
    accentColor: 'warning-500',
    iconBgColor: 'warning-100',
  },
  woff: {
    iconSrc: 'pause-circle-line',
    accentColor: 'gray-600',
    iconBgColor: 'gray-300',
  },
} as const;

export type DateBetweenData = { currentMonth: string; dateBetween: Date[][] };
export type ScheduleDataWithRender = SchedulePractitionerRequestEntity & {
  arrangedRequest?: ArrangedRequest;
};

export type ArrangedRequest = SrShiftPlan;

export type SrShiftPlan = {
  m: Record<number, ScheduleShiftsEntity>;
  a: Record<number, ScheduleShiftsEntity>;
  n: Record<number, ScheduleShiftsEntity>;
};

export type DatePickerShiftPlan = {
  dateString?: string;
  remark?: string;
};
export type QueryRemoveOrigin = {
  queryIndex: {
    practitionerIndex: number;
    requestIndex: number | number[];
  };
  schedulePractitioner: SchedulePractitionerEntity;
  schedulePractitionerRequest: SchedulePractitionerRequestEntity | ScheduleRequestIndex;
};

export type ScheduleRequestIndex = { [index: number]: SchedulePractitionerRequestEntity };

export type DatePickerRequest = {
  [id: string]: {
    practitioner: SchedulePractitionerEntity;
    request: {
      // 📌key such as 2023-01-25
      [date: string]: DatePickerShiftPlan;
    };
  };
};

export type DisabledDate = {
  title: string;
  date: string;
  repetition: 'once' | 'every-week' | 'every-month' | 'every-year';
};

export const dayPortValue = {
  a: {
    src: 'sunset-u',
    text: 'กลางวัน',
    bgColor: 'warning-100',
    mediumColor: 'warning-200',
    iconColor: 'warning-500',
    softColor: 'warning-50',
    lowColor: 'warning-25',
  },
  n: {
    src: 'moon-u',
    text: 'เย็น',
    bgColor: 'primary-100',
    mediumColor: 'primary-200',
    iconColor: 'primary-500',
    softColor: 'primary-50',
    lowColor: 'primary-25',
  },
  m: {
    src: 'cloud-sun-u',
    text: 'เช้า',
    bgColor: 'primary-100',
    mediumColor: 'primary-200',
    iconColor: 'primary-500',
    softColor: 'primary-50',
    lowColor: 'primary-25',
  },
};

export const genderType = {
  M: 'ช',
  F: 'ญ',
};

export const shiftPlanIcon: Record<string, string> = {
  sem: 'exit-right-custom',
  off: 'block-custom',
  vac: 'vacation-custom',
};
