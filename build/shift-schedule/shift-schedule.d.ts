import { LitElement, PropertyValueMap } from 'lit';
import '@cortex-ui/core/cx/c-box';
import '@cortex-ui/core/cx/modal';
import '@cortex-ui/core/cx/theme';
import '@cortex-ui/core/cx/icon';
import '@cortex-ui/core/cx/button';
import '@cortex-ui/core/cx/datepicker';
import '@cortex-ui/core/cx/popover';
import './components/request-button';
import { DateBetweenData, DayPart, RequestType, ScheduleDataWithRender, SchedulePractitionerRequestEntity, SchedulingData, DatePickerShiftPlan, SrShiftPlan, SchedulePractitionerEntity, ScheduleShiftsEntity } from './schedule.types';
import { ColorTypes } from '@cortex-ui/core/cx/types/colors.type';
import { ScheduleRequestDetailResponse, ScheduleRequestType } from './schedule-client.typess';
import { DateRangeSelected } from '@cortex-ui/core/cx/components/calendar/types/calendar.types';
export declare class ShiftSchedule extends LitElement {
    private buttonGroupUI;
    private scheduleTitleUI;
    private tableLineUI;
    private titleLeftTopUI;
    private monthUI;
    private genderBox;
    private requestBox;
    private userTitle;
    private weekDayUI;
    private weekDayWRapperUI;
    private monthEachUI;
    private sundayBorderRightUI;
    private titleSticky;
    private userSelected;
    private tableWrapperUI;
    private iconTitleWrapper;
    private iconTitle;
    viewerRole: 'manager' | 'staff';
    mode: 'view' | 'edit';
    practitionerId?: string;
    currentUserIndex: number;
    scheduleData?: SchedulingData | ScheduleRequestDetailResponse | null;
    private removeOriginCache;
    requestTypes?: RequestType[] | ScheduleRequestType[];
    dateBetween?: DateBetweenData[];
    requestSelected?: RequestType;
    selectedDate?: Date;
    srState: never[];
    maxHeightOfUserTable?: number;
    private shiftSrRequestCache;
    userImgDefault?: string;
    shiftSrRequestSaved: {
        [id: string]: {
            practitioner: SchedulePractitionerEntity;
            request: {
                [date: string]: {
                    shiftPlan: SrShiftPlan;
                };
            };
        };
    };
    shiftSemRequestSaved: {
        [id: string]: {
            practitioner: SchedulePractitionerEntity;
            request: {
                [date: string]: DatePickerShiftPlan;
            };
        };
    };
    shiftOffRequestSaved: {
        [id: string]: {
            practitioner: SchedulePractitionerEntity;
            request: {
                [date: string]: DatePickerShiftPlan;
            };
        };
    };
    shiftVacRequestSaved: {
        [id: string]: {
            practitioner: SchedulePractitionerEntity;
            request: {
                [date: string]: DatePickerShiftPlan;
            };
        };
    };
    shiftWoffRequestSaved: {
        [id: string]: {
            practitioner: SchedulePractitionerEntity;
            request: {
                [date: string]: {
                    date: Date;
                };
            };
        };
    };
    maxHeight?: number;
    datepickerData?: DateRangeSelected;
    private removeRequestSelected?;
    tableWrapperRef: import("lit-html/directives/ref").Ref<HTMLDivElement>;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    dateFormat(date: Date | number | string | undefined, options?: Intl.DateTimeFormatOptions): string | undefined;
    renderRequestButton(): import("lit-html").TemplateResult<1>;
    selectRequest(type: RequestType): void;
    private calcHeightOfUserTable;
    connectedCallback(): Promise<void>;
    private setRemoveMode;
    isRemoveMode: boolean;
    render(): import("lit-html").TemplateResult<1>;
    ManagerHoverUser(indexUser: number): void;
    sentRemoveEvent(): void;
    removeWoffSaved(dateString?: string, practitioner?: SchedulePractitionerEntity, data?: {
        initial: boolean;
    }): void;
    renderWoffSaved(dateString?: string, practitioner?: SchedulePractitionerEntity, data?: {
        initial: boolean;
    }): import("lit-html").TemplateResult<1>;
    removeSrPlan(dayPart: DayPart, dateString: string, practitioner: SchedulePractitionerEntity): void;
    renderSrShiftPlanSaved(planRequest: {
        practitioner: SchedulePractitionerEntity;
        request: {
            [date: string]: {
                shiftPlan: SrShiftPlan;
            };
        };
    }, dateString: string, practitioner: SchedulePractitionerEntity): import("lit-html").TemplateResult<1>;
    removeShiftDatePicker(data: {
        dateString?: string;
        remark?: string;
        initial?: boolean;
    }, type: RequestType['abbr'], practitioner: SchedulePractitionerEntity): void;
    findRequestType(abbr: string): RequestType;
    renderShiftPlanSaved(data: {
        dateString?: string;
        remark?: string;
        initial?: boolean;
    }, type: RequestType['abbr'], practitioner: SchedulePractitionerEntity): import("lit-html").TemplateResult<1>;
    deleteInitialSr(practitioner: SchedulePractitionerEntity, dateString: string, dayPart: string): void;
    renderInitialRequest(request: ScheduleDataWithRender, practitioner: SchedulePractitionerEntity, date: Date): import("lit-html").TemplateResult<1> | undefined;
    saveDatepicker(e: CXDatePicker.SelectDate): void;
    deleteInitialDatePicker(practitionerId: string, dateBetween: Date[]): void;
    saveWithDateData: (practitioner: SchedulePractitionerEntity) => void;
    renderDatepickerBox(data: {
        title: string;
        practitioner: SchedulePractitionerEntity;
        date: Date;
    }): import("lit-html").TemplateResult<1>;
    renderEmptyDateForSelect(date: Date, practitioner: SchedulePractitionerEntity): import("lit-html").TemplateResult<1> | undefined;
    renderRequestSr(shifts: ScheduleShiftsEntity[], dayPart: DayPart): import("lit-html").TemplateResult<1>;
    addSrShiftRequest(requestPlan: ScheduleShiftsEntity): void;
    groupShiftsByLetter(arr: any): any;
    renderSrPopover(date: Date, practitioner: SchedulePractitionerEntity): import("lit-html").TemplateResult<1>;
    clearShiftRequestCache(): void;
    cancelSrRequestPlan(): void;
    saveSrRequestPlan(date: Date, practitioner: SchedulePractitionerEntity): void;
    closePopover(): void;
    selectDateRequest(date: Date, type?: RequestType['abbr'], practitioner?: SchedulePractitionerEntity): void;
    saveWoffRequest(date: Date, practitioner: SchedulePractitionerEntity): void;
    renderEmptyBox(date: Date, type?: RequestType['abbr'], practitioner?: SchedulePractitionerEntity): import("lit-html").TemplateResult<1>;
    firstUpdated(): void;
    resetRequestSelect(): void;
    convertRequestDatesToObject(requests: SchedulePractitionerRequestEntity[]): {
        [key: string]: ScheduleDataWithRender;
    };
    setColorRequestType(requestTime: DayPart): ColorTypes;
    convertDateToString(date: Date): string;
    private setTableEgdeLine;
    updated(changedProp: Map<string, unknown>): void;
    getDateBetween(startDate: Date, endDate: Date): DateBetweenData[];
    createRenderRoot(): this;
}
declare global {
    namespace CXShiftSchedule {
        type Ref = ShiftSchedule;
    }
}
