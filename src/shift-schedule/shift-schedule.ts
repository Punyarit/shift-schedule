import { LitElement, html, PropertyValueMap, render, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getDateBetweenArrayDate } from '@cortex-ui/core/cx/helpers/functions/date/date-methods';
import '@cortex-ui/core/cx/c-box';
import '@cortex-ui/core/cx/modal';
import '@cortex-ui/core/cx/theme';
import '@cortex-ui/core/cx/icon';
import '@cortex-ui/core/cx/button';
import '@cortex-ui/core/cx/datepicker';
import '@cortex-ui/core/cx/popover';
import './components/request-button';
import { CBoxUiAttribute } from '@cortex-ui/core/cx/components/c-box/types/attribute-changed.types';
import { debounce } from '@cortex-ui/core/cx/helpers/debounceTimer';
import {
  ArrangedRequest,
  DateBetweenData,
  DayPart,
  RequestType,
  requestTypeStyles,
  ScheduleDataWithRender,
  SchedulePractitionerRequestEntity,
  SchedulingData,
  DatePickerShiftPlan,
  SrShiftPlan,
  SchedulePractitionerEntity,
  ScheduleShiftsEntity,
  QueryRemoveOrigin,
  ScheduleRequestIndex,
  DatePickerRequest,
  DisabledDate,
  dayPortValueEarly,
  genderType,
  shiftPlanIcon,
  DateObject as HolidayObject,
  Practitioner,
  ScheduleErrorDayRequest,
  dayPortValueLate,
} from './schedule.types';
import { createRef, ref } from 'lit/directives/ref.js';
import { ScheduleRequestDetailResponse, ScheduleRequestType } from './schedule-client.typess';
import { ModalCaller } from '@cortex-ui/core/cx/helpers/ModalCaller';
import { ModalSingleton } from '@cortex-ui/core/cx/components/modal/singleton/modal.singleton';
import '@lit-labs/virtualizer';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
dayjs.locale('th');
dayjs.extend(buddhistEra);
@customElement('cx-shift-schedule')
export class ShiftSchedule extends LitElement {
  private iconTitle = (color: string) =>
    `iconTitle: round-full w-32 h-32 bg-${color} flex justify-center items-center`;

  @property({ type: Object }) public currentTime = new Date();

  @property({ type: String })
  viewerRole: 'manager' | 'staff' = 'staff';

  @property({ type: String })
  timePeriod: 'early' | 'late' = 'late';

  @property({ type: Object })
  public shiftSlot: { id: string; name: string }[] = [];

  private shiftSlotSort = {} as Record<string, string>;

  @property({ type: String })
  mode: 'view' | 'edit' = 'view';

  @property({ type: Object })
  disableDates: DisabledDate[] = [];

  @property({ type: String })
  practitionerId?: string;
  // practitionerId?: string = 'C1CD433E-F36B-1410-870D-0060E4CDB88B';

  @state()
  userHoverIndex = 0;

  @state()
  userSelectedIndex = 0;

  @property({ type: Object })
  public scheduleData?: SchedulingData | ScheduleRequestDetailResponse | null;

  private removeOriginCache = [] as Array<QueryRemoveOrigin>;

  @property({ type: Array })
  public requestTypes?: RequestType[] | ScheduleRequestType[];

  @state()
  dateBetween?: DateBetweenData[];

  @property({ type: Object })
  holidays: HolidayObject[] = [];

  @property({ type: Object })
  errorDayRequest: ScheduleErrorDayRequest[] = [];

  @property()
  requestSelected?: RequestType;

  @state()
  selectedDate?: Date;

  @state()
  srState = [];

  @property()
  maxWeekOFf: number = 3;

  @state()
  maxHeightOfUserTable?: number;

  private shiftSrRequestCache = {} as {
    [date: string]: SrShiftPlan;
  };

  private shiftSrShipCache = {} as {
    [date: string]: SrShiftPlan;
  };

  private shiftDatepickerCache = {} as {
    [type: string]: {
      dateString: string;
      remark: string | undefined;
      initial: boolean;
      requestType: 'sem' | 'off' | 'vac';
      practitioner: SchedulePractitionerEntity;
      date: Date;
      indexUser: number;
    };
  };

  // FIXME: hard code maxVacation 15* may add this prop in the future.
  // @property({ type: Number }) public maxVacation = 15;

  @property({ type: String })
  userImgDefault?: string;

  @state()
  shiftSrRequestSaved = {} as {
    [id: string]: {
      practitioner: SchedulePractitionerEntity;
      request: {
        // 📌key such as 2023-01-25
        [date: string]: {
          shiftPlan: SrShiftPlan;
        };
      };
    };
  };

  @state()
  shiftSemRequestSaved = {} as DatePickerRequest;

  @state()
  shiftOffRequestSaved = {} as DatePickerRequest;

  @state()
  shiftVacRequestSaved = {} as DatePickerRequest;

  @state()
  shiftWoffRequestSaved = {} as {
    [id: string]: {
      practitioner: SchedulePractitionerEntity;
      request: {
        // 📌key such as 2023-01-25
        [date: string]: {
          date: Date;
        };
      };
    };
  };

  @property({ type: String })
  maxHeight?: string;

  @state()
  datepickerData?: CXDatePicker.SelectDate.Range['detail'] = {
    endDate: undefined,
    startDate: undefined,
  };

  private removeRequestSelected?: RequestType;

  public tableWrapperRef = createRef<HTMLDivElement>();
  public dividerRef = createRef<HTMLDivElement>();
  public remarkRef = createRef<HTMLInputElement>();
  private currentPopoverRef?: CXPopover.Ref;
  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (this.shiftSlot.length && !Object.keys(this.shiftSlotSort).length) {
      for (const slot of this.shiftSlot) {
        this.shiftSlotSort[slot.id] = slot.name.toLowerCase();
      }
    }

    if (_changedProperties.has('scheduleData')) {
      this.moveUserToFirstArray();

      this.dateBetween = this.getDateBetween(
        new Date((this.scheduleData as SchedulingData)?.startDate!),
        new Date((this.scheduleData as SchedulingData)?.endDate!)
      );
    }
    if (_changedProperties.has('shouldArrowLeftDisable')) return;
    if (_changedProperties.has('currentMonthTitleDisplay')) return;
    if (_changedProperties.has('userHoverIndex')) return;
    if (_changedProperties.has('userSelectedIndex')) return;

