import { ColorTypes } from '@cortex-ui/core/cx/types/colors.type';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RequestType } from '../schedule.types';
@customElement('request-button')
export class MyElement extends LitElement {
  @property({ type: String })
  text!: string;

  @property({ type: String })
  icon!: CXIcon.Set['src'];

  @property({ type: String })
  iconColor!: ColorTypes;

  @property({ type: String })
  bgColor!: ColorTypes;

  @property({ type: String })
  accentColor!: ColorTypes;

  @property({ type: String })
  iconBgColor!: ColorTypes;

  @property({ type: Object })
  currentType?: RequestType;

  @property({ type: Object })
  requestType!: RequestType;

  @property({ type: String })
  width = '44';

  @property({ type: String })
  height = '44';

  render() {
    const isSelected = this.requestType.abbr === this.currentType?.abbr;
    const borderColor = isSelected ? this.accentColor : this.iconBgColor;
    const bgHover = isSelected ? this.accentColor : this.iconBgColor;
    return html`
      <style>
        cx-shift-schedule request-button c-box[icon-prefix]::before {
          transition: 0.2s ease;
        }

        cx-shift-schedule request-button .btnContent {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        cx-shift-schedule request-button .wrapper {
          cursor: pointer;
          display: flex;
          align-items: center;
          column-gap: 8px;
          border-radius: 24px;
          padding-right: 24px;
          font-size: 16px;
          font-family: var(--regular);
          transition: all 0.2s ease;
        }
        [data-abbr='${this.requestType.abbr}']:hover {
          background: var(--${bgHover}) !important;
        }
      </style>
      <div
        data-abbr="${this.requestType.abbr}"
        style="color:${isSelected
          ? 'white'
          : this.accentColor}; border: 2px solid var(--${borderColor});background: ${isSelected
          ? `var(--${this.accentColor})`
          : 'white'}"
        class="wrapper">
        <div
          id="icon-head"
          class="btnContent"
          style="min-width:${this.width}px; min-height:${this
            .height}px; background:var(--${isSelected ? this.accentColor : this.iconBgColor});">
          <c-box icon-prefix="24 ${this.icon} ${isSelected ? 'white' : this.accentColor}"></c-box>
        </div>
        <div
          style="white-space: pre; font-size:16px; font-family:var(--regular); color:${isSelected
            ? 'white'
            : `var(--${this.accentColor})`} "
          >${this.text}</div>
      </div>
    `;
  }

  createRenderRoot() {
    return this;
  }
}
