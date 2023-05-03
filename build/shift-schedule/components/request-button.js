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
import { customElement, property } from 'lit/decorators.js';
let MyElement = class MyElement extends LitElement {
    constructor() {
        super(...arguments);
        this.btnWrapper = (color) => `btnWrapper: cursor-pointer flex items-center col-gap-8 round-24 border-2 border-${color} border-solid pr-24`;
        this.btnContent = 'btnContent: flex items-center justify-center round-full';
        this.width = '44';
        this.height = '44';
    }
    render() {
        const isSelected = this.requestType.abbr === this.currentType?.abbr;
        const hov = `hov: bg-${isSelected ? this.accentColor : this.iconBgColor}!`;
        return html `
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
};
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], MyElement.prototype, "text", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", Object)
], MyElement.prototype, "icon", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], MyElement.prototype, "iconColor", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], MyElement.prototype, "bgColor", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], MyElement.prototype, "accentColor", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", String)
], MyElement.prototype, "iconBgColor", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], MyElement.prototype, "currentType", void 0);
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], MyElement.prototype, "requestType", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", Object)
], MyElement.prototype, "width", void 0);
__decorate([
    property({ type: String }),
    __metadata("design:type", Object)
], MyElement.prototype, "height", void 0);
MyElement = __decorate([
    customElement('request-button')
], MyElement);
export { MyElement };
//# sourceMappingURL=request-button.js.map