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
        this.btnWrapper = 'cursor-pointer flex items-center col-gap-12 round-24 border-2 border-primary-100 border-solid pr-24';
        this.btnContent = 'round-full flex items-center justify-center';
        this.width = '44';
        this.height = '44';
    }
    render() {
        const isSelected = this.requestType.abbr === this.currentType?.abbr;
        return html `
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
        <c-box whitespace-pre>${this.text}</c-box>
      </c-box>
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