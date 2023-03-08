import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import { ShiftSchedule as CXShiftSchedule } from '../shift-schedule/shift-schedule';
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
    },
});
//# sourceMappingURL=index.js.map