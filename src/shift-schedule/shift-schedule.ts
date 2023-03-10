import { LitElement, html, PropertyValueMap } from 'lit';
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
} from './schedule.types';
import { createRef, ref } from 'lit/directives/ref.js';
import { ColorTypes } from '@cortex-ui/core/cx/types/colors.type';
import { ScheduleRequestDetailResponse, ScheduleRequestType } from './schedule-client.typess';
import { ModalCaller } from '@cortex-ui/core/cx/helpers/ModalCaller';
import { DateRangeSelected } from '@cortex-ui/core/cx/components/calendar/types/calendar.types';

@customElement('cx-shift-schedule')
export class ShiftSchedule extends LitElement {
  private buttonGroupUI = 'buttonGroupUI: flex items-center col-gap-24 px-24';
  private scheduleTitleUI = 'scheduleTitleUI: inline-flex';
  private tableLineUI = 'tableLineUI: border-1 border-solid border-primary-100 border-box';
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

  @property({ type: String })
  viewerRole: 'manager' | 'staff' = 'staff';

  @property({ type: String })
  practitionerId?: string;
  // practitionerId?: string = 'C1CD433E-F36B-1410-870D-0060E4CDB88B';

  @state()
  currentUserIndex = 0;

  @property({ type: Object })
  public scheduleData?: SchedulingData | ScheduleRequestDetailResponse | null;

  @property({ type: Array })
  public requestTypes?: RequestType[] | ScheduleRequestType[];

  @state()
  dateBetween?: DateBetweenData[];

  @state()
  requestSelected?: RequestType;

  @state()
  selectedDate?: Date;

  @state()
  srState = [];

  @state()
  maxHeightOfUserTable?: number;

  private shiftSrRequestCache = {} as SrShiftPlan;

  @property({ type: String })
  userImgDefault?: string;

  @state()
  shiftSrRequestSaved = {} as {
    [id: string]: {
      // 📌key such as 2023-01-25
      [date: string]: SrShiftPlan;
    };
  };

  @state()
  shiftSemRequestSaved = {} as {
    [id: string]: {
      // 📌key such as 2023-01-25
      [date: string]: DatePickerShiftPlan;
    };
  };

  @state()
  shiftOffRequestSaved = {} as {
    [id: string]: {
      // 📌key such as 2023-01-25
      [date: string]: DatePickerShiftPlan;
    };
  };

  @state()
  shiftVacRequestSaved = {} as {
    [id: string]: {
      // 📌key such as 2023-01-25
      [date: string]: DatePickerShiftPlan;
    };
  };

