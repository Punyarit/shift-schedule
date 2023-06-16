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
        this.width = '44';
        this.height = '44';
    }
    render() {
        const isSelected = this.requestType.abbr === this.currentType?.abbr;
        const borderColor = isSelected ? this.accentColor : this.iconBgColor;
        const bgHover = isSelected ? this.accentColor : this.iconBgColor;
        return html `
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