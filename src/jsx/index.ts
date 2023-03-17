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
    onRemoveREquest: 'remove-request',
    onSelectRequest: 'select-request',
    onRemoveOrigin: 'remove-origin',
    onFocusRequest: 'focus-request',
  },
});

declare global {
  namespace CXShiftSchedule {
    type JSX = typeof CxShiftSchedule.defaultProps;
  }
}

// theme
export const CxTheme = createComponent({
  tagName: 'cx-theme',
  elementClass: Theme,
  react: React,
});

declare global {
  namespace CXTheme {
    type JSX = typeof CxTheme.defaultProps;
  }
}

// modal
export const CXModal = createComponent({
  tagName: 'cx-modal',
  elementClass: Modal,
  react: React,
});

declare global {
  namespace CXModal {
    type JSX = typeof CXModal.defaultProps;
  }
}