  @state()
  shiftWoffRequestSaved = {} as {
    [id: string]: {
      practitioner: SchedulePractitionerEntity;
      request: {
        // 📌key such as 2023-01-25
        [key: string]: {
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
    const theme = this.querySelector('cx-theme');
    const userTable = this.querySelector('#week-month-user');

    setTimeout(() => {
      const heightOfTheme = theme?.getBoundingClientRect();
      const userTableTop = userTable?.getBoundingClientRect();
      this.maxHeightOfUserTable =
        this.maxHeight ?? Math.floor(heightOfTheme?.height! - userTableTop?.top!);
    }, 250);
  }

  async connectedCallback() {
    super.connectedCallback();
    this.scheduleData = await (await fetch('http://localhost:3000/data')).json();
    this.requestTypes = await (await fetch('http://localhost:3000/types')).json();
  }

  private setRemoveMode() {
    this.requestSelected = undefined;
    this.isRemoveMode = true;
  }

  @state()
  isRemoveMode = false;

  render() {
    return html`
      <style>
        input::placeholder {
          font-family: Sarabun-Regular;
        }

        c-box[input-box].remark-input {
          width: var(--size-274) !important;
        }
      </style>
      <cx-theme>
        <c-box absolute top-0>${this.viewerRole}</c-box>
        <cx-modal .set="${{ multiplePopover: true } as CXModal.Set}"></cx-modal>
        <c-box style="height:100vh" overflow-hidden>
          <c-box bg-white p-24 flex flex-col row-gap-24>
            <c-box ui="${this.buttonGroupUI}">
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
            </c-box>

            <c-box overflow-x-auto overflow-y-hidden ${ref(this.tableWrapperRef)}>
              <c-box ui="${this.tableWrapperUI}, ${this.tableLineUI}">
                <c-box ui="${this.scheduleTitleUI}">
                  <!-- FIXME: should titleSticky below -->
                  <c-box UI="${this.tableLineUI}, ${this.titleLeftTopUI} " min-w="260">
                    <c-box semiBold tx-16>รายชื่อเจ้าหน้าที่</c-box>
                    <c-box tx-14
                      >ทั้งหมด ${this.scheduleData?.schedulePractitioner?.length} คน</c-box
                    >
                  </c-box>

                  <c-box flex id="week-month-title">
                    ${this.dateBetween?.map((dateBet) => {
                      return html`
                        <c-box>
                          <c-box ui="${this.monthUI}, ${this.tableLineUI}" pl-12 border-box>
                            <c-box
                              icon-prefix="favorite-line"
                              icon-suffix="favorite-line"
                              tx-12
                              py-6>
                              ${this.dateFormat(dateBet.currentMonth, {
                                month: 'long',
                                year: 'numeric',
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
                                      month: 'long',
                                      year: 'numeric',
                                    })}
                                  </c-box>

                                  <c-box flex>
                                    ${weekday.map((date) => {
                                      const isSunday =
                                        date.getDay() === 0 ? this.sundayBorderRightUI : '';
                                      return html` <c-box
                                        ui="${isSunday}, ${this.tableLineUI}, ${this.weekDayUI}">
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
                      const borderBottom: string =
                        indexUser === (this.viewerRole === 'manager' ? this.currentUserIndex : 0)
                          ? this.userSelected
                          : '';
                      const requestData = this.convertRequestDatesToObject(
                        request as SchedulePractitionerRequestEntity[]
                      );
                      const targetUser = practitioner?.practitionerId === this.practitionerId!;
                      return html`
                        <c-box flex ui="targetUser: ${targetUser ? 'order-first' : ''}">
                          <c-box
                            min-w="260"
                            ui="${borderBottom}, ${this.userTitle}, ${this.tableLineUI}, ${this
                              .titleSticky}">
                            <c-box relative top-0 left-0>
                              <img src="${this.userImgDefault || ''}" alt="" />
                              <c-box ui="${this.genderBox}"> ${gender} </c-box>
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

                                    const dateString = this.convertDateToString(day);
                                    const srSaved = this.shiftSrRequestSaved[practitioner.id];
                                    const semSaved = this.shiftSemRequestSaved[practitioner.id];
                                    const offSaved = this.shiftOffRequestSaved[practitioner.id];
                                    const vacSaved = this.shiftVacRequestSaved[practitioner.id];

                                    const requestInitial = requestData[dateString];

                                    const woffSaved =
                                      this.shiftWoffRequestSaved?.[practitioner.id]?.request;

                                    const userTargetIndex =
                                      this.viewerRole === 'manager' ? this.currentUserIndex : 0;
                                    console.log(srSaved, 'srSaved');
                                    return html` <c-box
                                      @mouseover="${() => this.ManagerHoverUser(indexUser)}"
                                      ui="${borderBottom}, ${this.tableLineUI}, ${this
                                        .requestBox}, ${borderRight}">
                                      <c-box w-full h-full bg-white>
                                        <!-- if have request date then render request -->
                                        <!-- when saving -->
                                        ${srSaved && srSaved?.[dateString]
                                          ? this.renderSrShiftPlanSaved(
                                              srSaved,
                                              dateString,
                                              practitioner
                                            )
                                          : semSaved?.[dateString]
                                          ? this.renderShiftPlanSaved(
                                              semSaved?.[dateString],
                                              'sem',
                                              practitioner
                                            )
                                          : offSaved?.[dateString]
                                          ? this.renderShiftPlanSaved(
                                              offSaved?.[dateString],
                                              'off',
                                              practitioner
                                            )
                                          : vacSaved?.[dateString]
                                          ? this.renderShiftPlanSaved(
                                              vacSaved?.[dateString],
                                              'vac',
                                              practitioner
                                            )
                                          : woffSaved?.[dateString]
                                          ? this.renderWoffSaved(dateString, practitioner)
                                          : requestInitial
                                          ? this.renderInitialRequest(requestInitial, practitioner)
                                          : indexUser === userTargetIndex
                                          ? this.renderEmptyDateForSelect(day, practitioner)
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
                </c-box>
              </c-box>
            </c-box>
          </c-box>
        </c-box>
      </cx-theme>
    `;
  }

  ManagerHoverUser(indexUser: number) {
    if (this.viewerRole === 'manager') {
      this.currentUserIndex = indexUser;
    }
  }

  sentRemoveEvent() {
    this.dispatchEvent(
      new CustomEvent('remove-request', {
        detail: {
          requestType: this.removeRequestSelected,
          requests: {
            sr: this.shiftSrRequestCache,
            sem: this.shiftSemRequestSaved,
            off: this.shiftOffRequestSaved,
            vac: this.shiftVacRequestSaved,
            woff: this.shiftWoffRequestSaved,
          },
        },
      })
    );
  }

  removeWoffSaved(dateString?: string, practitioner?: SchedulePractitionerEntity) {
    if (this.isRemoveMode) {
      this.removeRequestSelected = this.findRequestType('woff');
      delete this.shiftWoffRequestSaved?.[practitioner?.id!]?.request?.[dateString!];
      this.sentRemoveEvent();
      this.requestUpdate();
    }
  }
  renderWoffSaved(dateString?: string, practitioner?: SchedulePractitionerEntity) {
    return html`<c-box h-full w-full p-4 border-box>
      <c-box
        class="woff-saved"
        bg-bluestate-200
        icon-prefix="pause-circle-line"
        w-full
        h-full
        flex
        justify-center
        round-6
        @click="${() => this.removeWoffSaved(dateString, practitioner)}"
        items-center></c-box>
    </c-box>`;
  }

  removeSrPlan(dayPart: DayPart, dateString: string, practitioner: SchedulePractitionerEntity) {
    if (this.isRemoveMode) {
      delete this.shiftSrRequestSaved[practitioner.id][dateString][dayPart];
      if (Object.keys(this.shiftSrRequestSaved[practitioner.id][dateString]).length === 0) {
        delete this.shiftSrRequestSaved[practitioner.id][dateString];
      }
      this.removeRequestSelected = this.findRequestType('sr');
      this.sentRemoveEvent();
      this.requestUpdate();
    }
  }

  renderSrShiftPlanSaved(
    planRequest: {
      [date: string]: SrShiftPlan;
    },
    dateString: string,
    practitioner: SchedulePractitionerEntity
  ) {
    const planEntries = Object.entries(planRequest?.[dateString]);
    console.log('shift-schedule.js |planEntries| = ', planEntries);
    return html`
      ${planEntries.map(([dayPart, plans]) => {
        return html`
          <c-box p-4 border-box flex flex-col row-gap-4>
            <c-box
              class="srDayPart"
              p-4
              border-box
              round-6
              h-44
              @click="${() => this.removeSrPlan(dayPart as DayPart, dateString, practitioner)}"
              bg-color="${this.setColorRequestType(dayPart as DayPart)}">
              <c-box>
                <c-box icon-prefix="favorite-line" flex flex-col>
                  <c-box
                    >${Object.keys(plans).map(
                      (plan) => html`<c-box inline>${plan}</c-box> `
                    )}</c-box
                  >
                </c-box>
              </c-box>
            </c-box>
          </c-box>
        `;
      })}
    `;
  }

  removeShiftPlanDatePicker(
    data: { date?: Date; remark?: string },
    type: RequestType['abbr'],
    practitioner: SchedulePractitionerEntity
  ) {
    if (this.isRemoveMode) {
      console.log('shift-schedule.js |data| = ', data);
      const dateString = this.convertDateToString(data.date!);

      if (type === 'sem') {
        delete this.shiftSemRequestSaved[practitioner.id][dateString];
        this.removeRequestSelected = this.findRequestType('sem');
        this.sentRemoveEvent();

        this.requestUpdate();
      }

      if (type === 'off') {
        delete this.shiftOffRequestSaved[practitioner.id][dateString];
        this.removeRequestSelected = this.findRequestType('off');
        this.sentRemoveEvent();
        this.requestUpdate();
      }

      if (type === 'vac') {
        delete this.shiftVacRequestSaved[practitioner.id][dateString];
        this.removeRequestSelected = this.findRequestType('vac');
        this.sentRemoveEvent();
        this.requestUpdate();
      }
    }
  }

  findRequestType(abbr: string) {
    return this.requestTypes?.find((res) => res.abbr === abbr) as RequestType;
  }
  renderShiftPlanSaved(
    data: { date?: Date; remark?: string },
    type: RequestType['abbr'],
    practitioner: SchedulePractitionerEntity
  ) {
    return html`<c-box p-4 border-box h-full w-full>
      <c-box
        class="shift-plan-datepicker"
        bg-modern-green-100
        bg-color="${requestTypeStyles[type].iconBgColor}"
        h-full
        w-full
        round-6
        p-6
        border-box
        @click="${() => this.removeShiftPlanDatePicker(data, type, practitioner)}">
        ${data.remark
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

  renderInitialRequest(request: ScheduleDataWithRender, practitioner: SchedulePractitionerEntity) {
    switch (request.requestType.abbr) {
      case 'sr':
        return html`
          ${Object.entries(request.arrangedRequest).map(([dayPart, plans]) => {
            return html`
              <c-box p-4 border-box flex flex-col row-gap-4>
                <c-box
                  p-4
                  border-box
                  round-6
                  h-44
                  bg-color="${this.setColorRequestType(dayPart as DayPart)}">
                  <c-box>
                    <c-box icon-prefix="favorite-line" flex flex-col>
                      <c-box>${plans.map((plan) => html`<c-box inline>${plan}</c-box> `)}</c-box>
                    </c-box>
                  </c-box>
                </c-box>
              </c-box>
            `;
          })}
        `;

      case 'woff':
        return html`${this.renderWoffSaved()}`;

      case 'off':
        return html`${this.renderShiftPlanSaved(
          {
            remark: '',
          },
          'off',
          practitioner
        )}`;

      case 'vac':
        return html`${this.renderShiftPlanSaved(
          {
            remark: '',
          },
          'vac',
          practitioner
        )}`;

      case 'sem':
        return html` <c-box h-full w-full p-4 border-box>
          <c-box
            h-full
            round-6
            bg-modern-green-100
            icon-prefix="favorite-line"
            icon-prefix-color="modern-green-500"
            flex
            justify-center
            items-center>
          </c-box>
        </c-box>`;
      default:
        break;
    }
  }

  saveDatepicker(e: CXDatePicker.SelectDate) {
    this.datepickerData = e.detail.date as DateRangeSelected;
  }

  saveWithDateData = (practitioner: SchedulePractitionerEntity) => {
    const remarkInput = this.querySelector<HTMLInputElement>('#remarkRef');
    const dateBetween = getDateBetweenArrayDate(
      this.datepickerData?.startdate!,
      this.datepickerData?.enddate!
    );

    const dataDate = {} as { [key: string]: DatePickerShiftPlan };
    for (const date of dateBetween) {
      dataDate[this.convertDateToString(date)] = {
        date: date,
        remark: remarkInput?.value,
      };
    }

    switch (this.requestSelected?.abbr) {
      case 'sem':
        if (!this.shiftSemRequestSaved[practitioner.id]) {
          this.shiftSemRequestSaved[practitioner.id] = {};
        }

        this.shiftSemRequestSaved[practitioner.id] = {
          ...this.shiftSemRequestSaved[practitioner.id],
          ...dataDate,
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
          this.shiftOffRequestSaved[practitioner.id] = {};
        }

        this.shiftOffRequestSaved[practitioner.id] = {
          ...this.shiftOffRequestSaved[practitioner.id],
          ...dataDate,
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
          this.shiftVacRequestSaved[practitioner.id] = {};
        }

        this.shiftVacRequestSaved[practitioner.id] = {
          ...this.shiftVacRequestSaved[practitioner.id],
          ...dataDate,
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
    this.selectedDate = undefined;
    ModalCaller.popover().clear();
  };

  renderDatepickerBox(data: { title: string; practitioner: SchedulePractitionerEntity }) {
    return html` <c-box content w>
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
          @select-date="${this.saveDatepicker}"
          .set="${{
            daterange: true,
            inputStyle: 'short',
          } as CXDatePicker.Set}"></cx-datepicker>
      </c-box>

      <c-box mt-12>หมายเหตุ</c-box>
      <c-box class="remark-input" mt-6 input-box="primary-200">
        <input
          id="remarkRef"
          type="text"
          style="border:none;outline:none;width:200px"
          placeholder="หมายเหตุเพิ่มเติม" />
      </c-box>
    </c-box>`;
  }

  renderEmptyDateForSelect(date: Date, practitioner: SchedulePractitionerEntity) {
    switch (this.requestSelected?.abbr) {
      case 'sr':
        return html`
          <cx-popover
            .set="${{
              arrowpoint: true,
              focusout: 'close',
              mouseleave: 'none',
              transform: 'center',
            } as CXPopover.Set}">
            ${this.renderEmptyBox(date)} ${this.renderSrPopover(date, practitioner)}
          </cx-popover>
        `;

      case 'sem':
        return html`
          <cx-popover
            .set="${{
              arrowpoint: true,
              focusout: 'close',
              mouseleave: 'none',
              transform: 'center',
            } as CXPopover.Set}">
            ${this.renderEmptyBox(date)}

