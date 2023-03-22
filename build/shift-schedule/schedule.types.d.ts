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
export declare const dayPortValue: {
    a: {
        src: string;
        text: string;
        bgColor: string;
        mediumColor: string;
        iconColor: string;
        softColor: string;
        lowColor: string;
    };
    n: {
        src: string;
        text: string;
        bgColor: string;
        mediumColor: string;
        iconColor: string;
        softColor: string;
        lowColor: string;
    };
    m: {
        src: string;
        text: string;
        bgColor: string;
        mediumColor: string;
        iconColor: string;
        softColor: string;
        lowColor: string;
    };
};
