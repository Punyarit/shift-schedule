import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import { ShiftSchedule as CXShiftSchedule } from '../shift-schedule/shift-schedule';
import { Theme } from '@cortex-ui/core/cx/theme';
import { Modal } from '@cortex-ui/core/cx/modal';
export const CxShiftSchedule = createComponent({
    tagName: 'cx-shift-schedule',
    elementClass: CXShiftSchedule,
    react: React,
    events: {
        onSaveRequest: 'save-request',
        onSaveSr: 'save-sr',
        onSaveSem: 'save-sem',
        onSaveOff: 'save-off',
        onSaveVac: 'save-vac',
        onSaveWoff: 'save-woff',
        onRemoveRequest: 'remove-request',
        onSelectRequest: 'select-request',
        onRemoveOrigin: 'remove-origin',
        onFocusRequest: 'focus-request',
    },
});
// theme
export const CxTheme = createComponent({
    tagName: 'cx-theme',
    elementClass: Theme,
    react: React,
});
// modal
export const CXModal = createComponent({
    tagName: 'cx-modal',
    elementClass: Modal,
    react: React,
});
//# sourceMappingURL=index.js.map