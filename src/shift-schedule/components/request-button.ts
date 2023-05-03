import { ColorTypes } from '@cortex-ui/core/cx/types/colors.type';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RequestType } from '../schedule.types';
@customElement('request-button')
export class MyElement extends LitElement {
  private btnWrapper = (color: string) =>
    `btnWrapper: cursor-pointer flex items-center col-gap-8 round-24 border-2 border-${color} border-solid pr-24`;

  private btnContent = 'btnContent: flex items-center justify-center round-full';

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
    const hov = `hov: bg-${isSelected ? this.accentColor : this.iconBgColor}!`;
    return html`
      <c-div
        class="wrapper"
        tabindex="0"
        .$class="${this.btnWrapper(isSelected ? this.accentColor : this.iconBgColor)}"
        .$class-hover="${hov}"
        style="font-size: 16px; color: var(--${isSelected
          ? 'white'
          : this.accentColor}); transition: all 0.2s ease; background: var(--${isSelected
          ? this.accentColor
          : 'white'})">
        <c-div
          id="icon-head"
          .$class="${this.btnContent}"
          .min-w="${this.width}"
          .min-h="${this.height}"
          style="background: var(--${isSelected ? this.accentColor : this.iconBgColor})">
          <c-div .$icon="${this.icon}: tx-24 tx-${isSelected ? 'white' : this.accentColor}"></c-div>
        </c-div>
        <c-div
          whitespace-pre
          style="font-size: 16px; color: var(--${isSelected ? 'white' : 'gray-800'})"
          >${this.text}</c-div
        >
      </c-div>
    `;
  }

  createRenderRoot() {
    return this;
  }
}
