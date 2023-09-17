import { ShiftSchedule as CXShiftSchedule } from '../shift-schedule/shift-schedule';
import { Theme } from '@cortex-ui/core/cx/theme';
import { Modal } from '@cortex-ui/core/cx/modal';
export declare const CxShiftSchedule: import("@lit-labs/react").ReactWebComponent<CXShiftSchedule, {
    onSaveRequest: string;
    onSaveSr: string;
    onSaveSem: string;
    onSaveOff: string;
    onSaveVac: string;
    onSaveWoff: string;
    onRemoveRequest: string;
    onRemoveAction: string;
    onSelectRequest: string;
    onRemoveOrigin: string;
    onFocusRequest: string;
}>;
declare global {
    namespace CXShiftSchedule {
        type JSX = typeof CxShiftSchedule.defaultProps;
    }
}
export declare const CxTheme: import("@lit-labs/react").ReactWebComponent<Theme, {}>;
declare global {
    namespace CXTheme {
        type JSX = typeof CxTheme.defaultProps;
    }
}
export declare const CXModal: import("@lit-labs/react").ReactWebComponent<Modal, {}>;
declare global {
    namespace CXModal {
        type JSX = typeof CXModal.defaultProps;
    }
}
