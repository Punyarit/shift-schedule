export type ScheduleRequestDetailResponse = {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string | null;
    id: string;
    json: string;
    scheduleGroupId: string;
    startDate: string;
    endDate: string;
    startRequestDate: string;
    endRequestDate: string;
    modelTaskName: string | null;
    templateId: string;
    organizationId: string;
    schedulePractitioner: ResponseSchedulePractitioner[];
    scheduleShifts: ResponseScheduleShifts[];
};
export interface ResponseSchedulePractitioner {
    id: string;
    practitionerId: string;
    hardConstraints: string | null;
    dayOff: number;
    vacation: number;
    organizationId: string | null;
    schedulePractitionerPlan: ResponseSchedulePractitionerPlan[];
    schedulePractitionerRequest: ResponseSchedulePractitionerRequest[];
    practitioner: {
        nameGiven: string;
        nameFamily: string;
        gender: 'M' | 'F';
        practitionerLevel: {
            id: string;
            name: string;
        };
        practitionerRole: {
            name: string;
        };
    };
}
export interface ResponseSchedulePractitionerPlan {
}
export interface ResponseSchedulePractitionerRequest {
}
export interface ResponseScheduleShifts {
    id: string;
    shiftName: string;
    startTime: string;
    endTime: string;
    scheduleId: string;
    shiftSlotId: string;
    organizationId: string | null;
    scheduleStaffings: ResponseScheduleStaffing[];
}
export interface ResponseScheduleStaffing {
    id: string;
    planDate: string;
    scheduleShiftId: string;
    shift: string | null;
    minStaff: number;
    organizationId: string | null;
    practitionerLevelId: string;
    practitionerLevel: {
        id: string;
        name: string;
    };
}
export type ScheduleRequestType = {
    id?: string;
    name?: string;
    abbr?: string;
};
