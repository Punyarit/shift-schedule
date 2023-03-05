import { LitElement, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@cortex-ui/core/cx/c-box';
import '@cortex-ui/core/cx/modal';
import '@cortex-ui/core/cx/theme';
import '@cortex-ui/core/cx/icon';
import '@cortex-ui/core/cx/button';
import '@cortex-ui/core/cx/datepicker';
import '@cortex-ui/core/cx/popover';
import './components/request-button';
import {
  DateBetweenData,
  DayPart,
  RequestType,
  requestTypeStyles,
  ScheduleDataWithRender,
  SchedulePractitionerRequestEntity,
  SchedulingData,
} from './schedule.types';
import { createRef, ref } from 'lit/directives/ref.js';
import { ColorTypesV2 } from '@cortex-ui/core/cx/types/colors.v2.type';
import { ScheduleRequestDetailResponse, ScheduleRequestType } from './schedule-client.typess';

@customElement('cx-shift-schedule')
export class ShiftSchedule extends LitElement {
  private buttonGroupUI = 'flex items-center col-gap-24 px-24';
  private scheduleTitleUI = 'inline-flex';
  private tableLineUI = 'border-1 border-solid border-primary-100 border-box';
  private titleLeftTopUI = 'min-w-260 pl-12 flex flex-col pt-42 border-box';
  private monthUI = 'flex items-center ';
  private genderBox = `absolute right-0 top-26 width tx-10 w-16 h-16 bg-primary-500 tx-white flex justify-center items-center round-full z-1`;
  private requestBox = 'min-w-90 inline-flex flex-col';
  private userTitle = 'flex col-gap-6 min-w-260 p-12 border-box';
  private weekDayUI = 'py-6 min-w-90 pl-12 border-box';
  private weekDayWRapperUI = 'flex';
  private monthEachUI = ' tx-12 pl-12 py-6 border-right-solid';
  private sundayBorderRightUI = 'border-right-2 border-right-primary-500';
  private titleSticky = 'sticky top-0 left-0 bg-white';
  private userSelected = 'border-bottom-2 border-bottom-solid border-bottom-primary-500';
  private tableWrapperUI = 'inline-flex flex-col';
  private iconTitleWrapper =
    'inline-flex round-24 border-1 border-primary-200 border-solid flex items-center col-gap-6 pr-12';
  private iconTitle = 'round-full w-32 h-32 bg-primary-100 flex justify-center items-center';

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

  public tableWrapperRef = createRef<HTMLDivElement>();

  async connectedCallback() {
    super.connectedCallback();
    // this.scheduleData = await (await fetch('http://localhost:3001/data')).json();
    // this.requestTypes = await (await fetch('http://localhost:3001/types')).json();
  }

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
          @mousedown="${() => this.selectRequest(type as RequestType)}"
          .currentType="${this.requestSelected}"
          .requestType="${type}"
          text="${type.name}"
          icon="${iconSrc}"
          iconBgColor="${iconBgColor}"
          accentColor="${accentColor}"></request-button>`;
      })}
    `;
  }

  @property({ type: String })
  userImgDefault?: string;

  selectRequest(type: RequestType) {
    this.requestSelected = type;
  }

  render() {
    return html`
      <style>
        cx-button {
          --width: var(--size-50) !important;
        }
      </style>
      <cx-theme>
        <cx-modal .set="${{ multiplePopover: true } as CXModal.Set}"></cx-modal>
        <c-box bg-white p-24 flex flex-col row-gap-24>
          <c-box ui="${this.buttonGroupUI}">
            <c-box> เลือกรูปแบบคำขอเวร </c-box>
            ${this.renderRequestButton()}
          </c-box>

          <c-box overflow-x-auto ${ref(this.tableWrapperRef)}>
            <c-box ui="${this.tableWrapperUI} ${this.tableLineUI}">
              <c-box ui="${this.scheduleTitleUI}">
                <c-box UI="${this.tableLineUI} ${this.titleLeftTopUI} ${this.titleSticky}">
                  <c-box semiBold tx-16>รายชื่อเจ้าหน้าที่</c-box>
                  <c-box tx-14>ทั้งหมด 70 คน</c-box>
                </c-box>

                <c-box flex id="week-month-title">
                  ${this.dateBetween?.map((dateBet) => {
                    return html`
                      <c-box>
                        <c-box ui="${this.monthUI} ${this.tableLineUI}" pl-12 border-box>
                          <c-box icon-prefix="favorite-line" icon-suffix="favorite-line" tx-12 py-6>
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
                                  ui="${this.monthEachUI} ${this.sundayBorderRightUI} ${this
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
                                      ui="${isSunday} ${this.tableLineUI} ${this.weekDayUI}">
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

              <c-box inline-flex flex-col id="week-month-user" style="height: calc(100vh - 293px);">
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
                    const borderBottom: string = indexUser === 0 ? this.userSelected : '';

                    const requestData = this.convertRequestDatesToObject(
                      request as SchedulePractitionerRequestEntity[]
                    );
                    return html`
                      <c-box flex>
                        <c-box
                          ui="${this.userTitle} ${this.tableLineUI} ${this
                            .titleSticky} ${borderBottom}">
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
                                  const borderRight =
                                    day.getDay() === 0 ? this.sundayBorderRightUI : '';

                                  const dateString = this.convertDateToString(day);

                                  return html` <c-box
                                    ui="${this.tableLineUI} ${this
                                      .requestBox} ${borderRight} ${borderBottom}">
                                    <c-box w-full h-full bg-white>
                                      <!-- if have request date then render request -->
                                      ${requestData[dateString]
                                        ? requestData[dateString].render?.()
                                        : indexUser === 0
                                        ? this.renderEmptyDate(day)
                                        : html` <c-box p-4 border-box w-full h-full slot="host">
                                            <c-box
                                              bg-hover="primary-100"
                                              w-full
                                              h-full
                                              round-8
                                              flex
                                              justify-center
                                              items-center
                                              cursor-pointer
                                              icon-prefix-color-hover="primary-300"
                                              icon-prefix-hover="plus-line"></c-box>
                                          </c-box>`}
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

        <c-box fixed bottom-0 p-24 w-full border-box>
          <c-box
            h-64
            bg-white
            border-box
            shadow-4
            flex
            col-gap-24
            round-12
            items-center
            p-24
            border-box
            justify-between>
            <c-box inline-flex col-gap-24 items-center>
              <c-box inline>สรุปจำนวนคำขอเวรนี้</c-box>
              <c-box inline round-36 bg-primary-50 tx-gray-500 px-16 py-8 border-box
                >หยุดประจำสัปดาห์(0) 0</c-box
              >
              <c-box inline round-36 bg-primary-50 tx-gray-500 px-16 py-8 border-box
                >ลาหยุด(0) 0</c-box
              >
              <c-box inline round-36 bg-primary-50 tx-gray-500 px-16 py-8 border-box
                >ลาพักร้อน (15)(0) 0</c-box
              >
            </c-box>

            <c-box flex flex-end col-gap-12>
              <cx-button .set="${{ type: 'secondary' } as CXButton.Set}">ยกเลิก</cx-button>
              <cx-button @click="${this.onSave}">บันทึกการเปลี่ยนแปลง</cx-button>
            </c-box>
          </c-box>
        </c-box>
      </cx-theme>
    `;
  }

  onSave() {
    this.dispatchEvent(
      new CustomEvent('save-request', {
        detail: { request: this.scheduleData },
      })
    );
  }

  renderEmptyDate(date: Date) {
    switch (this.requestSelected?.abbr) {
      case 'sr':
        return html`
          <cx-popover
            .set="${{
              arrowpoint: true,
              focusout: 'close',
              mouseleave: 'none',
            } as CXPopover.Set}">
            ${this.renderEmptyBox(date)} ${this.renderSrPopover()}
          </cx-popover>
        `;

      case 'sem':
        return html`
          <cx-popover
            .set="${{ arrowpoint: true, focusout: 'close', mouseleave: 'none' } as CXPopover.Set}">
            ${this.renderEmptyBox(date)}

            <c-box slot="popover">
              <c-box content>
                <!-- title -->
                <c-box>
                  <c-box ui="${this.iconTitleWrapper}">
                    <c-box
                      icon-prefix="circle-line"
                      icon-prefix-color="primary-500"
                      ui="${this.iconTitle}"></c-box>
                    <c-box tx-14> ขออบรม, สัมนา, ไปราชการ </c-box>
                  </c-box>
                  <c-box mt-12 flex items-center flex justify-between>
                    <c-box tx-16 semiBold tx-gray-700>เลือกเวรที่ต้องการ</c-box>
                    <c-box>
                      <cx-button .set="${{ type: 'secondary' } as CXButton.Set}">ยกเลิก</cx-button>
                      <cx-button>บันทึก</cx-button>
                    </c-box>
                  </c-box>
                </c-box>
                <!-- date picker -->
                <c-box mt-12>
                  <c-box mb-12>Date</c-box>
                  <cx-datepicker
                    .set="${{
                      daterange: true,
                      inputStyle: 'short',
                    } as CXDatePicker.Set}"></cx-datepicker>
                </c-box>

                <c-box mt-12>หมายเหตุ</c-box>
                <c-box mt-6 input-box="primary-500">
                  <input
                    type="text"
                    style="border:none;outline:none"
                    placeholder="หมายเหตุเพิ่มเติม" />
                </c-box>
              </c-box>
            </c-box>
          </cx-popover>
        `;

      case 'off':
        return html` ${this.renderEmptyBox(date, 'off')} `;

      case 'vac':
        return html`
          <cx-popover
            .set="${{ arrowpoint: true, focusout: 'close', mouseleave: 'none' } as CXPopover.Set}">
            ${this.renderEmptyBox(date)}

            <c-box slot="popover">
              <c-box content>
                <!-- title -->
                <c-box>
                  <c-box ui="${this.iconTitleWrapper}">
                    <c-box
                      icon-prefix="circle-line"
                      icon-prefix-color="primary-500"
                      ui="${this.iconTitle}"></c-box>
                    <c-box tx-14> ขอลาหยุด </c-box>
                  </c-box>
                  <c-box mt-12 flex items-center flex justify-between>
                    <c-box tx-16 semiBold tx-gray-700>เลือกเวรที่ต้องการ</c-box>
                    <c-box>
                      <cx-button .set="${{ type: 'secondary' } as CXButton.Set}">ยกเลิก</cx-button>
                      <cx-button>บันทึก</cx-button>
                    </c-box>
                  </c-box>
                </c-box>
                <!-- date picker -->
                <c-box mt-12>
                  <c-box mb-12>Date</c-box>
                  <cx-datepicker
                    .set="${{
                      daterange: true,
                      inputStyle: 'short',
                    } as CXDatePicker.Set}"></cx-datepicker>
                </c-box>

                <c-box mt-12>หมายเหตุ</c-box>
                <c-box mt-6 input-box="primary-500">
                  <input
                    type="text"
                    style="border:none;outline:none"
                    placeholder="หมายเหตุเพิ่มเติม" />
                </c-box>
              </c-box>
            </c-box>
          </cx-popover>
        `;

      case 'woff':
        return html`
          <cx-popover
            .set="${{ arrowpoint: true, focusout: 'close', mouseleave: 'none' } as CXPopover.Set}">
            ${this.renderEmptyBox(date)}

            <c-box slot="popover">
              <c-box content>
                <!-- title -->
                <c-box>
                  <c-box ui="${this.iconTitleWrapper}">
                    <c-box
                      icon-prefix="circle-line"
                      icon-prefix-color="primary-500"
                      ui="${this.iconTitle}"></c-box>
                    <c-box tx-14> ขอลาหยุด </c-box>
                  </c-box>
                  <c-box mt-12 flex items-center flex justify-between>
                    <c-box tx-16 semiBold tx-gray-700>เลือกเวรที่ต้องการ</c-box>
                    <c-box>
                      <cx-button .set="${{ type: 'secondary' } as CXButton.Set}">ยกเลิก</cx-button>
                      <cx-button>บันทึก</cx-button>
                    </c-box>
                  </c-box>
                </c-box>
                <!-- date picker -->
                <c-box mt-12>
                  <c-box mb-12>Date</c-box>
                  <cx-datepicker
                    .set="${{
                      daterange: true,
                      inputStyle: 'short',
                    } as CXDatePicker.Set}"></cx-datepicker>
                </c-box>

                <c-box mt-12>หมายเหตุ</c-box>
                <c-box mt-6 input-box="primary-500">
                  <input
                    type="text"
                    style="border:none;outline:none"
                    placeholder="หมายเหตุเพิ่มเติม" />
                </c-box>
              </c-box>
            </c-box>
          </cx-popover>
        `;
      default:
        return undefined;
    }
  }

  // FIXME: any type w8 for api data
  renderRequestSr(mockdata: any, dayPart: DayPart) {
    const srData = {
      afternoon: {
        text: 'กลางวัน',
      },
      evening: {
        text: 'เย็น',
      },
      morning: {
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
          ${mockdata.map((res: any) => {
            return html` <c-box flex items-center flex-col>
              <c-box
                @click="${() => this.addSrState(res)}"
                bg-hover="primary-100"
                cursor-pointer
                w-80
                h-30
                bg-primary-50
                round-8
                flex
                justify-center
                items-center
                >${res.plan}</c-box
              >
              <c-box tx-12>${res.time}</c-box>
            </c-box>`;
          })}
        </c-box>
      </c-box>
    </c-box>`;
  }

  addSrState(res: any) {
    console.log('shift-scheduling.js |res| = ', res);
  }

  renderSrPopover() {
    // FIXME: w8 for api data
    const mockdata = [
      {
        plan: 1,
        time: '08:00-10:00',
      },
      {
        plan: 2,
        time: '08:00-10:00',
      },
      {
        plan: 3,
        time: '08:00-10:00',
      },
      {
        plan: 4,
        time: '08:00-10:00',
      },
      {
        plan: 5,
        time: '08:00-10:00',
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
                <cx-button .set="${{ type: 'secondary' } as CXButton.Set}">ยกเลิก</cx-button>
                <cx-button @click="${this.saveSrState}">บันทึก</cx-button>
              </c-box>
            </c-box>
          </c-box>

          <!-- selected request -->
          <c-box mt-12 flex flex-col row-gap-24>
            <!-- morning -->
            ${this.renderRequestSr(mockdata, 'morning')}

            <!-- afternoon -->
            ${this.renderRequestSr(mockdata, 'afternoon')}

            <!-- evening -->
            ${this.renderRequestSr(mockdata, 'evening')}
          </c-box>
        </c-box>
      </c-box>
    `;
  }

  saveSrState() {
    console.log('shift-scheduling.js |this.srState| = ', this.srState);
  }

  selectDateRequest(date: Date) {
    this.selectedDate = date;
  }

  renderEmptyBox(date: Date, type?: string) {
    const isSameDate = this.selectedDate?.getTime() === date.getTime();
    return html`
      <c-box
        p-4
        border-box
        w-full
        h-full
        slot="host"
        @click="${() => this.selectDateRequest(date)}">
        <c-box
          bg-hover="primary-100"
          bg-color="${isSameDate ? 'primary-100' : 'white'}"
          icon-prefix="${isSameDate ? (type ? 'pause-circle-line' : 'plus-line') : 'none'}"
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
    // console.log('shift-scheduling.js |123| = ', 123);
    window.addEventListener('resize', this.setTableEgdeLine);
    setTimeout(() => {
      this.setTableEgdeLine();
    }, 250);
  }

  convertRequestDatesToObject(arr: SchedulePractitionerRequestEntity[]): {
    [key: string]: ScheduleDataWithRender;
  } {
    const result: {
      [key: string]: ScheduleDataWithRender;
    } = {};

    arr.forEach((item) => {
      result[item.requestDate] = { ...item, render: null };
      result[item.requestDate].requestDate;
      result[item.requestDate].render = () =>
        this.renderFactoryRequestType(result[item.requestDate]);
    });

    return result;
  }

  renderFactoryRequestType(requestDate: SchedulePractitionerRequestEntity) {
    if (requestDate.requestType.name === 'ขออยู่เวร') {
      const [requestTime, requestDuring] = requestDate.requestShift.split('') as [
        'a' | 'm' | 'n',
        string
      ];
      return html`<c-box p-1 border-box>
        <c-box h-44 bg-color="${this.setColorRequestType(requestTime)}">
          <c-box>
            <c-box icon-prefix="favorite-line" flex flex-col> ${requestDuring} </c-box>
          </c-box>
        </c-box>
      </c-box>`;
    } else if (requestDate.requestType.name === 'ลาหยุด') {
      const icon: CXIcon.Set['src'] = 'pause-circle-line';
      return html`
        <c-box
          bg-bluestate-200
          h-full
          w-full
          icon-prefix="${icon}"
          flex
          justify-center
          items-center>
        </c-box>
      `;
    }

    return html``;
  }

  setColorRequestType(requestTime: 'a' | 'm' | 'n'): ColorTypesV2 {
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

  updated() {
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
