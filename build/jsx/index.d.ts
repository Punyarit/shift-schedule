import { ShiftSchedule as CXShiftSchedule } from '../shift-schedule/shift-schedule';
export declare const CxShiftSchedule: import("@lit-labs/react").ReactWebComponent<CXShiftSchedule, {
    onSaveRequest: string;
}>;
declare global {
    namespace CXShiftSchedule {
        type JSX = typeof CxShiftSchedule.defaultProps;
    }
}
