import { DatePicker } from '@cortex-ui/core/cx/datepicker';
export declare const CxDatePicker: import("@lit-labs/react").ReactWebComponent<DatePicker, {
    onSelectDate: string;
}>;
declare global {
    namespace CXDatePicker {
        type JSX = typeof CxDatePicker.defaultProps;
    }
}
