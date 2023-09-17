import { TemplateResult } from 'lit';
import { ColorTypes } from '@cortex-ui/core/cx/types/colors.type';
import { IconSrcTypes } from '@cortex-ui/core/cx/components/icon/types/icon.types';
import { ScheduleRequestType } from './schedule-client.typess';

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

export interface ScheduleErrorDayRequest {
  id: string;
  practitionerId: string;
  date: string;
  scheduleRequestTypeId: string;
  scheduleRequestType: ScheduleRequestType;
  scheduleId: string;
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
  m: Record<string, ScheduleShiftsEntity>;
  a: Record<string, ScheduleShiftsEntity>;
  n: Record<string, ScheduleShiftsEntity>;
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

export type DateObject = {
  date: string;
  name: string;
};

export const dayPortValueEarly = {
  m: {
    src: 'cloud-sun-u',
    text: 'เช้า',
    bgColor: 'color-4-100',
    mediumColor: 'primary-200',
    iconColor: 'color-4-500',
    softColor: 'primary-50',
    lowColor: 'primary-25',
    size: '16',
  },
  a: {
    src: 'sunset-u',
    text: 'บ่าย',
    bgColor: 'warning-100',
    mediumColor: 'warning-200',
    iconColor: 'color-12-500',
    softColor: 'warning-50',
    lowColor: 'warning-25',
    size: '16',
  },
  n: {
    src: 'moon-u',
    text: 'ดึก',
    bgColor: 'color-7-100',
    mediumColor: 'primary-200',
    iconColor: 'color-7-500',
    softColor: 'color-7-100',
    lowColor: 'primary-25',
    size: '14',
  },
};

export const dayPortValueLate = {
  n: {
    src: 'moon-u',
    text: 'ดึก',
    bgColor: 'color-4-100',
    mediumColor: 'primary-200',
    iconColor: 'color-4-500',
    softColor: 'primary-50',
    lowColor: 'primary-25',
    size: '14',
  },
  m: {
    src: 'cloud-sun-u',
    text: 'เช้า',
    bgColor: 'warning-100',
    mediumColor: 'warning-200',
    iconColor: 'color-12-500',
    softColor: 'warning-50',
    lowColor: 'warning-25',
    size: '16',
  },
  a: {
    src: 'sunset-u',
    text: 'บ่าย',
    bgColor: 'color-7-100',
    mediumColor: 'primary-200',
    iconColor: 'color-7-500',
    softColor: 'color-7-100',
    lowColor: 'primary-25',
    size: '16',
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

export interface Practitioner {
  id: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  username: string;
  nameGiven: string;
  nameFamily: string;
  nameMiddle: any;
  namePrefixId: any;
  practitionerLevelId: string;
  birthdate: any;
  gender: string;
  photo: any;
  tel: any;
  email: string;
  defaultHardConstraints: string;
  organizationId: string;
  roleId: string;
  contractEnumId: string;
  mainZoneId: string;
  practitionerRoleId: string;
  practitionerCompetencyId: string;
  workingMethod: string;
  isActive: boolean;
  practitionerLevel: PractitionerLevel;
  practitionerRole: PractitionerRole;
  mainZone: MainZone;
  leave: Leave;
  vacations: Vacation[];
}

export interface PractitionerLevel {
  id: string;
  name: string;
  practitionerRole: PractitionerRole;
  practitionerRoleId: string;
}

export interface PractitionerRole {
  id: string;
  name: string;
  abbr: string;
}

export interface MainZone {
  id: string;
  abbr: string;
  fullName: string;
  organizationId: any;
}

export interface Leave {
  id: string;
  practitionerId: string;
  updatedAt: string;
  dayOff: number;
  organizationId: string;
}

export interface Vacation {
  id: string;
  practitionerId: string;
  updatedAt: string;
  year: number;
  vacation: number;
  organizationId: string;
}
