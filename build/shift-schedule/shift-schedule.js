var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { LitElement, html, render } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getDateBetweenArrayDate, } from '@cortex-ui/core/cx/helpers/functions/date/date-methods';
import '@cortex-ui/core/cx/c-box';
import '@cortex-ui/core/cx/modal';
import '@cortex-ui/core/cx/theme';
import '@cortex-ui/core/cx/icon';
import '@cortex-ui/core/cx/button';
import '@cortex-ui/core/cx/datepicker';
import '@cortex-ui/core/cx/popover';
import './components/request-button';
import { debounce } from '@cortex-ui/core/cx/helpers/debounceTimer';
import { requestTypeStyles, dayPortValue, genderType, shiftPlanIcon, } from './schedule.types';
import { createRef, ref } from 'lit/directives/ref.js';
import { ModalCaller } from '@cortex-ui/core/cx/helpers/ModalCaller';
import { ModalSingleton } from '@cortex-ui/core/cx/components/modal/singleton/modal.singleton';
import '@lit-labs/virtualizer';
let ShiftSchedule = class ShiftSchedule extends LitElement {
    constructor() {
        super(...arguments);
        this.buttonGroupUI = 'buttonGroupUI: flex items-center col-gap-24 px-24';
        this.scheduleTitleUI = 'scheduleTitleUI: inline-flex';
        this.tableLineUI = 'tableLineUI: border-1 border-solid border-gray-300 border-box';
        this.titleLeftTopUI = 'titleLeftTopUI: pl-12 flex flex-col pt-42 border-box';
        this.genderBox = `genderBox: absolute right-0 top-26 width tx-10 w-16 h-16 tx-white! flex justify-center items-center round-full z-1`;
        this.requestBox = 'requestBox: min-w-90 inline-flex flex-col';
        this.userTitle = 'userTitle: flex col-gap-6 p-12 border-box';
        this.weekDayUI = 'weekDayUI: py-6 min-w-90 pl-12 border-box';
        this.weekDayWRapperUI = 'weekDayWRapperUI: flex';
        this.monthEachUI = 'monthEachUI: tx-12 pl-12 py-6 border-right-solid';
        this.sundayBorderRightUI = 'sundayBorderRightUI: border-right-2! border-right-primary-500!';
        this.titleSticky = 'titleSticky: sticky top-0 left-0 bg-white';
        this.tableWrapperUI = 'tableWrapperUI: inline-flex flex-col';
        this.iconTitleWrapper = (color) => `iconTitleWrapper: inline-flex round-24 border-1 border-${color} border-solid items-center col-gap-6 pr-12`;
        this.iconTitle = (color) => `iconTitle: round-full w-32 h-32 bg-${color} flex justify-center items-center`;
        this.weekendBg = 'weekendBg: bg-pinky-25! w-full h-full';
        this.currentTime = new Date();
        this.viewerRole = 'staff';
        this.mode = 'view';
        this.disableDates = [];
        // practitionerId?: string = 'C1CD433E-F36B-1410-870D-0060E4CDB88B';
        this.userHoverIndex = 0;
        this.userSelectedIndex = 0;
        this.removeOriginCache = [];
        this.holidays = [];
        this.errorDayRequest = [];
        this.srState = [];
        this.maxWeekOFf = 3;
        this.shiftSrRequestCache = {};
        this.shiftSrShipCache = {};
        this.shiftDatepickerCache = {};
        this.shiftSrRequestSaved = {};
        this.shiftSemRequestSaved = {};
        this.shiftOffRequestSaved = {};
        this.shiftVacRequestSaved = {};
        this.shiftWoffRequestSaved = {};
        this.datepickerData = {
            endDate: undefined,
            startDate: undefined,
        };
        this.tableWrapperRef = createRef();
        this.dividerRef = createRef();
        this.remarkRef = createRef();
        this.disableDateArranged = {};
        this.holidayWithKeyMap = {};
        this.isRemoveMode = false;
        this.dividerTop = 0;
        this.startFocusWithViewMode = false;
        this.saveShiftPlanDatePicker = (practitioner, dateString, ceillId, remark, type) => {
            if (!this.datepickerData?.startDate && !this.datepickerData?.endDate) {
                this.datepickerData = {
                    startDate: new Date(dateString),
                    endDate: new Date(dateString),
                };
            }
            const dateBetween = getDateBetweenArrayDate(this.datepickerData?.startDate, this.datepickerData?.endDate);
            const dataDate = {};
            for (const date of dateBetween) {
                dataDate[this.convertDateToString(date)] = {
                    dateString: this.convertDateToString(date),
                    remark: this.remarkRef.value?.value,
                };
            }
            switch (this.requestSelected?.abbr) {
                case 'sem':
                    if (!this.shiftSemRequestSaved[practitioner.id]) {
                        this.shiftSemRequestSaved[practitioner.id] = {};
                        this.shiftSemRequestSaved[practitioner.id].request = {};
                    }
                    this.shiftSemRequestSaved[practitioner.id] = {
                        request: {
                            ...this.shiftSemRequestSaved[practitioner.id].request,
                            ...dataDate,
                        },
                        practitioner,
                    };
                    this.dispatchEvent(new CustomEvent('save-sem', {
                        detail: this.shiftSemRequestSaved,
                    }));
                    this.dispatchEvent(new CustomEvent('save-request', {
                        detail: {
                            [this.requestSelected.abbr]: this.shiftSemRequestSaved,
                        },
                    }));
                    break;
                case 'off':
                    const checkOffSaved = Object.keys(this.shiftOffRequestSaved[practitioner.id]?.request || {}).includes(dateString);
                    const savedArr = Object.keys(this.shiftOffRequestSaved[practitioner.id]?.request || {});
                    const savedOffCOunt = this.countSameDates(this.generateDayOffValue || [], savedArr);
                    console.log('shift-schedule.js |savedOffCOunt| = ', savedOffCOunt);
                    if (savedOffCOunt) {
                        practitioner.practitioner.leave.dayOff += savedOffCOunt;
                    }
                    if (!this.shiftOffRequestSaved[practitioner.id]) {
                        this.shiftOffRequestSaved[practitioner.id] = {};
                        this.shiftOffRequestSaved[practitioner.id].request = {};
                    }
                    const cloneOffResultValue = structuredClone(this.shiftOffRequestSaved[practitioner.id].request);
                    this.shiftOffRequestSaved[practitioner.id] = {
                        request: {
                            ...cloneOffResultValue,
                            ...dataDate,
                        },
                        practitioner,
                    };
                    const initialDayOFfExist = practitioner.schedulePractitionerRequest
                        ?.filter((res) => res?.requestType.abbr === 'off')
                        .map((res) => res?.requestDate) || [];
                    if (!this.generateDayOffValue) {
                        if (!initialDayOFfExist.includes(dateString) && !checkOffSaved) {
                            practitioner.practitioner.leave.dayOff -= 1;
                        }
                    }
                    else if (this.generateDayOffValue) {
                        console.log('shift-schedule.js |practitioner.practitioner.leave.dayOff| = ', practitioner.practitioner.leave.dayOff);
                        console.log('shift-schedule.js |this.generateDayOffValue| = ', this.generateDayOffValue);
                        const initialCount = this.countSameDates(this.generateDayOffValue, initialDayOFfExist);
                        if (initialCount) {
                            practitioner.practitioner.leave.dayOff += initialCount;
                        }
                        practitioner.practitioner.leave.dayOff -= this.generateDayOffValue.length;
                        const filteredDateOff = this.filterDateDataUse(this.shiftOffRequestSaved[practitioner.id].request, this.generateDayOffValue);
                        this.shiftOffRequestSaved[practitioner.id].request = {
                            ...cloneOffResultValue,
                            ...filteredDateOff,
                        };
                    }
                    else if (this.disableDates) {
                        const disabledDates = this.disableDates?.flatMap((res) => res.date);
                        const filteredDateOff = this.filterDateDataDisabled(this.shiftOffRequestSaved[practitioner.id].request, disabledDates);
                        this.shiftOffRequestSaved[practitioner.id].request = filteredDateOff;
                    }
                    console.log('shift-schedule.js |practitioner.practitioner.leave.dayOff | = ', practitioner.practitioner.leave.dayOff);
                    this.dispatchEvent(new CustomEvent('save-off', {
                        detail: this.shiftOffRequestSaved,
                    }));
                    this.dispatchEvent(new CustomEvent('save-request', {
                        detail: {
                            [this.requestSelected.abbr]: {
                                practitioner,
                                type: this.requestSelected,
                                request: this.shiftOffRequestSaved,
                            },
                        },
                    }));
                    break;
                case 'vac':
                    if (!this.shiftVacRequestSaved[practitioner.id]) {
                        this.shiftVacRequestSaved[practitioner.id] = {};
                        this.shiftVacRequestSaved[practitioner.id].request = {};
                    }
                    this.shiftVacRequestSaved[practitioner.id] = {
                        request: {
                            ...this.shiftVacRequestSaved[practitioner.id].request,
                            ...dataDate,
                        },
                        practitioner,
                    };
                    if (this.generateDayOffValue) {
                        const filteredDateVac = this.filterDateDataUse(this.shiftVacRequestSaved[practitioner.id].request, this.generateDayOffValue);
                        this.shiftVacRequestSaved[practitioner.id].request = filteredDateVac;
                    }
                    else if (this.disableDates) {
                        const disabledDates = this.disableDates?.flatMap((res) => res.date);
                        const filteredDateOff = this.filterDateDataDisabled(this.shiftVacRequestSaved[practitioner.id].request, disabledDates);
                        this.shiftVacRequestSaved[practitioner.id].request = filteredDateOff;
                    }
                    this.dispatchEvent(new CustomEvent('save-vac', {
                        detail: this.shiftVacRequestSaved,
                    }));
                    this.dispatchEvent(new CustomEvent('save-request', {
                        detail: {
                            [this.requestSelected.abbr]: this.shiftVacRequestSaved,
                        },
                    }));
                    break;
                default:
                    break;
            }
            this.deleteInitialDatePicker(practitioner.id, dateBetween, dateString);
            this.datepickerData = undefined;
            this.selectedDate = undefined;
            this.closePopover();
            if (ceillId) {
                const boxTarget = this.querySelector(`#${ceillId}-${dateString}`);
                setTimeout(() => {
                    render(this.renderDayOffHost({
                        dateString,
                        initial: undefined,
                        remark: this.remarkCache,
                    }, this.requestSelected?.abbr), boxTarget);
                }, 0);
            }
        };
        this.findDuplicationDate = (arrayDate1, arrayDate2) => {
            // Convert all dates to strings
            const arrayDate1Str = arrayDate1.map((date) => {
                if (date instanceof Date) {
                    const timezoneOffset = date.getTimezoneOffset() * 60000;
                    const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().split('T')[0];
                    return localISOTime;
                }
                return date;
            });
            const arrayDate2Str = arrayDate2.map((date) => {
                if (date instanceof Date) {
                    const timezoneOffset = date.getTimezoneOffset() * 60000;
                    const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().split('T')[0];
                    return localISOTime;
                }
                return date;
            });
            // Find duplicate dates
            const duplicates = arrayDate1Str.filter((date) => arrayDate2Str.includes(date));
            return duplicates;
        };
        this.shouldScrollErrorTarget = false;
        this.initialScroll = false;
        this.maxDayOffLength = {};
        this.vacDayOff = {};
        this.currentScrollX = 0;
        this.reduceDate = (date, n) => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() - n);
            return newDate;
        };
        this.daysBetween = (startDate, endDate) => {
            const oneDay = 24 * 60 * 60 * 1000;
            const diffInMs = Math.abs(endDate.getTime() - startDate.getTime());
            return Math.round(diffInMs / oneDay);
        };
    }
    willUpdate(_changedProperties) {
        if (_changedProperties.has('scheduleData')) {
            this.moveUserToFirstArray();
            this.dateBetween = this.getDateBetween(new Date(this.scheduleData?.startDate), new Date(this.scheduleData?.endDate));
        }
        if (_changedProperties.has('shouldArrowLeftDisable'))
            return;
        if (_changedProperties.has('currentMonthTitleDisplay'))
            return;
        if (_changedProperties.has('userHoverIndex'))
            return;
        if (_changedProperties.has('userSelectedIndex'))
            return;
        if (this.tableWrapperRef.value) {
            const tableRect = this.tableWrapperRef.value.getBoundingClientRect();
            const width = tableRect.width;
            this.style.setProperty('--table-width', `${width}px`);
            super.willUpdate(_changedProperties);
        }
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
          text="${type.abbr === 'sem' ? 'อบรม, สัมนา, ไปราชการ' : type.name}"
          icon="${iconSrc}"
          iconBgColor="${iconBgColor}"
          accentColor="${accentColor}"></request-button>`;
        })}
    `;
    }
    selectRequest(type) {
        if (this.currentPopoverRef) {
            this.shakePopover();
            return;
        }
        this.isRemoveMode = false;
        this.requestSelected = type;
        this.dispatchEvent(new CustomEvent('select-request', {
            detail: {
                requestSelected: this.requestSelected,
            },
        }));
    }
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
        ];
        for (const { css, variable } of cssVariables) {
            this.style.setProperty(`--${variable}`, css);
        }
        this.scheduleData = await (await fetch('http://localhost:3000/data')).json();
        this.requestTypes = await (await fetch('http://localhost:3000/types')).json();
    }
    setRemoveMode() {
        if (this.currentPopoverRef) {
            this.shakePopover();
            return;
        }
        this.requestSelected = undefined;
        this.isRemoveMode = true;
        this.dispatchEvent(new CustomEvent('remove-action'));
    }
    render() {
        return html `
      <style>
        cx-shift-schedule {
          width: 100%;
          display: block;
        }
        .error-day-request {
          border: 2px solid #f3655c !important;
        }
        .remove-btn:hover {
          background-color: var(--${this.isRemoveMode ? 'neutral-500' : 'neutral-200'}) !important;
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

        #table-header-wrapper::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }

        .lit-virtualizer {
          overflow-x: scroll;
          overflow-y: overlay;
        }

        /*  */
        .lit-virtualizer::-webkit-scrollbar {
          width: 6px;
        }

        /* Track */
        .lit-virtualizer::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        /* Handle */
        .lit-virtualizer::-webkit-scrollbar-thumb {
          background: #a1a1a1;
        }

        /* Handle on hover */
        .lit-virtualizer::-webkit-scrollbar-thumb:hover {
          background: #696969;
        }
        /*  */

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
          position: relative;
          z-index: 1;
          border-bottom: 2px solid var(--primary-500) !important;
          transition: border-bottom 0.15s ease;
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
          cursor: not-allowed;
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
          width: 312px !important;
          border: 2px solid var(--gray-400) !important;
        }

        .buttonGroupUI {
          display: flex;
          align-items: center;
          column-gap: 24px;
          padding-left: 24px;
          padding-right: 24px;
        }
        .remove-btn-active:active {
          background: var(--${this.isRemoveMode ? 'neutral-500' : 'neutral-200'}) !important;
        }
      </style>
      <c-box relative overflow-hidden>
        <c-box class="cbox-divider" absolute ${ref(this.dividerRef)}></c-box>
        <c-box bg-white flex flex-col row-gap-24>
          ${this.mode === 'edit'
            ? html ` <c-box class="buttonGroupUI">
                <c-box whitespace-pre> เลือกรูปแบบคำขอเวร </c-box>
                ${this.renderRequestButton()}
                <c-box inline h-40 w-1 bg-gray-400></c-box>
                <c-box
                  @click="${this.setRemoveMode}"
                  inline-flex
                  items-center
                  col-gap-8
                  round-44
                  w-96
                  border-solid
                  border-1
                  cursor-pointer
                  class="remove-btn remove-btn-active"
                  style="border-color: var(--neutral-200)"
                  bg="${this.isRemoveMode ? 'neutral-500' : 'white'}">
                  <c-box
                    flex-center
                    icon-prefix="16 delete-tag-custom ${this.isRemoveMode
                ? 'white!'
                : 'neutral-500'}"
                    w-44
                    h-44
                    round-full
                    bg="${this.isRemoveMode ? 'neutral-500' : 'neutral-200'}">
                  </c-box>
                  <c-box
                    transition="all 0.2s ease"
                    style="color:${this.isRemoveMode ? 'white!' : 'neutral-500'}"
                    ui="_:${this.isRemoveMode ? 'tx-white' : 'tx-gray-800'}"
                    ,
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
                  <c-box
                    absolute
                    style="${this.mode === 'edit' ? 'top:73px' : ''}"
                    left="274"
                    h-26
                    pt-4
                    flex
                    items-center
                    col-gap-6>
                    <c-box
                      ui="_: w-24 h-24 round-full flex-center"
                      ui-active="_1: ${this.shouldArrowLeftDisable ? 'bg-white' : 'bg-primary-100'}"
                      icon-suffix="8 angle-left-u ${this.shouldArrowLeftDisable
            ? 'gray-400'
            : 'gray-600'}"
                      transition-200
                      cursor-pointer
                      style="${this.shouldArrowLeftDisable
            ? 'cursor: not-allowed'
            : 'cursor: pointer'}"
                      @click="${() => this.shouldArrowLeftDisable ? null : this.goToMonth('previous')}"></c-box>

                    <c-box w-90 flex justify-center tx-12 tx-gray-600>
                      ${this.dateFormat(this.currentMonthTitleDisplay, {
            month: 'long',
            year: 'numeric',
        })}
                    </c-box>

                    <c-box
                      ui="_: w-24 h-24 round-full flex-center"
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
            : 'cursor: pointer'}"
                      @click="${() => this.shouldArrowRightDisable ? null : this.goToMonth('next')}"></c-box>
                  </c-box>
                  ${this.dateBetween?.map((dateBet) => {
            return html `
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
                          ${dateBet.dateBetween.map((weekday, weekIndex) => {
                return html `
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
                    const isSunday = date.getDay() === 0 ? this.sundayBorderRightUI : '';
                    const isHoliday = this.holidayWithKeyMap?.[this.convertDateToString(date)];
                    const isWeekend = isHoliday || date.getDay() === 0 || date.getDay() === 6
                        ? this.weekendBg
                        : '';
                    const timezoneOffset = date.getDate() === 1 || dateIndex === 0
                        ? date.getTimezoneOffset() * 60000
                        : null;
                    const localISOTime = timezoneOffset
                        ? new Date(date.getTime() - timezoneOffset)
                            .toISOString()
                            .split('T')[0]
                        : '';
                    return html ` <c-box
                                      data-first-date="${localISOTime}"
                                      class="${date.getDate() === 1
                        ? 'first-date-of-month'
                        : this.dateBetween?.[0].dateBetween[0][0].getDate() !== 1
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
                style="height:${this.maxHeight}; width:var(--table-width)">
                <div class="lit-virtualizer">
                  ${this.scheduleData?.schedulePractitioner?.map((practitioner, indexUser) => {
            const { practitioner: { gender, nameFamily, nameGiven, practitionerLevel, practitionerRole, }, schedulePractitionerRequest: request, } = practitioner;
            const requestData = this.convertRequestDatesToObject(request);
            const targetUser = practitioner?.practitionerId === this.practitionerId;
            return html `
                        <c-box
                          flex
                          style="width: fit-content;"
                          ui="targetUser: ${targetUser ? 'order-first' : ''}"
                          @click="${() => {
                if (this.mode === 'view') {
                    if (!this.startFocusWithViewMode) {
                        this.startFocusWithViewMode = true;
                    }
                    this.userSelectedIndex = indexUser;
                    this.dispatchEvent(new CustomEvent('focus-request', {
                        detail: { practitioner: practitioner },
                    }));
                }
            }}">
                          <c-box
                            @mouseenter="${this.viewerRole === 'manager'
                ? (e) => this.managerHoverUser(indexUser, e, practitioner)
                : null}"
                            style="cursor:${this.requestSelected ? 'pointer' : 'default'};z-index:2"
                            min-w="260"
                            class="${(this.viewerRole === 'staff' && indexUser === 0) ||
                (this.viewerRole === 'manager' &&
                    indexUser === this.userSelectedIndex &&
                    this.requestSelected) ||
                (this.mode === 'view' &&
                    indexUser === this.userSelectedIndex &&
                    this.startFocusWithViewMode)
                ? 'focus-divider'
                : ''}"
                            @click="${() => {
                if (this.viewerRole === 'manager' && this.requestSelected) {
                    this.userSelectedIndex = indexUser;
                    this.dispatchEvent(new CustomEvent('focus-request', {
                        detail: { practitioner: practitioner },
                    }));
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
                    this.requestSelected) ||
                (this.mode === 'view' &&
                    indexUser === this.userSelectedIndex &&
                    this.startFocusWithViewMode)
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
                                ${genderType[gender]}
                              </c-box>
                            </c-box>

                            <c-box>
                              <c-box tx-14> ${nameGiven} ${nameFamily}</c-box>
                              <c-box tx-12>
                                <span style="text-transform: uppercase">
                                  ${practitionerRole.abbr} </span
                                >, ${practitionerLevel.name}</c-box
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
                        const isHoliday = this.holidayWithKeyMap?.[this.convertDateToString(day)];
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        const dateString = this.convertDateToString(day);
                        const srSaved = this.shiftSrRequestSaved[practitioner.id];
                        const semSaved = this.shiftSemRequestSaved[practitioner.id];
                        const offSaved = this.shiftOffRequestSaved[practitioner.id];
                        const vacSaved = this.shiftVacRequestSaved[practitioner.id];
                        const requestInitial = requestData[dateString];
                        const disableDate = this.disableDateArranged?.[dateString];
                        const woffSaved = this.shiftWoffRequestSaved?.[practitioner.id]?.request;
                        const userTargetIndex = this.viewerRole === 'manager' ? this.userHoverIndex : 0;
                        const isErrorDayRequest = this.errorDayRequest[0]?.date === dateString &&
                            practitioner.practitionerId ===
                                this.errorDayRequest[0]?.practitionerId;
                        return html ` <c-box
                                      @mouseenter="${this.viewerRole === 'manager'
                            ? (e) => this.managerHoverUser(indexUser, e, practitioner)
                            : null}"
                                      ui="${this.tableLineUI}, ${this.requestBox}, ${borderRight}"
                                      class="${isErrorDayRequest ? 'error-day-request' : ''} ${(this
                            .viewerRole === 'staff' &&
                            indexUser === 0) ||
                            (this.viewerRole === 'manager' &&
                                indexUser === this.userSelectedIndex &&
                                this.requestSelected) ||
                            (this.mode === 'view' &&
                                indexUser === this.userSelectedIndex &&
                                this.startFocusWithViewMode)
                            ? 'focus-divider'
                            : ''} ${isWeekend || isHoliday ? 'bg-pinky' : ''}">
                                      <c-box
                                        w-full
                                        h-full
                                        style="opacity:${(this.viewerRole === 'staff' &&
                            indexUser === 0) ||
                            this.viewerRole === 'manager'
                            ? '1'
                            : '0.6'}; max-width:88px; word-break:break-all;
                                          ${(this.requestSelected?.abbr === 'woff' &&
                            this.shouldNotAllowedWeekOffSelect) ||
                            (this.requestSelected?.abbr === 'off' &&
                                practitioner?.practitioner?.leave?.dayOff === 0) ||
                            (this.requestSelected?.abbr === 'vac' &&
                                (this.vacDayOff?.[practitioner.practitioner.id] === 0 ||
                                    this.maxDayOffLength?.[practitioner.practitioner.id]?.vacation >=
                                        this.vacDayOff?.[practitioner.practitioner.id]))
                            ? 'cursor:not-allowed'
                            : ''}">
                                        <!-- if have request date then render request -->

                                        <!-- when saving -->
                                        ${disableDate
                            ? html ` <div class="diagonal-pattern"></div> `
                            : srSaved && srSaved?.request?.[dateString]
                                ? this.renderSrShiftSaved(srSaved, dateString, practitioner, indexUser)
                                : semSaved?.request?.[dateString]
                                    ? this.renderDayOffPlanSaved(semSaved?.request?.[dateString], 'sem', practitioner, day, indexUser)
                                    : offSaved?.request?.[dateString]
                                        ? this.renderDayOffPlanSaved(offSaved?.request?.[dateString], 'off', practitioner, day, indexUser)
                                        : vacSaved?.request?.[dateString]
                                            ? this.renderDayOffPlanSaved(vacSaved?.request?.[dateString], 'vac', practitioner, day, indexUser)
                                            : woffSaved?.[dateString]
                                                ? this.renderWoffSaved(dateString, practitioner, undefined, 'woff', day, indexUser)
                                                : requestInitial
                                                    ? this.renderInitialRequest(requestInitial, practitioner, day, indexUser)
                                                    : indexUser === userTargetIndex
                                                        ? this.renderEmptyDateForSelect(day, practitioner, dateString, indexUser)
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
                </div>
              </c-box>
            </c-box>
          </c-box>
        </c-box>
      </c-box>
    `;
    }
    managerHoverUser(indexUser, e, practitioner) {
        this.userHoverIndex = indexUser;
        const target = e.target;
        const weekMonthUser = this.querySelector('#week-month-user');
        if (target) {
            const targetRect = target.getBoundingClientRect();
            const hostRect = this.getBoundingClientRect();
            const tableRect = weekMonthUser?.getBoundingClientRect();
            if (this.dividerRef.value) {
                this.dividerRef.value.style.setProperty('--cbox-divider-top', `${Math.floor(targetRect.bottom - hostRect.top)}px`);
                this.dividerRef.value.style.setProperty('--cbox-divider-width', `${tableRect?.width}px`);
            }
        }
        this.setVacDayOff(practitioner);
    }
    sentRemoveEvent() {
        this.dispatchEvent(new CustomEvent('remove-request', {
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
        }));
    }
    removeWoffSaved(dateString, practitioner, data) {
        if (this.viewerRole === 'staff' && this.practitionerId !== practitioner?.practitionerId)
            return;
        if (this.isRemoveMode) {
            if (data?.initial) {
                const practitionerIndex = this.scheduleData?.schedulePractitioner?.findIndex((res) => res.id === practitioner?.id);
                if (typeof practitionerIndex === 'number') {
                    const requestIndex = this.scheduleData?.schedulePractitioner?.[practitionerIndex].schedulePractitionerRequest?.findIndex((res) => {
                        return res?.requestDate === dateString;
                    });
                    if (typeof requestIndex === 'number') {
                        const dataSlice = {
                            queryIndex: {
                                requestIndex,
                                practitionerIndex,
                            },
                            schedulePractitioner: this.scheduleData?.schedulePractitioner?.[practitionerIndex],
                            schedulePractitionerRequest: this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                                .schedulePractitionerRequest?.[requestIndex],
                        };
                        this.removeOriginCache.push(dataSlice);
                        this.dispatchEvent(new CustomEvent('remove-origin', {
                            detail: { ...dataSlice, result: this.removeOriginCache },
                        }));
                        delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                            .schedulePractitionerRequest?.[requestIndex];
                        this.requestUpdate();
                    }
                }
            }
            else {
                this.removeRequestSelected = this.findRequestType('woff');
                delete this.shiftWoffRequestSaved?.[practitioner?.id]?.request?.[dateString];
                this.sentRemoveEvent();
                this.requestUpdate();
            }
        }
    }
    renderWoffSaved(dateString, practitioner, data, type, date, indexUser) {
        const cellId = `woff-saved-shift-cell-${indexUser}`;
        return html `
      <c-box
        w-full
        h-full
        id="${cellId}-${dateString}"
        @click="${this.requestSelected?.abbr !== 'woff'
            ? (e) => {
                this.appendPopover(type, cellId, {
                    date: date,
                    dateString: dateString,
                    indexUser: indexUser,
                    practitioner: practitioner,
                }, this.getPopoverByRequest({
                    date: date,
                    practitioner: practitioner,
                    dateString,
                    cellId,
                    type,
                    event: e,
                }), this.renderWoffSavedHost(dateString, practitioner, { initial: true }, 'woff', date, indexUser));
            }
            : null}">
        ${this.renderWoffSavedHost(dateString, practitioner, data, type, date, indexUser)}
      </c-box>
    `;
    }
    renderWoffSavedHost(dateString, practitioner, data, type, date, indexUser) {
        return html `<c-box h-full w-full p-4 border-box slot="host">
      <c-box
        style="${(this.requestSelected?.abbr === 'woff' && this.shouldNotAllowedWeekOffSelect) ||
            (this.requestSelected?.abbr === 'off' && practitioner?.practitioner?.leave?.dayOff === 0) ||
            (this.requestSelected?.abbr === 'vac' &&
                (this.vacDayOff?.[(practitioner?.practitioner).id] === 0 ||
                    this.maxDayOffLength?.[(practitioner?.practitioner).id]?.vacation >=
                        this.vacDayOff?.[(practitioner?.practitioner).id]))
            ? 'pointer-events: none'
            : ''}"
        class="woff-saved ${this.requestSelected?.abbr !== 'woff' || this.isRemoveMode
            ? 'hover-request'
            : ''}"
        bg="gray-300"
        icon-prefix="26 pause-circle-line ${requestTypeStyles[type].accentColor}"
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
    removeSrPlan(dateString, practitioner, removeMode) {
        if (this.isRemoveMode || removeMode) {
            if (this.viewerRole === 'staff' && this.practitionerId !== practitioner.practitionerId)
                return;
            delete this.shiftSrRequestSaved[practitioner.id].request[dateString];
            this.removeRequestSelected = this.findRequestType('sr');
            this.sentRemoveEvent();
            this.requestUpdate();
        }
    }
    renderSrSavedHost(dateString, practitioner, planEntries) {
        const checkMaxLength = (this.requestSelected?.abbr === 'woff' && this.shouldNotAllowedWeekOffSelect) ||
            (this.requestSelected?.abbr === 'off' && practitioner?.practitioner?.leave?.dayOff === 0) ||
            (this.requestSelected?.abbr === 'vac' &&
                (this.vacDayOff?.[practitioner.practitioner.id] === 0 ||
                    this.maxDayOffLength?.[practitioner.practitioner.id]?.vacation >=
                        this.vacDayOff?.[practitioner.practitioner.id]));
        return html ` <c-box
      @click="${() => this.removeSrPlan(dateString, practitioner)}"
      w-full
      h-full
      style="${checkMaxLength ? 'pointer-events:none' : this.isRemoveMode ? 'cursor:pointer' : ''}"
      shift-type="sr-saved"
      slot="host">
      ${planEntries
            ?.sort((a, b) => {
            const indexMap = { m: 0, a: 1, n: 2 };
            // @ts-ignore
            return indexMap[a[0]] - indexMap[b[0]];
        })
            ?.map(([dayPart, plans]) => {
            return html `
            <c-box p-4 border-box flex flex-col row-gap-4>
              <c-box
                class="${this.isRemoveMode || this.requestSelected ? 'srDayPart' : ''} "
                p-4
                border-box
                round-6
                h-44
                bg="${this.setColorRequestType(dayPart)}">
                <c-box>
                  <c-box
                    class="icon-daypart-sr"
                    icon-prefix="${dayPortValue[dayPart].size} ${dayPortValue[dayPart].src} ${dayPortValue[dayPart].iconColor}"
                    flex
                    flex-col>
                    <c-box flex col-gap-4 tx-12 mt-4
                      >${Object.keys(plans).map((plan) => {
                return html `<c-box inline>${plan}</c-box>`;
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
    renderSrShiftSaved(planRequest, dateString, practitioner, indexUser) {
        const planEntries = Object.entries(planRequest?.request?.[dateString]?.shiftPlan || {});
        const shiftPlan = this.shiftSrRequestSaved?.[practitioner.id]?.request?.[dateString]?.shiftPlan;
        const cellId = `sr-saved-shift-cell-${indexUser}`;
        const date = new Date(dateString);
        return html `
      <c-box
        w-full
        h-full
        id="${cellId}-${dateString}"
        @click="${this.requestSelected?.abbr !== 'woff'
            ? (e) => {
                planEntries.length
                    ? this.appendPopover('sr', cellId, {
                        date,
                        dateString,
                        indexUser,
                        practitioner,
                    }, this.getPopoverByRequest({
                        date,
                        practitioner,
                        cellId,
                        request: shiftPlan,
                        dateString,
                        event: e,
                    }), this.renderSrSavedHost(dateString, practitioner, planEntries))
                    : null;
            }
            : () => {
                this.saveWoffRequest(date, practitioner, dateString);
                this.requestUpdate();
            }}">
        ${planEntries.length
            ? this.renderSrSavedHost(dateString, practitioner, planEntries)
            : this.renderEmptyDateForSelect(new Date(dateString), practitioner, dateString, indexUser)}
      </c-box>
    `;
    }
    removeShiftDatePicker(data, type, practitioner) {
        if (this.viewerRole === 'staff' && this.practitionerId !== practitioner.practitionerId)
            return;
        if (data?.initial && this.isRemoveMode) {
            const practitionerIndex = this.scheduleData?.schedulePractitioner?.findIndex((res) => res.id === practitioner.id);
            if (typeof practitionerIndex === 'number') {
                const requestIndex = this.scheduleData?.schedulePractitioner?.[practitionerIndex].schedulePractitionerRequest?.findIndex((res) => res?.requestDate === data.dateString);
                if (typeof requestIndex === 'number') {
                    const dataSlice = {
                        queryIndex: {
                            practitionerIndex,
                            requestIndex,
                        },
                        schedulePractitioner: this.scheduleData?.schedulePractitioner?.[practitionerIndex],
                        schedulePractitionerRequest: this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                            ?.schedulePractitionerRequest?.[requestIndex],
                    };
                    this.removeOriginCache.push(dataSlice);
                    this.dispatchEvent(new CustomEvent('remove-origin', {
                        detail: { ...dataSlice, result: this.removeOriginCache },
                    }));
                    delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                        ?.schedulePractitionerRequest?.[requestIndex];
                    if (type === 'off') {
                        practitioner.practitioner.leave.dayOff += 1;
                    }
                    this.requestUpdate();
                }
            }
        }
        else {
            if (this.isRemoveMode) {
                if (type === 'sem') {
                    delete this.shiftSemRequestSaved[practitioner.id].request[data.dateString];
                    this.removeRequestSelected = this.findRequestType('sem');
                    this.sentRemoveEvent();
                    this.requestUpdate();
                }
                if (type === 'off') {
                    delete this.shiftOffRequestSaved[practitioner.id].request[data.dateString];
                    this.removeRequestSelected = this.findRequestType('off');
                    practitioner.practitioner.leave.dayOff += 1;
                    this.sentRemoveEvent();
                    this.requestUpdate();
                }
                if (type === 'vac') {
                    delete this.shiftVacRequestSaved[practitioner.id].request[data.dateString];
                    this.removeRequestSelected = this.findRequestType('vac');
                    this.sentRemoveEvent();
                    this.requestUpdate();
                }
            }
        }
    }
    findRequestType(abbr) {
        return this.requestTypes?.find((res) => res.abbr === abbr);
    }
    renderDayOffHost(data, type) {
        return html `${data?.remark
            ? html `<c-box
          slot="host"
          shift-type="${type}-saved"
          flex
          flex-col
          tx-12
          icon-prefix="16 ${shiftPlanIcon?.[type]} ${requestTypeStyles?.[type]?.accentColor}">
          ${data.remark}
        </c-box>`
            : html `<c-box
          slot="host"
          flex
          shift-type="${type}-saved"
          justify-center
          items-center
          h-full
          icon-prefix="26 ${shiftPlanIcon?.[type]} ${requestTypeStyles?.[type]?.accentColor}">
        </c-box>`}`;
    }
    renderDayOffPlanSaved(data, type, practitioner, date, indexUser, cancel) {
        const cellId = `sem-saved-shift-cell-${indexUser}`;
        const checkWeekOffDisabled = this.shouldNotAllowedWeekOffSelect && this.requestSelected?.abbr === 'woff';
        return html `<c-box
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
                (this.vacDayOff?.[practitioner.practitioner.id] === 0 ||
                    this.maxDayOffLength?.[practitioner.practitioner.id]?.vacation >=
                        this.vacDayOff?.[practitioner.practitioner.id]))
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
                ? (e) => {
                    this.appendPopover(type, cellId, {
                        date: date,
                        dateString: data.dateString,
                        indexUser: indexUser,
                        practitioner: practitioner,
                    }, this.getPopoverByRequest({
                        date: date,
                        practitioner: practitioner,
                        dateString: data.dateString,
                        cellId,
                        type,
                        event: e,
                        indexUser,
                        remark: data.remark,
                    }), this.renderDayOffHost(data, type));
                    this.shiftDatepickerCache[type] = {
                        dateString: data.dateString,
                        remark: data.remark,
                        initial: false,
                        requestType: type,
                        practitioner,
                        date,
                        indexUser,
                    };
                }
                : () => {
                    this.saveWoffRequest(date, practitioner, data.dateString);
                    this.requestUpdate();
                }}">
        ${this.renderDayOffHost(data, type)}
      </c-box>
    </c-box>`;
    }
    removeInitialSr(practitioner, dateString) {
        if (this.viewerRole === 'staff' && practitioner.practitionerId !== this.practitionerId)
            return;
        if (!this.isRemoveMode)
            return;
        const practitionerIndex = this.scheduleData?.schedulePractitioner?.findIndex((res) => res.id === practitioner.id);
        if (typeof practitionerIndex === 'number') {
            const shiftPlans = this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                .schedulePractitionerRequest;
            let requestIndex = [];
            let requestResult = {};
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
                };
                this.removeOriginCache.push(dataSlice);
                for (const srIndex of resultShiftSr.requestIndex) {
                    delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                        .schedulePractitionerRequest?.[srIndex];
                }
                this.dispatchEvent(new CustomEvent('remove-origin', {
                    detail: { ...dataSlice, result: this.removeOriginCache },
                }));
                this.requestUpdate();
            }
        }
    }
    goToMonth(type) {
        // if (this.shouldArrowLeftDisable === true && type === 'next') return;
        // if (this.shouldArrowRightDisable === true && type === 'previous') return;
        const litVirtualizer = this.querySelector('.lit-virtualizer');
        if (litVirtualizer) {
            const currentMonth = this.scrollValueFirstDateMonth?.find((res) => res.date === this.currentMonthTitleDisplay);
            let targetMonth;
            const currentIndex = currentMonth?.index;
            targetMonth = this.scrollValueFirstDateMonth?.[currentIndex + (type === 'next' ? 1 : -1)];
            const left = litVirtualizer.getBoundingClientRect().left;
            const scrollValue = targetMonth.scrollValue - (left + 260);
            if (targetMonth && Math.floor(scrollValue) <= 0) {
                targetMonth = this.scrollValueFirstDateMonth?.[currentIndex + (type === 'next' ? 2 : -1)];
                const scrollValue = targetMonth.scrollValue - (left + 260);
                litVirtualizer.scrollTo({
                    top: litVirtualizer.scrollTop,
                    left: scrollValue + 1,
                    behavior: 'smooth',
                });
            }
            else if (targetMonth) {
                litVirtualizer.scrollTo({
                    top: litVirtualizer.scrollTop,
                    left: scrollValue + 1,
                    behavior: 'smooth',
                });
            }
        }
    }
    renderSrInitialHost(request, practitioner, dateString) {
        return html ` <c-box
      w-full
      h-full
      shift-type="sr-init"
      slot="host"
      cursor="${this.requestSelected || this.isRemoveMode ? 'pointer' : 'default'}"
      @click="${this.isRemoveMode ? () => this.removeInitialSr(practitioner, dateString) : null}">
      ${Object.entries(request.arrangedRequest).map(([dayPart, plans]) => {
            const plansEntries = Object.entries(plans);
            return html `
          <c-box p-4 border-box flex flex-col row-gap-4 border-box>
            <c-box
              border-box
              p-4
              border-box
              round-6
              h-44
              bg="${this.setColorRequestType(dayPart)}">
              <div
                style="cursor:${this.requestSelected || this.isRemoveMode
                ? 'pointer'
                : ''}; width:100%; height:100%">
                <c-box>
                  <c-box
                    class="icon-daypart-sr"
                    icon-prefix="${dayPortValue[dayPart].size} ${dayPortValue[dayPart].src} ${dayPortValue[dayPart].iconColor}"
                    flex
                    flex-col>
                    <c-box
                      >${plansEntries.map(([plan]) => html `<c-box inline tx-12>${plan}</c-box> `)}</c-box
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
    renderInitialRequest(request, practitioner, date, indexUser) {
        const dateString = this.convertDateToString(date);
        const cellId = `initial-data-shift-cell-${indexUser}`;
        const title = {
            sem: 'ขออบรม, สัมนา, ไปราชการ',
            off: 'ขอลาหยุด',
            vac: 'ขอลาพักร้อน',
        };
        const popoverObj = {
            date,
            practitioner,
            dateString,
            cellId,
            request: request.arrangedRequest,
            remark: request?.remark || '',
            title: title[request.requestType.abbr],
            type: request.requestType.abbr,
        };
        switch (request.requestType.abbr) {
            case 'sr':
                return html `
          <c-box
            w-full
            h-full
            id="${cellId}-${dateString}"
            @click="${this.requestSelected?.abbr !== 'woff'
                    ? (e) => {
                        this.appendPopover(request.requestType.abbr, cellId, {
                            date,
                            dateString,
                            indexUser,
                            practitioner,
                        }, this.getPopoverByRequest({ ...popoverObj, event: e }), this.renderSrInitialHost(request, practitioner, dateString));
                    }
                    : () => {
                        this.saveWoffRequest(date, practitioner, dateString);
                        this.requestUpdate();
                    }}">
            ${this.renderSrInitialHost(request, practitioner, dateString)}
          </c-box>
        `;
            case 'woff':
                return html `
          <c-box
            w-full
            h-full
            id="${cellId}-${dateString}"
            shift-type="woff-init"
            @click="${this.requestSelected?.abbr !== 'woff'
                    ? (e) => {
                        this.appendPopover(request.requestType.abbr, cellId, {
                            date,
                            dateString,
                            indexUser,
                            practitioner,
                        }, this.getPopoverByRequest({ ...popoverObj, event: e }), this.renderWoffSavedHost(dateString, practitioner, { initial: true }, 'woff', date, indexUser));
                    }
                    : null}">
            ${this.renderWoffSavedHost(dateString, practitioner, { initial: true }, 'woff', date, indexUser)}
          </c-box>
        `;
            case 'sem':
            case 'vac':
            case 'off':
                return html `
          <c-box
            shift-type="${request.requestType.abbr}-init"
            w-full
            h-full
            id="${cellId}-${dateString}"
            @click="${this.requestSelected?.abbr !== 'woff'
                    ? (e) => {
                        this.appendPopover(request.requestType.abbr, cellId, {
                            date,
                            dateString,
                            indexUser,
                            practitioner,
                        }, this.getPopoverByRequest({ ...popoverObj, event: e }), this.renderDayOffPlanSaved({
                            dateString,
                            remark: request.remark,
                            initial: true,
                        }, request.requestType.abbr, practitioner, date, indexUser));
                        this.shiftDatepickerCache[request.requestType.abbr] = {
                            dateString,
                            remark: request.remark,
                            initial: true,
                            requestType: request.requestType.abbr,
                            practitioner,
                            date,
                            indexUser,
                        };
                    }
                    : () => {
                        this.saveWoffRequest(date, practitioner, dateString);
                        this.requestUpdate();
                    }}">
            ${this.renderDayOffPlanSaved({
                    dateString,
                    remark: request.remark,
                    initial: true,
                }, request.requestType.abbr, practitioner, date, indexUser)}
          </c-box>
        `;
            default:
                break;
        }
    }
    saveDatepicker(e, practitioner) {
        const disabledDates = this.disableDates ? Object.keys(this.disableDateArranged) : undefined;
        // prepare dayOff
        if (e.detail.endDate && this.requestSelected?.abbr === 'off') {
            const initialDayOFfExist = practitioner.schedulePractitionerRequest
                ?.filter((res) => res?.requestType.abbr === 'off')
                .map((res) => res?.requestDate) || [];
            // const initialDayOFfExist: string[] = [];
            let dayOffSavedExist = Object.keys(this.shiftOffRequestSaved?.[practitioner.id]?.request || {});
            let dayOff = practitioner.practitioner.leave.dayOff;
            console.log('shift-schedule.js |saveDatepicker dayOff| = ', dayOff);
            const dayBetweenStartEnd = this.daysBetween(e.detail.startDate, e.detail.endDate) + 1;
            if (dayBetweenStartEnd > dayOff) {
                const rangeDayOff = this.dateRangeIntersect(e.detail.startDate, e.detail.endDate, dayOffSavedExist);
                console.log('shift-schedule.js |rangeDayOff| = ', rangeDayOff);
                const dayOffUse = (rangeDayOff?.length || 0) + dayOff;
                this.generateDayOffValue = this.generateDayOff(e.detail.startDate, e.detail.endDate, dayOffSavedExist, dayOff, disabledDates, initialDayOFfExist);
                console.log('shift-schedule.js |this.generateDayOffValue| = ', this.generateDayOffValue);
                e.detail.endDate = new Date(this.generateDayOffValue[this.generateDayOffValue.length - 1]);
            }
            else {
                this.generateDayOffValue = getDateBetweenArrayDate(e.detail.startDate, e.detail.endDate)
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
                    }
                    else {
                        return true;
                    }
                });
            }
        }
        // prepare vacation off
        if (e.detail.endDate && this.requestSelected?.abbr === 'vac') {
            const initialDayOFfExist = practitioner.schedulePractitionerRequest
                ?.filter((res) => res?.requestType.abbr === 'vac')
                .map((res) => res?.requestDate) || [];
            let dayOffSavedExist = Object.keys(this.shiftVacRequestSaved?.[practitioner.id]?.request || {});
            const findVacation = practitioner.practitioner.vacations.find((res) => res.year === new Date(this.currentTime).getFullYear());
            let dayOff = findVacation.vacation;
            const dayBetweenStartEnd = this.daysBetween(e.detail.startDate, e.detail.endDate) + 1;
            if (dayBetweenStartEnd > dayOff) {
                this.generateDayOffValue = this.generateDayOff(e.detail.startDate, e.detail.endDate, dayOffSavedExist, dayOff, disabledDates, initialDayOFfExist);
                e.detail.endDate = new Date(this.generateDayOffValue[this.generateDayOffValue.length - 1]);
            }
        }
        this.datepickerData = e.detail;
        e.target
            .fix()
            .rangeValue({ startDate: e.detail.startDate, endDate: e.detail.endDate })
            .exec();
    }
    removeInitialSameData(practitionerId, dateString) {
        const practitionerIndex = this.scheduleData?.schedulePractitioner?.findIndex((res) => res.id === practitionerId);
        if (typeof practitionerIndex === 'number') {
            const requestIndex = this.scheduleData?.schedulePractitioner?.[practitionerIndex].schedulePractitionerRequest?.findIndex((res) => res?.requestDate === dateString);
            if (typeof requestIndex === 'number') {
                const request = this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                    .schedulePractitionerRequest?.[requestIndex];
                if (request?.requestType?.abbr === 'sr') {
                    for (let index = 0; index <
                        this.scheduleData?.schedulePractitioner?.[practitionerIndex].schedulePractitionerRequest
                            ?.length; index++) {
                        const request = this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                            .schedulePractitionerRequest[index];
                        if (request?.requestType?.abbr === 'sr' && request?.requestDate === dateString) {
                            delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                                .schedulePractitionerRequest[index];
                        }
                    }
                }
                else {
                    delete this.scheduleData?.schedulePractitioner?.[practitionerIndex]
                        .schedulePractitionerRequest?.[requestIndex];
                }
            }
        }
    }
    deleteInitialDatePicker(practitionerId, dateBetween, dateString) {
        switch (this.requestSelected?.abbr) {
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
                delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateString];
                delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateString];
                delete this.shiftSrRequestSaved[practitionerId]?.request?.[dateString];
                delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateString];
                break;
            case 'sr':
                this.removeInitialSameData(practitionerId, dateString);
                delete this.shiftOffRequestSaved[practitionerId]?.request?.[dateString];
                delete this.shiftVacRequestSaved[practitionerId]?.request?.[dateString];
                delete this.shiftSemRequestSaved[practitionerId]?.request?.[dateString];
                delete this.shiftWoffRequestSaved[practitionerId]?.request?.[dateString];
                break;
            default:
                break;
        }
        this.requestUpdate();
    }
    getPopoverByRequest(data) {
        switch (this.requestSelected?.abbr) {
            case 'sr':
                return this.renderSrPopover(data.date, data.practitioner, data.request, data.cellId, data.indexUser, data.event);
            case 'off':
            case 'sem':
            case 'vac':
                return this.renderDatepickerBox({
                    date: data.date,
                    practitioner: data.practitioner,
                    title: data.title,
                    cellId: data.cellId,
                    dateString: data.dateString,
                    remark: data.remark,
                    type: data.type,
                    indexUser: data.indexUser,
                    request: data.request,
                    event: data.event,
                });
        }
    }
    filterDateDataDisabled(dateData, disabledDate) {
        const filteredData = {};
        for (const date in dateData) {
            if (!disabledDate.includes(date)) {
                filteredData[date] = dateData[date];
            }
        }
        return filteredData;
    }
    filterDateDataUse(dateData, usedDate) {
        const filteredData = {};
        usedDate?.forEach((date) => {
            if (dateData?.hasOwnProperty(date)) {
                filteredData[date] = dateData[date];
            }
        });
        return filteredData;
    }
    renderDatepickerBox(data) {
        const inputTarget = data.event?.target;
        const inputExistValue = inputTarget.textContent?.trim();
        const shouldInitValue = inputTarget.getAttribute('shift-type') === `${this.requestSelected?.abbr}-saved`;
        const title = {
            sem: 'ขออบรม, สัมนา, ไปราชการ',
            off: 'ขอลาหยุด',
            vac: 'ขอลาพักร้อน',
        };
        const iconSoftColor = requestTypeStyles[this.requestSelected?.abbr].iconBgColor;
        const accentColor = requestTypeStyles[this.requestSelected?.abbr].accentColor;
        return html `
      <c-box slot="popover" popover-check>
        <c-box content>
          <!-- title -->
          <c-box>
            <c-box ui="${this.iconTitleWrapper(iconSoftColor)}">
              <c-box
                icon-prefix="16 ${requestTypeStyles[this.requestSelected?.abbr]
            .iconSrc} ${accentColor}"
                ui="${this.iconTitle(iconSoftColor)}"></c-box>
              <c-box tx-14> ${title[this.requestSelected?.abbr]} </c-box>
            </c-box>
            <c-box mt-12 flex items-center flex justify-between>
              <c-box tx-16 semiBold tx-gray-700>เลือกเวรที่ต้องการขอ</c-box>
              <c-box flex col-gap-6>
                <cx-button
                  .var="${{ width: 'size-0' }}"
                  .set="${{ type: 'secondary' }}"
                  @click="${() => {
            this.closePopover();
            if (data.cellId) {
                const boxTarget = this.querySelector(`#${data.cellId}-${data.dateString}`);
                this.renderContentBack(data.type, data.date, data.dateString, data.practitioner, boxTarget, data.indexUser, undefined, data.request);
            }
        }}"
                  >ยกเลิก</cx-button
                >
                <cx-button
                  @click="${() => {
            this.saveShiftPlanDatePicker(data.practitioner, data.dateString, data.cellId, data.remark, data.type);
        }}"
                  .var="${{ width: 'size-0' }}"
                  >บันทึก</cx-button
                >
              </c-box>
            </c-box>
          </c-box>
          <!-- date picker -->
          <c-box mt-18>
            <c-box mb-12>Date</c-box>
            <cx-datepicker
              @select-date="${(e) => this.saveDatepicker(e, data.practitioner)}"
              .set="${{
            date: data.date,
            dateRange: true,
            rangeValue: {
                endDate: data.date,
                startDate: data.date,
            },
            inputStyle: 'short',
            min: new Date(this.scheduleData?.startDate),
            max: new Date(this.scheduleData?.endDate),
        }}"
              .var="${{
            heightInput: '44',
            widthInput: '312',
        }}"></cx-datepicker>
          </c-box>

          <c-box mt-12>หมายเหตุ</c-box>
          <c-box class="remark-input" mt-6 input-box="primary-200">
            <input
              @input="${(e) => {
            const input = e.target;
            if (input.value.length > 10) {
                input.value = input.value.slice(0, 10);
            }
            this.remarkCache = input.value;
        }}"
              value="${shouldInitValue ? inputExistValue : ''}"
              ${ref(this.remarkRef)}
              type="text"
              style="border:none;outline:none;width:200px"
              placeholder="หมายเหตุเพิ่มเติม" />
          </c-box>
        </c-box>
      </c-box>
    `;
    }
    shakePopover() {
        const popoverCheck = ModalSingleton.modalRef.querySelector('c-box[popover-check]');
        popoverCheck?.classList.add('shake-efx-popover');
        setTimeout(() => {
            popoverCheck?.classList.remove('shake-efx-popover');
        }, 600);
    }
    appendPopover(type, cellId, data, popoverContent, popoverHost) {
        if (this.isRemoveMode)
            return;
        if (this.currentPopoverRef) {
            this.shakePopover();
            return;
        }
        if ((this.requestSelected?.abbr === 'off' && data.practitioner.practitioner.leave.dayOff === 0) ||
            (this.requestSelected?.abbr === 'vac' &&
                (this.vacDayOff?.[data.practitioner.practitioner.id] === 0 ||
                    this.maxDayOffLength?.[data.practitioner.practitioner.id]?.vacation >=
                        this.vacDayOff?.[data.practitioner.practitioner.id])))
            return;
        this.userSelectedIndex = data.indexUser;
        if (this.mode === 'edit') {
            this.dispatchEvent(new CustomEvent('focus-request', {
                detail: { practitioner: data.practitioner },
            }));
        }
        if (this.requestSelected?.abbr === 'woff')
            return;
        const boxTarget = this.querySelector(`#${cellId}-${data.dateString}`);
        if (boxTarget) {
            const firstElement = boxTarget.firstElementChild;
            if (firstElement?.tagName !== 'CX-POPOVER') {
                firstElement?.remove();
            }
            else {
                return;
            }
            const popover = html `
        <cx-popover
          .set="${{
                arrowpoint: true,
                focusout: 'none',
                mouseleave: 'none',
                transform: 'center',
            }}">
          ${popoverHost} ${popoverContent}
        </cx-popover>
      `;
            render(popover, boxTarget);
            requestAnimationFrame(() => {
                this.currentPopoverRef = this.querySelector('cx-popover');
                // @ts-ignore
                this.currentPopoverRef.setOpenPopover();
            });
        }
    }
    renderEmptyDateForSelect(date, practitioner, dateString, indexUser, request) {
        const requestClone = structuredClone(request);
        const cellId = `empty-shift-cell-${indexUser}`;
        switch (this.requestSelected?.abbr) {
            case 'sr':
                return html `
          <c-box
            id="${cellId}-${dateString}"
            w-full
            h-full
            @click="${(event) => this.appendPopover(this.requestSelected?.abbr, cellId, {
                    date,
                    practitioner,
                    dateString,
                    indexUser,
                }, this.getPopoverByRequest({
                    request: requestClone,
                    date,
                    practitioner,
                    cellId,
                    dateString: this.convertDateToString(date),
                    indexUser,
                    event,
                }), this.renderEmptyBox(date, 'select', this.requestSelected?.abbr, practitioner, dateString, indexUser))}">
            ${this.renderEmptyBox(date, 'display', this.requestSelected?.abbr, practitioner, dateString, indexUser)}
          </c-box>
        `;
            case 'vac':
            case 'off':
            case 'sem':
                return html `
          <c-box
            id="${cellId}-${dateString}"
            w-full
            h-full
            style="pointer-events:${(this.requestSelected?.abbr === 'off' &&
                    practitioner?.practitioner?.leave?.dayOff === 0) ||
                    (this.requestSelected?.abbr === 'vac' &&
                        (this.vacDayOff?.[practitioner.practitioner.id] === 0 ||
                            this.maxDayOffLength?.[practitioner.practitioner.id]?.vacation >=
                                this.vacDayOff?.[practitioner.practitioner.id]))
                    ? 'none'
                    : ''}"
            @click="${(e) => {
                    this.appendPopover(this.requestSelected?.abbr, cellId, {
                        date,
                        practitioner,
                        dateString,
                        indexUser,
                    }, this.getPopoverByRequest({
                        date,
                        practitioner,
                        cellId,
                        dateString,
                        event: e,
                        indexUser,
                    }), this.renderEmptyBox(date, 'select', this.requestSelected?.abbr, practitioner, dateString, indexUser));
                }}">
            ${this.renderEmptyBox(date, 'display', this.requestSelected?.abbr, practitioner, dateString, indexUser)}
          </c-box>
        `;
            case 'woff':
                return html `
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
    renderShipSrRequest(shifts, dayPart, dateString, practitioner, initialSr) {
        const shouldRender = shifts.flatMap((res) => res.scheduleStaffings?.filter((res) => res.planDate === dateString &&
            res.practitionerLevel.id === practitioner.practitioner.practitionerLevel.id &&
            res.practitionerLevel.practitionerRole.id ===
                practitioner.practitioner.practitionerRole.id));
        const filteredShift = shifts.flatMap((res) => {
            return {
                ...res,
                scheduleStaffings: res.scheduleStaffings?.filter((res) => res.planDate === dateString.trim() &&
                    res.practitionerLevel.id === practitioner.practitioner.practitionerLevel.id &&
                    res.practitionerLevel.practitionerRole.id ===
                        practitioner.practitioner.practitionerRole.id),
            };
        });
        return shouldRender.length
            ? html ` <c-box flex col-gap-24>
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
              ${filteredShift?.map((requestPlan) => {
                const [dayPart, plan] = requestPlan.shiftName.split('');
                const hasInitialSr = initialSr?.[+plan];
                const bgColor = dayPortValue[dayPart].bgColor;
                const mediumColor = dayPortValue[dayPart].mediumColor;
                return requestPlan?.scheduleStaffings?.length
                    ? html ` <c-box flex items-center flex-col>
                      <c-box
                        @click="${(e) => {
                        this.addSrShiftRequest(requestPlan, dateString);
                        const target = e.target;
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
                    </c-box>`
                    : undefined;
            })}
            </c-box>
          </c-box>
        </c-box>`
            : undefined;
    }
    addSrShiftRequest(requestPlan, dateString) {
        const [dayPart, plan] = requestPlan.shiftName.split('');
        // 📌 long hand =  if (!this.shiftRequest[dayPart]) this.shiftRequest[dayPart] = {};
        this.shiftSrRequestCache[dateString] ||= {};
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
        }
        else {
            this.shiftSrRequestCache[dateString][dayPart][+plan] = requestPlan;
        }
    }
    groupShiftsByLetter(arr) {
        const result = {};
        for (const shift of arr) {
            const letter = shift.shiftName.charAt(0);
            if (!result[letter]) {
                result[letter] = [];
            }
            result[letter].push(shift);
        }
        return result;
    }
    renderContentBack(type, date, dateString, practitioner, boxTarget, indexUser, renderType, request) {
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
                render(this.renderWoffSavedHost(dateString, practitioner, { initial: true }, 'woff', date, indexUser), boxTarget);
                break;
            case 'off':
            case 'sem':
            case 'vac':
                setTimeout(() => {
                    render(this.renderDayOffPlanSaved({
                        dateString: this.shiftDatepickerCache[type].dateString,
                        remark: this.shiftDatepickerCache[type].remark,
                        initial: this.shiftDatepickerCache[type].initial,
                    }, this.shiftDatepickerCache[type].requestType, this.shiftDatepickerCache[type].practitioner, this.shiftDatepickerCache[type].date, this.shiftDatepickerCache[type].indexUser, 'cancel'), boxTarget);
                }, 0);
                break;
            default:
                render(this.renderEmptyDateForSelect(date, practitioner, dateString, indexUser, request), boxTarget);
                break;
        }
    }
    renderSrPopover(date, practitioner, request, cellId, indexUser, event) {
        const shiftGroup = this.groupShiftsByLetter(this.scheduleData?.scheduleShifts);
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
            ?.flatMap((res) => res.scheduleStaffings?.find((res) => new Date(res.planDate).getDate() === date.getDate() &&
            res.practitionerLevelId === practitioner.practitioner.practitionerLevelId &&
            res.practitionerLevel.practitionerRoleId ===
                practitioner.practitioner.practitionerRoleId))
            .filter(Boolean);
        const hasSrPlan = !!shouldAllowedPointer?.length && this.requestSelected?.abbr === 'sr';
        return hasSrPlan
            ? html `
          <c-box slot="popover" popover-check>
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
                      .set="${{ type: 'secondary' }}"
                      @click="${() => {
                this.closePopover();
                if (cellId) {
                    const boxTarget = this.querySelector(`#${cellId}-${dateString}`);
                    const targetElement = event?.target;
                    const shiftType = targetElement.closest('c-box[shift-type]');
                    const requestHostType = shiftType.getAttribute('shift-type');
                    if (cellId) {
                        const [requestType, renderType] = requestHostType?.split('-');
                        this.renderContentBack(requestType, date, dateString, practitioner, boxTarget, indexUser, renderType, request);
                    }
                }
            }}"
                      >ยกเลิก</cx-button
                    >
                    <cx-button
                      .var="${{ width: 'size-0' }}"
                      @click="${() => this.saveSrRequestPlan(date, practitioner, cellId, indexUser)}"
                      >บันทึก</cx-button
                    >
                  </c-box>
                </c-box>
              </c-box>

              <!-- selected request -->
              <c-box mt-12 flex flex-col row-gap-24>
                <!-- morning -->
                ${['m', 'a', 'n'].map((dayPart) => html `${shiftGroup[dayPart]
                ? this.renderShipSrRequest(shiftGroup[dayPart], dayPart, dateString, practitioner, request?.[dayPart])
                : undefined}`)}
              </c-box>
            </c-box>
          </c-box>
        `
            : html `
          <c-box slot="popover" popover-check>
            <c-box content flex flex-col items-center row-gap-12>
              <c-box> ไม่มีเวรให้เลือก </c-box>

              <cx-button
                .var="${{ width: 'size-0' }}"
                .set="${{ type: 'secondary' }}"
                @click="${() => {
                this.closePopover();
                if (cellId) {
                    const boxTarget = this.querySelector(`#${cellId}-${dateString}`);
                    const targetElement = event?.target;
                    const shiftType = targetElement.closest('c-box[shift-type]');
                    const requestHostType = shiftType.getAttribute('shift-type');
                    if (cellId) {
                        const [requestType, renderType] = requestHostType?.split('-');
                        this.renderContentBack(requestType, date, dateString, practitioner, boxTarget, indexUser, renderType, request);
                    }
                }
            }}"
                >ยกเลิก</cx-button
              >
            </c-box>
          </c-box>
        `;
    }
    saveSrRequestPlan(date, practitioner, cellId, indexUser) {
        const dateString = this.convertDateToString(date);
        if (!this.shiftSrRequestSaved[practitioner.id]) {
            this.shiftSrRequestSaved[practitioner.id] = {};
            this.shiftSrRequestSaved[practitioner.id].request = {};
            this.shiftSrRequestSaved[practitioner.id].request[this.convertDateToString(date)] = {};
        }
        if (typeof this.shiftSrRequestSaved[practitioner.id].request !== 'object') {
            this.shiftSrRequestSaved[practitioner.id].request = {};
        }
        if (typeof this.shiftSrRequestSaved[practitioner.id].request[this.convertDateToString(date)] !==
            'object') {
            this.shiftSrRequestSaved[practitioner.id].request[this.convertDateToString(date)] = {};
        }
        this.shiftSrRequestSaved[practitioner.id].practitioner = practitioner;
        this.shiftSrRequestSaved[practitioner.id].request[this.convertDateToString(date)].shiftPlan =
            this.shiftSrRequestCache[dateString];
        // it not re render
        if (cellId) {
            const boxTarget = this.querySelector(`#${cellId}-${dateString}`);
            setTimeout(() => {
                if (Object.keys(this.shiftSrRequestCache).length === 0) {
                    render(this.renderEmptyDateForSelect(date, practitioner, dateString, indexUser), boxTarget);
                }
                else {
                    const planEntries = Object.entries(this.shiftSrRequestCache[dateString]);
                    render(this.renderSrSavedHost(dateString, practitioner, planEntries), boxTarget);
                    this.shiftSrRequestCache[dateString] = {};
                }
            }, 0);
        }
        const dateBetween = getDateBetweenArrayDate(this.datepickerData?.startDate, this.datepickerData?.endDate);
        this.deleteInitialDatePicker(practitioner.id, dateBetween, dateString);
        this.requestUpdate();
        this.dispatchEvent(new CustomEvent('save-sr', { detail: this.shiftSrRequestSaved }));
        this.dispatchEvent(new CustomEvent('save-request', {
            detail: { [this.requestSelected?.abbr]: this.shiftSrRequestSaved },
        }));
        this.selectedDate = undefined;
        this.closePopover();
    }
    closePopover() {
        ModalCaller.popover().clear();
        this.currentPopoverRef = undefined;
        this.generateDayOffValue = undefined;
        this.datepickerData = undefined;
    }
    selectDateRequest(date, type, practitioner, dateString) {
        this.selectedDate = date;
        if (type === 'woff') {
            this.saveWoffRequest(date, practitioner, dateString);
        }
    }
    saveWoffRequest(date, practitioner, dateString) {
        if (this.shouldNotAllowedWeekOffSelect === true)
            return;
        if (!this.shiftWoffRequestSaved?.[practitioner.id]) {
            this.shiftWoffRequestSaved[practitioner.id] = {};
            this.shiftWoffRequestSaved[practitioner.id].request = {};
        }
        this.shiftWoffRequestSaved[practitioner.id].request[this.convertDateToString(date)] = { date };
        this.shiftWoffRequestSaved[practitioner.id] = {
            ...this.shiftWoffRequestSaved[practitioner.id],
            practitioner,
        };
        const dateBetween = getDateBetweenArrayDate(this.datepickerData?.startDate, this.datepickerData?.endDate);
        this.deleteInitialDatePicker(practitioner.id, dateBetween, dateString);
        this.dispatchEvent(new CustomEvent('focus-request', {
            detail: { practitioner: practitioner },
        }));
        this.dispatchEvent(new CustomEvent('save-woff', {
            detail: this.shiftWoffRequestSaved,
        }));
        this.dispatchEvent(new CustomEvent('save-request', {
            detail: {
                [this.requestSelected?.abbr]: this.shiftWoffRequestSaved,
            },
        }));
        this.selectedDate = undefined;
    }
    renderEmptyBox(date, state, type, practitioner, dateString, indexUser) {
        const isSameDate = this.selectedDate === date;
        const isHoliday = this.holidayWithKeyMap?.[this.convertDateToString(date)];
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        return html `
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
    countSameDates(dateA, dateB) {
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
                const requestPLan = this.scheduleData?.schedulePractitioner?.[cache.queryIndex.practitionerIndex]
                    .schedulePractitionerRequest;
                if (!requestPLan)
                    return;
                // woff, sem, off, vac
                if (typeof cache.queryIndex.requestIndex === 'number') {
                    if (requestPLan) {
                        requestPLan[cache.queryIndex.requestIndex] = cache.schedulePractitionerRequest;
                    }
                }
                else {
                    // sr
                    cache.queryIndex.requestIndex.forEach((resIndex) => {
                        requestPLan[resIndex] = cache.schedulePractitionerRequest[resIndex];
                    });
                }
                this.requestUpdate();
            }
        }
    }
    convertRequestDatesToObject(requests) {
        const result = {};
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
                        const [dayPart, requestPart] = requestShift?.split('');
                        if (!result[requestDate]) {
                            result[requestDate] = { arrangedRequest: {}, ...item };
                        }
                        if (!result[requestDate].arrangedRequest[dayPart]) {
                            result[requestDate].arrangedRequest[dayPart] = {};
                        }
                        result[requestDate].arrangedRequest[dayPart][+requestPart] =
                            // @ts-ignore
                            this.scheduleData?.scheduleShifts?.find((res) => res.shiftName === requestShift);
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
    setColorRequestType(requestTime) {
        switch (requestTime) {
            case 'a':
                return 'color-12-100';
            case 'n':
                return 'color-7-100';
            case 'm':
                return 'color-4-100';
        }
    }
    convertDateToString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    // private setTableEgdeLine = () => {
    //   const element = this.tableWrapperRef.value!;
    //   const hasScrollX = element.scrollWidth > element?.clientWidth!;
    //   if (hasScrollX) {
    //     this.tableWrapperRef.value?.setAttribute('ui', this.tableLineUI);
    //   } else {
    //     this.tableWrapperRef.value?.removeAttribute('ui');
    //   }
    // };
    moveUserToFirstArray() {
        const index = this.scheduleData?.schedulePractitioner?.findIndex((obj) => {
            return obj.practitionerId === this.practitionerId;
        });
        if (index !== -1) {
            const item = this.scheduleData?.schedulePractitioner?.splice(index, 1)[0];
            this.scheduleData?.schedulePractitioner?.unshift(item);
        }
        return true;
    }
    isSameMonth(date1, date2) {
        return (new Date(date1).getMonth() === new Date(date2).getMonth() &&
            new Date(date1).getFullYear() === new Date(date2).getFullYear());
    }
    updated(changedProp) {
        if (changedProp.has('userHoverIndex'))
            return;
        const tableWrapper = this.querySelector('.lit-virtualizer');
        const errorDayRequest = this.querySelector('.error-day-request');
        if (changedProp.has('errorDayRequest')) {
            this.shouldScrollErrorTarget = true;
        }
        if (errorDayRequest && this.shouldScrollErrorTarget) {
            const left = tableWrapper?.getBoundingClientRect().left;
            setTimeout(() => {
                const errorRect = errorDayRequest?.getBoundingClientRect();
                const scrollErrorValue = errorRect?.left;
                tableWrapper?.scrollTo({
                    top: 0,
                    left: Math.floor(scrollErrorValue - (left + 260)),
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
        }
        else {
            shiftPlandatepicker.forEach((ele) => {
                ele?.removeAttribute('cursor-pointer');
            });
            woffSaved.forEach((ele) => {
                ele?.removeAttribute('cursor-pointer');
            });
        }
        this.disableDateArranged = this.getDateDisabled(this.disableDates, this.scheduleData?.startDate, this.scheduleData?.endDate);
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
                    this.scrollValueFirstDateMonth = structuredClone(firstDateOfMonthsArray
                        .map((ele, index) => {
                        return {
                            scrollValue: Math.floor(ele.getBoundingClientRect().left),
                            date: ele.getAttribute('data-first-date'),
                        };
                    })
                        ?.sort((a, b) => a.scrollValue - b.scrollValue)
                        .map((res, index) => ({ ...res, index })));
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
                        const target = e.target;
                        const left = target.getBoundingClientRect().left + 260;
                        const scrollValue = target.scrollLeft + left;
                        let value = {};
                        for (let index = 0; index <= this.scrollValueFirstDateMonth.length; index++) {
                            const current = this.scrollValueFirstDateMonth[index];
                            const next = this.scrollValueFirstDateMonth[index + 1];
                            if (scrollValue >= current?.scrollValue && scrollValue <= next?.scrollValue) {
                                value = current;
                            }
                            else if (!next && !Object.keys(value).length) {
                                value = this.scrollValueFirstDateMonth[this.scrollValueFirstDateMonth.length - 1];
                            }
                        }
                        this.currentMonthTitleDisplay = value.date;
                        if (this.scrollValueFirstDateMonth[0].date === this.currentMonthTitleDisplay) {
                            this.shouldArrowLeftDisable = true;
                        }
                        else {
                            this.shouldArrowLeftDisable = false;
                        }
                        if (this.scrollValueFirstDateMonth[this.scrollValueFirstDateMonth.length - 1].date ===
                            this.currentMonthTitleDisplay) {
                            this.shouldArrowRightDisable = true;
                        }
                        else {
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
                if (this.monthTitleNav) {
                    this.currentMonthTitleDisplay = this.monthTitleNav?.dataset.firstDate;
                }
                else {
                    this.monthTitleNav = this.querySelector('.first-date-of-month');
                    this.currentMonthTitleDisplay = this.monthTitleNav?.dataset.firstDate;
                }
            }
            setTimeout(() => {
                // right
                const monthValRight = this.scrollValueFirstDateMonth?.find((res) => res.date === this.currentMonthTitleDisplay);
                if (typeof monthValRight === 'undefined' ||
                    monthValRight?.index === this.scrollValueFirstDateMonth.length - 1) {
                    this.shouldArrowRightDisable = true;
                }
                else {
                    this.shouldArrowRightDisable = false;
                }
                // left
                const monthValLeft = this.scrollValueFirstDateMonth?.find((res) => res.date === this.currentMonthTitleDisplay);
                if (typeof monthValLeft === 'undefined' || monthValLeft?.index === 0) {
                    this.shouldArrowLeftDisable = true;
                }
                else {
                    this.shouldArrowLeftDisable = false;
                }
            }, 250);
        }
        //
        const practitioner = this.scheduleData?.schedulePractitioner?.[this.userSelectedIndex];
        // dayOff
        if (practitioner && this.requestSelected?.abbr === 'off') {
            const initialOff = practitioner.schedulePractitionerRequest.filter((res) => res.requestType.abbr === 'off');
            const savedOff = Object.keys(this.shiftOffRequestSaved?.[practitioner.id]?.request || {});
            // this.mayDayOffLength = initialOff.length + savedOff.length;
            if (!this.maxDayOffLength?.[practitioner.practitioner.id]) {
                this.maxDayOffLength[practitioner.practitioner.id] = {};
            }
            this.maxDayOffLength[practitioner.practitioner.id].dayOff =
                initialOff.length + savedOff.length;
        }
        this.setVacDayOff(practitioner);
        super.update(changedProp);
    }
    setVacDayOff(practitioner) {
        if (practitioner && this.requestSelected?.abbr === 'vac') {
            const initialOff = practitioner.schedulePractitionerRequest.filter((res) => res.requestType.abbr === 'vac');
            const saveVac = Object.keys(this.shiftVacRequestSaved?.[practitioner.id]?.request || {});
            // this.mayDayOffLength = initialOff.length + savedOff.length;
            if (!this.maxDayOffLength?.[practitioner.practitioner.id]) {
                this.maxDayOffLength[practitioner.practitioner.id] = {};
            }
            this.maxDayOffLength[practitioner.practitioner.id].vacation =
                initialOff.length + saveVac.length;
            // cache initial value
            const findVacation = practitioner.practitioner.vacations.find((res) => res.year === new Date(this.currentTime).getFullYear());
            this.vacDayOff[practitioner.practitioner.id] = findVacation.vacation;
            this.requestUpdate();
        }
    }
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
    dateRangeIntersect(startDate, endDate, dateSameCheck) {
        const result = [];
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
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    generateDayOff(startDate, endDate, dayOffExist, dayOff, disabledDate, initialDate) {
        const existingDaysOff = new Set([...dayOffExist, ...initialDate]);
        const disabledDays = new Set(disabledDate);
        const initialDays = new Set(initialDate);
        let availableDays = [...Array.from(initialDays)];
        while (dayOff > availableDays.length - Array.from(initialDays).length) {
            for (let currentDate = new Date(startDate.getTime()); currentDate <= endDate && dayOff > availableDays.length - Array.from(initialDays).length; currentDate.setDate(currentDate.getDate() + 1)) {
                const dateString = currentDate.getFullYear().toString().padStart(4, '0') +
                    '-' +
                    (currentDate.getMonth() + 1).toString().padStart(2, '0') +
                    '-' +
                    currentDate.getDate().toString().padStart(2, '0');
                if (existingDaysOff.has(dateString) && !availableDays.includes(dateString)) {
                    availableDays.push(dateString);
                }
                else if (!existingDaysOff.has(dateString) &&
                    !disabledDays.has(dateString) &&
                    currentDate >= startDate &&
                    currentDate <= endDate) {
                    availableDays.push(dateString);
                    existingDaysOff.add(dateString);
                }
            }
        }
        return availableDays;
    }
    getHolidayObject(inputArray) {
        const outputObject = {};
        inputArray.forEach((item) => {
            outputObject[item.date] = item;
        });
        return outputObject;
    }
    increaseDate(days, date) {
        const newDate = new Date(date.getTime());
        newDate.setDate(date.getDate() + days);
        return newDate;
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
    disconnectedCallback() {
        super.disconnectedCallback();
        ModalCaller.popover().clear();
    }
};
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "currentTime", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], ShiftSchedule.prototype, "viewerRole", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], ShiftSchedule.prototype, "mode", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Array)
], ShiftSchedule.prototype, "disableDates", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], ShiftSchedule.prototype, "practitionerId", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "userHoverIndex", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "userSelectedIndex", void 0);
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
    property({ type: Object }),
    __metadata("design:type", Array)
], ShiftSchedule.prototype, "holidays", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Array)
], ShiftSchedule.prototype, "errorDayRequest", void 0);
__decorate([
    property(),
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
    property(),
    __metadata("design:type", Number)
], ShiftSchedule.prototype, "maxWeekOFf", void 0);
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
    property({ type: String }),
    __metadata("design:type", String)
], ShiftSchedule.prototype, "maxHeight", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "datepickerData", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "isRemoveMode", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "dividerTop", void 0);
__decorate([
    state(),
    __metadata("design:type", Boolean)
], ShiftSchedule.prototype, "shouldArrowLeftDisable", void 0);
__decorate([
    state(),
    __metadata("design:type", Boolean)
], ShiftSchedule.prototype, "shouldArrowRightDisable", void 0);
__decorate([
    state(),
    __metadata("design:type", String)
], ShiftSchedule.prototype, "currentMonthTitleDisplay", void 0);
__decorate([
    state(),
    __metadata("design:type", Object)
], ShiftSchedule.prototype, "startFocusWithViewMode", void 0);
__decorate([
    state(),
    __metadata("design:type", Boolean)
], ShiftSchedule.prototype, "shouldNotAllowedWeekOffSelect", void 0);
ShiftSchedule = __decorate([
    customElement('cx-shift-schedule')
], ShiftSchedule);
export { ShiftSchedule };
//# sourceMappingURL=shift-schedule.js.map