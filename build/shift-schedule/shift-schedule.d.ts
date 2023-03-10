import { LitElement, PropertyValueMap } from 'lit';
import '@cortex-ui/core/cx/c-box';
import '@cortex-ui/core/cx/modal';
import '@cortex-ui/core/cx/theme';
import '@cortex-ui/core/cx/icon';
import '@cortex-ui/core/cx/button';
import '@cortex-ui/core/cx/datepicker';
import '@cortex-ui/core/cx/popover';
import './components/request-button';
import { DateBetweenData, DayPart, RequestType, ScheduleDataWithRender, SchedulePractitionerRequestEntity, SchedulingData, DatePickerShiftPlan, SrShiftPlan, SchedulePractitionerEntity } from './schedule.types';
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
    practitionerId?: string;
    currentUserIndex: number;
    scheduleData?: SchedulingData | ScheduleRequestDetailResponse | null;
    requestTypes?: RequestType[] | ScheduleRequestType[];
    dateBetween?: DateBetweenData[];
    requestSelected?: RequestType;
    selectedDate?: Date;
    srState: never[];
    maxHeightOfUserTable?: number;
    private shiftSrRequestCache;
    userImgDefault?: string;
    shiftSrRequestSaved: {
        [key: string]: SrShiftPlan;
    };
    shiftSemRequestSaved: {
        [key: string]: DatePickerShiftPlan;
    };
    shiftOffRequestSaved: {
        [key: string]: DatePickerShiftPlan;
    };
    shiftVacRequestSaved: {
        [key: string]: DatePickerShiftPlan;
    };
    shiftWoffRequestSaved: {
        [key: string]: {
            date: Date;
            practitioner: SchedulePractitionerEntity;
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
    private clearRequest;
    isRemoveMode: boolean;
    render(): import("lit-html").TemplateResult<1>;
    ManagerHoverUser(indexUser: number): void;
    sentRemoveEvent(): void;
    removeWoffSaved(dateString?: string): void;
    renderWoffSaved(dateString?: string): import("lit-html").TemplateResult<1>;
    removeSrPlan(dayPart: DayPart, dateString: string): void;
    renderSrShiftPlanSaved(planRequest: SrShiftPlan, dateString: string): import("lit-html").TemplateResult<1>;
    removeShiftPlanDatePicker(data: {
        date?: Date;
        remark?: string;
    }, type: RequestType['abbr']): void;
    findRequestType(abbr: string): RequestType;
    renderShiftPlanSaved(data: {
        date?: Date;
        remark?: string;
    }, type: RequestType['abbr']): import("lit-html").TemplateResult<1>;
    renderInitialRequest(request: ScheduleDataWithRender): import("lit-html").TemplateResult<1> | undefined;
    saveDatepicker(e: CXDatePicker.SelectDate): void;
    saveWithDateData: (practitioner: SchedulePractitionerEntity) => void;
    renderDatepickerBox(data: {
        title: string;
        practitioner: SchedulePractitionerEntity;
    }): import("lit-html").TemplateResult<1>;
    renderEmptyDateForSelect(date: Date, practitioner: SchedulePractitionerEntity): import("lit-html").TemplateResult<1> | undefined;
    renderRequestSr(mockdata: any, dayPart: DayPart): import("lit-html").TemplateResult<1>;
    addSrShiftRequest(requestPlan: {
        plan: number;
        time: string;
    }, dayPart: DayPart): void;
    renderSrPopover(date: Date, practitioner: SchedulePractitionerEntity): import("lit-html").TemplateResult<1>;
    clearShiftRequestCache(): void;
    cancelSrRequestPlan(): void;
    saveSrRequestPlan(date: Date, practitioner: SchedulePractitionerEntity): void;
    closePopover(): void;
    selectDateRequest(date: Date, type?: RequestType['abbr'], practitioner?: SchedulePractitionerEntity): void;
    saveWoffRequest(date: Date, practitioner: SchedulePractitionerEntity): void;
    renderEmptyBox(date: Date, type?: RequestType['abbr'], practitioner?: SchedulePractitionerEntity): import("lit-html").TemplateResult<1>;
    firstUpdated(): void;
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
        type Ref = typeof ShiftSchedule;
    }
}
