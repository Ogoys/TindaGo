import React, { useMemo } from 'react';
import { CalendarDatePickerModal } from './CalendarDatePickerModal';

interface LoanPaymentDateModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  selectedDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
}

export const LoanPaymentDateModal: React.FC<LoanPaymentDateModalProps> = ({
  visible,
  onClose,
  onConfirm,
  selectedDate,
  minDate,
  maxDate,
}) => {
  const defaultMinDate = useMemo(() => {
    if (minDate) {
      const next = new Date(minDate);
      next.setHours(0, 0, 0, 0);
      return next;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }, [minDate]);

  const defaultMaxDate = useMemo(() => {
    if (maxDate) {
      const next = new Date(maxDate);
      next.setHours(23, 59, 59, 999);
      return next;
    }
    const thirtyDaysFromNow = new Date(defaultMinDate);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 29);
    thirtyDaysFromNow.setHours(23, 59, 59, 999);
    return thirtyDaysFromNow;
  }, [maxDate, defaultMinDate]);

  const initialDate = useMemo(() => {
    if (selectedDate) {
      return selectedDate;
    }
    return defaultMinDate;
  }, [selectedDate, defaultMinDate]);

  const infoText = useMemo(() => {
    const minLabel = defaultMinDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
    const maxLabel = defaultMaxDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
    return `Pick a date between ${minLabel} and ${maxLabel}.`;
  }, [defaultMinDate, defaultMaxDate]);

  const handleConfirm = (date: Date) => {
    onConfirm(date);
    onClose();
  };

  return (
    <CalendarDatePickerModal
      visible={visible}
      onClose={onClose}
      onConfirm={handleConfirm}
      initialDate={initialDate}
      minDate={defaultMinDate}
      maxDate={defaultMaxDate}
      title="Set Loan Payment Date"
      description="Choose when you plan to repurchase or pay back this amount."
      infoText={infoText}
      confirmLabel="Set Date"
      showClearButton={false}
    />
  );
};
 