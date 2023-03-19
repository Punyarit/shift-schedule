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
import { ModalSingleton } from '@cortex-ui/core/cx/components/modal/singleton/modal.singleton';
import './components/request-button';
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
  DisableDate,
} from './schedule.types';
import { createRef, ref } from 'lit/directives/ref.js';
import { ColorTypes } from '@cortex-ui/core/cx/types/colors.type';
import { ScheduleRequestDetailResponse, ScheduleRequestType } from './schedule-client.typess';
import { ModalCaller } from '@cortex-ui/core/cx/helpers/ModalCaller';
import { DateRangeSelected } from '@cortex-ui/core/cx/components/calendar/types/calendar.types';
import '@lit-labs/virtualizer';
import { CxDatepickerName } from '@cortex-ui/core/cx/components/datepicker/types/datepicker.name';

@customElement('cx-shift-schedule')
export class ShiftSchedule extends LitElement {
  private buttonGroupUI = 'buttonGroupUI: flex items-center col-gap-24 px-24';
  private scheduleTitleUI = 'scheduleTitleUI: inline-flex';
  private tableLineUI = 'tableLineUI: border-1 border-solid border-gray-100 border-box';
  private titleLeftTopUI = 'titleLeftTopUI: pl-12 flex flex-col pt-42 border-box';
  private monthUI = 'monthUI: flex items-center';
  private genderBox = `genderBox: absolute right-0 top-26 width tx-10 w-16 h-16 bg-primary-500 tx-white flex justify-center items-center round-full z-1`;
  private requestBox = 'requestBox: min-w-90 inline-flex flex-col';
  private userTitle = 'userTitle: flex col-gap-6 p-12 border-box';
  private weekDayUI = 'weekDayUI: py-6 min-w-90 pl-12 border-box';
  private weekDayWRapperUI = 'weekDayWRapperUI: flex';
  private monthEachUI = 'monthEachUI: tx-12 pl-12 py-6 border-right-solid';
  private sundayBorderRightUI = 'sundayBorderRightUI: border-right-2! border-right-primary-500!';
  private titleSticky = 'titleSticky: sticky top-0 left-0 bg-white';
  private userSelected =
    'userSelected: border-bottom-2! border-bottom-solid! border-bottom-primary-500!';
  private tableWrapperUI = 'tableWrapperUI: inline-flex flex-col';
  private iconTitleWrapper =
    'iconTitleWrapper: inline-flex round-24 border-1 border-primary-200 border-solid flex items-center col-gap-6 pr-12';
  private iconTitle =
    'iconTitle: round-full w-32 h-32 bg-primary-100 flex justify-center items-center';

  private weekendBg = 'weekendBg: bg-pinky-25! w-full h-full';

  @property({ type: String })
  viewerRole: 'manager' | 'staff' = 'staff';

  @property({ type: String })
  mode: 'view' | 'edit' = 'view';

  @property({ type: Object })
  disableDates: DisableDate[] = [];

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
  maxHeight?: number;

  @state()
  datepickerData?: DateRangeSelected;

  private removeRequestSelected?: RequestType;

