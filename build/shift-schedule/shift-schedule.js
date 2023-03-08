var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { LitElement, html } from 'lit';
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
import { requestTypeStyles, } from './schedule.types';
import { createRef, ref } from 'lit/directives/ref.js';
import { ModalCaller } from '@cortex-ui/core/cx/helpers/ModalCaller';
let ShiftSchedule = class ShiftSchedule extends LitElement {
    constructor() {
        super(...arguments);
        this.buttonGroupUI = 'flex items-center col-gap-24 px-24';
        this.scheduleTitleUI = 'inline-flex';
        this.tableLineUI = 'border-1 border-solid border-primary-100 border-box';
        this.titleLeftTopUI = 'pl-12 flex flex-col pt-42 border-box';
        this.monthUI = 'flex items-center ';
        this.genderBox = `absolute right-0 top-26 width tx-10 w-16 h-16 bg-primary-500 tx-white flex justify-center items-center round-full z-1`;
        this.requestBox = 'min-w-90 inline-flex flex-col';
        this.userTitle = 'flex col-gap-6 p-12 border-box';
        this.weekDayUI = 'py-6 min-w-90 pl-12 border-box';
        this.weekDayWRapperUI = 'flex';
        this.monthEachUI = ' tx-12 pl-12 py-6 border-right-solid';
        this.sundayBorderRightUI = 'border-right-2 border-right-primary-500';
        this.titleSticky = 'sticky top-0 left-0 bg-white';
        this.userSelected = 'border-bottom-2 border-bottom-solid border-bottom-primary-500';
        this.tableWrapperUI = 'inline-flex flex-col';
        this.iconTitleWrapper = 'inline-flex round-24 border-1 border-primary-200 border-solid flex items-center col-gap-6 pr-12';
        this.iconTitle = 'round-full w-32 h-32 bg-primary-100 flex justify-center items-center';
        this.role = 'user';
        this.srState = [];
        this.shiftSrRequestCache = {};
        this.shiftSrRequestSaved = {};
        this.shiftSemRequestSaved = {};
        this.shiftOffRequestSaved = {};
        this.shiftVacRequestSaved = {};
        this.shiftWoffRequestSaved = {};
        this.tableWrapperRef = createRef();
        this.saveWithDateData = () => {
            const remarkInput = this.querySelector('#remarkRef');
            const dateBetween = getDateBetweenArrayDate(this.datepickerData?.startdate, this.datepickerData?.enddate);
            const dataDate = {};
            for (const date of dateBetween) {
                dataDate[this.convertDateToString(date)] = {
                    date: date,
                    remark: remarkInput?.value,
                };
            }
            switch (this.requestSelected?.abbr) {
                case 'sem':
                    this.shiftSemRequestSaved = { ...this.shiftSemRequestSaved, ...dataDate };
                    this.dispatchEvent(new CustomEvent('save-sem', {
                        detail: {
                            type: this.requestSelected,
                            request: this.shiftSemRequestSaved,
                        },
                    }));
                    this.dispatchEvent(new CustomEvent('save-request', {
                        detail: {
                            [this.requestSelected.abbr]: {
                                type: this.requestSelected,
                                request: this.shiftSemRequestSaved,
                            },
                        },
                    }));
                    break;
                case 'off':
                    this.shiftOffRequestSaved = { ...this.shiftOffRequestSaved, ...dataDate };
                    this.dispatchEvent(new CustomEvent('save-off', {
                        detail: {
                            type: this.requestSelected,
                            request: this.shiftOffRequestSaved,
                        },
                    }));
                    this.dispatchEvent(new CustomEvent('save-request', {
                        detail: {
                            [this.requestSelected.abbr]: {
                                type: this.requestSelected,
                                request: this.shiftOffRequestSaved,
                            },
                        },
                    }));
                    break;
                case 'vac':
                    this.shiftVacRequestSaved = { ...this.shiftVacRequestSaved, ...dataDate };
                    this.dispatchEvent(new CustomEvent('save-vac', {
                        detail: {
                            type: this.requestSelected,
                            request: this.shiftVacRequestSaved,
                        },
                    }));
                    this.dispatchEvent(new CustomEvent('save-request', {
                        detail: {
                            [this.requestSelected.abbr]: {
                                type: this.requestSelected,
                                request: this.shiftVacRequestSaved,
                            },
                        },
                    }));
                    break;
                default:
                    break;
            }
            this.selectedDate = undefined;
            ModalCaller.popover().clear();
        };
        this.setTableEgdeLine = () => {
            const element = this.tableWrapperRef.value;
            element.firstElementChild?.clientWidth;
            const hasScrollX = element.scrollWidth > element?.clientWidth;
            if (hasScrollX) {
                this.tableWrapperRef.value?.setAttribute('ui', this.tableLineUI);
            }
            else {
                this.tableWrapperRef.value?.removeAttribute('ui');
            }
        };
    }
    async connectedCallback() {
        super.connectedCallback();
        this.scheduleData = await (await fetch('http://localhost:3000/data')).json();
        this.requestTypes = await (await fetch('http://localhost:3000/types')).json();
    }
    willUpdate(_changedProperties) {
        if (_changedProperties.has('scheduleData')) {
            this.dateBetween = this.getDateBetween(new Date(this.scheduleData?.startDate), new Date(this.scheduleData?.endDate));
        }
        super.willUpdate(_changedProperties);
    }
    dateFormat(date, options) {
        if (!date)
            return;
        let newDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        return new Intl.DateTimeFormat('th-TH', options).format(newDate);
    }
    renderRequestButton() {
        return html `
      ${this.requestTypes?.map((type) => {
            const { accentColor, iconSrc, iconBgColor } = requestTypeStyles[type.abbr];
            return html ` <request-button
          @click="${() => this.selectRequest(type)}"
          .currentType="${this.requestSelected}"
          .requestType="${type}"
          text="${type.name}"
          icon="${iconSrc}"
          iconBgColor="${iconBgColor}"
          accentColor="${accentColor}"></request-button>`;
        })}
    `;
    }
    selectRequest(type) {
        this.requestSelected = type;
    }
    calcHeightOfUserTable() {
        const theme = this.querySelector('cx-theme');
        const userTable = this.querySelector('#week-month-user');
        setTimeout(() => {
            const heightOfTheme = theme?.getBoundingClientRect();
            const userTableTop = userTable?.getBoundingClientRect();
            this.maxHeightOfUserTable = Math.floor(heightOfTheme?.height - userTableTop?.top);
        }, 250);
    }
    clearRequest() {
        this.shiftSrRequestSaved = {};
        this.shiftSemRequestSaved = {};
        this.shiftOffRequestSaved = {};
        this.shiftVacRequestSaved = {};
        this.shiftWoffRequestSaved = {};
        this.dispatchEvent(new CustomEvent('clear-request', {
            detail: {
                sr: {},
                sem: {},
                off: {},
                vac: {},
                woff: {},
            },
        }));
    }
    render() {
        return html `
      <style>
        input::placeholder {
          font-family: Sarabun-Regular;
        }
      </style>
      <cx-theme>
        <cx-modal .set="${{ multiplePopover: true }}"></cx-modal>
        <c-box style="height:100vh" overflow-hidden>
          <c-box bg-white p-24 flex flex-col row-gap-24>
            <c-box ui="${this.buttonGroupUI}">
              <c-box whitespace-pre> เลือกรูปแบบคำขอเวร </c-box>
              ${this.renderRequestButton()}
              <c-box inline h-40 w-1 bg-pinky-100></c-box>
              <c-box
                @click="${this.clearRequest}"
                cursor-pointer
                shadow-hover="shadow-3"
                inline-flex
                items-center
                col-gap-12
                round-44
                w-96
                border-solid
                border-1
                border-pinky-100>
                <c-box flex-center icon-prefix="close-circle-line" w-44 h-44 round-full bg-pinky-50>
                </c-box>
                <c-box>ลบ</c-box>
              </c-box>
            </c-box>

            <c-box overflow-x-auto overflow-y-hidden ${ref(this.tableWrapperRef)}>
              <c-box ui="${this.tableWrapperUI} ${this.tableLineUI}">
                <c-box ui="${this.scheduleTitleUI}">
                  <!-- FIXME: should titleSticky below -->
                  <c-box UI="${this.tableLineUI} ${this.titleLeftTopUI} " min-w="260">
                    <c-box semiBold tx-16>รายชื่อเจ้าหน้าที่</c-box>
                    <c-box tx-14
                      >ทั้งหมด ${this.scheduleData?.schedulePractitioner?.length} คน</c-box
                    >
                  </c-box>

                  <c-box flex id="week-month-title">
                    ${this.dateBetween?.map((dateBet) => {
            return html `
                        <c-box>
                          <c-box ui="${this.monthUI} ${this.tableLineUI}" pl-12 border-box>
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
                return html `
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
                    const isSunday = date.getDay() === 0 ? this.sundayBorderRightUI : '';
                    return html ` <c-box
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

                <c-box
                  inline-flex
                  flex-col
                  id="week-month-user"
                  overflow-y-auto
                  overflow-x-hidden
                  style="height:${this.maxHeightOfUserTable}px">
                  ${this.scheduleData?.schedulePractitioner?.map((practitioner, indexUser) => {
            const { practitioner: { gender, nameFamily, nameGiven, practitionerLevel, practitionerRole, }, schedulePractitionerRequest: request, } = practitioner;
            const borderBottom = indexUser === 0 ? this.userSelected : '';
            const requestData = this.convertRequestDatesToObject(request);
            return html `
                        <c-box flex>
                          <c-box
                            min-w="260"
                            ui="${this.userTitle} ${this.tableLineUI} ${this
                .titleSticky} ${borderBottom}">
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
                return html `
                              ${dateBet.dateBetween.map((week) => {
                    return html `
                                  ${week.map((day) => {
                        day.setHours(0, 0, 0, 0);
                        const borderRight = day.getDay() === 0 ? this.sundayBorderRightUI : '';
                        const dateString = this.convertDateToString(day);
                        const srSaved = this.shiftSrRequestSaved[dateString];
                        const requestInitial = requestData[dateString];
                        const semSaved = this.shiftSemRequestSaved[dateString];
                        const offSaved = this.shiftOffRequestSaved[dateString];
                        const vacSaved = this.shiftVacRequestSaved[dateString];
                        const woffSaved = this.shiftWoffRequestSaved[dateString];
                        return html ` <c-box
                                      ui="${this.tableLineUI} ${this
                            .requestBox} ${borderRight} ${borderBottom}">
                                      <c-box w-full h-full bg-white>
                                        <!-- if have request date then render request -->
                                        ${srSaved && indexUser === 0
                            ? this.renderSrShiftPlanSaved(srSaved)
                            : semSaved && indexUser === 0
                                ? this.renderShiftPlanSaved(semSaved, 'sem')
                                : offSaved && indexUser === 0
                                    ? this.renderShiftPlanSaved(offSaved, 'off')
                                    : vacSaved && indexUser === 0
                                        ? this.renderShiftPlanSaved(vacSaved, 'vac')
                                        : woffSaved && indexUser === 0
                                            ? this.renderWoffSaved()
                                            : requestInitial && indexUser === 0
                                                ? this.renderInitialRequest(requestInitial)
                                                : indexUser === 0
                                                    ? this.renderEmptyDateForSelect(day)
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
        })}
                </c-box>
              </c-box>
            </c-box>
          </c-box>
        </c-box>
      </cx-theme>
    `;
    }
    renderWoffSaved() {
        return html `<c-box h-full w-full p-4 border-box>
      <c-box
        bg-bluestate-200
        icon-prefix="pause-circle-line"
        w-full
        h-full
        flex
        justify-center
        round-6
        items-center></c-box>
    </c-box>`;
    }
    renderSrShiftPlanSaved(plans) {
        const planEntries = Object.entries(plans);
        return html `
      ${planEntries.map(([dayPart, plans]) => {
            return html `
          <c-box p-4 border-box flex flex-col row-gap-4>
            <c-box
              p-4
              border-box
              round-6
              h-44
              bg-color="${this.setColorRequestType(dayPart)}">
              <c-box>
                <c-box icon-prefix="favorite-line" flex flex-col>
                  <c-box
                    >${Object.keys(plans).map((plan) => html `<c-box inline>${plan}</c-box> `)}</c-box
                  >
                </c-box>
              </c-box>
            </c-box>
          </c-box>
        `;
        })}
    `;
    }
    renderShiftPlanSaved(data, type) {
        return html `<c-box p-4 border-box h-full w-full>
      <c-box
        bg-modern-green-100
        bg-color="${requestTypeStyles[type].iconBgColor}"
        h-full
        w-full
        round-6
        p-6
        border-box>
        ${data.remark
            ? html `<c-box
              flex
              flex-col
              icon-prefix="favorite-line"
              icon-prefix-color="modern-green-500">
              ${data.remark}
            </c-box>`
            : html `<c-box
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
    renderInitialRequest(request) {
        switch (request.requestType.abbr) {
            case 'sr':
                return html `
          ${Object.entries(request.arrangedRequest).map(([dayPart, plans]) => {
                    return html `
              <c-box p-4 border-box flex flex-col row-gap-4>
                <c-box
                  p-4
                  border-box
                  round-6
                  h-44
                  bg-color="${this.setColorRequestType(dayPart)}">
                  <c-box>
                    <c-box icon-prefix="favorite-line" flex flex-col>
                      <c-box>${plans.map((plan) => html `<c-box inline>${plan}</c-box> `)}</c-box>
                    </c-box>
                  </c-box>
                </c-box>
              </c-box>
            `;
                })}
        `;
            case 'woff':
                return html `${this.renderWoffSaved()}`;
            case 'off':
                return html `${this.renderShiftPlanSaved({
                    remark: '',
                }, 'off')}`;
            case 'vac':
                return html `${this.renderShiftPlanSaved({
                    remark: '',
                }, 'vac')}`;
            case 'sem':
                return html ` <c-box h-full w-full p-4 border-box>
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
    saveDatepicker(e) {
        this.datepickerData = e.detail.date;
    }
    renderDatepickerBox(data) {
        return html ` <c-box content>
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
              .var="${{ width: 'size-0' }}"
              .set="${{ type: 'secondary' }}"
              @click="${ModalCaller.popover().clear}"
              >ยกเลิก</cx-button
            >
            <cx-button
              @click="${this.saveWithDateData}"
              .var="${{ width: 'size-0' }}"
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
        }}"></cx-datepicker>
      </c-box>

      <c-box mt-12>หมายเหตุ</c-box>
      <c-box mt-6 input-box="primary-500">
        <input
          id="remarkRef"
          type="text"
          style="border:none;outline:none"
          placeholder="หมายเหตุเพิ่มเติม" />
      </c-box>
    </c-box>`;
    }
    renderEmptyDateForSelect(date) {
        switch (this.requestSelected?.abbr) {
            case 'sr':
                return html `
          <cx-popover
            .set="${{
                    arrowpoint: true,
                    focusout: 'none',
                    mouseleave: 'none',
                }}">
            ${this.renderEmptyBox(date)} ${this.renderSrPopover(date)}
          </cx-popover>
        `;
            case 'sem':
                return html `
          <cx-popover
            .set="${{ arrowpoint: true, focusout: 'none', mouseleave: 'none' }}">
            ${this.renderEmptyBox(date)}

            <c-box slot="popover">
              ${this.renderDatepickerBox({
                    title: 'ขออบรม, สัมนา, ไปราชการ',
                })}
            </c-box>
          </cx-popover>
        `;
            case 'off':
                return html `
          <cx-popover
            .set="${{ arrowpoint: true, focusout: 'none', mouseleave: 'none' }}">
            ${this.renderEmptyBox(date)}

            <c-box slot="popover">
              ${this.renderDatepickerBox({
                    title: 'ขอลาหยุด',
                })}
            </c-box>
          </cx-popover>
        `;
            case 'vac':
                return html `
          <cx-popover
            .set="${{ arrowpoint: true, focusout: 'none', mouseleave: 'none' }}">
            ${this.renderEmptyBox(date)}

            <c-box slot="popover">
              ${this.renderDatepickerBox({
                    title: 'ขอลาพักร้อน',
                })}
            </c-box>
          </cx-popover>
        `;
            case 'woff':
                return html ` ${this.renderEmptyBox(date, 'woff')} `;
            default:
                return undefined;
        }
    }
    // FIXME: any type w8 for api data
    renderRequestSr(mockdata, dayPart) {
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
        return html ` <c-box flex col-gap-24>
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
          ${mockdata.map((requestPlan) => {
            return html ` <c-box flex items-center flex-col>
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
    addSrShiftRequest(requestPlan, dayPart) {
        // 📌 long hand =  if (!this.shiftRequest[dayPart]) this.shiftRequest[dayPart] = {};
        this.shiftSrRequestCache[dayPart] ||= {};
        if (this.shiftSrRequestCache[dayPart][requestPlan.plan]) {
            delete this.shiftSrRequestCache[dayPart][requestPlan.plan];
            if (Object.keys(this.shiftSrRequestCache[dayPart]).length === 0) {
                delete this.shiftSrRequestCache[dayPart];
            }
        }
        else {
            this.shiftSrRequestCache[dayPart][requestPlan.plan] = requestPlan.time;
        }
    }
    renderSrPopover(date) {
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
        return html `
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
                  .set="${{ type: 'secondary' }}"
                  @click="${this.cancelSrRequestPlan}"
                  >ยกเลิก</cx-button
                >
                <cx-button
                  .var="${{ width: 'size-0' }}"
                  @click="${() => this.saveSrRequestPlan(date)}"
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
        this.shiftSrRequestCache = {};
    }
    cancelSrRequestPlan() {
        this.closePopover();
    }
    saveSrRequestPlan(date) {
        this.shiftSrRequestSaved[this.convertDateToString(date)] = this.shiftSrRequestCache;
        this.requestUpdate();
        this.dispatchEvent(new CustomEvent('save-sr', {
            detail: {
                type: this.requestSelected,
                request: this.shiftSrRequestSaved,
            },
        }));
        this.dispatchEvent(new CustomEvent('save-request', {
            detail: {
                [this.requestSelected?.abbr]: {
                    type: this.requestSelected,
                    request: this.shiftSrRequestSaved,
                },
            },
        }));
        this.selectedDate = undefined;
        this.closePopover();
    }
    closePopover() {
        this.clearShiftRequestCache();
        ModalCaller.popover().clear();
    }
    selectDateRequest(date, type) {
        this.selectedDate = date;
        if (type === 'woff') {
            this.saveWoffRequest(date);
        }
    }
    saveWoffRequest(date) {
        this.shiftWoffRequestSaved = {
            ...this.shiftWoffRequestSaved,
            [this.convertDateToString(date)]: {
                date,
            },
        };
        this.dispatchEvent(new CustomEvent('save-woff', {
            detail: {
                type: this.requestSelected,
                request: this.shiftWoffRequestSaved,
            },
        }));
        this.dispatchEvent(new CustomEvent('save-request', {
            detail: {
                [this.requestSelected?.abbr]: {
                    type: this.requestSelected,
                    request: this.shiftWoffRequestSaved,
                },
            },
        }));
        this.selectedDate = undefined;
    }
    renderEmptyBox(date, type) {
        const isSameDate = this.selectedDate === date;
        return html `
      <c-box
        p-4
        border-box
        w-full
        h-full
        slot="host"
        @click="${() => this.selectDateRequest(date, type)}">
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
    firstUpdated() {
        window.addEventListener('resize', this.setTableEgdeLine);
        setTimeout(() => {
            this.setTableEgdeLine();
        }, 250);
    }
    convertRequestDatesToObject(requests) {
        // console.log('572: shift-schedule.js |requests| = ', requests);
        const result = {};
        requests.forEach((item) => {
            const { requestDate, requestShift, requestType } = item;
            const [dayPart, requestPart] = requestShift.split('');
            if (!result[requestDate]) {
                result[requestDate] = { arrangedRequest: {}, requestType };
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
    setColorRequestType(requestTime) {
        switch (requestTime) {
            case 'a':
                return 'warning-100';
            case 'n':
            case 'm':
                return 'primary-100';
        }
    }
    convertDateToString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    updated(changedProp) {
        // remove borderRight last element
        const weekMonthTitle = this.querySelector('#week-month-title');
        const weekMonthUser = this.querySelector('#week-month-user');
        const lastTableIndexTitle = weekMonthTitle?.lastElementChild?.lastElementChild?.lastElementChild;
        const lastTableIndexUser = weekMonthUser?.firstElementChild?.lastElementChild;
        const lastMonthEle = lastTableIndexTitle?.children.item(0);
        const lastWeekEle = lastTableIndexTitle?.children.item(1)?.lastElementChild;
        if (!lastWeekEle || !lastMonthEle || !lastTableIndexUser)
            return;
        requestAnimationFrame(() => {
            lastMonthEle.style.borderRight = 'var(--size-1) solid var(--primary-100)';
            lastWeekEle.style.borderRight = 'var(--size-1) solid var(--primary-100)';
            lastTableIndexUser.style.borderRight = 'var(--size-1) solid var(--primary-100)';
        });
        this.calcHeightOfUserTable();
    }
    getDateBetween(startDate, endDate) {
        const result = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const currentMonth = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
            const currentWeekday = currentDate.getDay();
            if (currentWeekday === 1) {
                const currentWeek = [new Date(currentDate)];
                while (currentWeek.length < 7 && currentDate < endDate) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    currentWeek.push(new Date(currentDate));
                }
                if (!result.find(({ currentMonth: cm }) => cm === currentMonth)) {
                    result.push({ currentMonth, dateBetween: [] });
                }
                result.find(({ currentMonth: cm }) => cm === currentMonth)?.dateBetween.push(currentWeek);
            }
            else if (!result.find(({ currentMonth: cm }) => cm === currentMonth)) {
                result.push({ currentMonth, dateBetween: [[new Date(currentDate)]] });
            }
            else {
                result
                    .find(({ currentMonth: cm }) => cm === currentMonth)
                    ?.dateBetween[result[result.length - 1].dateBetween.length - 1].push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return result;
    }
    createRenderRoot() {
        return this;
    }
};
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], ShiftSchedule.prototype, "role", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "scheduleData", void 0);
__decorate([
    property({ type: Array }),
    __metadata("design:type", Array)
], ShiftSchedule.prototype, "requestTypes", void 0);
__decorate([
    state(),
    __metadata("design:type", Array)
], ShiftSchedule.prototype, "dateBetween", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "requestSelected", void 0);
__decorate([
    state(),
    __metadata("design:type", Date)
], ShiftSchedule.prototype, "selectedDate", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "srState", void 0);
__decorate([
    state(),
    __metadata("design:type", Number)
], ShiftSchedule.prototype, "maxHeightOfUserTable", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], ShiftSchedule.prototype, "userImgDefault", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "shiftSrRequestSaved", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "shiftSemRequestSaved", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "shiftOffRequestSaved", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "shiftVacRequestSaved", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "shiftWoffRequestSaved", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "datepickerData", void 0);
ShiftSchedule = __decorate([
    customElement('cx-shift-schedule')
], ShiftSchedule);
export { ShiftSchedule };
//# sourceMappingURL=shift-schedule.js.map