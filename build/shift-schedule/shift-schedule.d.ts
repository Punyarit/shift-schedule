import { LitElement, PropertyValueMap } from 'lit';
import '@cortex-ui/core/cx/c-box';
import '@cortex-ui/core/cx/modal';
import '@cortex-ui/core/cx/theme';
import '@cortex-ui/core/cx/icon';
import '@cortex-ui/core/cx/button';
import '@cortex-ui/core/cx/datepicker';
import '@cortex-ui/core/cx/popover';
import './components/request-button';
import { DateBetweenData, DayPart, RequestType, ScheduleDataWithRender, SchedulePractitionerRequestEntity, SchedulingData } from './schedule.types';
import { ColorTypesV2 } from '@cortex-ui/core/cx/types/colors.v2.type';
import { ScheduleRequestDetailResponse, ScheduleRequestType } from './schedule-client.typess';
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
    tableWrapperRef: import("lit-html/directives/ref").Ref<HTMLDivElement>;
    connectedCallback(): Promise<void>;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    dateFormat(date: Date | number | string | undefined, options?: Intl.DateTimeFormatOptions): string | undefined;
    renderRequestButton(): import("lit-html").TemplateResult<1>;
    userImgDefault?: string;
    selectRequest(type: RequestType): void;
    render(): import("lit-html").TemplateResult<1>;
    onSave(): void;
    renderEmptyDate(date: Date): import("lit-html").TemplateResult<1> | undefined;
    renderRequestSr(mockdata: any, dayPart: DayPart): import("lit-html").TemplateResult<1>;
    addSrState(res: any): void;
    renderSrPopover(): import("lit-html").TemplateResult<1>;
    saveSrState(): void;
    selectDateRequest(date: Date): void;
    renderEmptyBox(date: Date, type?: string): import("lit-html").TemplateResult<1>;
    firstUpdated(): void;
    convertRequestDatesToObject(arr: SchedulePractitionerRequestEntity[]): {
        [key: string]: ScheduleDataWithRender;
    };
    renderFactoryRequestType(requestDate: SchedulePractitionerRequestEntity): import("lit-html").TemplateResult<1>;
    setColorRequestType(requestTime: 'a' | 'm' | 'n'): ColorTypesV2;
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
