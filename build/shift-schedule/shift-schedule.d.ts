import { LitElement, PropertyValueMap } from 'lit';
import '@cortex-ui/core/cx/c-box';
import '@cortex-ui/core/cx/modal';
import '@cortex-ui/core/cx/theme';
import '@cortex-ui/core/cx/icon';
import '@cortex-ui/core/cx/button';
import '@cortex-ui/core/cx/datepicker';
import '@cortex-ui/core/cx/popover';
import './components/request-button';
import { DateBetweenData, DayPart, RequestType, ScheduleDataWithRender, SchedulePractitionerRequestEntity, SchedulingData, ShiftPlan } from './schedule.types';
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
        [key: string]: ShiftPlan;
    };
    shiftSemRequestSaved: {
        date: DateRangeSelected;
        remark: string;
    };
    datepickerData?: DateRangeSelected;
    tableWrapperRef: import("lit-html/directives/ref").Ref<HTMLDivElement>;
    connectedCallback(): Promise<void>;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    dateFormat(date: Date | number | string | undefined, options?: Intl.DateTimeFormatOptions): string | undefined;
    renderRequestButton(): import("lit-html").TemplateResult<1>;
    selectRequest(type: RequestType): void;
    private calcHeightOfUserTable;
    render(): import("lit-html").TemplateResult<1>;
    renderSrShiftPlanSaved(plans: ShiftPlan): import("lit-html").TemplateResult<1>;
    renderSemShiftPlanSaved(): import("lit-html").TemplateResult<1>;
    renderShiftRequest(request: ScheduleDataWithRender): import("lit-html").TemplateResult<1> | undefined;
    saveDatepicker(e: CXDatePicker.SelectDate): void;
    saveWithDateData: () => void;
    renderDatepickerBox(): import("lit-html").TemplateResult<1>;
    renderEmptyDateWithPopover(date: Date): import("lit-html").TemplateResult<1> | undefined;
    renderRequestSr(mockdata: any, dayPart: DayPart): import("lit-html").TemplateResult<1>;
    addSrShiftRequest(requestPlan: {
        plan: number;
        time: string;
    }, dayPart: DayPart): void;
    renderSrPopover(date: Date): import("lit-html").TemplateResult<1>;
    clearShiftRequestCache(): void;
    cancelSrRequestPlan(): void;
    saveSrRequestPlan(date: Date): void;
    closePopover(): void;
    selectDateRequest(date: Date): void;
    renderEmptyBox(date: Date, type?: string): import("lit-html").TemplateResult<1>;
    firstUpdated(): void;
    convertRequestDatesToObject(requests: SchedulePractitionerRequestEntity[]): {
        [key: string]: ScheduleDataWithRender;
    };
    setColorRequestType(requestTime: DayPart): ColorTypes;
    convertDateToString(date: Date): string;
    private setTableEgdeLine;
    updated(): void;
    getDateBetween(startDate: Date, endDate: Date): DateBetweenData[];
    createRenderRoot(): this;
}
declare global {
    namespace CXShiftSchedule {
        type Ref = typeof ShiftSchedule;
    }
}