  public tableWrapperRef = createRef<HTMLDivElement>();
  public dividerRef = createRef<HTMLDivElement>();
  public remarkRef = createRef<HTMLInputElement>();
  private currentPopoverRef?: CXPopover.Ref;
  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has('scheduleData')) {
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
      this.maxHeightOfUserTable =
        this.maxHeight ?? Math.floor(heightOfTheme?.height! - userTableTop?.top!);
    }, 250);
  }

  private disableDateArranged = {} as {
    [date: string]: DisableDate;
  };

  async connectedCallback() {
    super.connectedCallback();
    this.scheduleData = await (await fetch('http://localhost:3000/data')).json();
    this.requestTypes = await (await fetch('http://localhost:3000/types')).json();
    console.log('shift-schedule.js |this.scheduleData| = ', this.scheduleData);
  }

  private setRemoveMode() {
    this.requestSelected = undefined;
    this.isRemoveMode = true;
  }

  @state()
  isRemoveMode = false;

  @state()
  dividerTop = 0;

  render() {
    return html`
      <style>
        :host {
          --cbox-divider-width: 100%;
          --cbox-divider-top: 0;
        }

        .focus-divider {
          border-bottom: 2px solid var(--primary-500);
        }

        input::placeholder {
          font-family: Sarabun-Regular;
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
            var(--pinky-50),
            var(--pinky-50) 5px,
            #ffffff 5px,
            #ffffff 10px
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
          width: var(--size-274) !important;
        }
      </style>
      <c-box style="height:100vh" relative overflow-hidden>
        <c-box class="cbox-divider" absolute ${ref(this.dividerRef)}></c-box>
        <c-box bg-white flex flex-col row-gap-24>
          ${this.mode === 'edit'
            ? html` <c-box ui="${this.buttonGroupUI}">
                <c-box whitespace-pre> เลือกรูปแบบคำขอเวร </c-box>
                ${this.renderRequestButton()}
                <c-box inline h-40 w-1 bg-pinky-100></c-box>
                <c-box
                  @click="${this.setRemoveMode}"
                  cursor-pointer
                  shadow-hover="shadow-3"
                  inline-flex
                  items-center
                  col-gap-12
                  round-44
                  w-96
                  border-solid
                  border-1
                  border-pinky-100
                  bg-color="${this.isRemoveMode ? 'pinky-300' : 'white'}">
                  <c-box
                    flex-center
                    icon-prefix="close-circle-line"
                    icon-prefix-color="${this.isRemoveMode ? 'white' : 'pinky-900'}"
                    w-44
                    h-44
                    round-full
                    bg-color="${this.isRemoveMode ? 'pinky-300' : 'pinky-50'}">
                  </c-box>
                  <c-box tx-color="${this.isRemoveMode ? 'white' : 'pinky-900'}">ลบ</c-box>
                </c-box>
              </c-box>`
            : undefined}

          <c-box overflow-x-auto overflow-y-hidden ${ref(this.tableWrapperRef)}>
            <c-box ui="${this.tableWrapperUI}, ${this.tableLineUI}">
              <c-box ui="${this.scheduleTitleUI}">
                <!-- FIXME: should titleSticky below -->
                <c-box UI="${this.tableLineUI}, ${this.titleLeftTopUI} " min-w="260">
                  <c-box semiBold tx-16>รายชื่อเจ้าหน้าที่</c-box>
                  <c-box tx-14>ทั้งหมด ${this.scheduleData?.schedulePractitioner?.length} คน</c-box>
                </c-box>

                <c-box flex id="week-month-title">
                  ${this.dateBetween?.map((dateBet) => {
                    return html`
                      <c-box>
                        <c-box ui="${this.monthUI}, ${this.tableLineUI}" pl-12 border-box>
                          <c-box icon-prefix="favorite-line" icon-suffix="favorite-line" tx-12 py-6>
                            ${this.dateFormat(dateBet.currentMonth, {
                              month: 'short',
                            })}
                          </c-box>
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
                                  ${weekday.map((date) => {
                                    const isSunday =
                                      date.getDay() === 0 ? this.sundayBorderRightUI : '';

                                    const isWeekend =
                                      date.getDay() === 0 || date.getDay() === 6
                                        ? this.weekendBg
                                        : '';

                                    return html` <c-box
                                      ui="${isSunday}, ${this.tableLineUI}, ${this
                                        .weekDayUI}, ${isWeekend}">
                                      <c-box tx-12>
                                        ${this.dateFormat(date, {
                                          weekday: 'short',
                                        })}
                                      </c-box>
                                      <c-box tx-14>
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
                overflow-y-auto
                overflow-x-hidden
                style="height:${this.maxHeightOfUserTable!}px">
                <lit-virtualizer
                  .items=${(this.scheduleData as SchedulingData)?.schedulePractitioner!}
                  .renderItem="${(practitioner: SchedulePractitionerEntity, indexUser: number) => {
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
                      <c-box flex ui="targetUser: ${targetUser ? 'order-first' : ''}">
                        <c-box
                          min-w="260"
                          class="${(this.viewerRole === 'staff' && indexUser === 0) ||
                          (this.viewerRole === 'manager' &&
                            indexUser === this.userSelectedIndex &&
                            this.requestSelected)
                            ? 'focus-divider'
                            : ''}"
                          ui="${this.userTitle}, ${this.tableLineUI}, ${this.titleSticky}">
                          <c-box relative top-0 left-0>
                            <img src="${this.userImgDefault || ''}" alt="" />
                            <c-box ui="${this.genderBox}"> ${gender} </c-box>
                          </c-box>

                          <c-box>
                            <c-box tx-14> ${nameGiven} ${nameFamily}</c-box>
                            <c-box tx-12>${practitionerRole.name}, ${practitionerLevel.name}</c-box>
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

                                  return html` <c-box
                                    @mouseenter="${this.viewerRole === 'manager'
                                      ? (e: MouseEvent) => this.managerHoverUser(indexUser, e)
                                      : null}"
                                    ui="${this.tableLineUI}, ${this.requestBox}, ${borderRight}"
                                    class="${(this.viewerRole === 'staff' && indexUser === 0) ||
                                    (this.viewerRole === 'manager' &&
                                      indexUser === this.userSelectedIndex &&
                                      this.requestSelected)
                                      ? 'focus-divider'
                                      : ''} ${isWeekend ? 'bg-pinky' : ''}">
                                    <c-box w-full h-full>
                                      <!-- if have request date then render request -->
                                      <!-- when saving -->
                                      ${disableDate
                                        ? html` <div class="diagonal-pattern"></div> `
                                        : srSaved && srSaved?.request?.[dateString]
                                        ? this.renderSrShiftPlanSaved(
                                            srSaved,
                                            dateString,
                                            practitioner,
                                            indexUser
                                          )
                                        : semSaved?.request?.[dateString]
                                        ? this.renderShiftPlanSaved(
                                            semSaved?.request?.[dateString],
                                            'sem',
                                            practitioner
                                          )
                                        : offSaved?.request?.[dateString]
                                        ? this.renderShiftPlanSaved(
                                            offSaved?.request?.[dateString],
                                            'off',
                                            practitioner
                                          )
                                        : vacSaved?.request?.[dateString]
                                        ? this.renderShiftPlanSaved(
                                            vacSaved?.request?.[dateString],
                                            'vac',
                                            practitioner
                                          )
                                        : woffSaved?.[dateString]
                                        ? this.renderWoffSaved(dateString, practitioner)
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
                  }}">
                </lit-virtualizer>
              </c-box>
            </c-box>
          </c-box>
        </c-box>
      </c-box>
    `;
  }

  managerHoverUser(indexUser: number, e: MouseEvent) {
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
          (res) => res.practitionerId === practitioner?.practitionerId
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
    data?: { initial: boolean }
  ) {
    return html`<c-box h-full w-full p-4 border-box>
      <c-box
        class="woff-saved ${this.requestSelected || this.isRemoveMode ? 'hover-request' : ''}"
        bg-bluestate-200
        icon-prefix="pause-circle-line"
        w-full
        h-full
        flex
        justify-center
        round-6
        @click="${() => this.removeWoffSaved(dateString, practitioner, data)}"
        items-center></c-box>
    </c-box>`;
  }

  removeSrPlan(dayPart: DayPart, dateString: string, practitioner: SchedulePractitionerEntity) {
    if (this.isRemoveMode) {
      delete this.shiftSrRequestSaved[practitioner.id].request[dateString].shiftPlan[dayPart];
      if (
        Object.keys(this.shiftSrRequestSaved[practitioner.id].request[dateString].shiftPlan)
          .length === 0
      ) {
        delete this.shiftSrRequestSaved[practitioner.id].request[dateString];
      }

      if (Object.keys(this.shiftSrRequestSaved[practitioner.id].request).length === 0) {
        delete this.shiftSrRequestSaved[practitioner.id];
      }
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
    console.log('shift-schedule.js |planEntries| = ', planEntries);
    return html` <c-box w-full h-full slot="host">
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
                @click="${() => this.removeSrPlan(dayPart as DayPart, dateString, practitioner)}"
                bg-color="${this.setColorRequestType(dayPart as DayPart)}">
                <c-box>
                  <c-box icon-prefix="favorite-line" flex flex-col>
                    <c-box
                      >${Object.keys(plans).map((plan) => {
                        console.log('plan', plan);
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

  renderSrShiftPlanSaved(
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
    const planEntries = Object.entries(planRequest?.request[dateString].shiftPlan);

    console.log('shift-schedule.js |planEntries5555| = ', planEntries);

    console.log('shift-schedule.js |planEntries| = ', planEntries);
    const shiftPlan = this.shiftSrRequestSaved?.[practitioner.id]?.request?.[dateString]?.shiftPlan;
    const cellId = 'sr-saved-shift-cell';
    const date = new Date(dateString);
    return html`
      <c-box
        w-full
        h-full
        id="${cellId}-${dateString}"
        @click="${() =>
          this.appendPopover(
            'sr',
            cellId,
            {
              date,
              dateString,
              indexUser,
              practitioner,
            },
            this.renderSrPopover(date, practitioner, shiftPlan, cellId),
            this.renderSrSavedHost(dateString, practitioner, planEntries)
          )}">
        ${this.renderSrSavedHost(dateString, practitioner, planEntries)}
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
        (res) => res.practitionerId === practitioner.practitionerId
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
  renderShiftPlanSaved(
    data: { dateString?: string; remark?: string; initial?: boolean },
    type: RequestType['abbr'],
    practitioner: SchedulePractitionerEntity
  ) {
    return html`<c-box p-4 border-box h-full w-full>
      <c-box
        class="shift-plan-datepicker ${this.requestSelected || this.isRemoveMode
          ? 'hover-request'
          : ''}"
        bg-modern-green-100
        bg-color="${requestTypeStyles[type].iconBgColor}"
        h-full
        w-full
        round-6
        p-6
        border-box
        @click="${() => this.removeShiftDatePicker(data, type, practitioner)}">
        ${data?.remark
          ? html`<c-box
              flex
              flex-col
              icon-prefix="favorite-line"
              icon-prefix-color="modern-green-500">
              ${data.remark}
            </c-box>`
          : html`<c-box
              flex
              justify-center
              items-center
              h-full
              icon-prefix="favorite-line"
              icon-prefix-color="modern-green-500">
            </c-box>`}
      </c-box>
    </c-box>`;
  }

  removeInitialSr(practitioner: SchedulePractitionerEntity, dateString: string, dayPart: string) {
    if (!this.isRemoveMode) return;
    const practitionerIndex = this.scheduleData?.schedulePractitioner?.findIndex(
      (res) => res.practitionerId === practitioner.practitionerId
    );

    if (typeof practitionerIndex === 'number') {
      const shiftPlans = this.scheduleData?.schedulePractitioner?.[practitionerIndex]
        .schedulePractitionerRequest as SchedulePractitionerRequestEntity[];

      let requestIndex = [];
      let requestResult = {} as any;
      for (let index = 0; index < shiftPlans.length; index++) {
        if (
          shiftPlans[index]?.requestShift?.split('')?.[0] === dayPart &&
          shiftPlans[index]?.requestDate === dateString
        ) {
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

  renderSrInitialHost(
    request: ScheduleDataWithRender,
    practitioner: SchedulePractitionerEntity,
    dateString: string
  ) {
    return html` <c-box w-full h-full slot="host">
      ${Object.entries(request.arrangedRequest!).map(([dayPart, plans]) => {
        const plansEntries = Object.entries(plans);
        return html`
          <c-box p-4 border-box flex flex-col row-gap-4>
            <c-box
              @click="${this.isRemoveMode
                ? () => this.removeInitialSr(practitioner, dateString, dayPart)
                : null}"
              p-4
              border-box
              round-6
              h-44
              bg-color="${this.setColorRequestType(dayPart as DayPart)}">
              <div
                style="cursor:${this.requestSelected || this.isRemoveMode
                  ? 'pointer'
                  : ''}; width:100%; height:100%">
                <c-box>
                  <c-box icon-prefix="favorite-line" flex flex-col>
                    <c-box
                      >${plansEntries.map(([plan]) => html`<c-box inline>${plan}</c-box> `)}</c-box
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

  renderInitialRequest(
    request: ScheduleDataWithRender,
    practitioner: SchedulePractitionerEntity,
    date: Date,
    indexUser: number
  ) {
    const dateString = this.convertDateToString(date);
    const cellId = 'initial-data-shift-cell';
    switch (request.requestType.abbr) {
      case 'sr':
        return html`
          <c-box
            w-full
            h-full
            id="${cellId}-${dateString}"
            @click="${this.requestSelected
              ? () =>
                  this.appendPopover(
                    request.requestType.abbr,
                    cellId,
                    {
                      date,
                      dateString,
                      indexUser,
                      practitioner,
                    },
                    this.renderSrPopover(date, practitioner, request.arrangedRequest, cellId),
                    this.renderSrInitialHost(request, practitioner, dateString)
                  )
              : null}">
            ${this.renderSrInitialHost(request, practitioner, dateString)}
          </c-box>
        `;

      case 'woff':
        return html`${this.renderWoffSaved(dateString, practitioner, { initial: true })}`;

      case 'sem':
      case 'vac':
      case 'off':
        return html`${this.renderShiftPlanSaved(
          {
            dateString,
            remark: request.remark,
            initial: true,
          },
          request.requestType.abbr,
          practitioner
        )}`;

      default:
        break;
    }
  }

  saveDatepicker(e: CXDatePicker.SelectDate) {
    this.datepickerData = e.detail.date as DateRangeSelected;
  }

  deleteInitialDatePicker(practitionerId: string, dateBetween: Date[]) {
    switch (this.requestSelected?.abbr!) {
      case 'sem':
        for (const date of dateBetween) {
          const dateString = this.convertDateToString(date);
          delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateString];
          delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateString];
          delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateString];
          delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateString];
        }
        break;

      case 'vac':
        for (const date of dateBetween) {
          const dateString = this.convertDateToString(date);
          delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateString];
          delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateString];
          delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateString];
          delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateString];
        }
        break;

      case 'off':
        for (const date of dateBetween) {
          const dateString = this.convertDateToString(date);
          delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateString];
          delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateString];
          delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateString];
          delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateString];
        }
        break;

      default:
        break;
    }

    this.requestUpdate();
  }

  saveWithDateData = (practitioner: SchedulePractitionerEntity) => {
    const dateBetween = getDateBetweenArrayDate(
      this.datepickerData?.startdate!,
      this.datepickerData?.enddate!
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

        this.deleteInitialDatePicker(practitioner.id, dateBetween);
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
        this.deleteInitialDatePicker(practitioner.id, dateBetween);
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

        this.deleteInitialDatePicker(practitioner.id, dateBetween);
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
    this.selectedDate = undefined;
    ModalCaller.popover().clear();
  };

  renderDatepickerBox(data: {
    title: string;
    practitioner: SchedulePractitionerEntity;
    date: Date;
  }) {
    return html` <c-box content>
      <!-- title -->
      <c-box>
        <c-box ui="${this.iconTitleWrapper}">
          <c-box
            icon-prefix="circle-line"
            icon-prefix-color="primary-500"
            ui="${this.iconTitle}"></c-box>
          <c-box tx-14> ${data.title} </c-box>
        </c-box>
        <c-box mt-12 flex items-center flex justify-between>
          <c-box tx-16 semiBold tx-gray-700>เลือกเวรที่ต้องการขอ</c-box>
          <c-box flex col-gap-6>
            <cx-button
              .var="${{ width: 'size-0' } as CXButton.Var}"
              .set="${{ type: 'secondary' } as CXButton.Set}"
              @click="${ModalCaller.popover().clear}"
              >ยกเลิก</cx-button
            >
            <cx-button
              @click="${() => this.saveWithDateData(data.practitioner)}"
              .var="${{ width: 'size-0' } as CXButton.Var}"
              >บันทึก</cx-button
            >
          </c-box>
        </c-box>
      </c-box>
      <!-- date picker -->
      <c-box mt-12>
        <c-box mb-12>Date</c-box>
        <cx-datepicker
          @select-date="${(e: CXDatePicker.SelectDate) => this.saveDatepicker(e)}"
          .set="${{
            date: data.date,
            daterange: true,
            inputStyle: 'short',
            min: new Date(this.scheduleData?.startDate!),
            max: new Date(this.scheduleData?.endDate!),
          } as CXDatePicker.Set}"></cx-datepicker>
      </c-box>

      <c-box mt-12>หมายเหตุ</c-box>
      <c-box class="remark-input" mt-6 input-box="primary-200">
        <input
          ${ref(this.remarkRef)}
          type="text"
          style="border:none;outline:none;width:200px"
          placeholder="หมายเหตุเพิ่มเติม" />
      </c-box>
    </c-box>`;
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
    this.userSelectedIndex = data.indexUser;
    const boxTarget = this.querySelector(`#${cellId}-${data.dateString}`) as HTMLElement;
    if (boxTarget) {
      const firstElement = boxTarget.firstElementChild;
      if (firstElement?.tagName !== 'CX-POPOVER') {
        firstElement?.remove();
      } else {
        return;
      }

      switch (type) {
        case 'sr':
          const popoverSr = html`
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
          render(popoverSr, boxTarget);
          requestAnimationFrame(() => {
            this.currentPopoverRef = this.querySelector('cx-popover') as CXPopover.Ref;
            // @ts-ignore
            this.currentPopoverRef.setOpenPopover();
          });

          break;

        case 'sem':
        case 'off':
        case 'vac':
          const title = {
            sem: 'ขออบรม, สัมนา, ไปราชการ',
            off: 'ขอลาหยุด',
            vac: 'ขอลาพักร้อน',
          };
          const popoverSem = html`<cx-popover
            .set="${{
              arrowpoint: true,
              focusout: 'close',
              mouseleave: 'none',
              transform: 'center',
            } as CXPopover.Set}">
            ${this.renderEmptyBox(data.date, 'select')}

            <c-box slot="popover">
              ${this.renderDatepickerBox({
                title: title[type],
                practitioner: data.practitioner,
                date: data.date,
              })}
            </c-box>
          </cx-popover>`;

          render(popoverSem, boxTarget);
          requestAnimationFrame(() => {
            this.currentPopoverRef = this.querySelector('cx-popover') as CXPopover.Ref;
            // @ts-ignore
            this.currentPopoverRef.setOpenPopover();
          });
          break;

        default:
          break;
      }
    }
  }

  renderEmptyDateForSelect(
    date: Date,
    practitioner: SchedulePractitionerEntity,
    dateString: string,
    indexUser: number
  ) {
    const cellId = 'empty-shift-cell';
    switch (this.requestSelected?.abbr) {
      case 'sr':
        return html`
          <c-box
            id="${cellId}-${dateString}"
            w-full
            h-full
            @click="${() =>
              this.appendPopover(
                this.requestSelected?.abbr!,
                cellId,
                {
                  date,
                  practitioner,
                  dateString,
                  indexUser,
                },
                this.renderSrPopover(date, practitioner),
                this.renderEmptyBox(date, 'select')
              )}">
            ${this.renderEmptyBox(date, 'display')}
          </c-box>
        `;

      case 'vac':
      case 'off':
      case 'sem':
        return html` <c-box
          id="empty-shift-cell-${dateString}"
          w-full
          h-full
          @click="${() =>
            this.appendPopover(
              this.requestSelected?.abbr!,
              cellId,
              {
                date,
                practitioner,
                dateString,
                indexUser,
              },
              this.renderSrPopover(date, practitioner),
              this.renderEmptyBox(date, 'select')
            )}">
          ${this.renderEmptyBox(date, 'display')}
        </c-box>`;

      case 'woff':
        return html` ${this.renderEmptyBox(date, 'select', 'woff', practitioner)} `;

      default:
        return undefined;
    }
  }

  // FIXME: any type w8 for api data
  renderRequestSr(
    shifts: ScheduleShiftsEntity[],
    dayPart: DayPart,
    dateString: string,
    initialSr?: Record<number, ScheduleShiftsEntity>
  ) {
    const srData = {
      a: {
        text: 'กลางวัน',
      },
      n: {
        text: 'เย็น',
      },
      m: {
        text: 'เช้า',
      },
    };

    return html` <c-box flex col-gap-24>
      <c-box flex col-gap-6 items-center h-fit mt-2 min-w-80>
        <c-box
          bg-color="primary-100"
          p-2
          round-full
          icon-prefix-color="primary-500"
          icon-prefix="circle-line"></c-box>
        <c-box>${srData[dayPart].text}</c-box>
      </c-box>
      <c-box>
        <c-box flex col-gap-6>
          ${shifts?.map((requestPlan) => {
            const [dayPart, plan] = requestPlan.shiftName.split('');
            const hasInitialSr = initialSr?.[+plan];

            return html` <c-box flex items-center flex-col>
              <c-box
                @click="${() => this.addSrShiftRequest(requestPlan, dateString)}"
                bg-hover="primary-100"
                bg-toggle="primary-100"
                bg-active="primary-200"
                cursor-pointer
                w-80
                h-30
                bg-color="${hasInitialSr ? 'primary-100' : 'primary-50'}"
                round-8
                flex
                justify-center
                items-center
                >${plan}</c-box
              >
              <c-box tx-12
                >${requestPlan.startTime.slice(0, -3)} - ${requestPlan.endTime.slice(0, -3)}</c-box
              >
            </c-box>`;
          })}
        </c-box>
      </c-box>
    </c-box>`;
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

  renderSrPopover(
    date: Date,
    practitioner: SchedulePractitionerEntity,
    request?: SrShiftPlan,
    cellId?: string
  ) {
    const shiftGroup = this.groupShiftsByLetter(this.scheduleData?.scheduleShifts) as Record<
      'a' | 'm' | 'n',
      ScheduleShiftsEntity[]
    >;

    const dateString = this.convertDateToString(date);

    if (request) {
      this.shiftSrRequestCache[dateString] = {
        ...(this.shiftSrRequestCache[dateString] || {}),
        ...request,
      };
    }

    console.log(
      'shift-schedule.js |this.shiftSrRequestCache initial| = ',
      this.shiftSrRequestCache
    );
    return html`
      <c-box slot="popover">
        <c-box content>
          <!-- title -->
          <c-box>
            <c-box ui="${this.iconTitleWrapper}">
              <c-box
                icon-prefix="circle-line"
                icon-prefix-color="primary-500"
                ui="${this.iconTitle}"></c-box>
              <c-box tx-14> ขอเข้าเวร </c-box>
            </c-box>
            <c-box mt-12 flex items-center flex justify-between>
              <c-box tx-16 semiBold tx-gray-700>เลือกเวรที่ต้องการ</c-box>
              <c-box>
                <cx-button
                  .var="${{ width: 'size-0' }}"
                  .set="${{ type: 'secondary' } as CXButton.Set}"
                  @click="${this.closePopover}"
                  >ยกเลิก</cx-button
                >
                <cx-button
                  .var="${{ width: 'size-0' }}"
                  @click="${() => this.saveSrRequestPlan(date, practitioner, cellId)}"
                  >บันทึก</cx-button
                >
              </c-box>
            </c-box>
          </c-box>

          <!-- selected request -->
          <c-box mt-12 flex flex-col row-gap-24>
            <!-- morning -->
            ${(['m', 'a', 'n'] as const).map(
              (res) =>
                html`${shiftGroup[res]
                  ? this.renderRequestSr(shiftGroup[res], res, dateString, request?.[res])
                  : undefined}`
            )}
          </c-box>
        </c-box>
      </c-box>
    `;
  }

  saveSrRequestPlan(date: Date, practitioner: SchedulePractitionerEntity, cellId?: string) {
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
        const planEntries = Object.entries(this.shiftSrRequestCache[dateString]);
        render(this.renderSrSavedHost(dateString, practitioner, planEntries), boxTarget);
        this.shiftSrRequestCache[dateString] = {} as SrShiftPlan;
      }, 0);
    }
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
    practitioner?: SchedulePractitionerEntity
  ) {
    this.selectedDate = date;

    if (type === 'woff') {
      this.saveWoffRequest(date, practitioner!);
    }
  }

  saveWoffRequest(date: Date, practitioner: SchedulePractitionerEntity) {
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
    practitioner?: SchedulePractitionerEntity
  ) {
    const isSameDate = this.selectedDate === date;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return html`
      <c-box
        p-4
        border-box
        w-full
        h-full
        slot="host"
        @click="${state === 'select'
          ? () => this.selectDateRequest(date, type, practitioner)
          : null}">
        <c-box
          bg-hover="primary-100"
          bg-active="primary-200"
          bg-color="${isSameDate ? 'primary-100' : isWeekend ? 'pinky-25' : 'white'}"
          icon-prefix="${isSameDate ? 'plus-line' : 'none'}"
          icon-prefix-color="${type ? 'gray-600' : 'primary-300'}"
          w-full
          h-full
          round-8
          flex
          justify-center
          items-center
          cursor-pointer
          icon-prefix-color-hover="primary-300"
          icon-prefix-hover="plus-line"></c-box>
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

  setColorRequestType(requestTime: DayPart): ColorTypes {
    switch (requestTime) {
      case 'a':
        return 'warning-100';
      case 'n':
      case 'm':
        return 'primary-100';
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

  updated(changedProp: Map<string, unknown>) {
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

    this.disableDateArranged = this.getHolidayOccurrences(
      this.disableDates,
      this.scheduleData?.startDate,
      this.scheduleData?.endDate
    );

    console.log('shift-schedule.js |this.disableDateArranged`| = ', this.disableDateArranged);
  }

  // @ts-ignore
  getHolidayOccurrences(holidays, startDate, endDate) {
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

  createRenderRoot() {
    return this;
  }
}

declare global {
  namespace CXShiftSchedule {
    type Ref = ShiftSchedule;
  }
}
