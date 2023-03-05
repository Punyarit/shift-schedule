import { ColorTypesV2 } from '@cortex-ui/core/cx/types/colors.v2.type';
import { LitElement } from 'lit';
import { RequestType } from '../schedule.types';
export declare class MyElement extends LitElement {
    private btnWrapper;
    private btnContent;
    text: string;
    icon: CXIcon.Set['src'];
    iconColor: ColorTypesV2;
    bgColor: ColorTypesV2;
    accentColor: ColorTypesV2;
    iconBgColor: ColorTypesV2;
    currentType?: RequestType;
    requestType: RequestType;
    width: string;
    height: string;
    render(): import("lit-html").TemplateResult<1>;
    createRenderRoot(): this;
}
