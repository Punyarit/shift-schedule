import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import { ShiftSchedule as ShiftScheduleComponent } from './dist/shift-schedule';

export const ShiftSchedule = createComponent({
  tagName: 'shift-schedule',
  elementClass: ShiftScheduleComponent,
  react: React,
  events: {
    onSaveRequest: 'save-request',
  },
});
