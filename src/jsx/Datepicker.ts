import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { DatePicker } from '@cortex-ui/core/cx/datepicker';

export const CxDatePicker = createComponent({
  tagName: 'cx-datepicker',
  elementClass: DatePicker,
  react: React,
  events: {
    onSelectDate: 'select-date',
  },
});

declare global {
  namespace CXDatePicker {
    type JSX = typeof CxDatePicker.defaultProps;
  }
}
