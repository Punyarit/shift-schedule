import { LitElement, PropertyValueMap, TemplateResult } from 'lit';
import '@cortex-ui/core/cx/c-box';
import '@cortex-ui/core/cx/modal';
import '@cortex-ui/core/cx/theme';
import '@cortex-ui/core/cx/icon';
import '@cortex-ui/core/cx/button';
import '@cortex-ui/core/cx/datepicker';
import '@cortex-ui/core/cx/popover';
import './components/request-button';
import { DateBetweenData, DayPart, RequestType, ScheduleDataWithRender, SchedulePractitionerRequestEntity, SchedulingData, SrShiftPlan, SchedulePractitionerEntity, ScheduleShiftsEntity, DatePickerRequest, DisabledDate, DateObject as HolidayObject } from './schedule.types';
import { ScheduleRequestDetailResponse, ScheduleRequestType } from './schedule-client.typess';
import '@lit-labs/virtualizer';
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
    private tableWrapperUI;
    private iconTitleWrapper;
    private iconTitle;
    private weekendBg;
    currentTime: Date;
    viewerRole: 'manager' | 'staff';
    mode: 'view' | 'edit';
    disableDates: DisabledDate[];
    practitionerId?: string;
    userHoverIndex: number;
    userSelectedIndex: number;
    scheduleData?: SchedulingData | ScheduleRequestDetailResponse | null;
    private removeOriginCache;
    requestTypes?: RequestType[] | ScheduleRequestType[];
    dateBetween?: DateBetweenData[];
    holidays: HolidayObject[];
    requestSelected?: RequestType;
    selectedDate?: Date;
    srState: never[];
    maxHeightOfUserTable?: number;
    private shiftSrRequestCache;
    private shiftSrShipCache;
    private shiftDatepickerCache;
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
    shiftSemRequestSaved: DatePickerRequest;
    shiftOffRequestSaved: DatePickerRequest;
    shiftVacRequestSaved: DatePickerRequest;
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
    maxHeight?: string;
    datepickerData?: CXDatePicker.SelectDate.Range['detail'];
    private removeRequestSelected?;
    private currentMonthTitleIndex;
    tableWrapperRef: import("lit-html/directives/ref").Ref<HTMLDivElement>;
    dividerRef: import("lit-html/directives/ref").Ref<HTMLDivElement>;
    remarkRef: import("lit-html/directives/ref").Ref<HTMLInputElement>;
    private currentPopoverRef?;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    dateFormat(date: Date | number | string | undefined, options?: Intl.DateTimeFormatOptions): string | undefined;
    renderRequestButton(): TemplateResult<1>;
    selectRequest(type: RequestType): void;
    private calcHeightOfUserTable;
    private disableDateArranged;
    connectedCallback(): Promise<void>;
    private setRemoveMode;
    private holidayWithKeyMap;
    isRemoveMode: boolean;
    dividerTop: number;
    private currentMonthTitle;
    private monthTitleNav?;
    currentMonthTitleDisplay?: string;
    render(): TemplateResult<1>;
    managerHoverUser(indexUser: number, e: MouseEvent): void;
    sentRemoveEvent(): void;
    removeWoffSaved(dateString?: string, practitioner?: SchedulePractitionerEntity, data?: {
        initial: boolean;
    }): void;
    renderWoffSaved(dateString?: string, practitioner?: SchedulePractitionerEntity, data?: {
        initial: boolean;
    }, type?: RequestType['abbr'], date?: Date, indexUser?: number): TemplateResult<1>;
    renderWoffSavedHost(dateString?: string, practitioner?: SchedulePractitionerEntity, data?: {
        initial: boolean;
    }, type?: RequestType['abbr'], date?: Date, indexUser?: number): TemplateResult;
    removeSrPlan(dateString: string, practitioner: SchedulePractitionerEntity, removeMode?: boolean): void;
    renderSrSavedHost(dateString: string, practitioner: SchedulePractitionerEntity, planEntries: [string, Record<number, ScheduleShiftsEntity>][]): TemplateResult<1>;
    renderSrShiftSaved(planRequest: {
        practitioner: SchedulePractitionerEntity;
        request: {
            [date: string]: {
                shiftPlan: SrShiftPlan;
            };
        };
    }, dateString: string, practitioner: SchedulePractitionerEntity, indexUser: number): TemplateResult<1>;
    removeShiftDatePicker(data: {
        dateString?: string;
        remark?: string;
        initial?: boolean;
    }, type: RequestType['abbr'], practitioner: SchedulePractitionerEntity): void;
    findRequestType(abbr: string): RequestType;
    renderShiftPlanHost(data: {
        dateString?: string;
        remark?: string;
        initial?: boolean;
    }, type: RequestType['abbr']): TemplateResult<1>;
    renderShiftPlanSaved(data: {
        dateString?: string;
        remark?: string;
        initial?: boolean;
    }, type: RequestType['abbr'], practitioner: SchedulePractitionerEntity, date: Date, indexUser: number): TemplateResult<1>;
    removeInitialSr(practitioner: SchedulePractitionerEntity, dateString: string): void;
    goToMonth(type: 'next' | 'previous'): void;
    renderSrInitialHost(request: ScheduleDataWithRender, practitioner: SchedulePractitionerEntity, dateString: string): TemplateResult<1>;
    renderInitialRequest(request: ScheduleDataWithRender, practitioner: SchedulePractitionerEntity, date: Date, indexUser: number): TemplateResult<1> | undefined;
    saveDatepicker(e: CXDatePicker.SelectDate.Range, practitioner: SchedulePractitionerEntity): void;
    removeInitialSameData(practitionerId: string, dateString?: string): void;
    deleteInitialDatePicker(practitionerId: string, dateBetween: Date[], dateString?: string): void;
    getPopoverByRequest(data: {
        date: Date;
        practitioner: SchedulePractitionerEntity;
        request?: SrShiftPlan;
        cellId?: string;
        dateString?: string;
        type?: RequestType['abbr'];
        title?: string;
        remark?: string;
        indexUser?: number;
        event?: PointerEvent;
    }): TemplateResult<1> | undefined;
    saveShiftPlanDatePicker: (practitioner: SchedulePractitionerEntity, dateString: string, ceillId: string, remark: string, type: RequestType['abbr']) => void;
    renderDatepickerBox(data: {
        title: string;
        practitioner: SchedulePractitionerEntity;
        date: Date;
        cellId: string;
        dateString: string;
        remark: string;
        type: RequestType['abbr'];
        indexUser: number;
        request?: SrShiftPlan;
    }): TemplateResult<1>;
    appendPopover(type: RequestType['abbr'], cellId: string, data: {
        date: Date;
        practitioner: SchedulePractitionerEntity;
        dateString: string;
        indexUser: number;
    }, popoverContent: TemplateResult, popoverHost: TemplateResult): void;
    renderEmptyDateForSelect(date: Date, practitioner: SchedulePractitionerEntity, dateString: string, indexUser: number, request?: SrShiftPlan): TemplateResult<1> | undefined;
    renderShipSrRequest(shifts: ScheduleShiftsEntity[], dayPart: DayPart, dateString: string, initialSr?: Record<number, ScheduleShiftsEntity>): TemplateResult<1>;
    addSrShiftRequest(requestPlan: ScheduleShiftsEntity, dateString: string): void;
    groupShiftsByLetter(arr: any): any;
    renderContentBack(type: RequestType['abbr'], date: Date, dateString: string, practitioner: SchedulePractitionerEntity, boxTarget: HTMLElement, indexUser?: number, renderType?: 'init' | 'saved', request?: SrShiftPlan): void;
    renderSrPopover(date: Date, practitioner: SchedulePractitionerEntity, request?: SrShiftPlan, cellId?: string, indexUser?: number, event?: PointerEvent): TemplateResult<1>;
    saveSrRequestPlan(date: Date, practitioner: SchedulePractitionerEntity, cellId?: string, indexUser?: number): void;
    closePopover(): void;
    selectDateRequest(date: Date, type?: RequestType['abbr'], practitioner?: SchedulePractitionerEntity, dateString?: string): void;
    saveWoffRequest(date: Date, practitioner: SchedulePractitionerEntity, dateString: string): void;
    renderEmptyBox(date: Date, state?: 'display' | 'select', type?: RequestType['abbr'], practitioner?: SchedulePractitionerEntity, dateString?: string): TemplateResult<1>;
    firstUpdated(): void;
    resetRequestSelect(): void;
    findDuplicationDate: (arrayDate1: (string | Date)[], arrayDate2: (string | Date)[]) => string[];
    convertRequestDatesToObject(requests: SchedulePractitionerRequestEntity[]): {
        [key: string]: ScheduleDataWithRender;
    };
    setColorRequestType(requestTime: DayPart): string;
    convertDateToString(date: Date): string;
    private setTableEgdeLine;
    updated(changedProp: Map<string, unknown>): void;
    private mayDayOffLength;
    private currentScrollX;
    getDateDisabled(holidays: any, startDate: any, endDate: any): {};
    formatDate(date: Date): string;
    generateDayOff(startDate: Date, endDate: Date, dayOffAlreadySpent: string[], availableDayOff: number): string[];
    getHolidayObject(inputArray: HolidayObject[]): {
        [key: string]: HolidayObject;
    };
    increaseDate(days: number, date: Date): Date;
    getDateBetween(startDate: Date, endDate: Date): DateBetweenData[];
    reduceDate: (date: Date, n: number) => Date;
    daysBetween: (startDate: Date, endDate: Date) => number;
    createRenderRoot(): this;
}
declare global {
    namespace CXShiftSchedule {
        type Ref = ShiftSchedule;
    }
}
