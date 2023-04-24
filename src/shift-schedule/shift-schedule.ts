import { LitElement, html, PropertyValueMap, render, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  getDateBetweenArrayDate,
  getDateBetweenArrayNumber,
} from '@cortex-ui/core/cx/helpers/functions/date/date-methods';
import '@cortex-ui/core/cx/c-box';
import '@cortex-ui/core/cx/modal';
import '@cortex-ui/core/cx/theme';
import '@cortex-ui/core/cx/icon';
import '@cortex-ui/core/cx/button';
import '@cortex-ui/core/cx/datepicker';
import '@cortex-ui/core/cx/popover';
import './components/request-button';
import { CBoxUiAttribute } from '@cortex-ui/core/cx/components/c-box/types/attribute-changed.types';
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
  dayPortValue,
  genderType,
  shiftPlanIcon,
  DateObject as HolidayObject,
  Practitioner,
  ScheduleErrorDayRequest,
} from './schedule.types';
import { createRef, ref } from 'lit/directives/ref.js';
import { ScheduleRequestDetailResponse, ScheduleRequestType } from './schedule-client.typess';
import { ModalCaller } from '@cortex-ui/core/cx/helpers/ModalCaller';
import '@lit-labs/virtualizer';

@customElement('cx-shift-schedule')
export class ShiftSchedule extends LitElement {
  private buttonGroupUI = 'buttonGroupUI: flex items-center col-gap-24 px-24';
  private scheduleTitleUI = 'scheduleTitleUI: inline-flex';
  private tableLineUI = 'tableLineUI: border-1 border-solid border-gray-300 border-box';
  private titleLeftTopUI = 'titleLeftTopUI: pl-12 flex flex-col pt-42 border-box';
  private genderBox = `genderBox: absolute right-0 top-26 width tx-10 w-16 h-16 tx-white! flex justify-center items-center round-full z-1`;
  private requestBox = 'requestBox: min-w-90 inline-flex flex-col';
  private userTitle = 'userTitle: flex col-gap-6 p-12 border-box';
  private weekDayUI = 'weekDayUI: py-6 min-w-90 pl-12 border-box';
  private weekDayWRapperUI = 'weekDayWRapperUI: flex';
  private monthEachUI = 'monthEachUI: tx-12 pl-12 py-6 border-right-solid';
  private sundayBorderRightUI = 'sundayBorderRightUI: border-right-2! border-right-primary-500!';
  private titleSticky = 'titleSticky: sticky top-0 left-0 bg-white';
  private tableWrapperUI = 'tableWrapperUI: inline-flex flex-col';
  private iconTitleWrapper = (color: string) =>
    `iconTitleWrapper: inline-flex round-24 border-1 border-${color} border-solid items-center col-gap-6 pr-12`;
  private iconTitle = (color: string) =>
    `iconTitle: round-full w-32 h-32 bg-${color} flex justify-center items-center`;

  private weekendBg = 'weekendBg: bg-pinky-25! w-full h-full';

  @property({ type: Object }) public currentTime = new Date();

  @property({ type: String })
  viewerRole: 'manager' | 'staff' = 'staff';

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

  private currentMonthTitleIndex = 0;

