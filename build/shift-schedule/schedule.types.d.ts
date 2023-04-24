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
export declare const requestTypeStyles: Record<RequestType['abbr'], {
    iconSrc: IconSrcTypes;
    accentColor: ColorTypes;
    iconBgColor: ColorTypes;
}>;
export type DateBetweenData = {
    currentMonth: string;
    dateBetween: Date[][];
};
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
export type ScheduleRequestIndex = {
    [index: number]: SchedulePractitionerRequestEntity;
};
export type DatePickerRequest = {
    [id: string]: {
        practitioner: SchedulePractitionerEntity;
        request: {
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
export declare const dayPortValue: {
    a: {
        src: string;
        text: string;
        bgColor: string;
        mediumColor: string;
        iconColor: string;
        softColor: string;
        lowColor: string;
        size: string;
    };
    n: {
        src: string;
        text: string;
        bgColor: string;
        mediumColor: string;
        iconColor: string;
        softColor: string;
        lowColor: string;
        size: string;
    };
    m: {
        src: string;
        text: string;
        bgColor: string;
        mediumColor: string;
        iconColor: string;
        softColor: string;
        lowColor: string;
        size: string;
    };
};
export declare const genderType: {
    M: string;
    F: string;
};
export declare const shiftPlanIcon: Record<string, string>;
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
