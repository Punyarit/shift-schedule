import { ColorTypesV2 } from '@cortex-ui/core/cx/types/colors.v2.type';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RequestType } from '../schedule.types';
@customElement('request-button')
export class MyElement extends LitElement {
  private btnWrapper =
    'cursor-pointer flex items-center col-gap-12 round-24 border-2 border-primary-100 border-solid pr-24';

  private btnContent = 'round-full flex items-center justify-center';

  @property({ type: String })
  text!: string;

  @property({ type: String })
  icon!: CXIcon.Set['src'];

  @property({ type: String })
  iconColor!: ColorTypesV2;

  @property({ type: String })
  bgColor!: ColorTypesV2;

  @property({ type: String })
  accentColor!: ColorTypesV2;

  @property({ type: String })
  iconBgColor!: ColorTypesV2;

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
    return html`
      <c-box
        shadow-hover="shadow-3"
        class="wrapper"
        tabindex="0"
        tx-color="${isSelected ? 'white' : this.accentColor}"
        ui="${this.btnWrapper}"
        bg-color="${isSelected ? this.accentColor : 'white'}">
        <c-box
          id="icon-head"
          ui="${this.btnContent}"
          min-w="${this.width}"
          min-h="${this.height}"
          bg-color="${isSelected ? this.accentColor : this.iconBgColor}">
          <c-box
            icon-prefix="${this.icon}"
            icon-prefix-size="24"
            icon-prefix-color="${this.iconColor}"></c-box>
        </c-box>
        <c-box>${this.text}</c-box>
      </c-box>
    `;
  }

  createRenderRoot() {
    return this;
  }
}