    if (this.tableWrapperRef.value) {
      const tableRect = this.tableWrapperRef.value.getBoundingClientRect();
      const width = tableRect.width;
      this.style.setProperty('--table-width', `${width}px`);
      super.willUpdate(_changedProperties);
    }
  }

  renderRequestButton() {
    return html`
      ${(this.requestTypes as RequestType[])?.map((type) => {
        const { accentColor, iconSrc, iconBgColor } = requestTypeStyles[type.abbr];
        return html` <request-button
          @click="${() => this.selectRequest(type as RequestType)}"
          .currentType="${this.requestSelected}"
          .requestType="${type}"
          text="${type.abbr === 'sem' ? 'อบรม, สัมมนา, ไปราชการ' : type.name}"
          icon="${iconSrc}"
          iconBgColor="${iconBgColor}"
          accentColor="${accentColor}"></request-button>`;
      })}
    `;
  }

  selectRequest(type: RequestType) {
    if (this.currentPopoverRef) {
      this.shakePopover();
      return;
    }

    this.isRemoveMode = false;
    this.requestSelected = type;
    this.dispatchEvent(
      new CustomEvent('select-request', {
        detail: {
          requestSelected: this.requestSelected,
        },
      })
    );
  }

  private disableDateArranged = {} as {
    [date: string]: DisabledDate;
  };

  async connectedCallback() {
    super.connectedCallback();
    const cssVariables = [
      { variable: 'primary-500', css: '#247CFF' },
      { variable: 'primary-100', css: '#DDEBFF' },
      { variable: 'gray-100', css: '#eaedf2' },
      { variable: 'gray-300', css: '#E7EEFF' },
      { variable: 'gray-400', css: '#C9D4F1' },
      { variable: 'gray-600', css: '#556E97' },
      { variable: 'gray-500', css: '#A5B7DA' },
      { variable: 'gray-800', css: '#2A3959' },
      { variable: 'pinky-25', css: '#F8F9FC' },
      { variable: 'neutral-200', css: '#F1F1F1' },
      { variable: 'neutral-500', css: '#7A7A7A' },
      { variable: 'color-1-100', css: '#DDEBFF' },
      { variable: 'color-12-100', css: '#FFF1CE' },
      { variable: 'color-4-100', css: '#E2F6FF' },
      { variable: 'color-4-700', css: '#004461' },
      { variable: 'alarm-orange-100', css: '#FFE9EA' },
      { variable: 'alarm-orange-500', css: '#FA4453' },
      { variable: 'modern-green-500', css: '#05CBA7' },
      { variable: 'modern-green-100', css: '#DEFFF9' },
      { variable: 'warning-500', css: '#F7773E' },
      { variable: 'warning-100', css: '#FDE4D8' },
      { variable: 'color-9-500', css: '#E33396' },
      { variable: 'color-5-200', css: '#A7CBFF' },
      { variable: 'color-7-500', css: '#745FF2' },
      { variable: 'color-7-100', css: '#EDEAFF' },
      { variable: 'color-12-500', css: '#FEBA0C' },
    ] as const;
    for (const { css, variable } of cssVariables) {
      this.style.setProperty(`--${variable}`, css);
    }
    this.scheduleData = await (await fetch('http://localhost:3000/data')).json();
    this.requestTypes = await (await fetch('http://localhost:3000/types')).json();
  }

  private setRemoveMode() {
    if (this.currentPopoverRef) {
      this.shakePopover();
      return;
    }
    this.requestSelected = undefined;
    this.isRemoveMode = true;

    this.dispatchEvent(new CustomEvent('remove-action'));
  }

  private holidayWithKeyMap: {
    [date: string]: HolidayObject;
  } = {};

  @state()
  isRemoveMode = false;

  @state()
  dividerTop = 0;

  private monthTitleNav?: HTMLElement | null;

  @state()
  shouldArrowLeftDisable?: boolean;

  @state()
  shouldArrowRightDisable?: boolean;

  @state()
  currentMonthTitleDisplay?: string;

  @state()
  startFocusWithViewMode = false;

  render() {
    return html`
      <style>
        cx-shift-schedule {
          width: 100%;
          display: block;
        }

        .cx-shift-schedule__iconTitle {
          border-radius: 50%;
          width: 32px;
          height: 32px;
          background: var(--primary-100);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .cx-shift-schedule__titleSrWrapper {
          margin-top: 12px;
          display: flex;
          align-items: center;
          display: flex;
          justify-content: space-between;
          column-gap: 12px;
        }

        .cx-shift-schedule__iconTitleWrapper {
          display: inline-flex;
          border-radius: 24px;
          border: 1px solid var(--primary-200);
          align-items: center;
          column-gap: 6px;
          padding-right: 12px;
        }
        cx-shift-schedule .tableWrapperUI {
          display: inline-flex;
          flex-flow: column;
        }

        cx-shift-schedule .titleSticky {
          position: sticky;
          top: 0;
          left: 0;
          background: white;
        }
        cx-shift-schedule .titleLeftTopUI {
          padding-left: 12px;
          display: flex;
          flex-flow: column;
          padding-top: 42px;
          box-sizing: border-box;
        }

        cx-shift-schedule .remove-btn-wrapper {
          display: inline-flex;
          align-items: center;
          column-gap: 8px;
          border-radius: 44px;
          width: 96px;
          border: 2px solid var(--neutral-200);
          cursor: pointer;
          background: ${this.isRemoveMode ? 'var(--neutral-500)' : 'white'};
        }

        cx-shift-schedule .requestBox {
          min-width: 90px;
          display: inline-flex;
          flex-flow: column;
        }
        cx-shift-schedule .monthEachUI {
          font-size: 12px;
          padding-left: 12px;
          padding-top: 6px;
          padding-bottom: 6px;
          border-right-style: solid;
        }

        cx-shift-schedule .sundayBorderRightUI {
          border-right-width: 2px !important;
          border-right-color: var(--primary-500) !important;
        }

        cx-shift-schedule .tableLineUI {
          border: 1px solid var(--gray-300);
          box-sizing: border-box;
        }

        cx-shift-schedule .weekDayUI {
          padding-top: 6px;
          padding-bottom: 6px;
          min-width: 90px;
          padding-left: 12px;
          box-sizing: border-box;
        }

        cx-shift-schedule .weekendBg {
          background: var(--pinky-25) !important;
          width: 100%;
          height: 100%;
        }

        cx-shift-schedule .error-day-request {
          border: 2px solid #f3655c !important;
        }
        cx-shift-schedule .remove-btn:hover {
          background-color: var(--${this.isRemoveMode ? 'neutral-500' : 'neutral-200'}) !important;
        }

        cx-shift-schedule .user-title {
          display: flex;
          column-gap: 6px;
          padding: 12px;
          box-sizing: border-box;
        }

        cx-shift-schedule .table-line {
          border: 1px solid var(--gray-300);
          box-sizing: border-box;
        }

        cx-shift-schedule .title-sticky {
          position: sticky;
          top: 0;
          left: 0;
          background: white;
          z-index: 1;
        }

        cx-shift-schedule .title-default {
          position: relative;
          z-index: 0;
        }

        .shake-efx-popover {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both !important;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        @keyframes shake {
          10%,
          90% {
            transform: translate3d(-1px, 0, 0);
          }
          20%,
          80% {
            transform: translate3d(2px, 0, 0);
          }
          30%,
          50%,
          70% {
            transform: translate3d(-4px, 0, 0);
          }
          40%,
          60% {
            transform: translate3d(4px, 0, 0);
          }
        }

        c-box {
          transition: all 0.2 ease !important;
        }

        cx-shift-schedule #table-header-wrapper::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }

        cx-shift-schedule .lit-virtualizer {
          overflow-x: scroll;
          overflow-y: overlay;
        }

        /*  */
        cx-shift-schedule .lit-virtualizer::-webkit-scrollbar {
          width: 6px;
        }

        /* Track */
        cx-shift-schedule .lit-virtualizer::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        /* Handle */
        cx-shift-schedule .lit-virtualizer::-webkit-scrollbar-thumb {
          background: #a1a1a1;
        }

        /* Handle on hover */
        cx-shift-schedule .lit-virtualizer::-webkit-scrollbar-thumb:hover {
          background: #696969;
        }
        /*  */

        :host {
          --hover-divider-width: 100%;
          --hover-divider-top: 0;
        }

        cx-shift-schedule .element-visible {
          opacity: 1;
        }

        cx-shift-schedule .element-hidden {
          opacity: 0.4;
        }

        c-box {
          color: var(--gray-800);
        }

        cx-shift-schedule .focus-divider {
          position: relative;
          z-index: 2;
          border-bottom: 2px solid var(--primary-500) !important;
          transition: border-bottom 0.15s ease;
        }

        cx-shift-schedule .user-border-focus {
          transition: outline 0.15s ease;
          outline: 4px solid var(--color-5-200);
        }

        cx-shift-schedule input::placeholder {
          font-family: Sarabun-Regular;
          font-size: 16px;
        }
        c-box[icon-prefix].icon-daypart-sr::before {
          height: 18px;
        }

        cx-shift-schedule .bg-pinky {
          background: var(--pinky-25);
        }

        cx-shift-schedule .hover-request {
          cursor: pointer;
        }

        cx-shift-schedule .srDayPart {
          cursor: pointer;
        }

        cx-shift-schedule .diagonal-pattern {
          width: 100%;
          height: 100%;
          cursor: not-allowed;
          background: repeating-linear-gradient(
            135deg,
            var(--pinky-25),
            var(--pinky-25) 4px,
            #ffffff 4px,
            #ffffff 8px
          );
        }

        cx-shift-schedule .hover-divider {
          transition: all 0.2s ease;
          width: var(--hover-divider-width);
          translate: 0 var(--hover-divider-top);
          height: 2px;
          margin-top: 2px;
          background-color: #d6e8fd;
          position: absolute;
          z-index: 1;
        }

        .cx-shift-schedule__srPlanWrapper {
          display: flex;
          column-gap: 6px;
          align-items: center;
          height: fit-content;
          margin-top: 2px;
          min-width: 80px;
        }

        c-box[input-box].remark-input {
          width: 312px !important;
          border: 2px solid var(--gray-400) !important;
        }

        cx-shift-schedule .buttonGroupUI {
          display: flex;
          align-items: center;
          column-gap: 24px;
          padding-left: 24px;
          padding-right: 24px;
          row-gap: 12px;
          flex-wrap: wrap;
        }
        cx-shift-schedule .remove-btn-active:active {
          background: var(--${this.isRemoveMode ? 'neutral-500' : 'neutral-200'}) !important;
        }

        cx-shift-schedule .gender-box {
          position: absolute;
          right: 0;
          top: 26px;
          font-size: 10px;
          width: 16px;
          height: 16px;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          z-index: 1;
        }
      </style>
      <div style="position:relative; overflow:hidden;">
        <div class="hover-divider" ${ref(this.dividerRef)}></div>
        <div style="background:white; display:flex; flex-flow:column; row-gap:24px;">
          ${this.mode === 'edit'
            ? html` <div class="buttonGroupUI">
                <c-box whitespace-pre> เลือกรูปแบบคำขอเวร </c-box>
                ${this.renderRequestButton()}
                <c-box inline h-40 w-1 bg-gray-400></c-box>
                <div
                  @click="${this.setRemoveMode}"
                  class="remove-btn remove-btn-active remove-btn-wrapper">
                  <c-box
                    flex-center
                    icon-prefix="16 delete-tag-custom ${this.isRemoveMode
                      ? 'white!'
                      : 'neutral-500'}"
                    w-44
                    h-44
                    round-full
                    style="background: var(--${this.isRemoveMode ? 'neutral-500' : 'neutral-200'})">
                  </c-box>
                  <div
                    style="color:${this.isRemoveMode
                      ? 'white'
                      : 'neutral-500'};transition: 0.2s ease">
                    ลบ
                  </div>
                </div>
              </div>`
            : undefined}

          <div class="tableLineUI" ${ref(this.tableWrapperRef)} style="border-radius:8px">
            <div class="tableWrapperUI" style="width: var(--table-width)">
              <div style="display:inline-flex;overflow-x:auto" id="table-header-wrapper">
                <!-- FIXME: should titleSticky below -->
                <div class="tableLineUI titleLeftTopUI titleSticky" style="min-width:260px;">
                  <c-box semiBold>รายชื่อเจ้าหน้าที่</c-box>
                  <c-box>ทั้งหมด ${this.scheduleData?.schedulePractitioner?.length} คน</c-box>
                </div>

                <c-box flex id="week-month-title">
                  <c-box absolute h-26 pt-4 flex items-center col-gap-6>
                    <c-box
                      ui-active="_1: ${this.shouldArrowLeftDisable ? 'bg-white' : 'bg-primary-100'}"
                      icon-suffix="8 angle-left-u ${this.shouldArrowLeftDisable
                        ? 'gray-400'
                        : 'gray-600'}"
                      transition-200
                      cursor-pointer
                      style="${this.shouldArrowLeftDisable
                        ? 'cursor: not-allowed'
                        : 'cursor: pointer'}; width:24px; height:24px; border-radius:50%; display:flex; justify-content:center; align-items:center;"
                      @click="${() =>
                        this.shouldArrowLeftDisable ? null : this.goToMonth('previous')}"></c-box>

                    <c-box
                      w-90
                      flex
                      justify-center
                      tx-12
                      tx-gray-600
                      class="currentMonthTitleDisplay">
                      ${this.currentMonthTitleDisplay
                        ? html`<span
                            >${dayjs(new Date(this.currentMonthTitleDisplay!)).format(
                              'MMMM BBBB'
                            )}</span
                          > `
                        : undefined}
                    </c-box>

                    <c-box
                      ui-active="_1: ${this.shouldArrowRightDisable
                        ? 'bg-white'
                        : 'bg-primary-100'}"
                      transition-200
                      icon-suffix="8 angle-right-u ${this.shouldArrowRightDisable
                        ? 'gray-400'
                        : 'gray-600'}"
                      cursor-pointer
                      style="${this.shouldArrowRightDisable
                        ? 'cursor: not-allowed'
                        : 'cursor: pointer'}; width:24px; height:24px; border-radius:50%; display:flex; justify-content:center; align-items:center;"
                      @click="${() =>
                        this.shouldArrowRightDisable ? null : this.goToMonth('next')}"></c-box>
                  </c-box>
                  ${this.dateBetween?.map((dateBet) => {
                    return html`
                      <c-box>
                        <c-box
                          border-bottom-gray-300
                          border-bottom-solid
                          border-bottom-1
                          pl-12
                          border-box>
                          <c-box h-30></c-box>
                        </c-box>

                        <div style="display:flex">
                          ${dateBet.dateBetween.map((weekday, weekIndex) => {
                            return html`
                              <c-box flex flex-col>
                                <c-box class="monthEachUI sundayBorderRightUI tableLineUI">
                                  ${dateBet.currentMonth
                                    ? dayjs(new Date(`${dateBet.currentMonth}-01`)).format(
                                        'MMM BBBB'
                                      )
                                    : undefined}
                                </c-box>

                                <c-box flex>
                                  ${weekday.map((date, dateIndex) => {
                                    const isSunday =
                                      date.getDay() === 0 ? 'sundayBorderRightUI' : '';

                                    const isHoliday =
                                      this.holidayWithKeyMap?.[this.convertDateToString(date)];

                                    const isWeekendBg =
                                      isHoliday || date.getDay() === 0 || date.getDay() === 6
                                        ? 'weekendBg'
                                        : '';

                                    const timezoneOffset =
                                      date.getDate() === 1 || dateIndex === 0
                                        ? date.getTimezoneOffset() * 60000
                                        : null;
                                    const localISOTime = timezoneOffset
                                      ? new Date(date.getTime() - timezoneOffset)
                                          .toISOString()
                                          .split('T')[0]
                                      : '';
                                    return html` <c-box
                                      data-first-date="${localISOTime}"
                                      class="${date.getDate() === 1
                                        ? 'first-date-of-month'
                                        : this.dateBetween?.[0].dateBetween[0][0].getDate() !== 1
                                        ? 'start-date-of-month'
                                        : ''} ${isSunday} tableLineUI weekDayUI ${isWeekendBg}">
                                      <c-box tx-12 tx-gray-500>
                                        ${date ? dayjs(new Date(date)).format('dd') : undefined}
                                      </c-box>
                                      <c-box
                                        tx-14
                                        style="color:${isHoliday
                                          ? 'var(--color-9-500)'
                                          : isWeekendBg
                                          ? 'var(--gray-500)'
                                          : 'var(--gray-800)'}; font-weight: ${isHoliday
                                          ? '600'
                                          : '400'}">
                                        ${date ? dayjs(new Date(date)).format('D') : undefined}
                                      </c-box>
                                    </c-box>`;
                                  })}
                                </c-box>
                              </c-box>
                            `;
                          })}
                        </div>
                      </c-box>
                    `;
                  })}
                </c-box>
              </div>

              <div
                id="week-month-user"
                style="height:${this
                  .maxHeight}; width:var(--table-width); display:inline-flex; flex-flow:column;">
                <div class="lit-virtualizer">
                  ${(this.scheduleData as SchedulingData)?.schedulePractitioner?.map(
                    (practitioner, indexUser) => {
                      const {
                        practitioner: {
                          gender,
                          nameFamily,
                          nameGiven,
                          practitionerLevel,
                          practitionerRole,
                        },
                        schedulePractitionerRequest: request,
                      } = practitioner;

                      const requestData = this.convertRequestDatesToObject(
                        request as SchedulePractitionerRequestEntity[]
                      );

                      const targetUser = practitioner?.practitionerId === this.practitionerId!;
                      return html`
                        <div
                          class="${targetUser && this.viewerRole === 'staff'
                            ? 'title-sticky'
                            : 'title-default'}"
                          style="width: fit-content;display:flex;"
                          @click="${() => {
                            if (this.mode === 'view') {
                              if (!this.startFocusWithViewMode) {
                                this.startFocusWithViewMode = true;
                              }
                              this.userSelectedIndex = indexUser;
                              this.dispatchEvent(
                                new CustomEvent('focus-request', {
                                  detail: { practitioner: practitioner },
                                })
                              );
                            }
                          }}">
                          <div
                            @mouseenter="${this.viewerRole === 'manager'
                              ? (e: MouseEvent) => this.managerHoverUser(indexUser, e, practitioner)
                              : null}"
                            style="cursor:${this.requestSelected
                              ? 'pointer'
                              : 'default'};z-index:3;min-width:260px;position:sticky; left:0; background:white"
                            class="${(this.viewerRole === 'staff' && indexUser === 0) ||
                            (this.viewerRole === 'manager' &&
                              indexUser === this.userSelectedIndex &&
                              this.requestSelected) ||
                            (this.mode === 'view' &&
                              indexUser === this.userSelectedIndex &&
                              this.startFocusWithViewMode)
                              ? 'focus-divider'
                              : ''} user-title table-line"
                            @click="${() => {
                              if (this.viewerRole === 'manager' && this.requestSelected) {
                                this.userSelectedIndex = indexUser;
                                this.dispatchEvent(
                                  new CustomEvent('focus-request', {
                                    detail: { practitioner: practitioner },
                                  })
                                );
                              }
                            }}">
                            <div style="position:relative; top:0; left:0">
                              <div
                                style="border-radius:50%; display:flex; justify-content:center; align-items:center;"
                                class="${(this.viewerRole === 'staff' && indexUser === 0) ||
                                (this.viewerRole === 'manager' &&
                                  indexUser === this.userSelectedIndex &&
                                  this.requestSelected) ||
                                (this.mode === 'view' &&
                                  indexUser === this.userSelectedIndex &&
                                  this.startFocusWithViewMode)
                                  ? 'user-border-focus'
                                  : ''}">
                                <div
                                  style="border-radius:50%; display:flex; justify-content:center; align-items:center; border: 2px solid var(--${gender ===
                                  'M'
                                    ? 'color-6-400'
                                    : 'color-9-500'})">
                                  <img
                                    style="border-radius: 50%"
                                    width="32px"
                                    height="32px"
                                    src="${this.userImgDefault || ''}"
                                    alt="" />
                                </div>
                              </div>

                              <div
                                class="gender-box"
                                style="background: var(--${gender === 'M'
                                  ? 'color-6-400'
                                  : 'color-9-500'});">
                                ${genderType[gender as 'M' | 'F']}
                              </div>
                            </div>

                            <div>
                              <div style="font-size:14px;">${nameGiven} ${nameFamily}</div>
                              <div style="font-size:12px;">
                                <span style="text-transform: uppercase">
                                  ${practitionerRole.abbr} </span
                                >, ${practitionerLevel.name}
                              </div>
                            </div>
                          </div>

                          ${this.dateBetween?.map((dateBet) => {
                            return html`
                              ${dateBet.dateBetween.map((week) => {
                                return html`
                                  ${week.map((day) => {
                                    day.setHours(0, 0, 0, 0);
                                    const sundayborderRightUI =
                                      day.getDay() === 0 ? 'sundayBorderRightUI' : '';

                                    const isHoliday =
                                      this.holidayWithKeyMap?.[this.convertDateToString(day)];
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                                    const dateString = this.convertDateToString(day);
                                    const srSaved = this.shiftSrRequestSaved[practitioner.id];

                                    const semSaved = this.shiftSemRequestSaved[practitioner.id];
                                    const offSaved = this.shiftOffRequestSaved[practitioner.id];
                                    const vacSaved = this.shiftVacRequestSaved[practitioner.id];

                                    const requestInitial = requestData[dateString];

                                    const disableDate = this.disableDateArranged?.[dateString];

                                    const woffSaved =
                                      this.shiftWoffRequestSaved?.[practitioner.id]?.request;

                                    const userTargetIndex =
                                      this.viewerRole === 'manager' ? this.userHoverIndex : 0;

                                    const isErrorDayRequest =
                                      this.errorDayRequest[0]?.date === dateString &&
                                      practitioner.practitionerId ===
                                        this.errorDayRequest[0]?.practitionerId;

                                    return html` <div
                                      @mouseenter="${this.viewerRole === 'manager'
                                        ? (e: MouseEvent) =>
                                            this.managerHoverUser(indexUser, e, practitioner)
                                        : null}"
                                      class="${sundayborderRightUI} tableLineUI requestBox ${isErrorDayRequest
                                        ? 'error-day-request'
                                        : ''} ${(this.viewerRole === 'staff' && indexUser === 0) ||
                                      (this.viewerRole === 'manager' &&
                                        indexUser === this.userSelectedIndex &&
                                        this.requestSelected) ||
                                      (this.mode === 'view' &&
                                        indexUser === this.userSelectedIndex &&
                                        this.startFocusWithViewMode)
                                        ? 'focus-divider'
                                        : ''} ${isWeekend || isHoliday ? 'bg-pinky' : ''}">
                                      <div
                                        style="opacity:${(this.viewerRole === 'staff' &&
                                          indexUser === 0) ||
                                        this.viewerRole === 'manager'
                                          ? '1'
                                          : '0.6'}; max-width:88px; word-break:break-all; width:100%; height:100%;
                                          ${(this.requestSelected?.abbr === 'woff' &&
                                          this.shouldNotAllowedWeekOffSelect) ||
                                        (this.requestSelected?.abbr === 'off' &&
                                          practitioner?.practitioner?.leave?.dayOff === 0) ||
                                        (this.requestSelected?.abbr === 'vac' &&
                                          this.vacDayOff?.[practitioner.practitioner.id] === 0)
                                          ? 'cursor:not-allowed'
                                          : ''}">
                                        <!-- if have request date then render request -->

                                        <!-- when saving -->
                                        ${disableDate
                                          ? html` <div class="diagonal-pattern"></div> `
                                          : srSaved && srSaved?.request?.[dateString]
                                          ? this.renderSrShiftSaved(
                                              srSaved,
                                              dateString,
                                              practitioner,
                                              indexUser
                                            )
                                          : semSaved?.request?.[dateString]
                                          ? this.renderDayOffPlanSaved(
                                              semSaved?.request?.[dateString],
                                              'sem',
                                              practitioner,
                                              day,
                                              indexUser
                                            )
                                          : offSaved?.request?.[dateString]
                                          ? this.renderDayOffPlanSaved(
                                              offSaved?.request?.[dateString],
                                              'off',
                                              practitioner,
                                              day,
                                              indexUser
                                            )
                                          : vacSaved?.request?.[dateString]
                                          ? this.renderDayOffPlanSaved(
                                              vacSaved?.request?.[dateString],
                                              'vac',
                                              practitioner,
                                              day,
                                              indexUser
                                            )
                                          : woffSaved?.[dateString]
                                          ? this.renderWoffSaved(
                                              dateString,
                                              practitioner,
                                              undefined,
                                              'woff',
                                              day,
                                              indexUser
                                            )
                                          : requestInitial
                                          ? this.renderInitialRequest(
                                              requestInitial,
                                              practitioner,
                                              day,
                                              indexUser
                                            )
                                          : indexUser === userTargetIndex
                                          ? this.renderEmptyDateForSelect(
                                              day,
                                              practitioner,
                                              dateString,
                                              indexUser
                                            )
                                          : undefined}
                                      </div>
                                    </div>`;
                                  })}
                                `;
                              })}
                            `;
                          })}
                        </div>
                      `;
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  managerHoverUser(indexUser: number, e: MouseEvent, practitioner: SchedulePractitionerEntity) {
    this.userHoverIndex = indexUser;
    const target = e.target as HTMLElement;
    const weekMonthUser = this.querySelector('#week-month-user');
    if (target) {
      const targetRect = target.getBoundingClientRect();
      const hostRect = this.getBoundingClientRect();
      const tableRect = weekMonthUser?.getBoundingClientRect();
      if (this.dividerRef.value) {
        this.dividerRef.value.style.setProperty(
          '--hover-divider-top',
          `${Math.floor(targetRect.bottom - hostRect.top)}px`
        );
        this.dividerRef.value.style.setProperty('--hover-divider-width', `${tableRect?.width}px`);
      }
    }

    this.setVacDayOff(practitioner);
  }

  sentRemoveEvent() {
    this.dispatchEvent(
      new CustomEvent('remove-request', {
        detail: {
          requestType: this.removeRequestSelected,
          requests: {
            sr: this.shiftSrRequestSaved,
            sem: this.shiftSemRequestSaved,
            off: this.shiftOffRequestSaved,
            vac: this.shiftVacRequestSaved,
            woff: this.shiftWoffRequestSaved,
          },
        },
      })
    );
  }

  removeWoffSaved(
    dateString?: string,
    practitioner?: SchedulePractitionerEntity,
    data?: { initial: boolean }
  ) {
    if (this.viewerRole === 'staff' && this.practitionerId !== practitioner?.practitionerId) return;
    if (this.isRemoveMode) {
      if (data?.initial) {
        const practitionerIndex = this.scheduleData?.schedulePractitioner?.findIndex(
          (res) => res.id === practitioner?.id
        );

        if (typeof practitionerIndex === 'number') {
          const requestIndex = this.scheduleData?.schedulePractitioner?.[
            practitionerIndex
          ].schedulePractitionerRequest?.findIndex((res) => {
            return (res as SchedulePractitionerRequestEntity)?.requestDate === dateString;
          });

          if (typeof requestIndex === 'number') {
            const dataSlice = {
              queryIndex: {
                requestIndex,
                practitionerIndex,
              },
              schedulePractitioner: this.scheduleData?.schedulePractitioner?.[practitionerIndex],
              schedulePractitionerRequest:
                this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                  .schedulePractitionerRequest?.[requestIndex],
            } as QueryRemoveOrigin;

            this.removeOriginCache.push(dataSlice);

            this.dispatchEvent(
              new CustomEvent('remove-origin', {
                detail: { ...dataSlice, result: this.removeOriginCache },
              })
            );

            delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
              .schedulePractitionerRequest?.[requestIndex];

            this.requestUpdate();
          }
        }
      } else {
        this.removeRequestSelected = this.findRequestType('woff');
        delete this.shiftWoffRequestSaved?.[practitioner?.id!]?.request?.[dateString!];
        this.sentRemoveEvent();
        this.requestUpdate();
      }
    }
  }

  renderWoffSaved(
    dateString?: string,
    practitioner?: SchedulePractitionerEntity,
    data?: { initial: boolean },
    type?: RequestType['abbr'],
    date?: Date,
    indexUser?: number
  ) {
    const cellId = `woff-saved-shift-cell-${indexUser}`;

    return html`
      <c-box
        w-full
        h-full
        id="${cellId}-${dateString}"
        @click="${this.requestSelected?.abbr !== 'woff'
          ? (e: PointerEvent) => {
              this.appendPopover(
                type!,
                cellId,
                {
                  date: date!,
                  dateString: dateString!,
                  indexUser: indexUser!,
                  practitioner: practitioner!,
                },
                this.getPopoverByRequest({
                  date: date!,
                  practitioner: practitioner!,
                  dateString,
                  cellId,
                  type,
                  event: e,
                })!,
                this.renderWoffSavedHost(
                  dateString,
                  practitioner,
                  { initial: true },
                  'woff',
                  date!,
                  indexUser
                )
              );
            }
          : null}">
        ${this.renderWoffSavedHost(dateString, practitioner, data, type, date, indexUser)}
      </c-box>
    `;
  }

  renderWoffSavedHost(
    dateString?: string,
    practitioner?: SchedulePractitionerEntity,
    data?: { initial: boolean },
    type?: RequestType['abbr'],
    date?: Date,
    indexUser?: number
  ): TemplateResult {
    return html`<c-box h-full w-full p-4 border-box slot="host">
      <c-box
        style="${(this.requestSelected?.abbr === 'woff' && this.shouldNotAllowedWeekOffSelect) ||
        (this.requestSelected?.abbr === 'off' && practitioner?.practitioner?.leave?.dayOff === 0) ||
        (this.requestSelected?.abbr === 'vac' &&
          this.vacDayOff?.[(practitioner?.practitioner as any).id] === 0)
          ? 'pointer-events: none'
          : ''}"
        class="woff-saved ${this.requestSelected?.abbr !== 'woff' || this.isRemoveMode
          ? 'hover-request'
          : ''}"
        bg="gray-300"
        icon-prefix="26 pause-circle-line ${requestTypeStyles[type!].accentColor}"
        w-full
        h-full
        shift-type="woff-saved"
        flex
        justify-center
        round-6
        @click="${this.isRemoveMode
          ? () => this.removeWoffSaved(dateString, practitioner, data)
          : null}"
        items-center></c-box>
    </c-box>`;
  }

  removeSrPlan(dateString: string, practitioner: SchedulePractitionerEntity, removeMode?: boolean) {
    if (this.isRemoveMode || removeMode) {
      if (this.viewerRole === 'staff' && this.practitionerId !== practitioner.practitionerId)
        return;

      delete this.shiftSrRequestSaved[practitioner.id].request[dateString];
      this.removeRequestSelected = this.findRequestType('sr');
      this.sentRemoveEvent();
      this.requestUpdate();
    }
  }

  renderSrSavedHost(
    dateString: string,
    practitioner: SchedulePractitionerEntity,
    planEntries: [string, Record<number, ScheduleShiftsEntity>][]
  ) {
    const checkMaxLength =
      (this.requestSelected?.abbr === 'woff' && this.shouldNotAllowedWeekOffSelect) ||
      (this.requestSelected?.abbr === 'off' && practitioner?.practitioner?.leave?.dayOff === 0) ||
      (this.requestSelected?.abbr === 'vac' &&
        this.vacDayOff?.[(practitioner.practitioner as any).id] === 0);

    return html` <c-box
      @click="${() => this.removeSrPlan(dateString, practitioner)}"
      w-full
      h-full
      style="${checkMaxLength ? 'pointer-events:none' : this.isRemoveMode ? 'cursor:pointer' : ''}"
      shift-type="sr-saved"
      slot="host">
      ${planEntries
        ?.sort((a, b) => {
          const indexMap =
            this.timePeriod === 'early' ? { m: 0, a: 1, n: 2 } : { m: 1, a: 2, n: 0 };
          // @ts-ignore
          return indexMap[a[0]] - indexMap[b[0]];
        })
        ?.map(([dayPart, plans]) => {
          const planValues = Object.values(plans);
          return html`
            <c-box p-4 border-box flex flex-col row-gap-4>
              <c-box
                class="${this.isRemoveMode || this.requestSelected ? 'srDayPart' : ''} "
                p-4
                border-box
                round-6
                style="min-height:44px"
                bg="${this.setColorRequestType(dayPart as DayPart)}">
                <c-box>
                  <c-box class="icon-daypart-sr" flex flex-col>
                    <c-box flex flex-col row-gap-4 tx-12
                      >${planValues.map((plan, index) => {
                        const isLast = index === planValues.length - 1;
                        const shouldComma = planValues.length > 1 && !isLast;
                        return html`<c-box block style="margin-top:${index > 0 ? '3px' : '0'}"
                          >${plan.shiftName}${shouldComma ? ',' : ''}</c-box
                        >`;
                      })}</c-box
                    >
                  </c-box>
                </c-box>
              </c-box>
            </c-box>
          `;
        })}
    </c-box>`;
  }

  renderSrShiftSaved(
    planRequest: {
      practitioner: SchedulePractitionerEntity;
      request: {
        [date: string]: {
          shiftPlan: SrShiftPlan;
        };
      };
    },
    dateString: string,
    practitioner: SchedulePractitionerEntity,
    indexUser: number
  ) {
    const planEntries = Object.entries(planRequest?.request?.[dateString]?.shiftPlan || {});
    const shiftPlan = this.shiftSrRequestSaved?.[practitioner.id]?.request?.[dateString]?.shiftPlan;
    const cellId = `sr-saved-shift-cell-${indexUser}`;
    const date = new Date(dateString);

    return html`
      <c-box
        w-full
        h-full
        id="${cellId}-${dateString}"
        @click="${this.requestSelected?.abbr !== 'woff'
          ? (e: PointerEvent) => {
              planEntries.length
                ? this.appendPopover(
                    'sr',
                    cellId,
                    {
                      date,
                      dateString,
                      indexUser,
                      practitioner,
                    },
                    this.getPopoverByRequest({
                      date,
                      practitioner,
                      cellId,
                      request: shiftPlan,
                      dateString,
                      event: e,
                    })!,

                    this.renderSrSavedHost(dateString, practitioner, planEntries)
                  )
                : null;
            }
          : () => {
              this.saveWoffRequest(date, practitioner, dateString);
              this.requestUpdate();
            }}">
        ${planEntries.length
          ? this.renderSrSavedHost(dateString, practitioner, planEntries)
          : this.renderEmptyDateForSelect(
              new Date(dateString),
              practitioner,
              dateString,
              indexUser
            )}
      </c-box>
    `;
  }

  removeShiftDatePicker(
    data: { dateString?: string; remark?: string; initial?: boolean },
    type: RequestType['abbr'],
    practitioner: SchedulePractitionerEntity
  ) {
    if (this.viewerRole === 'staff' && this.practitionerId !== practitioner.practitionerId) return;
    if (data?.initial && this.isRemoveMode) {
      const practitionerIndex = this.scheduleData?.schedulePractitioner?.findIndex(
        (res) => res.id === practitioner.id
      );

      if (typeof practitionerIndex === 'number') {
        const requestIndex = this.scheduleData?.schedulePractitioner?.[
          practitionerIndex
        ].schedulePractitionerRequest?.findIndex(
          (res) => (res as SchedulePractitionerRequestEntity)?.requestDate === data.dateString
        );

        if (typeof requestIndex === 'number') {
          const dataSlice = {
            queryIndex: {
              practitionerIndex,
              requestIndex,
            },
            schedulePractitioner: this.scheduleData?.schedulePractitioner?.[practitionerIndex],
            schedulePractitionerRequest:
              this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                ?.schedulePractitionerRequest?.[requestIndex!],
          } as QueryRemoveOrigin;
          this.removeOriginCache.push(dataSlice);
          this.dispatchEvent(
            new CustomEvent('remove-origin', {
              detail: { ...dataSlice, result: this.removeOriginCache },
            })
          );

          delete this.scheduleData?.schedulePractitioner?.[practitionerIndex!]
            ?.schedulePractitionerRequest?.[requestIndex!];

          if (type === 'off') {
            practitioner.practitioner.leave.dayOff += 1;
          }

          if (type === 'vac') {
            this.setVacDayOff(practitioner as SchedulePractitionerEntity, true);
            this.vacDayOff[practitioner.practitioner.id] += 1;
          }

          this.requestUpdate();
        }
      }
    } else {
      if (this.isRemoveMode) {
        if (type === 'sem') {
          delete this.shiftSemRequestSaved[practitioner.id].request[data.dateString!];
          this.removeRequestSelected = this.findRequestType('sem');
          this.sentRemoveEvent();

          this.requestUpdate();
        }

        if (type === 'off') {
          delete this.shiftOffRequestSaved[practitioner.id].request[data.dateString!];
          this.removeRequestSelected = this.findRequestType('off');
          practitioner.practitioner.leave.dayOff += 1;

          this.sentRemoveEvent();
          this.requestUpdate();
        }

        if (type === 'vac') {
          delete this.shiftVacRequestSaved[practitioner.id].request[data.dateString!];
          this.removeRequestSelected = this.findRequestType('vac');

          this.vacDayOff[practitioner.practitioner.id] += 1;

          this.sentRemoveEvent();
          this.requestUpdate();
        }
      }
    }
  }

  findRequestType(abbr: string) {
    return this.requestTypes?.find((res) => res.abbr === abbr) as RequestType;
  }

  renderDayOffHost(
    data: { dateString?: string; remark?: string; initial?: boolean },
    type: RequestType['abbr'],
    practitioner: SchedulePractitionerEntity
  ) {
    const dayOffWithID = `${data.dateString}-${practitioner.practitioner.id}`
    const remarkCacheId = `${type}-${dayOffWithID}`;

    this.remarkCache[remarkCacheId] = data.remark || '';
    for (const key of Object.keys(this.remarkCache)) {
      const [dayOffType, ...dayOffID] = key.split('-');
      if (dayOffID.join('-') === `${dayOffWithID}`) {
        if (type !== dayOffType) {
          delete this.remarkCache[key];
        }
      }
    }
    const icon = shiftPlanIcon?.[type];
    const icColor = requestTypeStyles?.[type]?.accentColor;
    return html`${this.remarkCache[remarkCacheId]
      ? html`<c-box
          slot="host"
          shift-type="${type}-saved"
          flex
          flex-col
          tx-12
          icon-prefix="16 ${icon} ${icColor}">
          ${this.remarkCache[remarkCacheId]}
        </c-box>`
      : html`<c-box
          slot="host"
          flex
          shift-type="${type}-saved"
          justify-center
          items-center
          h-full
          icon-prefix="26 ${icon} ${icColor}">
        </c-box>`}`;
  }

  renderDayOffPlanSaved(
    data: { dateString?: string; remark?: string; initial?: boolean },
    type: RequestType['abbr'],
    practitioner: SchedulePractitionerEntity,
    date: Date,
    indexUser: number,
    cancel?: string
  ) {
    const cellId = `sem-saved-shift-cell-${indexUser}`;
    const checkWeekOffDisabled =
      this.shouldNotAllowedWeekOffSelect && this.requestSelected?.abbr === 'woff';
    return html`<c-box
      p="${cancel ? '0' : '4'}"
      border-box
      h-full
      w-full
      slot="host"
      shift-type="${type}-saved">
      <c-box
        id="${cellId}-${data.dateString}"
        style="pointer-events:${checkWeekOffDisabled ||
        (this.requestSelected?.abbr === 'off' && practitioner?.practitioner?.leave?.dayOff === 0) ||
        (this.requestSelected?.abbr === 'vac' &&
          this.vacDayOff?.[(practitioner.practitioner as any).id] === 0)
          ? 'none'
          : ''}"
        class="shift-plan-datepicker ${this.requestSelected || this.isRemoveMode
          ? 'hover-request'
          : ''}"
        bg-modern-green-100
        bg="${requestTypeStyles?.[type]?.iconBgColor}"
        h-full
        w-full
        round-6
        p="${cancel ? '0' : '6'}"
        border-box
        @click="${this.isRemoveMode
          ? () => this.removeShiftDatePicker(data, type, practitioner)
          : this.requestSelected?.abbr !== 'woff'
          ? async (e: PointerEvent) => {
              const elementTarget =
                (e.target as HTMLElement).querySelector('[shift-type]') ||
                (e.target as HTMLElement);

              const [shift] = elementTarget.getAttribute('shift-type')?.split('-')!;
              if (shift === this.requestSelected?.abbr) {
                const remarkCacheId = `${this.requestSelected?.abbr}-${data.dateString}-${practitioner.practitioner.id}`;
                this.remarkCache[remarkCacheId] =
                  (elementTarget as HTMLElement)?.textContent?.trim() || '';
              }

              this.appendPopover(
                type!,
                cellId,
                {
                  date: date!,
                  dateString: data.dateString!,
                  indexUser: indexUser!,
                  practitioner: practitioner!,
                },
                this.getPopoverByRequest({
                  date: date!,
                  practitioner: practitioner!,
                  dateString: data.dateString,
                  cellId,
                  type,
                  event: e,
                  indexUser,
                  remark: data.remark,
                })!,
                this.renderDayOffHost(data, type, practitioner)
              );

              this.shiftDatepickerCache[type as any] = {
                dateString: data.dateString as any,
                remark: data.remark as any,
                initial: false,
                requestType: type as any,
                practitioner,
                date,
                indexUser,
              };
            }
          : () => {
              this.saveWoffRequest(date, practitioner, data.dateString!);
              this.requestUpdate();
            }}">
        ${this.renderDayOffHost(data, type, practitioner)}
      </c-box>
    </c-box>`;
  }

  removeInitialSr(practitioner: SchedulePractitionerEntity, dateString: string) {
    if (this.viewerRole === 'staff' && practitioner.practitionerId !== this.practitionerId) return;
    if (!this.isRemoveMode) return;
    const practitionerIndex = this.scheduleData?.schedulePractitioner?.findIndex(
      (res) => res.id === practitioner.id
    );

    if (typeof practitionerIndex === 'number') {
      const shiftPlans = this.scheduleData?.schedulePractitioner?.[practitionerIndex]
        .schedulePractitionerRequest as SchedulePractitionerRequestEntity[];

      let requestIndex = [];
      let requestResult = {} as any;
      for (let index = 0; index < shiftPlans.length; index++) {
        if (shiftPlans[index]?.requestDate === dateString) {
          requestIndex.push(index);
          requestResult[index] = shiftPlans[index];
        }
      }

      const resultShiftSr = {
        requestIndex,
        requestResult,
      };

      if (resultShiftSr.requestIndex.length) {
        const dataSlice = {
          queryIndex: {
            practitionerIndex,
            requestIndex: resultShiftSr.requestIndex,
          },
          schedulePractitionerRequest: resultShiftSr.requestResult,
          schedulePractitioner: this.scheduleData?.schedulePractitioner?.[practitionerIndex],
        } as QueryRemoveOrigin;

        this.removeOriginCache.push(dataSlice);

        for (const srIndex of resultShiftSr.requestIndex) {
          delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
            .schedulePractitionerRequest?.[srIndex];
        }

        this.dispatchEvent(
          new CustomEvent('remove-origin', {
            detail: { ...dataSlice, result: this.removeOriginCache },
          })
        );

        this.requestUpdate();
      }
    }
  }

  goToMonth(type: 'next' | 'previous') {
    // if (this.shouldArrowLeftDisable === true && type === 'next') return;
    // if (this.shouldArrowRightDisable === true && type === 'previous') return;
    const litVirtualizer = this.querySelector('.lit-virtualizer');
    if (litVirtualizer) {
      const currentMonth = this.scrollValueFirstDateMonth?.find(
        (res) => res.date === this.currentMonthTitleDisplay
      );

      let targetMonth:
        | {
            date: string;
            scrollValue: number;
            index: number;
          }
        | undefined;
      const currentIndex = currentMonth?.index;
      targetMonth = this.scrollValueFirstDateMonth?.[currentIndex! + (type === 'next' ? 1 : -1)];

      const left = litVirtualizer.getBoundingClientRect().left;
      const scrollValue = targetMonth!.scrollValue - (left + 260);
      if (targetMonth && Math.floor(scrollValue) <= 0) {
        targetMonth = this.scrollValueFirstDateMonth?.[currentIndex! + (type === 'next' ? 2 : -1)];
        const scrollValue = targetMonth!.scrollValue - (left + 260);
        litVirtualizer.scrollTo({
          top: litVirtualizer.scrollTop,
          left: scrollValue + 1,
          behavior: 'smooth',
        });
      } else if (targetMonth) {
        litVirtualizer.scrollTo({
          top: litVirtualizer.scrollTop,
          left: scrollValue + 1,
          behavior: 'smooth',
        });
      }
    }
  }

  renderSrInitialHost(
    request: ScheduleDataWithRender,
    practitioner: SchedulePractitionerEntity,
    dateString: string
  ) {
    return html` <c-box
      w-full
      h-full
      shift-type="sr-init"
      slot="host"
      cursor="${this.requestSelected || this.isRemoveMode ? 'pointer' : 'default'}"
      @click="${this.isRemoveMode ? () => this.removeInitialSr(practitioner, dateString) : null}">
      ${Object.entries(request.arrangedRequest!)
        .sort((a, b) => {
          const indexMap =
            this.timePeriod === 'early' ? { m: 0, a: 1, n: 2 } : { m: 1, a: 2, n: 0 };
          // @ts-ignore
          return indexMap[a[0]] - indexMap[b[0]];
        })
        .map(([dayPart, shiftPlan]) => {
          const plansEntries = Object.entries(shiftPlan);
          return html`
            <c-box p-4 border-box flex flex-col row-gap-4 border-box>
              <c-box
                p-4
                border-box
                round-6
                style="min-height:44px"
                bg="${this.setColorRequestType(dayPart as DayPart)}">
                <div
                  style="cursor:${this.requestSelected || this.isRemoveMode
                    ? 'pointer'
                    : ''}; width:100%; height:100%">
                  <c-box>
                    <c-box class="icon-daypart-sr" flex flex-col>
                      <c-box flex flex-col row-gap-4 tx-12
                        >${plansEntries.map(([shiftName], index) => {
                          const isLast = index === plansEntries.length - 1;
                          const shouldComma = plansEntries.length > 1 && !isLast;
                          return html`<c-box
                            block
                            tx-12
                            style="margin-top:${index > 0 ? '3px' : '0'}"
                            >${shiftName}${shouldComma ? ',' : ''}</c-box
                          >`;
                        })}</c-box
                      >
                    </c-box>
                  </c-box>
                </div>
              </c-box>
            </c-box>
          `;
        })}
    </c-box>`;
  }

  // 📌id cell maybe duplicate please careful. bug can occur
  renderInitialRequest(
    request: ScheduleDataWithRender,
    practitioner: SchedulePractitionerEntity,
    date: Date,
    indexUser: number
  ) {
    const dateString = this.convertDateToString(date);
    const cellId = `initial-data-shift-cell-${indexUser}`;
    const title = {
      sem: 'ขออบรม, สัมมนา, ไปราชการ',
      off: 'ขอลาหยุด',
      vac: 'ขอลาพักร้อน',
    } as const;

    const popoverObj = {
      date,
      practitioner,
      dateString,
      cellId,
      request: request.arrangedRequest,
      remark: request?.remark || '',
      title: title[request.requestType.abbr as 'sem' | 'off' | 'vac'],
      type: request.requestType.abbr,
    };

    switch (request.requestType.abbr) {
      case 'sr':
        return html`
          <c-box
            w-full
            h-full
            id="${cellId}-${dateString}"
            @click="${this.requestSelected?.abbr !== 'woff'
              ? (e: PointerEvent) => {
                  this.appendPopover(
                    request.requestType.abbr,
                    cellId,
                    {
                      date,
                      dateString,
                      indexUser,
                      practitioner,
                    },
                    this.getPopoverByRequest({ ...popoverObj, event: e })!,

                    this.renderSrInitialHost(request, practitioner, dateString)
                  );
                }
              : () => {
                  this.saveWoffRequest(date, practitioner, dateString);
                  this.requestUpdate();
                }}">
            ${this.renderSrInitialHost(request, practitioner, dateString)}
          </c-box>
        `;

      case 'woff':
        return html`
          <c-box
            w-full
            h-full
            id="${cellId}-${dateString}"
            shift-type="woff-init"
            @click="${this.requestSelected?.abbr !== 'woff'
              ? (e: PointerEvent) => {
                  this.appendPopover(
                    request.requestType.abbr,
                    cellId,
                    {
                      date,
                      dateString,
                      indexUser,
                      practitioner,
                    },
                    this.getPopoverByRequest({ ...popoverObj, event: e })!,
                    this.renderWoffSavedHost(
                      dateString,
                      practitioner,
                      { initial: true },
                      'woff',
                      date,
                      indexUser
                    )
                  );
                }
              : null}">
            ${this.renderWoffSavedHost(
              dateString,
              practitioner,
              { initial: true },
              'woff',
              date,
              indexUser
            )}
          </c-box>
        `;

      case 'sem':
      case 'vac':
      case 'off':
        return html`
          <c-box
            shift-type="${request.requestType.abbr}-init"
            w-full
            h-full
            id="${cellId}-${dateString}"
            @click="${this.requestSelected?.abbr !== 'woff'
              ? (e: PointerEvent) => {
                  this.appendPopover(
                    request.requestType.abbr,
                    cellId,
                    {
                      date,
                      dateString,
                      indexUser,
                      practitioner,
                    },
                    this.getPopoverByRequest({ ...popoverObj, event: e })!,
                    this.renderDayOffPlanSaved(
                      {
                        dateString,
                        remark: request.remark,
                        initial: true,
                      },
                      request.requestType.abbr,
                      practitioner,
                      date,
                      indexUser
                    )
                  );

                  this.shiftDatepickerCache[request.requestType.abbr] = {
                    dateString,
                    remark: request.remark,
                    initial: true,
                    requestType: request.requestType.abbr as any,
                    practitioner,
                    date,
                    indexUser,
                  };
                }
              : () => {
                  this.saveWoffRequest(date, practitioner, dateString);
                  this.requestUpdate();
                }}">
            ${this.renderDayOffPlanSaved(
              {
                dateString,
                remark: request.remark,
                initial: true,
              },
              request.requestType.abbr,
              practitioner,
              date,
              indexUser
            )}
          </c-box>
        `;

      default:
        break;
    }
  }

  private generateDayOffValue?: string[];
  saveDatepicker(e: CXDatePicker.SelectDate.Range, practitioner: SchedulePractitionerEntity) {
    const disabledDates = this.disableDates ? Object.keys(this.disableDateArranged) : undefined;

    // prepare dayOff
    if (e.detail.endDate && this.requestSelected?.abbr === 'off') {
      const initialDayOFfExist =
        practitioner.schedulePractitionerRequest
          ?.filter((res) => res?.requestType.abbr === 'off')
          .map((res) => res?.requestDate) || [];

      // const initialDayOFfExist: string[] = [];
      let dayOffSavedExist: string[] = Object.keys(
        this.shiftOffRequestSaved?.[practitioner.id]?.request || {}
      );

      let dayOff = practitioner.practitioner.leave.dayOff;

      const dayBetweenStartEnd = this.daysBetween(e.detail.startDate!, e.detail.endDate) + 1;
      if (dayBetweenStartEnd > dayOff) {
        // const dayOffUse = (rangeDayOff?.length || 0) + dayOff;
        this.generateDayOffValue = this.generateDayOff(
          e.detail.startDate!,
          e.detail.endDate,
          dayOffSavedExist,
          dayOff,
          disabledDates,
          initialDayOFfExist as string[]
        );

        e.detail.endDate = new Date(this.generateDayOffValue[this.generateDayOffValue.length - 1]);
      } else {
        this.generateDayOffValue = getDateBetweenArrayDate(e.detail.startDate!, e.detail.endDate)
          .map((res) => this.formatDate(res))
          .filter((res) => {
            if (this.disableDates) {
              let isDateExist = false;
              for (const dateVal of Object.keys(this.disableDateArranged)) {
                if (dateVal === res) {
                  isDateExist = true;
                  break;
                }
              }
              return !isDateExist;
            } else {
              return true;
            }
          });
      }
    }
    // prepare vacation off
    if (e.detail.endDate && this.requestSelected?.abbr === 'vac') {
      const initialVacOFfExist =
        practitioner.schedulePractitionerRequest
          ?.filter((res) => res?.requestType.abbr === 'vac')
          .map((res) => res?.requestDate) || [];
      // const initialDayOFfExist: string[] = [];
      let vacOffSavedExist: string[] = Object.keys(
        this.shiftVacRequestSaved?.[practitioner.id]?.request || {}
      );

      let vacOff: number;

      if (typeof this.vacDayOff[practitioner.practitioner.id] === 'number') {
        vacOff = this.vacDayOff[practitioner.practitioner.id];
      } else {
        const findVacation = practitioner!.practitioner!.vacations!.find(
          (res) => res!.year === new Date(this.currentTime).getFullYear()
        );
        vacOff = findVacation!.vacation;
      }
      const dayBetweenStartEnd = this.daysBetween(e.detail.startDate!, e.detail.endDate) + 1;
      if (dayBetweenStartEnd > vacOff) {
        // const rangeDayOff = this.dateRangeIntersect(
        //   e.detail.startDate!,
        //   e.detail.endDate,
        //   vacOffSavedExist
        // );
        // const dayOffUse = (rangeDayOff?.length || 0) + vacOff;
        this.generateDayOffValue = this.generateDayOff(
          e.detail.startDate!,
          e.detail.endDate,
          vacOffSavedExist,
          vacOff,
          disabledDates,
          initialVacOFfExist as string[]
        );

        e.detail.endDate = new Date(this.generateDayOffValue[this.generateDayOffValue.length - 1]);
      } else {
        this.generateDayOffValue = getDateBetweenArrayDate(e.detail.startDate!, e.detail.endDate)
          .map((res) => this.formatDate(res))
          .filter((res) => {
            if (this.disableDates) {
              let isDateExist = false;
              for (const dateVal of Object.keys(this.disableDateArranged)) {
                if (dateVal === res) {
                  isDateExist = true;
                  break;
                }
              }
              return !isDateExist;
            } else {
              return true;
            }
          });
      }
    }

    this.datepickerData = e.detail;

    (e.target as CXDatePicker.Ref)
      .fix()
      .rangeValue({ startDate: e.detail.startDate, endDate: e.detail.endDate })
      .exec();
  }

  removeInitialSameData(
    practitioner: SchedulePractitionerEntity,
    practitionerId: string,
    dateString?: string
  ) {
    const practitionerIndex = this.scheduleData?.schedulePractitioner?.findIndex(
      (res) => res.id === practitionerId
    );

    if (typeof practitionerIndex === 'number') {
      const requestIndex = this.scheduleData?.schedulePractitioner?.[
        practitionerIndex
      ].schedulePractitionerRequest?.findIndex(
        (res) => (res as SchedulePractitionerRequestEntity)?.requestDate === dateString
      );

      if (typeof requestIndex === 'number') {
        const request = this.scheduleData?.schedulePractitioner?.[practitionerIndex]
          .schedulePractitionerRequest?.[requestIndex]! as SchedulePractitionerRequestEntity;
        if (request?.requestType?.abbr === 'sr') {
          for (
            let index = 0;
            index <
            this.scheduleData?.schedulePractitioner?.[practitionerIndex].schedulePractitionerRequest
              ?.length!;
            index++
          ) {
            const request = this.scheduleData?.schedulePractitioner?.[practitionerIndex]
              .schedulePractitionerRequest![index] as SchedulePractitionerRequestEntity;

            if (request?.requestType?.abbr === 'sr' && request?.requestDate === dateString) {
              delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                .schedulePractitionerRequest![index];
            }
          }
        } else {
          if (request?.requestType?.abbr === 'off') {
            practitioner.practitioner.leave.dayOff += 1;
          } else if (request?.requestType?.abbr === 'vac') {
            this.vacDayOff[practitioner.practitioner.id] += 1;
          }
          delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
            .schedulePractitionerRequest?.[requestIndex];
        }
      }
    }
  }

  deleteInitialDatePicker(
    practitioner: SchedulePractitionerEntity,
    practitionerId: string,
    dateBetween: Date[],
    dateString?: string
  ) {
    switch (this.requestSelected?.abbr!) {
      case 'sem':
        for (const date of dateBetween) {
          const dateBetString = this.convertDateToString(date);
          this.removeInitialSameData(practitioner, practitionerId, dateBetString);
          if (this.shiftOffRequestSaved[practitionerId]?.request?.[dateBetString!]) {
            practitioner.practitioner.leave.dayOff += 1;
          }

          if (this.shiftVacRequestSaved[practitionerId]?.request?.[dateBetString!]) {
            this.vacDayOff[practitioner.practitioner.id] += 1;
          }
          delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateBetString];
        }
        break;

      case 'vac':
        for (const date of dateBetween) {
          const dateBetString = this.convertDateToString(date);
          if (this.shiftOffRequestSaved[practitionerId]?.request?.[dateBetString!]) {
            practitioner.practitioner.leave.dayOff += 1;
          }

          this.removeInitialSameData(practitioner, practitionerId, dateBetString);

          delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateBetString];
        }
        break;

      case 'off':
        for (const date of dateBetween) {
          const dateBetString = this.convertDateToString(date);
          this.removeInitialSameData(practitioner, practitionerId, dateBetString);

          if (this.shiftVacRequestSaved[practitionerId]?.request?.[dateBetString!]) {
            this.vacDayOff[practitioner.practitioner.id] += 1;
          }

          delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateBetString];
        }
        break;

      case 'woff':
        this.removeInitialSameData(practitioner, practitionerId, dateString);
        if (this.shiftOffRequestSaved[practitionerId]?.request?.[dateString!]) {
          practitioner.practitioner.leave.dayOff += 1;
        }

        if (this.shiftVacRequestSaved[practitionerId]?.request?.[dateString!]) {
          this.vacDayOff[practitioner.practitioner.id] += 1;
        }

        delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateString!];
        delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateString!];
        delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateString!];
        delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateString!];

        break;

      case 'sr':
        this.removeInitialSameData(practitioner, practitionerId, dateString!);
        if (this.shiftOffRequestSaved[practitionerId]?.request?.[dateString!]) {
          practitioner.practitioner.leave.dayOff += 1;
        }

        if (this.shiftVacRequestSaved[practitionerId]?.request?.[dateString!]) {
          this.vacDayOff[practitioner.practitioner.id] += 1;
        }
        delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateString!];
        delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateString!];
        delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateString!];
        delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateString!];
        break;
      default:
        break;
    }

    this.requestUpdate();
  }

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
  }) {
    switch (this.requestSelected?.abbr) {
      case 'sr':
        return this.renderSrPopover(
          data.date,
          data.practitioner,
          data.request,
          data.cellId,
          data.indexUser,
          data.event
        );

      case 'off':
      case 'sem':
      case 'vac':
        return this.renderDatepickerBox({
          date: data.date,
          practitioner: data.practitioner,
          title: data.title!,
          cellId: data.cellId!,
          dateString: data.dateString!,
          remark: data.remark!,
          type: data.type!,
          indexUser: data.indexUser!,
          request: data.request,
          event: data.event,
        });
    }
  }

  saveShiftPlanDatePickerDisabledButton = false;
  saveShiftPlanDatePicker = (
    practitioner: SchedulePractitionerEntity,
    dateString: string,
    ceillId: string,
    remark: string,
    type: RequestType['abbr']
  ) => {
    if (this.saveShiftPlanDatePickerDisabledButton) return;
    setTimeout(() => {
      this.saveShiftPlanDatePickerDisabledButton = false;
    }, 1000);
    if (!this.datepickerData?.startDate && !this.datepickerData?.endDate) {
      this.datepickerData = {
        startDate: new Date(dateString),
        endDate: new Date(dateString),
      };
    }
    const dateBetween = getDateBetweenArrayDate(
      this.datepickerData?.startDate!,
      this.datepickerData?.endDate!
    );

    const dataDate = {} as { [key: string]: DatePickerShiftPlan };
    for (const date of dateBetween) {
      dataDate[this.convertDateToString(date)] = {
        dateString: this.convertDateToString(date),
        remark: this.remarkRef.value?.value,
      };
    }

    switch (this.requestSelected?.abbr) {
      case 'sem':
        if (!this.shiftSemRequestSaved[practitioner.id]) {
          this.shiftSemRequestSaved[practitioner.id] = {} as any;
          this.shiftSemRequestSaved[practitioner.id].request = {};
        }

        this.shiftSemRequestSaved[practitioner.id] = {
          request: {
            ...this.shiftSemRequestSaved[practitioner.id].request,
            ...dataDate,
          },
          practitioner,
        };
        this.dispatchEvent(
          new CustomEvent('save-sem', {
            detail: this.shiftSemRequestSaved,
          })
        );
        this.dispatchEvent(
          new CustomEvent('save-request', {
            detail: {
              [this.requestSelected.abbr]: this.shiftSemRequestSaved,
            },
          })
        );
        break;

      case 'off':
        const checkOffSaved = Object.keys(
          this.shiftOffRequestSaved[practitioner.id]?.request || {}
        ).includes(dateString);

        const savedOffArr = Object.keys(this.shiftOffRequestSaved[practitioner.id]?.request || {});
        const savedOffCOunt = this.countSameDates(
          this.generateDayOffValue || [],
          savedOffArr as string[]
        );
        if (savedOffCOunt) {
          practitioner.practitioner.leave.dayOff += savedOffCOunt;
        }
        if (!this.shiftOffRequestSaved[practitioner.id]) {
          this.shiftOffRequestSaved[practitioner.id] = {} as any;
          this.shiftOffRequestSaved[practitioner.id].request = {};
        }

        const cloneOffResultValue = structuredClone(
          this.shiftOffRequestSaved[practitioner.id].request
        );
        this.shiftOffRequestSaved[practitioner.id] = {
          request: {
            ...cloneOffResultValue,
            ...dataDate,
          },
          practitioner,
        };
        const initialDayOFfExist =
          practitioner.schedulePractitionerRequest
            ?.filter((res) => res?.requestType.abbr === 'off')
            .map((res) => res?.requestDate) || [];

        if (!this.generateDayOffValue) {
          if (!initialDayOFfExist.includes(dateString) && !checkOffSaved) {
            practitioner.practitioner.leave.dayOff -= 1;
          }
        } else if (this.generateDayOffValue) {
          const initialCount = this.countSameDates(
            this.generateDayOffValue,
            initialDayOFfExist as string[]
          );
          if (initialCount) {
            practitioner.practitioner.leave.dayOff += initialCount;
          }

          practitioner.practitioner.leave.dayOff -= this.generateDayOffValue.length;

          const filteredDateOff = this.filterDateDataUse(
            this.shiftOffRequestSaved[practitioner.id].request,
            this.generateDayOffValue!
          );

          this.shiftOffRequestSaved[practitioner.id].request = {
            ...cloneOffResultValue,
            ...filteredDateOff,
          };
        } else if (this.disableDates) {
          const disabledDates = this.disableDates?.flatMap((res) => res.date);
          const filteredDateOff = this.filterDateDataDisabled(
            this.shiftOffRequestSaved[practitioner.id].request,
            disabledDates
          );

          this.shiftOffRequestSaved[practitioner.id].request = filteredDateOff;
        }

        this.dispatchEvent(
          new CustomEvent('save-off', {
            detail: this.shiftOffRequestSaved,
          })
        );
        this.dispatchEvent(
          new CustomEvent('save-request', {
            detail: {
              [this.requestSelected.abbr]: {
                practitioner,
                type: this.requestSelected,
                request: this.shiftOffRequestSaved,
              },
            },
          })
        );
        break;

      case 'vac':
        const checkVacSaved = Object.keys(
          this.shiftVacRequestSaved[practitioner.id]?.request || {}
        ).includes(dateString);

        const savedVacArr = Object.keys(this.shiftVacRequestSaved[practitioner.id]?.request || {});
        const savedVacCount = this.countSameDates(
          this.generateDayOffValue || [],
          savedVacArr as string[]
        );

        if (savedVacCount) {
          this.vacDayOff[practitioner.practitioner.id] += savedVacCount;
        }

        if (!this.shiftVacRequestSaved[practitioner.id]) {
          this.shiftVacRequestSaved[practitioner.id] = {} as any;
          this.shiftVacRequestSaved[practitioner.id].request = {};
        }

        const cloneVacResultValue = structuredClone(
          this.shiftVacRequestSaved[practitioner.id].request
        );

        this.shiftVacRequestSaved[practitioner.id] = {
          request: {
            ...cloneVacResultValue,
            ...dataDate,
          },
          practitioner,
        };

        const initialVacExist =
          practitioner.schedulePractitionerRequest
            ?.filter((res) => res?.requestType.abbr === 'vac')
            .map((res) => res?.requestDate) || [];

        if (!this.generateDayOffValue) {
          if (!initialVacExist.includes(dateString) && !checkVacSaved) {
            this.vacDayOff[practitioner.practitioner.id] -= 1;
          }
        } else if (this.generateDayOffValue) {
          const initialCount = this.countSameDates(
            this.generateDayOffValue,
            initialVacExist as string[]
          );
          if (initialCount) {
            this.vacDayOff[practitioner.practitioner.id] += 1;
          }
          this.vacDayOff[practitioner.practitioner.id] -= this.generateDayOffValue.length;

          const filteredVacOff = this.filterDateDataUse(
            this.shiftVacRequestSaved[practitioner.id].request,
            this.generateDayOffValue!
          );

          this.shiftVacRequestSaved[practitioner.id].request = {
            ...cloneVacResultValue,
            ...filteredVacOff,
          };
        } else if (this.disableDates) {
          const disabledDates = this.disableDates?.flatMap((res) => res.date);
          const filteredVacOff = this.filterDateDataDisabled(
            this.shiftVacRequestSaved[practitioner.id].request,
            disabledDates
          );

          this.shiftVacRequestSaved[practitioner.id].request = filteredVacOff;
        }

        this.dispatchEvent(
          new CustomEvent('save-vac', {
            detail: this.shiftVacRequestSaved,
          })
        );
        this.dispatchEvent(
          new CustomEvent('save-request', {
            detail: {
              [this.requestSelected.abbr]: this.shiftVacRequestSaved,
            },
          })
        );
        break;

      default:
        break;
    }

    this.deleteInitialDatePicker(practitioner, practitioner.id, dateBetween, dateString);

    this.datepickerData = undefined;
    this.selectedDate = undefined;
    this.closePopover();

    if (ceillId) {
      // boxTarget must stay outside settimeout if it inside settimeout it will be null;
      const boxTarget = this.querySelector(`#${ceillId}-${dateString}`) as HTMLElement;
      setTimeout(() => {
        const remarkCacheId = `${this.requestSelected?.abbr}-${dateString}-${practitioner.practitioner.id}`;
        const renderDayOffHost = this.renderDayOffHost(
          {
            dateString,
            initial: undefined,
            remark: this.remarkCache[remarkCacheId],
          },
          this.requestSelected?.abbr!,
          practitioner
        );

        render(renderDayOffHost, boxTarget);
        setTimeout(() => {
          if (boxTarget?.children[1]) {
            boxTarget?.children[1]?.remove();
          }
        }, 5);
      }, 0);
    }

    this.saveShiftPlanDatePickerDisabledButton = true;
  };
  filterDateDataDisabled(
    dateData: {
      [key: string]: any;
    },
    disabledDate: string[]
  ): {
    [key: string]: any;
  } {
    const filteredData: {
      [key: string]: any;
    } = {};

    for (const date in dateData) {
      if (!disabledDate.includes(date)) {
        filteredData[date] = dateData[date];
      }
    }

    return filteredData;
  }

  filterDateDataUse(
    dateData: {
      [key: string]: any;
    },
    usedDate: string[]
  ): {
    [key: string]: any;
  } {
    const filteredData = {} as {
      [key: string]: any;
    };
    usedDate?.forEach((date) => {
      if (dateData?.hasOwnProperty(date)) {
        filteredData[date] = dateData[date];
      }
    });

    return filteredData;
  }

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
    event?: PointerEvent;
  }) {
    const title: Record<string, string> = {
      sem: 'ขออบรม, สัมมนา, ไปราชการ',
      off: 'ขอลาหยุด',
      vac: 'ขอลาพักร้อน',
    };
    const iconSoftColor = requestTypeStyles[this.requestSelected?.abbr!].iconBgColor;
    const accentColor = requestTypeStyles[this.requestSelected?.abbr!].accentColor;
    const shouldInitInputValue = data.type === this.requestSelected?.abbr;
    const remarkCacheId = `${this.requestSelected?.abbr}-${data.dateString}-${data.practitioner.practitioner.id}`;

    return html`
      <c-box slot="popover" popover-check>
        <c-box content>
          <!-- title -->
          <c-box>
            <c-box
              class="cx-shift-schedule__iconTitleWrapper"
              style="border:1px solid var(--${iconSoftColor})!important">
              <c-box
                class="cx-shift-schedule__iconTitle"
                icon-prefix="16 ${requestTypeStyles[this.requestSelected?.abbr!]
                  .iconSrc} ${accentColor}"
                style="background:var(--${iconSoftColor}) !important"></c-box>
              <c-box tx-14 tx-gray-600> ${title[this.requestSelected?.abbr!]} </c-box>
            </c-box>
            <c-box mt-12 flex items-center flex justify-between>
              <c-box tx-16 semiBold tx-gray-600>เลือกเวรที่ต้องการขอ</c-box>
              <c-box flex col-gap-6>
                <cx-button
                  .var="${{ width: 'size-0' } as CXButton.Var}"
                  .set="${{ type: 'secondary' } as CXButton.Set}"
                  @click="${() => {
                    this.closePopover();
                    if (data.cellId) {
                      const boxTarget = this.querySelector(
                        `#${data.cellId}-${data.dateString}`
                      ) as HTMLElement;

                      this.renderContentBack(
                        data.type,
                        data.date,
                        data.dateString,
                        data.practitioner,
                        boxTarget,
                        data.indexUser,
                        undefined,
                        data.request
                      );
                    }
                  }}"
                  >ยกเลิก</cx-button
                >
                <cx-button
                  @click="${() => {
                    this.saveShiftPlanDatePicker(
                      data.practitioner,
                      data.dateString,
                      data.cellId,
                      data.remark,
                      data.type
                    );
                  }}"
                  .var="${{ width: 'size-0' } as CXButton.Var}"
                  >บันทึก</cx-button
                >
              </c-box>
            </c-box>
          </c-box>
          <!-- date picker -->
          <c-box mt-18>
            <c-box mb-12>Date</c-box>
            <cx-datepicker
              @select-date="${(e: CXDatePicker.SelectDate.Range) =>
                this.saveDatepicker(e, data.practitioner)}"
              .set="${{
                date: data.date,
                dateRange: true,
                rangeValue: {
                  endDate: data.date,
                  startDate: data.date,
                },
                inputStyle: 'short',
                min: new Date(this.scheduleData?.startDate!),
                max: new Date(this.scheduleData?.endDate!),
              } as CXDatePicker.Set}"
              .var="${{
                heightInput: '44',
                widthInput: '312',
              } as CXDatePicker.Var}"></cx-datepicker>
          </c-box>

          <c-box mt-12>หมายเหตุ</c-box>
          <c-box class="remark-input" mt-6 input-box="primary-200">
            <input
              @input="${(e: InputEvent) => {
                const input = e.target as HTMLInputElement;
                if (input.value.length > 10) {
                  input.value = input.value.slice(0, 10);
                }
                this.remarkCache[remarkCacheId] = input.value;
              }}"
              value="${shouldInitInputValue ? this.remarkCache[remarkCacheId] || '' : ''}"
              ${ref(this.remarkRef)}
              type="text"
              style="border:none;outline:none;width:200px"
              placeholder="หมายเหตุเพิ่มเติม" />
          </c-box>
        </c-box>
      </c-box>
    `;
  }

  private remarkCache = {} as Record<string, string>;
  shakePopover() {
    const popoverCheck = ModalSingleton.modalRef.querySelector<HTMLElement>('c-box[popover-check]');
    popoverCheck?.classList.add('shake-efx-popover');
    setTimeout(() => {
      popoverCheck?.classList.remove('shake-efx-popover');
    }, 600);
  }

  appendPopover(
    type: RequestType['abbr'],
    cellId: string,
    data: {
      date: Date;
      practitioner: SchedulePractitionerEntity;
      dateString: string;
      indexUser: number;
    },
    popoverContent: TemplateResult,
    popoverHost: TemplateResult
  ) {
    if (this.isRemoveMode) return;
    if (this.currentPopoverRef) {
      this.shakePopover();
      return;
    }
    if (
      (this.requestSelected?.abbr === 'off' && data.practitioner.practitioner.leave.dayOff === 0) ||
      (this.requestSelected?.abbr === 'vac' &&
        this.vacDayOff?.[(data.practitioner.practitioner as any).id] === 0)
    ) {
      return;
    }
    this.userSelectedIndex = data.indexUser;
    if (this.mode === 'edit') {
      this.dispatchEvent(
        new CustomEvent('focus-request', {
          detail: { practitioner: data.practitioner },
        })
      );
    }

    if (this.requestSelected?.abbr === 'woff') return;

    const boxTarget = this.querySelector(`#${cellId}-${data.dateString}`) as HTMLElement;
    if (boxTarget) {
      const firstElement = boxTarget.firstElementChild;
      if (firstElement?.tagName !== 'CX-POPOVER') {
        firstElement?.remove();
      } else {
        return;
      }

      const popover = html`
        <cx-popover
          .set="${{
            arrowpoint: true,
            focusout: 'none',
            mouseleave: 'none',
            transform: 'center',
          } as CXPopover.Set}">
          ${popoverHost} ${popoverContent}
        </cx-popover>
      `;
      render(popover, boxTarget);
      requestAnimationFrame(() => {
        this.currentPopoverRef = this.querySelector('cx-popover') as CXPopover.Ref;
        // @ts-ignore
        this.currentPopoverRef.setOpenPopover();
      });
    }
  }

  renderEmptyDateForSelect(
    date: Date,
    practitioner: SchedulePractitionerEntity,
    dateString: string,
    indexUser: number,
    request?: SrShiftPlan
  ) {
    const requestClone = structuredClone(request);
    const cellId = `empty-shift-cell-${indexUser}`;
    switch (this.requestSelected?.abbr) {
      case 'sr':
        return html`
          <c-box
            id="${cellId}-${dateString}"
            w-full
            h-full
            @click="${(event: PointerEvent) =>
              this.appendPopover(
                this.requestSelected?.abbr!,
                cellId,
                {
                  date,
                  practitioner,
                  dateString,
                  indexUser,
                },
                this.getPopoverByRequest({
                  request: requestClone,
                  date,
                  practitioner,
                  cellId,
                  dateString: this.convertDateToString(date),
                  indexUser,
                  event,
                })!,
                this.renderEmptyBox(
                  date,
                  'select',
                  this.requestSelected?.abbr,
                  practitioner,
                  dateString,
                  indexUser
                )
              )}">
            ${this.renderEmptyBox(
              date,
              'display',
              this.requestSelected?.abbr,
              practitioner,
              dateString,
              indexUser
            )}
          </c-box>
        `;

      case 'vac':
      case 'off':
      case 'sem':
        return html`
          <c-box
            id="${cellId}-${dateString}"
            w-full
            h-full
            style="pointer-events:${(this.requestSelected?.abbr === 'off' &&
              practitioner?.practitioner?.leave?.dayOff === 0) ||
            (this.requestSelected?.abbr === 'vac' &&
              this.vacDayOff?.[(practitioner.practitioner as any).id] === 0)
              ? 'none'
              : ''}"
            @click="${(e: PointerEvent) => {
              this.appendPopover(
                this.requestSelected?.abbr!,
                cellId,
                {
                  date,
                  practitioner,
                  dateString,
                  indexUser,
                },
                this.getPopoverByRequest({
                  date,
                  practitioner,
                  cellId,
                  dateString,
                  event: e,
                  indexUser,
                })!,

                this.renderEmptyBox(
                  date,
                  'select',
                  this.requestSelected?.abbr,
                  practitioner,
                  dateString,
                  indexUser
                )
              );
            }}">
            ${this.renderEmptyBox(
              date,
              'display',
              this.requestSelected?.abbr,
              practitioner,
              dateString,
              indexUser
            )}
          </c-box>
        `;

      case 'woff':
        return html`
          <c-box
            w-full
            h-full
            style="${this.shouldNotAllowedWeekOffSelect ? 'pointer-events: none' : ''}">
            ${this.renderEmptyBox(date, 'select', 'woff', practitioner, dateString, indexUser)}
          </c-box>
        `;

      default:
        return undefined;
    }
  }

  // FIXME: any type w8 for api data
  renderShipSrRequest(
    shifts: ScheduleShiftsEntity[],
    dayPart: DayPart,
    dateString: string,
    practitioner: SchedulePractitionerEntity,
    initialSr?: Record<string, ScheduleShiftsEntity>
  ) {
    const shouldRender = shifts.flatMap((res) =>
      res.scheduleStaffings?.filter(
        (res) =>
          res.planDate === dateString &&
          res.practitionerLevel.id === practitioner.practitioner.practitionerLevel.id &&
          res.practitionerLevel.practitionerRole.id ===
            practitioner.practitioner.practitionerRole.id
      )
    );
    const filteredShift = shifts.flatMap((res) => {
      return {
        ...res,
        scheduleStaffings: res.scheduleStaffings?.filter(
          (res) =>
            res.planDate === dateString.trim() &&
            res.practitionerLevel.id === practitioner.practitioner.practitionerLevel.id &&
            res.practitionerLevel.practitionerRole.id ===
              practitioner.practitioner.practitionerRole.id
        ),
      };
    });

    return shouldRender.length
      ? html` <c-box flex col-gap-24>
          <c-box w-full>
            <c-box flex col-gap-6 justify-between>
              ${filteredShift?.map((requestPlan, indexs) => {
                const shiftDayPart = this.shiftSlotSort[requestPlan.shiftSlotId];
                const shouldRenderSr = requestPlan?.scheduleStaffings?.length! > 0;
                const hasInitialSr = initialSr?.[requestPlan.shiftName];
                const bgColor =
                  this.timePeriod === 'early'
                    ? dayPortValueEarly[shiftDayPart as DayPart].bgColor
                    : dayPortValueLate[shiftDayPart as DayPart].bgColor;

                const mediumColor =
                  this.timePeriod === 'late'
                    ? dayPortValueEarly[shiftDayPart as DayPart].mediumColor
                    : dayPortValueLate[shiftDayPart as DayPart].mediumColor;

                return shouldRenderSr
                  ? html` <c-box flex items-center flex-col style="width:100%">
                      <c-box
                        @click="${(e: PointerEvent) => {
                          this.addSrShiftRequest(requestPlan, dateString);

                          const target = e.target as CBoxUiAttribute;
                          target.uiToggled = !target.uiToggled;

                          const bgAttr = hasInitialSr
                            ? target.uiToggled
                              ? `${'primary-25'}!`
                              : `${bgColor}!`
                            : target.uiToggled
                            ? `${bgColor}!`
                            : `${'primary-25'}!`;

                          const colorAttr = hasInitialSr
                            ? target.uiToggled
                              ? `gray-500`
                              : `color-4-700`
                            : target.uiToggled
                            ? `color-4-700`
                            : `gray-500`;

                          target.setAttribute('bg', bgAttr);
                          target.style.color = `var(--${colorAttr})`;
                        }}"
                        shadow-hover="shadow-3"
                        ui-active="_1:bg-${mediumColor}!"
                        transition="all 0.2s ease"
                        h-30
                        bg="${hasInitialSr ? bgColor : 'primary-25'}"
                        round-8
                        flex
                        justify-center
                        items-center
                        cursor-pointer
                        tx-14
                        bold
                        style="color:var(--${hasInitialSr
                          ? 'color-4-700'
                          : 'gray-500'});width:100%;"
                        >${requestPlan.shiftName}</c-box
                      >
                      <c-box tx-12
                        >${requestPlan.startTime.slice(0, -3)} -
                        ${requestPlan.endTime.slice(0, -3)}</c-box
                      >
                    </c-box>`
                  : undefined;
              })}
            </c-box>
          </c-box>
        </c-box>`
      : undefined;
  }

  addSrShiftRequest(requestPlan: ScheduleShiftsEntity, dateString: string) {
    const plan = requestPlan.shiftName;
    const dayPart = this.shiftSlotSort[requestPlan.shiftSlotId] as 'a' | 'm' | 'n';
    // 📌 long hand =  if (!this.shiftRequest[dayPart]) this.shiftRequest[dayPart] = {};
    this.shiftSrRequestCache ||= {};

    this.shiftSrRequestCache[dateString] ||= {} as SrShiftPlan;
    this.shiftSrRequestCache[dateString][dayPart] ||= {};

    if (this.shiftSrRequestCache[dateString][dayPart][plan]) {
      delete this.shiftSrRequestCache[dateString][dayPart][plan];

      if (Object.keys(this.shiftSrRequestCache[dateString][dayPart]).length === 0) {
        delete this.shiftSrRequestCache[dateString][dayPart];
        if (Object.keys(this.shiftSrRequestCache[dateString]).length === 0) {
          delete this.shiftSrRequestCache[dateString];

          if (Object.keys(this.shiftSrRequestCache).length === 0) {
            this.shiftSrRequestCache = {};
          }
        }
      }
    } else {
      this.shiftSrRequestCache[dateString][dayPart][plan] = requestPlan;
    }
  }

  groupShiftsByLetter(arr: any) {
    const result = {} as any;
    for (const shift of arr) {
      const slotName = this.shiftSlotSort[shift.shiftSlotId];
      if (!result[slotName]) {
        result[slotName] = [];
      }
      result[slotName].push(shift);
    }
    return result;
  }

  renderContentBack(
    type: RequestType['abbr'],
    date: Date,
    dateString: string,
    practitioner: SchedulePractitionerEntity,
    boxTarget: HTMLElement,
    indexUser?: number,
    renderType?: 'init' | 'saved',
    request?: SrShiftPlan
  ) {
    switch (type) {
      case 'sr':
        setTimeout(() => {
          // this.shiftSrRequestCache = {} as any;
          const planEntries = Object.entries(request || this.shiftSrShipCache);
          render(this.renderSrSavedHost(dateString, practitioner, planEntries), boxTarget);
          // this.shiftSrShipCache = {};
        }, 0);
        break;

      case 'woff':
        render(
          this.renderWoffSavedHost(
            dateString,
            practitioner,
            { initial: true },
            'woff',
            date!,
            indexUser
          ),
          boxTarget
        );

        break;

      case 'off':
      case 'sem':
      case 'vac':
        setTimeout(() => {
          render(
            this.renderDayOffPlanSaved(
              {
                dateString: this.shiftDatepickerCache[type].dateString,
                remark: this.shiftDatepickerCache[type].remark,
                initial: this.shiftDatepickerCache[type].initial,
              },
              this.shiftDatepickerCache[type].requestType,
              this.shiftDatepickerCache[type].practitioner,
              this.shiftDatepickerCache[type].date,
              this.shiftDatepickerCache[type].indexUser,
              'cancel'
            ),
            boxTarget
          );
        }, 0);

        break;

      default:
        render(
          this.renderEmptyDateForSelect(date, practitioner, dateString, indexUser!, request),
          boxTarget
        );
        break;
    }
  }

  renderSrPopover(
    date: Date,
    practitioner: SchedulePractitionerEntity,
    request?: SrShiftPlan,
    cellId?: string,
    indexUser?: number,
    event?: PointerEvent
  ) {
    const shiftGroup = this.groupShiftsByLetter(this.scheduleData?.scheduleShifts) as Record<
      'a' | 'm' | 'n',
      ScheduleShiftsEntity[]
    >;

    const dateString = this.convertDateToString(date);

    // @ts-ignore
    this.shiftSrShipCache = structuredClone(request);

    if (request) {
      this.shiftSrRequestCache[dateString] = {
        ...(this.shiftSrRequestCache[dateString] || {}),
        ...structuredClone(request),
      };
    }

    const shouldAllowedPointer = this.scheduleData?.scheduleShifts
      // @ts-ignore
      ?.flatMap((res: ScheduleShiftsEntity) =>
        res.scheduleStaffings?.find(
          (res) =>
            new Date(res.planDate).getDate() === date.getDate() &&
            res.practitionerLevelId === practitioner.practitioner.practitionerLevelId &&
            res.practitionerLevel.practitionerRoleId ===
              practitioner.practitioner.practitionerRoleId
        )
      )
      .filter(Boolean);

    const hasSrPlan = !!shouldAllowedPointer?.length && this.requestSelected?.abbr === 'sr';

    return hasSrPlan
      ? html`
          <c-box slot="popover" popover-check>
            <c-box content>
              <!-- title -->
              <c-box>
                <c-box class="cx-shift-schedule__iconTitleWrapper">
                  <c-box
                    icon-prefix="16 emoji-wink-custom primary-500"
                    class="cx-shift-schedule__iconTitle"></c-box>
                  <c-box tx-14> ขอเข้าเวร </c-box>
                </c-box>
                <c-box class="cx-shift-schedule__titleSrWrapper">
                  <c-box tx-16 semiBold tx-gray-700>เลือกเวรที่ต้องการ</c-box>
                  <c-box>
                    <cx-button
                      .var="${{ width: 'size-0' }}"
                      .set="${{ type: 'secondary' } as CXButton.Set}"
                      @click="${() => {
                        this.closePopover();
                        this.shiftSrRequestCache = {};

                        if (cellId) {
                          const boxTarget = this.querySelector(
                            `#${cellId}-${dateString}`
                          ) as HTMLElement;

                          const targetElement = event?.target as HTMLElement;
                          const shift = targetElement.closest('c-box[shift-type]') as HTMLElement;
                          const requestHostType = shift.getAttribute('shift-type');

                          if (cellId) {
                            const [requestType, renderType] = requestHostType?.split('-') as [
                              RequestType['abbr'],
                              'init' | 'saved' | undefined
                            ];
                            this.renderContentBack(
                              requestType,
                              date,
                              dateString,
                              practitioner,
                              boxTarget,
                              indexUser,
                              renderType,
                              request
                            );
                          }
                        }
                      }}"
                      >ยกเลิก</cx-button
                    >
                    <cx-button
                      .var="${{ width: 'size-0' }}"
                      @click="${() =>
                        this.saveSrRequestPlan(date, practitioner, cellId, indexUser)}"
                      >บันทึก</cx-button
                    >
                  </c-box>
                </c-box>
              </c-box>

              <!-- selected request -->
              <c-box mt-12 flex flex-col row-gap-16>
                <!-- new improvement -->
                ${(
                  (this.timePeriod === 'early' ? ['m', 'a', 'n'] : ['n', 'm', 'a']) as DayPart[]
                ).map((dayPart) => {
                  return html`${shiftGroup[dayPart]
                    ? this.renderShipSrRequest(
                        shiftGroup[dayPart],
                        dayPart,
                        dateString,
                        practitioner,
                        request?.[dayPart]
                      )
                    : undefined}`;
                })}
              </c-box>
            </c-box>
          </c-box>
        `
      : html`
          <c-box slot="popover" popover-check>
            <c-box content flex flex-col items-center row-gap-12>
              <c-box> ไม่มีเวรให้เลือก </c-box>

              <cx-button
                .var="${{ width: 'size-0' }}"
                .set="${{ type: 'secondary' } as CXButton.Set}"
                @click="${() => {
                  this.closePopover();

                  if (cellId) {
                    const boxTarget = this.querySelector(`#${cellId}-${dateString}`) as HTMLElement;

                    const targetElement = event?.target as HTMLElement;
                    const shift = targetElement.closest('c-box[shift-type]') as HTMLElement;
                    const requestHostType = shift.getAttribute('shift-type');

                    if (cellId) {
                      const [requestType, renderType] = requestHostType?.split('-') as [
                        RequestType['abbr'],
                        'init' | 'saved' | undefined
                      ];
                      this.renderContentBack(
                        requestType,
                        date,
                        dateString,
                        practitioner,
                        boxTarget,
                        indexUser,
                        renderType,
                        request
                      );
                    }
                  }
                }}"
                >ยกเลิก</cx-button
              >
            </c-box>
          </c-box>
        `;
  }

  saveSrRequestPlanDisabled = false;
  saveSrRequestPlan(
    date: Date,
    practitioner: SchedulePractitionerEntity,
    cellId?: string,
    indexUser?: number
  ) {
    if (this.saveSrRequestPlanDisabled) return;
    setTimeout(() => {
      this.saveSrRequestPlanDisabled = false;
    }, 1000);

    const dateString = this.convertDateToString(date);
    if (!this.shiftSrRequestCache[dateString]) {
      this.shakePopover();
      return;
    }
    if (!this.shiftSrRequestSaved[practitioner.id]) {
      this.shiftSrRequestSaved[practitioner.id] = {} as any;
      this.shiftSrRequestSaved[practitioner.id].request = {};
      this.shiftSrRequestSaved[practitioner.id].request[this.convertDateToString(date)] = {} as {
        shiftPlan: SrShiftPlan;
      };
    }

    if (typeof this.shiftSrRequestSaved[practitioner.id].request !== 'object') {
      this.shiftSrRequestSaved[practitioner.id].request = {};
    }
    if (
      typeof this.shiftSrRequestSaved[practitioner.id].request[this.convertDateToString(date)] !==
      'object'
    ) {
      this.shiftSrRequestSaved[practitioner.id].request[this.convertDateToString(date)] = {} as {
        shiftPlan: SrShiftPlan;
      };
    }

    this.shiftSrRequestSaved[practitioner.id].practitioner = practitioner;
    this.shiftSrRequestSaved[practitioner.id].request[this.convertDateToString(date)].shiftPlan =
      this.shiftSrRequestCache[dateString];

    // it not re render

    if (cellId) {
      const boxTarget = this.querySelector(`#${cellId}-${dateString}`) as HTMLElement;
      setTimeout(() => {
        if (Object.keys(this.shiftSrRequestCache).length === 0) {
          render(
            this.renderEmptyDateForSelect(date, practitioner, dateString, indexUser!),
            boxTarget
          );
        } else {
          const planEntries = Object.entries(this.shiftSrRequestCache[dateString]);
          render(this.renderSrSavedHost(dateString, practitioner, planEntries), boxTarget);
          this.shiftSrRequestCache[dateString] = {} as SrShiftPlan;
        }
      }, 0);
    }
    const dateBetween = getDateBetweenArrayDate(
      this.datepickerData?.startDate!,
      this.datepickerData?.endDate!
    );

    this.deleteInitialDatePicker(practitioner, practitioner.id, dateBetween, dateString);
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('save-sr', { detail: this.shiftSrRequestSaved }));

    this.dispatchEvent(
      new CustomEvent('save-request', {
        detail: { [this.requestSelected?.abbr!]: this.shiftSrRequestSaved },
      })
    );

    this.selectedDate = undefined;

    this.closePopover();

    this.saveSrRequestPlanDisabled = true;
  }

  closePopover() {
    ModalCaller.popover().clear();
    this.currentPopoverRef = undefined;
    this.generateDayOffValue = undefined;
    this.datepickerData = undefined;
  }

  selectDateRequest(
    date: Date,
    type?: RequestType['abbr'],
    practitioner?: SchedulePractitionerEntity,
    dateString?: string
  ) {
    this.selectedDate = date;

    if (type === 'woff') {
      this.saveWoffRequest(date, practitioner!, dateString!);
    }
  }

  saveWoffRequest(date: Date, practitioner: SchedulePractitionerEntity, dateString: string) {
    if (this.shouldNotAllowedWeekOffSelect === true) return;
    if (!this.shiftWoffRequestSaved?.[practitioner.id]) {
      this.shiftWoffRequestSaved![practitioner.id] = {} as {
        practitioner: SchedulePractitionerEntity;
        request: { [key: string]: { date: Date } };
      };

      this.shiftWoffRequestSaved![practitioner.id].request = {} as {
        [key: string]: {
          date: Date;
        };
      };
    }

    this.shiftWoffRequestSaved![practitioner.id].request[this.convertDateToString(date)] = { date };

    this.shiftWoffRequestSaved[practitioner.id] = {
      ...this.shiftWoffRequestSaved[practitioner.id],
      practitioner,
    };
    const dateBetween = getDateBetweenArrayDate(
      this.datepickerData?.startDate!,
      this.datepickerData?.endDate!
    );

    this.deleteInitialDatePicker(practitioner, practitioner.id, dateBetween, dateString);

    this.dispatchEvent(
      new CustomEvent('focus-request', {
        detail: { practitioner: practitioner },
      })
    );

    this.dispatchEvent(
      new CustomEvent('save-woff', {
        detail: this.shiftWoffRequestSaved,
      })
    );
    this.dispatchEvent(
      new CustomEvent('save-request', {
        detail: {
          [this.requestSelected?.abbr!]: this.shiftWoffRequestSaved,
        },
      })
    );

    this.selectedDate = undefined;
  }

  renderEmptyBox(
    date: Date,
    state?: 'display' | 'select',
    type?: RequestType['abbr'],
    practitioner?: SchedulePractitionerEntity,
    dateString?: string,
    indexUser?: number
  ) {
    const isSameDate = this.selectedDate === date;
    const isHoliday = this.holidayWithKeyMap?.[this.convertDateToString(date)];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return html`
      <c-box
        p-4
        border-box
        w-full
        h-full
        shift-type="empty"
        slot="host"
        @click="${state === 'select'
          ? () => {
              if (this.requestSelected?.abbr === 'woff' && typeof indexUser === 'number') {
                this.userSelectedIndex = indexUser;
              }
              this.selectDateRequest(date, type, practitioner, dateString);
            }
          : null}">
        <c-box
          transition="all 0.2s ease"
          ui-hover="_1: bg-primary-100!"
          ui-active="_2: bg-primary-200!"
          bg="${isSameDate ? 'primary-100' : isWeekend || isHoliday ? 'pinky-25' : 'white'}"
          icon-prefix="${isSameDate
            ? '16 plus-line' + ' ' + type
              ? 'gray-600'
              : 'primary-300'
            : 'none'}"
          w-full
          h-full
          round-8
          flex
          justify-center
          items-center
          cursor-pointer
          icon-prefix-hover="16 plus-line primary-300"></c-box>
      </c-box>
    `;
  }
  countSameDates(dateA: string[], dateB: string[]): number {
    let setA = new Set(dateA);
    let setB = new Set(dateB);

    let intersection = new Set([...setA].filter((x) => setB.has(x)));

    return intersection.size;
  }
  // firstUpdated(): void {
  //   window.addEventListener('resize', this.setTableEgdeLine);
  //   setTimeout(() => {
  //     this.setTableEgdeLine();
  //   }, 250);
  // }

  resetRequestSelect() {
    this.requestSelected = undefined;
    this.isRemoveMode = false;
    this.shiftOffRequestSaved = {};
    this.shiftSemRequestSaved = {};
    this.shiftSrRequestSaved = {};
    this.shiftVacRequestSaved = {};
    this.shiftWoffRequestSaved = {};

    for (let index = 0; index < this.removeOriginCache.length; index++) {
      const cache = this.removeOriginCache[index];

      if (cache) {
        const requestPLan =
          this.scheduleData?.schedulePractitioner?.[cache.queryIndex.practitionerIndex]
            .schedulePractitionerRequest;

        if (!requestPLan) return;

        // woff, sem, off, vac
        if (typeof cache.queryIndex.requestIndex === 'number') {
          if (requestPLan) {
            requestPLan[cache.queryIndex.requestIndex] = cache.schedulePractitionerRequest;
          }
        } else {
          // sr
          (cache.queryIndex.requestIndex as number[]).forEach((resIndex) => {
            requestPLan[resIndex] = (cache.schedulePractitionerRequest as ScheduleRequestIndex)[
              resIndex
            ];
          });
        }

        this.requestUpdate();
      }
    }
  }

  findDuplicationDate = (
    arrayDate1: (string | Date)[],
    arrayDate2: (string | Date)[]
  ): string[] => {
    // Convert all dates to strings
    const arrayDate1Str: string[] = arrayDate1.map((date) => {
      if (date instanceof Date) {
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().split('T')[0];
        return localISOTime;
      }
      return date as string;
    });

    const arrayDate2Str: string[] = arrayDate2.map((date) => {
      if (date instanceof Date) {
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().split('T')[0];
        return localISOTime;
      }
      return date as string;
    });

    // Find duplicate dates
    const duplicates: string[] = arrayDate1Str.filter((date) => arrayDate2Str.includes(date));
    return duplicates;
  };

  convertRequestDatesToObject(requests: SchedulePractitionerRequestEntity[]): {
    [key: string]: ScheduleDataWithRender;
  } {
    const result: {
      [key: string]: ScheduleDataWithRender;
    } = {};

    if (requests.length) {
      requests?.forEach((item) => {
        const { requestDate, requestShift } = item;

        switch (item.requestType.abbr) {
          case 'vac':
          case 'sem':
          case 'off':
          case 'woff':
            if (!result[requestDate]) {
              result[requestDate] = { ...item };
            }
            // assign other properties to the result object
            result[requestDate] = { ...result[requestDate] };
            break;

          case 'sr':
            // @ts-ignore
            const scheduleShifts = this.scheduleData?.scheduleShifts?.find(
              (res: ScheduleShiftsEntity) => res.shiftName === requestShift
            ) as ScheduleShiftsEntity;
            const dayPart = this.shiftSlotSort[scheduleShifts.shiftSlotId] as 'a' | 'm' | 'n';
            if (!result[requestDate]) {
              result[requestDate] = { arrangedRequest: {} as ArrangedRequest, ...item };
            }
            if (!result[requestDate]!.arrangedRequest![dayPart]) {
              result[requestDate]!.arrangedRequest![dayPart] = {};
            }

            result[requestDate]!.arrangedRequest![dayPart][scheduleShifts.shiftName] =
              // @ts-ignore
              scheduleShifts;

            // assign other properties to the result object
            result[requestDate] = { ...result[requestDate] };
            break;

          default:
            break;
        }
      });
    }

    return result;
  }

  earlyColor(requestTime: DayPart) {
    switch (requestTime) {
      case 'm':
        return 'color-4-100';

      case 'a':
        return 'color-12-100';

      case 'n':
        return 'color-7-100';
    }
  }

  lateColor(requestTime: DayPart) {
    switch (requestTime) {
      case 'n':
        return 'color-4-100';

      case 'm':
        return 'color-12-100';

      case 'a':
        return 'color-7-100';
    }
  }

  setColorRequestType(requestTime: DayPart): string {
    return this.timePeriod === 'early' ? this.earlyColor(requestTime) : this.lateColor(requestTime);
  }

  convertDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private moveUserToFirstArray() {
    const index = this.scheduleData?.schedulePractitioner?.findIndex((obj) => {
      return obj.practitionerId === this.practitionerId;
    });

    if (index !== -1) {
      const item = this.scheduleData?.schedulePractitioner?.splice(index!, 1)[0];
      this.scheduleData?.schedulePractitioner?.unshift(item as any);
    }

    return true;
  }

  @state()
  private shouldNotAllowedWeekOffSelect?: boolean;

  private scrollValueFirstDateMonth?: {
    date: string;
    scrollValue: number;
    index: number;
  }[];

  isSameMonth(date1: string, date2: string): boolean {
    return (
      new Date(date1).getMonth() === new Date(date2).getMonth() &&
      new Date(date1).getFullYear() === new Date(date2).getFullYear()
    );
  }

  shouldScrollErrorTarget = false;
  initialScroll = false;

  firstTableUpdated = false;
  updated(changedProp: Map<string, unknown>) {
    if (this.firstTableUpdated === false) {
      const clearTimer = setInterval(() => {
        const currentMonthTitleDisplayElement = this.querySelector('.currentMonthTitleDisplay');
        if (currentMonthTitleDisplayElement?.children[0]?.tagName === 'SPAN') {
          clearInterval(clearTimer);
          this.firstTableUpdated = true;
        } else {
          this.updateTable(changedProp);
        }
      }, 500);
    }
    if (changedProp.has('userHoverIndex')) return;
    this.updateTable(changedProp);
  }

  private updateTable(changedProp: Map<string, unknown>) {
    const tableWrapper = this.querySelector('.lit-virtualizer');
    const errorDayRequest = this.querySelector('.error-day-request');

    if (changedProp.has('errorDayRequest')) {
      this.shouldScrollErrorTarget = true;
    }

    // handle error scroll to focus
    if (errorDayRequest && this.shouldScrollErrorTarget) {
      const left = tableWrapper?.getBoundingClientRect().left;
      setTimeout(() => {
        const errorRect = errorDayRequest?.getBoundingClientRect();
        const scrollErrorValue = errorRect?.left;
        tableWrapper?.scrollTo({
          top: 0,
          left: Math.floor(scrollErrorValue! - (left! + 260)),
          behavior: 'smooth',
        });
      }, 750);

      this.shouldScrollErrorTarget = false;
    }
    if (this.requestSelected?.abbr === 'woff') {
      const targetElement = tableWrapper?.children[this.userHoverIndex];
      const allShipTypes = targetElement?.querySelectorAll('c-box[shift-type="woff-saved"]');
      this.shouldNotAllowedWeekOffSelect = allShipTypes?.length === this.maxWeekOFf;
    }
    // remove borderRight last element
    const weekMonthTitle = this.querySelector('#week-month-title');
    const weekMonthUser = this.querySelector('#week-month-user');
    const lastTableIndexTitle =
      weekMonthTitle?.lastElementChild?.lastElementChild?.lastElementChild;
    const lastTableIndexUser = weekMonthUser?.firstElementChild?.lastElementChild as HTMLElement;

    const lastMonthEle = lastTableIndexTitle?.children.item(0) as HTMLElement;
    const lastWeekEle = lastTableIndexTitle?.children.item(1)?.lastElementChild as HTMLElement;
    if (!lastWeekEle || !lastMonthEle || !lastTableIndexUser) return;
    requestAnimationFrame(() => {
      lastMonthEle.style.borderRight = 'var(--size-1) solid var(--primary-100)';
      lastWeekEle.style.borderRight = 'var(--size-1) solid var(--primary-100)';
      lastTableIndexUser.style.borderRight = 'var(--size-1) solid var(--primary-100)';
    });

    // sr
    const shiftPlandatepicker = this.querySelectorAll('.shift-plan-datepicker');
    const woffSaved = this.querySelectorAll('.woff-saved');
    if (this.isRemoveMode) {
      shiftPlandatepicker.forEach((ele) => {
        ele?.setAttribute('cursor-pointer', '');
      });

      woffSaved.forEach((ele) => {
        ele?.setAttribute('cursor-pointer', '');
      });
    } else {
      shiftPlandatepicker.forEach((ele) => {
        ele?.removeAttribute('cursor-pointer');
      });

      woffSaved.forEach((ele) => {
        ele?.removeAttribute('cursor-pointer');
      });
    }

    this.disableDateArranged = this.getDateDisabled(
      this.disableDates,
      this.scheduleData?.startDate,
      this.scheduleData?.endDate
    );

    this.holidayWithKeyMap = this.getHolidayObject(this.holidays);

    //
    if (this.tableWrapperRef.value) {
      const tableHeaderWrapper = this.querySelector('#table-header-wrapper');
      const litVirtualizer = this.querySelector('.lit-virtualizer');

      const firstDateOfMonths = this.querySelectorAll('.first-date-of-month');
      const startDateOgMonth = this.querySelector('.start-date-of-month');

      const firstDateOfMonthsArray = Array.from(firstDateOfMonths);

      if (startDateOgMonth) {
        firstDateOfMonthsArray.unshift(startDateOgMonth);
      }

      if (!this.scrollValueFirstDateMonth) {
        debounce(() => {
          this.scrollValueFirstDateMonth = structuredClone(
            firstDateOfMonthsArray
              .map((ele, index) => {
                return {
                  scrollValue: Math.floor(ele.getBoundingClientRect().left),
                  date: ele.getAttribute('data-first-date'),
                };
              })
              ?.sort((a, b) => a.scrollValue - b.scrollValue)
              .map((res, index) => ({ ...res, index }))
          ) as any;
        }, 250);
      }
      if (tableHeaderWrapper && litVirtualizer && this.initialScroll === false) {
        this.initialScroll = true;
        tableHeaderWrapper.addEventListener('scroll', (e) => {
          if (this.scrollValueFirstDateMonth) {
            tableHeaderWrapper.scrollLeft = this.currentScrollX;
          }
        });
        litVirtualizer.addEventListener('scroll', (e) => {
          if (this.scrollValueFirstDateMonth) {
            const target = e.target as HTMLElement;
            const left = target.getBoundingClientRect().left + 260;
            const scrollValue = target.scrollLeft + left;
            let value = {} as {
              date: string;
              scrollValue: number;
              index: number;
            };
            for (let index = 0; index <= this.scrollValueFirstDateMonth.length; index++) {
              const current = this.scrollValueFirstDateMonth[index];
              const next = this.scrollValueFirstDateMonth[index + 1];
              if (scrollValue >= current?.scrollValue && scrollValue <= next?.scrollValue) {
                value = current;
              } else if (!next && !Object.keys(value).length) {
                value = this.scrollValueFirstDateMonth[this.scrollValueFirstDateMonth.length - 1];
              }
            }
            this.currentMonthTitleDisplay = value.date;
            if (this.scrollValueFirstDateMonth[0].date === this.currentMonthTitleDisplay) {
              this.shouldArrowLeftDisable = true;
            } else {
              this.shouldArrowLeftDisable = false;
            }

            if (
              this.scrollValueFirstDateMonth[this.scrollValueFirstDateMonth.length - 1].date ===
              this.currentMonthTitleDisplay
            ) {
              this.shouldArrowRightDisable = true;
            } else {
              this.shouldArrowRightDisable = false;
            }
            this.currentScrollX = litVirtualizer.scrollLeft;
            tableHeaderWrapper.scrollLeft = this.currentScrollX;
            this.closePopover();
          }
        });
      }

      if (!this.monthTitleNav) {
        this.monthTitleNav = this.querySelector('.start-date-of-month');

        if (!this.monthTitleNav) {
          this.monthTitleNav = this.querySelector('.first-date-of-month');
        }

        this.currentMonthTitleDisplay = this.monthTitleNav?.dataset.firstDate;
      }

      setTimeout(() => {
        // right
        const monthValRight = this.scrollValueFirstDateMonth?.find(
          (res) => res.date === this.currentMonthTitleDisplay
        );

        if (
          typeof monthValRight === 'undefined' ||
          monthValRight?.index === this.scrollValueFirstDateMonth!.length - 1
        ) {
          this.shouldArrowRightDisable = true;
        } else {
          this.shouldArrowRightDisable = false;
        }

        // left
        const monthValLeft = this.scrollValueFirstDateMonth?.find(
          (res) => res.date === this.currentMonthTitleDisplay
        );
        if (typeof monthValLeft === 'undefined' || monthValLeft?.index === 0) {
          this.shouldArrowLeftDisable = true;
        } else {
          this.shouldArrowLeftDisable = false;
        }
      }, 250);
    }

    super.update(changedProp);
  }

  private setVacDayOff(practitioner: SchedulePractitionerEntity, allowedExecute?: boolean) {
    if (typeof this.vacDayOff[(practitioner.practitioner as Practitioner).id] === 'number') return;
    if ((practitioner && this.requestSelected?.abbr === 'vac') || allowedExecute) {
      // const initialOff = (
      //   practitioner.schedulePractitionerRequest as SchedulePractitionerRequestEntity[]
      // ).filter((res) => res.requestType.abbr === 'vac');
      // const saveVac = Object.keys(this.shiftVacRequestSaved?.[practitioner.id]?.request || {});
      // this.mayDayOffLength = initialOff.length + savedOff.length;
      // if (!this.maxDayOffLength?.[(practitioner.practitioner as any).id]) {
      //   (this.maxDayOffLength as any)[(practitioner.practitioner as any).id] = {};
      // }

      // this.maxDayOffLength[(practitioner.practitioner as any).id].vacation =
      //   initialOff.length + saveVac.length;

      // cache initial value
      const findVacation = (practitioner!.practitioner as Practitioner).vacations!.find(
        (res) => res!.year === new Date(this.currentTime).getFullYear()
      );
      this.vacDayOff[(practitioner.practitioner as Practitioner).id] = findVacation!.vacation;
      this.requestUpdate();
    }
  }

  private maxDayOffLength: Record<string, Record<'dayOff' | 'vacation', number>> = {};

  private vacDayOff: { [practitionerId: string]: number } = {};

  private currentScrollX = 0;

  // @ts-ignore
  getDateDisabled(holidays, startDate, endDate) {
    const result = {};

    // Loop through each holiday object in the array
    // @ts-ignore
    holidays.forEach((holiday) => {
      // If the holiday occurs only once, check if it falls within the date range
      // @ts-ignore
      if (holiday.repetition === 'once' && holiday.date >= startDate && holiday.date <= endDate) {
        // @ts-ignore
        result[holiday.date] = holiday;
      }
      // If the holiday occurs every week, calculate occurrence dates between the date range
      else if (holiday.repetition === 'every-week') {
        let currentDate = holiday.date;
        while (currentDate <= endDate) {
          // @ts-ignore
          if (currentDate >= startDate) {
            // @ts-ignore
            result[currentDate] = { ...holiday, date: currentDate };
          }
          const nextWeek = new Date(currentDate);
          nextWeek.setDate(nextWeek.getDate() + 7);
          currentDate = nextWeek.toISOString().slice(0, 10);
        }
      }
      // If the holiday occurs every month, calculate occurrence dates between the date range
      else if (holiday.repetition === 'every-month') {
        let currentDate = new Date(holiday.date);
        while (currentDate <= new Date(endDate)) {
          const dateStr = currentDate.toISOString().slice(0, 10);
          // @ts-ignore
          if (dateStr >= startDate && dateStr <= endDate) {
            // @ts-ignore
            result[dateStr] = { ...holiday, date: dateStr };
          }
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
      // If the holiday occurs every year, calculate occurrence dates between the date range
      else if (holiday.repetition === 'every-year') {
        let currentDate = new Date(holiday.date);
        while (currentDate <= new Date(endDate)) {
          const dateStr = currentDate.toISOString().slice(0, 10);
          if (dateStr >= startDate && dateStr <= endDate) {
            // @ts-ignore
            result[dateStr] = { ...holiday, date: dateStr };
          }
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
      }
    });

    return result;
  }

  dateRangeIntersect(startDate: Date, endDate: Date, dateSameCheck: string[]): string[] {
    const result: string[] = [];
    const start = startDate.getTime();
    const end = endDate.getTime();

    for (let dateStr of dateSameCheck) {
      const currentTime = new Date(dateStr).getTime();
      if (currentTime >= start && currentTime <= end) {
        result.push(dateStr);
      }
    }
    return result;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  generateDayOff(
    startDate: Date,
    endDate: Date,
    dayOffExist: string[],
    dayOff: number,
    disabledDate: string[] = [],
    initialDate: string[] = []
  ): string[] {
    const existingDaysOff: Set<string> = new Set([...dayOffExist, ...initialDate]);
    const disabledDays: Set<string> = new Set(disabledDate);

    let availableDays: string[] = [...Array.from(existingDaysOff)];
    let newDaysOff: number = 0; // Counter for newly added days off

    for (
      let currentDate = new Date(startDate.getTime());
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dateString: string =
        currentDate.getFullYear().toString().padStart(4, '0') +
        '-' +
        (currentDate.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        currentDate.getDate().toString().padStart(2, '0');

      if (!disabledDays.has(dateString)) {
        if (!existingDaysOff.has(dateString) && newDaysOff < dayOff) {
          availableDays.push(dateString);
          newDaysOff++; // Increment the newDaysOff only when we add a new day
        }
      }
    }

    return availableDays;
  }

  getHolidayObject(inputArray: HolidayObject[]): { [key: string]: HolidayObject } {
    const outputObject: { [key: string]: HolidayObject } = {};

    inputArray.forEach((item) => {
      outputObject[item.date] = item;
    });

    return outputObject;
  }

  increaseDate(days: number, date: Date): Date {
    const newDate: Date = new Date(date.getTime());
    newDate.setDate(date.getDate() + days);
    return newDate;
  }

  getDateBetween(startDate: Date, endDate: Date): DateBetweenData[] {
    const result: DateBetweenData[] = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      const currentWeekday = currentDate.getDay();
      if (currentWeekday === 1) {
        const currentWeek: Date[] = [new Date(currentDate)];
        while (currentWeek.length < 7 && currentDate < endDate) {
          currentDate.setDate(currentDate.getDate() + 1);
          currentWeek.push(new Date(currentDate));
        }
        if (!result.find(({ currentMonth: cm }) => cm === currentMonth)) {
          result.push({ currentMonth, dateBetween: [] });
        }
        result.find(({ currentMonth: cm }) => cm === currentMonth)?.dateBetween.push(currentWeek);
      } else if (!result.find(({ currentMonth: cm }) => cm === currentMonth)) {
        result.push({ currentMonth, dateBetween: [[new Date(currentDate)]] });
      } else {
        result
          .find(({ currentMonth: cm }) => cm === currentMonth)
          ?.dateBetween[result[result.length - 1].dateBetween.length - 1].push(
            new Date(currentDate)
          );
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  reduceDate = (date: Date, n: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - n);
    return newDate;
  };

  daysBetween = (startDate: Date, endDate: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffInMs = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.round(diffInMs / oneDay);
  };

  createRenderRoot() {
    return this;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    ModalCaller.popover().clear();
  }
}
declare global {
  namespace CXShiftSchedule {
    type Ref = ShiftSchedule;
  }
}