            <c-box slot="popover">
              ${this.renderDatepickerBox({
                title: 'ขออบรม, สัมนา, ไปราชการ',
                practitioner,
              })}
            </c-box>
          </cx-popover>
        `;

      case 'off':
        return html`
          <cx-popover
            .set="${{
              arrowpoint: true,
              focusout: 'close',
              mouseleave: 'none',
              transform: 'center',
            } as CXPopover.Set}">
            ${this.renderEmptyBox(date)}

            <c-box slot="popover">
              ${this.renderDatepickerBox({
                title: 'ขอลาหยุด',
                practitioner,
              })}
            </c-box>
          </cx-popover>
        `;

      case 'vac':
        return html`
          <cx-popover
            .set="${{ arrowpoint: true, focusout: 'close', mouseleave: 'none' } as CXPopover.Set}">
            ${this.renderEmptyBox(date)}

            <c-box slot="popover">
              ${this.renderDatepickerBox({
                title: 'ขอลาพักร้อน',
                practitioner,
              })}
            </c-box>
          </cx-popover>
        `;

      case 'woff':
        return html` ${this.renderEmptyBox(date, 'woff', practitioner)} `;

      default:
        return undefined;
    }
  }

  // FIXME: any type w8 for api data
  renderRequestSr(mockdata: any, dayPart: DayPart) {
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
          ${mockdata.map((requestPlan: any) => {
            return html` <c-box flex items-center flex-col>
              <c-box
                @click="${() => this.addSrShiftRequest(requestPlan, dayPart)}"
                bg-hover="primary-100"
                bg-toggle="primary-100"
                bg-active="primary-200"
                cursor-pointer
                w-80
                h-30
                bg-color="primary-50"
                round-8
                flex
                justify-center
                items-center
                >${requestPlan.plan}</c-box
              >
              <c-box tx-12>${requestPlan.time}</c-box>
            </c-box>`;
          })}
        </c-box>
      </c-box>
    </c-box>`;
  }

  addSrShiftRequest(requestPlan: { plan: number; time: string }, dayPart: DayPart) {
    // 📌 long hand =  if (!this.shiftRequest[dayPart]) this.shiftRequest[dayPart] = {};
    this.shiftSrRequestCache[dayPart] ||= {};

    if (this.shiftSrRequestCache[dayPart][requestPlan.plan]) {
      delete this.shiftSrRequestCache[dayPart][requestPlan.plan];

      if (Object.keys(this.shiftSrRequestCache[dayPart]).length === 0) {
        delete this.shiftSrRequestCache[dayPart];
      }
    } else {
      this.shiftSrRequestCache[dayPart][requestPlan.plan] = requestPlan.time;
    }
  }

  renderSrPopover(date: Date, practitioner: SchedulePractitionerEntity) {
    // FIXME: w8 for api data
    const mockdata = [
      {
        plan: 1,
        time: '08:00-10:00',
      },
      {
        plan: 2,
        time: '10:00-12:00',
      },
      {
        plan: 3,
        time: '12:00-14:00',
      },
      {
        plan: 4,
        time: '14:00-16:00',
      },
      {
        plan: 5,
        time: '16:00-18:00',
      },
    ];
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
                  @click="${this.cancelSrRequestPlan}"
                  >ยกเลิก</cx-button
                >
                <cx-button
                  .var="${{ width: 'size-0' }}"
                  @click="${() => this.saveSrRequestPlan(date, practitioner)}"
                  >บันทึก</cx-button
                >
              </c-box>
            </c-box>
          </c-box>

          <!-- selected request -->
          <c-box mt-12 flex flex-col row-gap-24>
            <!-- morning -->
            ${this.renderRequestSr(mockdata, 'm')}

            <!-- afternoon -->
            ${this.renderRequestSr(mockdata, 'a')}

            <!-- evening -->
            ${this.renderRequestSr(mockdata, 'n')}
          </c-box>
        </c-box>
      </c-box>
    `;
  }

  clearShiftRequestCache() {
    this.shiftSrRequestCache = {} as SrShiftPlan;
  }

  cancelSrRequestPlan() {
    this.closePopover();
  }
  saveSrRequestPlan(date: Date, practitioner: SchedulePractitionerEntity) {
    if (!this.shiftSrRequestSaved[practitioner.id]) {
      this.shiftSrRequestSaved[practitioner.id] = {};
    }
    this.shiftSrRequestSaved[practitioner.id][this.convertDateToString(date)] =
      this.shiftSrRequestCache;

    this.requestUpdate();

    console.log('shift-schedule.js |this.shiftSrRequestSaved| = ', this.shiftSrRequestSaved);
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
    this.clearShiftRequestCache();
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
        detail: {
          practitioner,
          type: this.requestSelected,
          request: this.shiftWoffRequestSaved,
        },
      })
    );
    this.dispatchEvent(
      new CustomEvent('save-request', {
        detail: {
          [this.requestSelected?.abbr!]: {
            practitioner,
            type: this.requestSelected,
            request: this.shiftWoffRequestSaved,
          },
        },
      })
    );

    this.selectedDate = undefined;
  }

  renderEmptyBox(
    date: Date,
    type?: RequestType['abbr'],
    practitioner?: SchedulePractitionerEntity
  ) {
    const isSameDate = this.selectedDate === date;
    return html`
      <c-box
        p-4
        border-box
        w-full
        h-full
        slot="host"
        @click="${() => this.selectDateRequest(date, type, practitioner)}">
        <c-box
          bg-hover="primary-100"
          bg-active="primary-200"
          bg-color="${isSameDate ? 'primary-100' : 'white'}"
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

  convertRequestDatesToObject(requests: SchedulePractitionerRequestEntity[]): {
    [key: string]: ScheduleDataWithRender;
  } {
    // console.log('572: shift-schedule.js |requests| = ', requests);
    const result: {
      [key: string]: ScheduleDataWithRender;
    } = {};

    requests.forEach((item) => {
      const { requestDate, requestShift, requestType } = item;
      const [dayPart, requestPart] = requestShift.split('') as [DayPart, string];

      if (!result[requestDate]) {
        result[requestDate] = { arrangedRequest: {} as ArrangedRequest, requestType };
      }

      if (!result[requestDate].arrangedRequest[dayPart]) {
        result[requestDate].arrangedRequest[dayPart] = [];
      }

      result[requestDate].arrangedRequest[dayPart].push(requestPart);

      // assign other properties to the result object
      result[requestDate] = { ...result[requestDate] };

      // result[item.requestDate].requestRenderer = () =>
      //   this.renderFactoryRequestType(result[item.requestDate]);
    });
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
    const srDayParts = this.querySelectorAll('.srDayPart');
    const shiftPlandatepicker = this.querySelectorAll('.shift-plan-datepicker');
    const woffSaved = this.querySelectorAll('.woff-saved');
    if (this.isRemoveMode) {
      srDayParts.forEach((ele) => {
        ele?.setAttribute('cursor-pointer', '');
      });

      shiftPlandatepicker.forEach((ele) => {
        ele?.setAttribute('cursor-pointer', '');
      });

      woffSaved.forEach((ele) => {
        ele?.setAttribute('cursor-pointer', '');
      });
    } else {
      srDayParts.forEach((ele) => {
        ele?.removeAttribute('cursor-pointer');
      });

      shiftPlandatepicker.forEach((ele) => {
        ele?.removeAttribute('cursor-pointer');
      });

      woffSaved.forEach((ele) => {
        ele?.removeAttribute('cursor-pointer');
      });
    }
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
    type Ref = typeof ShiftSchedule;
  }
}