  public tableWrapperRef = createRef<HTMLDivElement>();
  public dividerRef = createRef<HTMLDivElement>();
  public remarkRef = createRef<HTMLInputElement>();
  private currentPopoverRef?: CXPopover.Ref;
  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has('scheduleData')) {
      this.moveUserToFirstArray();

      this.dateBetween = this.getDateBetween(
        new Date((this.scheduleData as SchedulingData)?.startDate!),
        new Date((this.scheduleData as SchedulingData)?.endDate!)
      );
    }

    super.willUpdate(_changedProperties);
  }

  dateFormat(date: Date | number | string | undefined, options?: Intl.DateTimeFormatOptions) {
    if (!date) return;
    let newDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return new Intl.DateTimeFormat('th-TH', options).format(newDate);
  }

  renderRequestButton() {
    return html`
      ${(this.requestTypes as RequestType[])?.map((type) => {
        const { accentColor, iconSrc, iconBgColor } = requestTypeStyles[type.abbr];
        return html` <request-button
          @click="${() => this.selectRequest(type as RequestType)}"
          .currentType="${this.requestSelected}"
          .requestType="${type}"
          text="${type.name}"
          icon="${iconSrc}"
          iconBgColor="${iconBgColor}"
          accentColor="${accentColor}"></request-button>`;
      })}
    `;
  }

  selectRequest(type: RequestType) {
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

  private calcHeightOfUserTable() {
    const theme = document.body.querySelector('cx-theme');
    const userTable = this.querySelector('#week-month-user');

    setTimeout(() => {
      const heightOfTheme = theme?.getBoundingClientRect();
      const userTableTop = userTable?.getBoundingClientRect();
      this.maxHeightOfUserTable = Math.floor(heightOfTheme?.height! - userTableTop?.top!);
    }, 250);
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
    this.requestSelected = undefined;
    this.isRemoveMode = true;
  }

  private holidayWithKeyMap: {
    [date: string]: HolidayObject;
  } = {};

  @state()
  isRemoveMode = false;

  @state()
  dividerTop = 0;

  private monthTitleNav?: NodeListOf<HTMLElement>;

  @state()
  currentMonthTitleDisplay?: string;

  render() {
    return html`
      <style>
        c-box {
          transition: all 0.2 ease !important;
        }

        #table-header-wrapper::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }

        .lit-virtualizer {
          overflow: auto;
        }

        .lit-virtualizer::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }

        :host {
          --cbox-divider-width: 100%;
          --cbox-divider-top: 0;
        }

        .element-visible {
          opacity: 1;
        }

        .element-hidden {
          opacity: 0.4;
        }

        c-box {
          color: var(--gray-800);
        }

        .focus-divider {
          border-bottom: 2px solid var(--primary-500) !important;
        }

        .user-border-focus {
          transition: outline 0.15s ease;
          outline: 4px solid var(--color-5-200);
        }

        input::placeholder {
          font-family: Sarabun-Regular;
          font-size: 16px;
        }
        c-box[icon-prefix].icon-daypart-sr::before {
          height: 18px;
        }

        .bg-pinky {
          background: var(--pinky-25);
        }

        c-box[_ui='targetUser'] {
          transition: all 0.25s ease;
        }

        .hover-request {
          cursor: pointer;
        }

        .srDayPart {
          cursor: pointer;
        }

        .diagonal-pattern {
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            135deg,
            var(--pinky-25),
            var(--pinky-25) 4px,
            #ffffff 4px,
            #ffffff 8px
          );
        }

        .cbox-divider {
          transition: all 0.125s ease;
          width: var(--cbox-divider-width);
          translate: 0 var(--cbox-divider-top);
          height: 2px;
          background-color: var(--primary-100);
          z-index: 1;
        }

        c-box[input-box].remark-input {
          width: var(--size-284) !important;
          border: 2px solid var(--gray-400) !important;
        }
      </style>
      <c-box style="height:${this.maxHeight || '100%'}" relative overflow-hidden>
        <c-box class="cbox-divider" absolute ${ref(this.dividerRef)}></c-box>
        <c-box bg-white flex flex-col row-gap-24>
          ${this.mode === 'edit'
            ? html` <c-box ui="${this.buttonGroupUI}">
                <c-box whitespace-pre> เลือกรูปแบบคำขอเวร </c-box>
                ${this.renderRequestButton()}
                <c-box inline h-40 w-1 bg-gray-400></c-box>
                <c-box
                  @click="${this.setRemoveMode}"
                  shadow-hover="shadow-3"
                  inline-flex
                  items-center
                  col-gap-8
                  round-44
                  w-96
                  border-solid
                  border-1
                  cursor-pointer
                  style="border-color: var(--neutral-200)"
                  ui-active="${this.isRemoveMode
                    ? 'bg: bg-' + 'neutral-500' + '!'
                    : 'bg: bg-' + 'neutral-200' + '!'}"
                  bg="${this.isRemoveMode ? 'neutral-500' : 'white'}">
                  <c-box
                    flex-center
                    icon-prefix="20 close-circle-line ${this.isRemoveMode
                      ? 'white!'
                      : 'neutral-500'}"
                    w-44
                    h-44
                    round-full
                    bg="${this.isRemoveMode ? 'neutral-500' : 'neutral-200'}">
                  </c-box>
                  <c-box
                    transition="all 0.2s ease"
                    ui="_:${this.isRemoveMode ? 'tx-white' : 'tx-gray-800'}"
                    >ลบ</c-box
                  >
                </c-box>
              </c-box>`
            : undefined}

          <c-box ${ref(this.tableWrapperRef)} ui="${this.tableLineUI}" style="border-radius:8px">
            <c-box ui="${this.tableWrapperUI}" style="width: var(--table-width)">
              <c-box ui="${this.scheduleTitleUI}" overflow-x-auto id="table-header-wrapper">
                <!-- FIXME: should titleSticky below -->
                <c-box
                  UI="${this.tableLineUI}, ${this.titleLeftTopUI}, ${this.titleSticky} "
                  min-w="260">
                  <c-box semiBold>รายชื่อเจ้าหน้าที่</c-box>
                  <c-box>ทั้งหมด ${this.scheduleData?.schedulePractitioner?.length} คน</c-box>
                </c-box>

                <c-box flex id="week-month-title">
                  <c-box absolute top-73 left="274" h-26 pt-4 flex items-center col-gap-6>
                    ${this.isOneMonth
                      ? undefined
                      : html` <c-box
                          ui="_: w-24 h-24 round-full flex-center"
                          ui-active="_1: bg-primary-100"
                          icon-suffix="8 angle-left-u gray-600"
                          transition-200
                          cursor-pointer
                          @click="${() => this.goToMonth('previous')}"></c-box>`}

                    <c-box
                      w-90
                      flex
                      style="${this.isOneMonth ? '' : 'justify-content: center'}"
                      tx-12
                      tx-gray-600>
                      ${this.dateFormat(this.currentMonthTitleDisplay, {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </c-box>

                    ${this.isOneMonth
                      ? undefined
                      : html`<c-box
                          ui="_: w-24 h-24 round-full flex-center"
                          ui-active="_1: bg-primary-100"
                          transition-200
                          icon-suffix="8 angle-right-u gray-600"
                          cursor-pointer
                          @click="${() => this.goToMonth('next')}"></c-box>`}
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

                        <c-box ui=${this.weekDayWRapperUI}>
                          ${dateBet.dateBetween.map((weekday) => {
                            return html`
                              <c-box flex flex-col>
                                <c-box
                                  ui="${this.monthEachUI}, ${this.sundayBorderRightUI}, ${this
                                    .tableLineUI}">
                                  ${this.dateFormat(dateBet.currentMonth, {
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </c-box>

                                <c-box flex>
                                  ${weekday.map((date, dateIndex) => {
                                    const isSunday =
                                      date.getDay() === 0 ? this.sundayBorderRightUI : '';

                                    const isHoliday =
                                      this.holidayWithKeyMap?.[this.convertDateToString(date)];

                                    const isWeekend =
                                      isHoliday || date.getDay() === 0 || date.getDay() === 6
                                        ? this.weekendBg
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
                                        : dateIndex === 0
                                        ? 'start-date-of-month'
                                        : ''}"
                                      ui="${isSunday}, ${this.tableLineUI}, ${this
                                        .weekDayUI}, ${isWeekend}">
                                      <c-box tx-12 tx-gray-500>
                                        ${this.dateFormat(date, {
                                          weekday: 'short',
                                        })}
                                      </c-box>
                                      <c-box
                                        tx-14
                                        style="color:${isHoliday
                                          ? 'var(--color-9-500)'
                                          : isWeekend
                                          ? 'var(--gray-500)'
                                          : 'var(--gray-800)'}; font-weight: ${isHoliday
                                          ? '600'
                                          : '400'}">
                                        ${this.dateFormat(date, {
                                          day: 'numeric',
                                        })}
                                      </c-box>
                                    </c-box>`;
                                  })}
                                </c-box>
                              </c-box>
                            `;
                          })}
                        </c-box>
                      </c-box>
                    `;
                  })}
                </c-box>
              </c-box>

              <c-box
                inline-flex
                flex-col
                id="week-month-user"
                style="height:${this.maxHeightOfUserTable!}px; width:var(--table-width)">
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
                        <c-box
                          flex
                          ui="targetUser: ${targetUser ? 'order-first' : ''}"
                          @click="${() => {
                            if (this.mode === 'view') {
                              this.dispatchEvent(
                                new CustomEvent('focus-request', {
                                  detail: { practitioner: practitioner },
                                })
                              );
                            }
                          }}">
                          <c-box
                            @mouseenter="${this.viewerRole === 'manager'
                              ? (e: MouseEvent) => this.managerHoverUser(indexUser, e, practitioner)
                              : null}"
                            style="cursor:${this.requestSelected ? 'pointer' : 'default'}"
                            min-w="260"
                            class="${(this.viewerRole === 'staff' && indexUser === 0) ||
                            (this.viewerRole === 'manager' &&
                              indexUser === this.userSelectedIndex &&
                              this.requestSelected)
                              ? 'focus-divider'
                              : ''}"
                            @click="${() => {
                              if (this.viewerRole === 'manager' && this.requestSelected) {
                                this.userSelectedIndex = indexUser;
                                this.dispatchEvent(
                                  new CustomEvent('focus-request', {
                                    detail: { practitioner: practitioner },
                                  })
                                );
                              }
                            }}"
                            ui="${this.userTitle}, ${this.tableLineUI}, ${this.titleSticky}">
                            <c-box relative top-0 left-0>
                              <c-box
                                round-full
                                flex-center
                                class="${(this.viewerRole === 'staff' && indexUser === 0) ||
                                (this.viewerRole === 'manager' &&
                                  indexUser === this.userSelectedIndex &&
                                  this.requestSelected)
                                  ? 'user-border-focus'
                                  : ''}">
                                <c-box
                                  round-full
                                  flex-center
                                  border="2 solid ${gender === 'M'
                                    ? 'primary-500'
                                    : 'color-9-500'}">
                                  <img
                                    style="border-radius: 50%"
                                    width="32px"
                                    height="32px"
                                    src="${this.userImgDefault || ''}"
                                    alt="" />
                                </c-box>
                              </c-box>

                              <c-box
                                ui="${this.genderBox}"
                                bg="${gender === 'M' ? 'primary-500' : 'color-9-500'}">
                                ${genderType[gender as 'M' | 'F']}
                              </c-box>
                            </c-box>

                            <c-box>
                              <c-box tx-14> ${nameGiven} ${nameFamily}</c-box>
                              <c-box tx-12
                                >${practitionerRole.name}, ${practitionerLevel.name}</c-box
                              >
                            </c-box>
                          </c-box>

                          ${this.dateBetween?.map((dateBet) => {
                            return html`
                              ${dateBet.dateBetween.map((week) => {
                                return html`
                                  ${week.map((day) => {
                                    day.setHours(0, 0, 0, 0);
                                    const borderRight =
                                      day.getDay() === 0 ? this.sundayBorderRightUI : '';

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

                                    return html` <c-box
                                      @mouseenter="${this.viewerRole === 'manager'
                                        ? (e: MouseEvent) =>
                                            this.managerHoverUser(indexUser, e, practitioner)
                                        : null}"
                                      ui="${this.tableLineUI}, ${this.requestBox}, ${borderRight}"
                                      class="${(this.viewerRole === 'staff' && indexUser === 0) ||
                                      (this.viewerRole === 'manager' &&
                                        indexUser === this.userSelectedIndex &&
                                        this.requestSelected)
                                        ? 'focus-divider'
                                        : ''} ${isWeekend || isHoliday ? 'bg-pinky' : ''}"
                                      style="${isErrorDayRequest
                                        ? 'border: 2px solid #F3655C'
                                        : ''}">
                                      <c-box
                                        w-full
                                        h-full
                                        style="opacity:${(this.viewerRole === 'staff' &&
                                          indexUser === 0) ||
                                        this.viewerRole === 'manager'
                                          ? '1'
                                          : '0.6'}; max-width:88px; word-break:break-all;
                                          ${(this.requestSelected?.abbr === 'off' &&
                                          (practitioner?.practitioner?.leave?.dayOff === 0 ||
                                            this.maxDayOffLength?.[
                                              (practitioner.practitioner as any).id
                                            ]?.dayOff >=
                                              practitioner?.practitioner?.leave?.dayOff)) ||
                                        (this.requestSelected?.abbr === 'vac' &&
                                          (this.vacDayOff?.[
                                            (practitioner.practitioner as any).id
                                          ] === 0 ||
                                            this.maxDayOffLength?.[
                                              (practitioner.practitioner as any).id
                                            ]?.vacation >=
                                              this.vacDayOff?.[
                                                (practitioner.practitioner as any).id
                                              ]))
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
                                          ? this.renderShiftPlanSaved(
                                              semSaved?.request?.[dateString],
                                              'sem',
                                              practitioner,
                                              day,
                                              indexUser
                                            )
                                          : offSaved?.request?.[dateString]
                                          ? this.renderShiftPlanSaved(
                                              offSaved?.request?.[dateString],
                                              'off',
                                              practitioner,
                                              day,
                                              indexUser
                                            )
                                          : vacSaved?.request?.[dateString]
                                          ? this.renderShiftPlanSaved(
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
                                      </c-box>
                                    </c-box>`;
                                  })}
                                `;
                              })}
                            `;
                          })}
                        </c-box>
                      `;
                    }
                  )}
                </div>
              </c-box>
            </c-box>
          </c-box>
        </c-box>
      </c-box>
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
          '--cbox-divider-top',
          `${Math.floor(targetRect.bottom - hostRect.top)}px`
        );
        this.dividerRef.value.style.setProperty('--cbox-divider-width', `${tableRect?.width}px`);
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
    return html` <c-box
      @click="${() => this.removeSrPlan(dateString, practitioner)}"
      w-full
      h-full
      shift-type="sr-saved"
      slot="host"
      cursor="${this.requestSelected || this.isRemoveMode ? 'pointer' : 'default'}">
      ${planEntries
        ?.sort((a, b) => {
          const indexMap = { m: 0, a: 1, n: 2 };
          // @ts-ignore
          return indexMap[a[0]] - indexMap[b[0]];
        })
        ?.map(([dayPart, plans]) => {
          return html`
            <c-box p-4 border-box flex flex-col row-gap-4>
              <c-box
                class="${this.isRemoveMode || this.requestSelected ? 'srDayPart' : ''} "
                p-4
                border-box
                round-6
                h-44
                bg="${this.setColorRequestType(dayPart as DayPart)}">
                <c-box>
                  <c-box
                    class="icon-daypart-sr"
                    icon-prefix="${dayPortValue[dayPart as DayPart].size} ${dayPortValue[
                      dayPart as DayPart
                    ].src} ${dayPortValue[dayPart as DayPart].iconColor}"
                    flex
                    flex-col>
                    <c-box flex col-gap-4 tx-12 mt-4
                      >${Object.keys(plans).map((plan) => {
                        return html`<c-box inline>${plan}</c-box>`;
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

          this.sentRemoveEvent();
          this.requestUpdate();
        }

        if (type === 'vac') {
          delete this.shiftVacRequestSaved[practitioner.id].request[data.dateString!];
          this.removeRequestSelected = this.findRequestType('vac');
          this.sentRemoveEvent();
          this.requestUpdate();
        }
      }
    }
  }

  findRequestType(abbr: string) {
    return this.requestTypes?.find((res) => res.abbr === abbr) as RequestType;
  }

  renderShiftPlanHost(
    data: { dateString?: string; remark?: string; initial?: boolean },
    type: RequestType['abbr']
  ) {
    return html`${data?.remark
      ? html`<c-box
          slot="host"
          shift-type="${type}-saved"
          flex
          flex-col
          tx-12
          icon-prefix="16 ${shiftPlanIcon?.[type]} ${requestTypeStyles?.[type]?.accentColor}">
          ${data.remark}
        </c-box>`
      : html`<c-box
          slot="host"
          flex
          shift-type="${type}-saved"
          justify-center
          items-center
          h-full
          icon-prefix="26 ${shiftPlanIcon?.[type]} ${requestTypeStyles?.[type]?.accentColor}">
        </c-box>`}`;
  }

  renderShiftPlanSaved(
    data: { dateString?: string; remark?: string; initial?: boolean },
    type: RequestType['abbr'],
    practitioner: SchedulePractitionerEntity,
    date: Date,
    indexUser: number
  ) {
    const cellId = `sem-saved-shift-cell-${indexUser}`;

    return html`<c-box p-4 border-box h-full w-full slot="host" shift-type="${type}-saved">
      <c-box
        id="${cellId}-${data.dateString}"
        style="pointer-events:${(this.requestSelected?.abbr === 'off' &&
          (practitioner?.practitioner?.leave?.dayOff === 0 ||
            this.maxDayOffLength?.[(practitioner.practitioner as any).id]?.dayOff >=
              practitioner?.practitioner?.leave?.dayOff)) ||
        (this.requestSelected?.abbr === 'vac' &&
          (this.vacDayOff?.[(practitioner.practitioner as any).id] === 0 ||
            this.maxDayOffLength?.[(practitioner.practitioner as any).id]?.vacation >=
              this.vacDayOff?.[(practitioner.practitioner as any).id]))
          ? 'none'
          : '   '}"
        class="shift-plan-datepicker ${this.requestSelected || this.isRemoveMode
          ? 'hover-request'
          : ''}"
        bg-modern-green-100
        bg="${requestTypeStyles?.[type]?.iconBgColor}"
        h-full
        w-full
        round-6
        p-6
        border-box
        @click="${this.isRemoveMode
          ? () => this.removeShiftDatePicker(data, type, practitioner)
          : this.requestSelected?.abbr !== 'woff'
          ? (e: PointerEvent) => {
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
                })!,
                this.renderShiftPlanHost(data, type)
              );
            }
          : () => {
              this.saveWoffRequest(date, practitioner, data.dateString!);
              this.requestUpdate();
            }}">
        ${this.renderShiftPlanHost(data, type)}
      </c-box>
    </c-box>`;
  }

  removeInitialSr(practitioner: SchedulePractitionerEntity, dateString: string) {
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
    const litVirtualizer = this.querySelector('.lit-virtualizer');
    if (litVirtualizer) {
      this.currentMonthTitleIndex =
        this.currentMonthTitleIndex === this.monthTitleNav!.length - 1
          ? type === 'next'
            ? this.currentMonthTitleIndex
            : this.currentMonthTitleIndex - 1
          : this.currentMonthTitleIndex +
            (type === 'next' ? 1 : this.currentMonthTitleIndex > 0 ? -1 : 0);

      const nextElement = this.monthTitleNav![this.currentMonthTitleIndex];

      if (this.monthTitleNav![this.currentMonthTitleIndex]) {
        litVirtualizer.scrollTo({
          top: 0,
          left: nextElement.offsetLeft - this.monthTitleNav![0].offsetLeft,
          behavior: 'smooth',
        });
        this.currentMonthTitleDisplay =
          this.monthTitleNav![this.currentMonthTitleIndex].dataset.firstDate;
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
      ${Object.entries(request.arrangedRequest!).map(([dayPart, plans]) => {
        const plansEntries = Object.entries(plans);
        return html`
          <c-box p-4 border-box flex flex-col row-gap-4 border-box>
            <c-box
              border-box
              p-4
              border-box
              round-6
              h-44
              bg="${this.setColorRequestType(dayPart as DayPart)}">
              <div
                style="cursor:${this.requestSelected || this.isRemoveMode
                  ? 'pointer'
                  : ''}; width:100%; height:100%">
                <c-box>
                  <c-box
                    class="icon-daypart-sr"
                    icon-prefix="${dayPortValue[dayPart as DayPart].size} ${dayPortValue[
                      dayPart as DayPart
                    ].src} ${dayPortValue[dayPart as DayPart].iconColor}"
                    flex
                    flex-col>
                    <c-box
                      >${plansEntries.map(
                        ([plan]) => html`<c-box inline tx-12>${plan}</c-box> `
                      )}</c-box
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
      sem: 'ขออบรม, สัมนา, ไปราชการ',
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
        this.shiftDatepickerCache[request.requestType.abbr] = {
          dateString,
          remark: request.remark,
          initial: true,

          requestType: request.requestType.abbr,
          practitioner,
          date,
          indexUser,
        };

        return html`
          <c-box
            shift-type="${request.requestType.abbr}-init"
            w-full
            h-full
            id="${cellId}-${dateString}"
            @click="${this.requestSelected?.abbr !== 'woff'
              ? (e: PointerEvent) =>
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
                    this.renderShiftPlanSaved(
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
                  )
              : () => {
                  this.saveWoffRequest(date, practitioner, dateString);
                  this.requestUpdate();
                }}">
            ${this.renderShiftPlanSaved(
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

  saveDatepicker(e: CXDatePicker.SelectDate.Range, practitioner: SchedulePractitionerEntity) {
    // prepare dayOff
    if (e.detail.endDate && this.requestSelected?.abbr === 'off') {
      const initialDayOFfExist =
        practitioner.schedulePractitionerRequest
          ?.filter((res) => res?.requestType.abbr === 'off')
          .map((res) => res?.requestDate) || [];

      let dayOffSavedExist: string[] = Object.keys(
        this.shiftOffRequestSaved?.[practitioner.id]?.request || {}
      );

      let dayOff = practitioner.practitioner.leave.dayOff;

      const dayBetweenStartEnd = this.daysBetween(e.detail.startDate!, e.detail.endDate) + 1;

      if (dayBetweenStartEnd > dayOff) {
        const uniqueDayOffExist = [
          ...new Set([...dayOffSavedExist, ...initialDayOFfExist]),
        ] as string[];
        const generateDayOffValue = this.generateDayOff(
          e.detail.startDate!,
          e.detail.endDate,
          uniqueDayOffExist,
          dayOff
        );
        e.detail.endDate = new Date(generateDayOffValue[generateDayOffValue.length - 1]);
      }
    }

    // prepare vacation off
    if (e.detail.endDate && this.requestSelected?.abbr === 'vac') {
      const initialDayOFfExist =
        practitioner.schedulePractitionerRequest
          ?.filter((res) => res?.requestType.abbr === 'vac')
          .map((res) => res?.requestDate) || [];

      let dayOffSavedExist: string[] = Object.keys(
        this.shiftVacRequestSaved?.[practitioner.id]?.request || {}
      );

      const findVacation = practitioner!.practitioner!.vacations!.find(
        (res) => res!.year === new Date(this.currentTime).getFullYear()
      );

      let dayOff = Math.abs(15 - findVacation!.vacation);

      const dayBetweenStartEnd = this.daysBetween(e.detail.startDate!, e.detail.endDate) + 1;

      if (dayBetweenStartEnd > dayOff) {
        const uniqueDayOffExist = [
          ...new Set([...dayOffSavedExist, ...initialDayOFfExist]),
        ] as string[];
        const generateDayOffValue = this.generateDayOff(
          e.detail.startDate!,
          e.detail.endDate,
          uniqueDayOffExist,
          dayOff
        );

        e.detail.endDate = new Date(generateDayOffValue[generateDayOffValue.length - 1]);
      }
    }

    this.datepickerData = e.detail;

    (e.target as CXDatePicker.Ref)
      .fix()
      .rangeValue({ startDate: e.detail.startDate, endDate: e.detail.endDate })
      .exec();
  }

  removeInitialSameData(practitionerId: string, dateString?: string) {
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
          delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
            .schedulePractitionerRequest?.[requestIndex];
        }
      }
    }
  }

  deleteInitialDatePicker(practitionerId: string, dateBetween: Date[], dateString?: string) {
    switch (this.requestSelected?.abbr!) {
      case 'sem':
        for (const date of dateBetween) {
          const dateBetString = this.convertDateToString(date);
          this.removeInitialSameData(practitionerId, dateBetString);

          delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateBetString];
        }
        break;

      case 'vac':
        for (const date of dateBetween) {
          const dateBetString = this.convertDateToString(date);
          this.removeInitialSameData(practitionerId, dateBetString);

          delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateBetString];
        }
        break;

      case 'off':
        for (const date of dateBetween) {
          const dateBetString = this.convertDateToString(date);
          this.removeInitialSameData(practitionerId, dateBetString);

          delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateBetString];
          delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateBetString];
        }
        break;

      case 'woff':
        this.removeInitialSameData(practitionerId, dateString);

        delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateString!];
        delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateString!];
        delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateString!];
        delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateString!];
        break;

      case 'sr':
        this.removeInitialSameData(practitionerId, dateString!);

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
        });
    }
  }

  saveShiftPlanDatePicker = (
    practitioner: SchedulePractitionerEntity,
    dateString: string,
    ceillId: string,
    remark: string,
    type: RequestType['abbr']
  ) => {
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
        if (!this.shiftOffRequestSaved[practitioner.id]) {
          this.shiftOffRequestSaved[practitioner.id] = {} as any;
          this.shiftOffRequestSaved[practitioner.id].request = {};
        }

        this.shiftOffRequestSaved[practitioner.id] = {
          request: {
            ...this.shiftOffRequestSaved[practitioner.id].request,
            ...dataDate,
          },
          practitioner,
        };
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
        if (!this.shiftVacRequestSaved[practitioner.id]) {
          this.shiftVacRequestSaved[practitioner.id] = {} as any;
          this.shiftVacRequestSaved[practitioner.id].request = {};
        }

        this.shiftVacRequestSaved[practitioner.id] = {
          request: {
            ...this.shiftVacRequestSaved[practitioner.id].request,
            ...dataDate,
          },
          practitioner,
        };

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
    this.deleteInitialDatePicker(practitioner.id, dateBetween, dateString);

    this.datepickerData = undefined;
    this.selectedDate = undefined;
    ModalCaller.popover().clear();

    if (ceillId) {
      const boxTarget = this.querySelector(`#${ceillId}-${dateString}`) as HTMLElement;
      setTimeout(() => {
        render(
          this.renderShiftPlanHost(
            {
              dateString,
              initial: undefined,
              remark,
            },
            this.requestSelected?.abbr!
          ),
          boxTarget
        );
      }, 0);
    }
  };

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
  }) {
    const title: Record<string, string> = {
      sem: 'ขออบรม, สัมนา, ไปราชการ',
      off: 'ขอลาหยุด',
      vac: 'ขอลาพักร้อน',
    };
    const iconSoftColor = requestTypeStyles[this.requestSelected?.abbr!].iconBgColor;
    const accentColor = requestTypeStyles[this.requestSelected?.abbr!].accentColor;
    return html`
      <c-box slot="popover">
        <c-box content>
          <!-- title -->
          <c-box>
            <c-box ui="${this.iconTitleWrapper(iconSoftColor)}">
              <c-box
                icon-prefix="16 ${requestTypeStyles[this.requestSelected?.abbr!]
                  .iconSrc} ${accentColor}"
                ui="${this.iconTitle(iconSoftColor)}"></c-box>
              <c-box tx-14> ${title[this.requestSelected?.abbr!]} </c-box>
            </c-box>
            <c-box mt-12 flex items-center flex justify-between>
              <c-box tx-16 semiBold tx-gray-700>เลือกเวรที่ต้องการขอ</c-box>
              <c-box flex col-gap-6>
                <cx-button
                  .var="${{ width: 'size-0' } as CXButton.Var}"
                  .set="${{ type: 'secondary' } as CXButton.Set}"
                  @click="${() => {
                    ModalCaller.popover().clear();
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
                  @click="${() =>
                    this.saveShiftPlanDatePicker(
                      data.practitioner,
                      data.dateString,
                      data.cellId,
                      data.remark,
                      data.type
                    )}"
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
              }}"
              ${ref(this.remarkRef)}
              type="text"
              style="border:none;outline:none;width:200px"
              placeholder="หมายเหตุเพิ่มเติม" />
          </c-box>
        </c-box>
      </c-box>
    `;
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
    if (
      (this.requestSelected?.abbr === 'off' &&
        (data.practitioner.practitioner.leave.dayOff === 0 ||
          this.maxDayOffLength?.[(data.practitioner.practitioner as any).id]?.dayOff >=
            data.practitioner?.practitioner?.leave?.dayOff)) ||
      (this.requestSelected?.abbr === 'vac' &&
        (this.vacDayOff?.[(data.practitioner.practitioner as any).id] === 0 ||
          this.maxDayOffLength?.[(data.practitioner.practitioner as any).id]?.vacation >=
            this.vacDayOff?.[(data.practitioner.practitioner as any).id]))
    )
      return;
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
            focusout: 'close',
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
              (practitioner?.practitioner?.leave?.dayOff === 0 ||
                this.maxDayOffLength?.[(practitioner.practitioner as any).id]?.dayOff >=
                  practitioner?.practitioner?.leave?.dayOff)) ||
            (this.requestSelected?.abbr === 'vac' &&
              (this.vacDayOff?.[(practitioner.practitioner as any).id] === 0 ||
                this.maxDayOffLength?.[(practitioner.practitioner as any).id]?.vacation >=
                  this.vacDayOff?.[(practitioner.practitioner as any).id]))
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
                this.getPopoverByRequest({ date, practitioner, cellId, dateString, event: e })!,

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
            <!-- ${this.maxDayOffLength?.[(practitioner.practitioner as any).id]?.vacation}
              ${this.vacDayOff?.[(practitioner.practitioner as any).id]} -->
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
          ${this.renderEmptyBox(date, 'select', 'woff', practitioner, dateString, indexUser)}
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
    initialSr?: Record<number, ScheduleShiftsEntity>
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

    return shouldRender.length
      ? html` <c-box flex col-gap-24>
          <c-box ui="srPlanWrapper:flex col-gap-6 items-center h-fit mt-2 min-w-80">
            <c-box
              bg="${dayPortValue[dayPart].bgColor}"
              p-2
              w-24
              h-24
              border-box
              flex-center
              round-8
              icon-prefix="${dayPortValue[dayPart].size} ${dayPortValue[dayPart]
                .src} ${dayPortValue[dayPart].iconColor}"></c-box>
            <c-box tx-14>${dayPortValue[dayPart].text}</c-box>
          </c-box>
          <c-box w-full>
            <c-box flex col-gap-6 justify-between>
              ${shifts?.map((requestPlan) => {
                const [dayPart, plan] = requestPlan.shiftName.split('');
                const hasInitialSr = initialSr?.[+plan];

                const bgColor = dayPortValue[dayPart as DayPart].bgColor;
                const mediumColor = dayPortValue[dayPart as DayPart].mediumColor;

                return html` <c-box flex items-center flex-col>
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
                    w-80
                    h-30
                    bg="${hasInitialSr ? bgColor : 'primary-25'}"
                    round-8
                    flex
                    justify-center
                    items-center
                    cursor-pointer
                    tx-14
                    bold
                    style="color:var(--${hasInitialSr ? 'color-4-700' : 'gray-500'})"
                    >${plan}</c-box
                  >
                  <c-box tx-12
                    >${requestPlan.startTime.slice(0, -3)} -
                    ${requestPlan.endTime.slice(0, -3)}</c-box
                  >
                </c-box>`;
              })}
            </c-box>
          </c-box>
        </c-box>`
      : undefined;
  }

  addSrShiftRequest(requestPlan: ScheduleShiftsEntity, dateString: string) {
    const [dayPart, plan] = requestPlan.shiftName.split('') as ['m' | 'a' | 'n', string];
    // 📌 long hand =  if (!this.shiftRequest[dayPart]) this.shiftRequest[dayPart] = {};
    this.shiftSrRequestCache[dateString] ||= {} as SrShiftPlan;
    this.shiftSrRequestCache[dateString][dayPart] ||= {};

    if (this.shiftSrRequestCache[dateString][dayPart][+plan]) {
      delete this.shiftSrRequestCache[dateString][dayPart][+plan];

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
      this.shiftSrRequestCache[dateString][dayPart][+plan] = requestPlan;
    }
  }

  groupShiftsByLetter(arr: any) {
    const result = {} as any;
    for (const shift of arr) {
      const letter = shift.shiftName.charAt(0);
      if (!result[letter]) {
        result[letter] = [];
      }
      result[letter].push(shift);
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
            this.renderShiftPlanSaved(
              {
                dateString: this.shiftDatepickerCache[type].dateString,
                remark: this.shiftDatepickerCache[type].remark,
                initial: this.shiftDatepickerCache[type].initial,
              },
              this.shiftDatepickerCache[type].requestType,
              this.shiftDatepickerCache[type].practitioner,
              this.shiftDatepickerCache[type].date,
              this.shiftDatepickerCache[type].indexUser
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
          <c-box slot="popover">
            <c-box content>
              <!-- title -->
              <c-box>
                <c-box ui="${this.iconTitleWrapper('primary-200')}">
                  <c-box
                    icon-prefix="16 emoji-wink-custom primary-500"
                    ui="${this.iconTitle('primary-100')}"></c-box>
                  <c-box tx-14> ขอเข้าเวร </c-box>
                </c-box>
                <c-box ui="titleSrWrapper:mt-12 flex items-center flex justify-between col-gap-12">
                  <c-box tx-16 semiBold tx-gray-700>เลือกเวรที่ต้องการ</c-box>
                  <c-box>
                    <cx-button
                      .var="${{ width: 'size-0' }}"
                      .set="${{ type: 'secondary' } as CXButton.Set}"
                      @click="${() => {
                        this.closePopover();
                        if (cellId) {
                          const boxTarget = this.querySelector(
                            `#${cellId}-${dateString}`
                          ) as HTMLElement;

                          const targetElement = event?.target as HTMLElement;
                          const shiftType = targetElement.closest(
                            'c-box[shift-type]'
                          ) as HTMLElement;
                          const requestHostType = shiftType.getAttribute('shift-type');

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
              <c-box mt-12 flex flex-col row-gap-24>
                <!-- morning -->
                ${(['m', 'a', 'n'] as const).map(
                  (dayPart) =>
                    html`${shiftGroup[dayPart]
                      ? this.renderShipSrRequest(
                          shiftGroup[dayPart],
                          dayPart,
                          dateString,
                          practitioner,
                          request?.[dayPart]
                        )
                      : undefined}`
                )}
              </c-box>
            </c-box>
          </c-box>
        `
      : html`
          <c-box slot="popover">
            <c-box content> ไม่มีเวรให้เลือก </c-box>
          </c-box>
        `;
  }

  saveSrRequestPlan(
    date: Date,
    practitioner: SchedulePractitionerEntity,
    cellId?: string,
    indexUser?: number
  ) {
    const dateString = this.convertDateToString(date);

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

    this.deleteInitialDatePicker(practitioner.id, dateBetween, dateString);
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent('save-sr', { detail: this.shiftSrRequestSaved }));

    this.dispatchEvent(
      new CustomEvent('save-request', {
        detail: { [this.requestSelected?.abbr!]: this.shiftSrRequestSaved },
      })
    );

    this.selectedDate = undefined;

    this.closePopover();
  }

  closePopover() {
    ModalCaller.popover().clear();
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

    this.deleteInitialDatePicker(practitioner.id, dateBetween, dateString);

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

  firstUpdated(): void {
    window.addEventListener('resize', this.setTableEgdeLine);
    setTimeout(() => {
      this.setTableEgdeLine();
    }, 250);
  }

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
            const [dayPart, requestPart] = requestShift?.split('') as [DayPart, string];
            if (!result[requestDate]) {
              result[requestDate] = { arrangedRequest: {} as ArrangedRequest, ...item };
            }
            if (!result[requestDate]!.arrangedRequest![dayPart]) {
              result[requestDate]!.arrangedRequest![dayPart] = {};
            }

            result[requestDate]!.arrangedRequest![dayPart][+requestPart] =
              // @ts-ignore
              this.scheduleData?.scheduleShifts?.find(
                (res: ScheduleShiftsEntity) => res.shiftName === requestShift
              );

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

  setColorRequestType(requestTime: DayPart): string {
    switch (requestTime) {
      case 'a':
        return 'color-12-100';
      case 'n':
        return 'color-7-100';
      case 'm':
        return 'color-4-100';
    }
  }

  convertDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private setTableEgdeLine = () => {
    const element = this.tableWrapperRef.value!;
    element.firstElementChild?.clientWidth;
    const hasScrollX = element.scrollWidth > element?.clientWidth!;

    if (hasScrollX) {
      this.tableWrapperRef.value?.setAttribute('ui', this.tableLineUI);
    } else {
      this.tableWrapperRef.value?.removeAttribute('ui');
    }
  };

  private moveUserToFirstArray() {
    const index = this.scheduleData?.schedulePractitioner?.findIndex(
      (obj) => obj.practitionerId === this.practitionerId
    );

    if (index !== -1) {
      const item = this.scheduleData?.schedulePractitioner?.splice(index!, 1)[0];
      this.scheduleData?.schedulePractitioner?.unshift(item as any);
    }

    return true;
  }

  @state()
  isOneMonth?: boolean;

  updated(changedProp: Map<string, unknown>) {
    if (typeof this.isOneMonth === 'undefined' && this.scheduleData) {
      const start = new Date(this.scheduleData.startDate);
      const end = new Date(this.scheduleData.endDate);
      this.isOneMonth =
        start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
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

    this.calcHeightOfUserTable();
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
      const tableRect = this.tableWrapperRef.value.getBoundingClientRect();
      const width = tableRect.width;
      this.style.setProperty('--table-width', `${width}px`);

      const tableHeaderWrapper = this.querySelector('#table-header-wrapper');
      const litVirtualizer = this.querySelector('.lit-virtualizer');

      if (tableHeaderWrapper && litVirtualizer) {
        tableHeaderWrapper.addEventListener('scroll', (e) => {
          tableHeaderWrapper.scrollLeft = this.currentScrollX;
        });
        litVirtualizer.addEventListener('scroll', (e) => {
          this.currentScrollX = litVirtualizer.scrollLeft;
          tableHeaderWrapper.scrollLeft = this.currentScrollX;
          this.closePopover();
        });
      }

      if (!this.monthTitleNav) {
        this.monthTitleNav = this.querySelectorAll('.first-date-of-month');

        if (this.monthTitleNav.length) {
          this.currentMonthTitleDisplay = this.monthTitleNav[0].dataset.firstDate;
        } else {
          this.monthTitleNav = this.querySelectorAll('.start-date-of-month');
          this.currentMonthTitleDisplay = this.monthTitleNav[0].dataset.firstDate;
        }
      }
    }

    //
    const practitioner = this.scheduleData?.schedulePractitioner?.[this.userSelectedIndex];
    // dayOff
    if (practitioner && this.requestSelected?.abbr === 'off') {
      const initialOff = (
        practitioner.schedulePractitionerRequest as SchedulePractitionerRequestEntity[]
      ).filter((res) => res.requestType.abbr === 'off');
      const savedOff = Object.keys(this.shiftOffRequestSaved?.[practitioner.id]?.request || {});

      // this.mayDayOffLength = initialOff.length + savedOff.length;
      if (!this.maxDayOffLength?.[(practitioner.practitioner as any).id]) {
        (this.maxDayOffLength as any)[(practitioner.practitioner as any).id] = {};
      }

      this.maxDayOffLength[(practitioner.practitioner as any).id].dayOff =
        initialOff.length + savedOff.length;
    }
    this.setVacDayOff(practitioner as SchedulePractitionerEntity);
  }

  private setVacDayOff(practitioner: SchedulePractitionerEntity) {
    if (practitioner && this.requestSelected?.abbr === 'vac') {
      const initialOff = (
        practitioner.schedulePractitionerRequest as SchedulePractitionerRequestEntity[]
      ).filter((res) => res.requestType.abbr === 'vac');
      const saveVac = Object.keys(this.shiftVacRequestSaved?.[practitioner.id]?.request || {});
      // this.mayDayOffLength = initialOff.length + savedOff.length;
      if (!this.maxDayOffLength?.[(practitioner.practitioner as any).id]) {
        (this.maxDayOffLength as any)[(practitioner.practitioner as any).id] = {};
      }

      this.maxDayOffLength[(practitioner.practitioner as any).id].vacation =
        initialOff.length + saveVac.length;

      // cache initial value
      const findVacation = (practitioner!.practitioner as Practitioner).vacations!.find(
        (res) => res!.year === new Date(this.currentTime).getFullYear()
      );
      this.vacDayOff[(practitioner.practitioner as Practitioner).id] = 15 - findVacation!.vacation;
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

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  generateDayOff(startDate: Date, endDate: Date, dayOffExist: string[], dayOff: number): string[] {
    const existingDaysOff: Set<string> = new Set(dayOffExist);
    const availableDays: string[] = [...dayOffExist];

    while (dayOff > availableDays.length) {
      for (
        let currentDate = new Date(startDate.getTime());
        currentDate <= endDate && dayOff > availableDays.length;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        const dateString =
          currentDate.getFullYear().toString().padStart(4, '0') +
          '-' +
          (currentDate.getMonth() + 1).toString().padStart(2, '0') +
          '-' +
          currentDate.getDate().toString().padStart(2, '0');

        if (
          !existingDaysOff.has(dateString) &&
          currentDate >= startDate &&
          currentDate <= endDate
        ) {
          availableDays.push(dateString);
          existingDaysOff.add(dateString);
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
      const currentMonth = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
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
}
declare global {
  namespace CXShiftSchedule {
    type Ref = ShiftSchedule;
  }
}
