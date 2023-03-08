import { ShiftSchedule as CXShiftSchedule } from '../shift-schedule/shift-schedule';
export declare const CxShiftSchedule: import("@lit-labs/react").ReactWebComponent<CXShiftSchedule, {
    onSaveRequest: string;
    onSaveSr: string;
    onSaveSem: string;
    onSaveOff: string;
    onSaveVac: string;
    onSaveWoff: string;
}>;
declare global {
    namespace CXShiftSchedule {
        type JSX = typeof CxShiftSchedule.defaultProps;
    }
}
