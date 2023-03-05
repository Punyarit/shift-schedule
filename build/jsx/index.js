import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import { ShiftSchedule as CXShiftSchedule } from '../shift-schedule/shift-schedule';
export const CxShiftSchedule = createComponent({
    tagName: 'cx-shift-schedule',
    elementClass: CXShiftSchedule,
    react: React,
    events: {
        onSaveRequest: 'save-request',
    },
});
//# sourceMappingURL=index.js.map