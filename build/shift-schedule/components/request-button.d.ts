import { ColorTypes } from '@cortex-ui/core/cx/types/colors.type';
import { LitElement } from 'lit';
import { RequestType } from '../schedule.types';
export declare class MyElement extends LitElement {
    text: string;
    icon: CXIcon.Set['src'];
    iconColor: ColorTypes;
    bgColor: ColorTypes;
    accentColor: ColorTypes;
    iconBgColor: ColorTypes;
    currentType?: RequestType;
    requestType: RequestType;
    width: string;
    height: string;
    render(): import("lit-html").TemplateResult<1>;
    createRenderRoot(): this;
}
