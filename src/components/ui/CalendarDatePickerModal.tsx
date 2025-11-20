import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { s, vs, ms } from '../../constants/responsive';

interface CalendarDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  onClear?: () => void;
  initialDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  title?: string;
  description?: string;
  infoText?: string;
  confirmLabel?: string;
  clearLabel?: string;
  showClearButton?: boolean;
}

const months = [
  { id: 0, short: 'Jan', name: 'January' },
  { id: 1, short: 'Feb', name: 'February' },
  { id: 2, short: 'Mar', name: 'March' },
  { id: 3, short: 'Apr', name: 'April' },
  { id: 4, short: 'May', name: 'May' },
  { id: 5, short: 'Jun', name: 'June' },
  { id: 6, short: 'Jul', name: 'July' },
  { id: 7, short: 'Aug', name: 'August' },
  { id: 8, short: 'Sep', name: 'September' },
  { id: 9, short: 'Oct', name: 'October' },
  { id: 10, short: 'Nov', name: 'November' },
  { id: 11, short: 'Dec', name: 'December' },
];

const defaultTitle = 'Select Date';
const defaultDescription = 'Choose a date that works best for you';
const defaultInfoText = 'Use the controls above to switch between months and years';

export const CalendarDatePickerModal: React.FC<CalendarDatePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onClear,
  initialDate = null,
  minDate,
  maxDate,
  title = defaultTitle,
  description = defaultDescription,
  infoText = defaultInfoText,
  confirmLabel = 'Confirm',
  clearLabel = 'Clear',
  showClearButton = true,
}) => {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const computedMinDate = useMemo(() => {
    const base = minDate ? new Date(minDate) : today;
    base.setHours(0, 0, 0, 0);
    return base;
  }, [minDate, today]);

  const computedMaxDate = useMemo(() => {
    if (maxDate) {
      const next = new Date(maxDate);
      next.setHours(23, 59, 59, 999);
      return next;
    }
    const fallback = new Date(computedMinDate);
    fallback.setFullYear(fallback.getFullYear() + 10);
    fallback.setHours(23, 59, 59, 999);
    return fallback;
  }, [maxDate, computedMinDate]);

  const clampDate = (date: Date) => {
    if (date.getTime() < computedMinDate.getTime()) {
      return new Date(computedMinDate);
    }
    if (date.getTime() > computedMaxDate.getTime()) {
      return new Date(computedMaxDate);
    }
    return date;
  };

  const initialClampedDate = useMemo(() => {
    if (initialDate) {
      return clampDate(new Date(initialDate));
    }
    return new Date(computedMinDate);
  }, [initialDate, computedMinDate]);

  const [tempDate, setTempDate] = useState<Date>(initialClampedDate);
  const [calendarMonth, setCalendarMonth] = useState(initialClampedDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(initialClampedDate.getFullYear());
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const yearScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      const nextDate = clampDate(initialClampedDate);
      setTempDate(nextDate);
      setCalendarMonth(nextDate.getMonth());
      setCalendarYear(nextDate.getFullYear());
      setShowMonthYearPicker(false);
    }
  }, [visible, initialClampedDate]);

  const getYears = () => {
    const years: number[] = [];
    const startYear = computedMinDate.getFullYear();
    const endYear = computedMaxDate.getFullYear();
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const getCalendarDays = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isDateDisabled = (day: number | null) => {
    if (!day) return true;
    const date = new Date(calendarYear, calendarMonth, day);
    return (
      date.getTime() < computedMinDate.getTime() ||
      date.getTime() > computedMaxDate.getTime()
    );
  };

  const isSameDay = (dateA: Date, dateB: Date) => {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const handleMonthChange = (increment: number) => {
    let newMonth = calendarMonth + increment;
    let newYear = calendarYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    const monthStart = new Date(newYear, newMonth, 1).getTime();
    const monthEnd = new Date(newYear, newMonth + 1, 0, 23, 59, 59, 999).getTime();

    if (monthEnd < computedMinDate.getTime() || monthStart > computedMaxDate.getTime()) {
      return;
    }

    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const handleDaySelect = (day: number | null) => {
    if (!day || isDateDisabled(day)) {
      return;
    }
    const newDate = new Date(calendarYear, calendarMonth, day);
    setTempDate(clampDate(newDate));
  };

  const handleMonthYearHeaderPress = () => {
    setShowMonthYearPicker(true);
    setTimeout(() => {
      const years = getYears();
      const selectedYearIndex = years.indexOf(calendarYear);
      if (selectedYearIndex !== -1 && yearScrollRef.current) {
        yearScrollRef.current.scrollTo({
          x: selectedYearIndex * s(70),
          animated: true,
        });
      }
    }, 100);
  };

  const handleYearSelect = (year: number) => {
    setCalendarYear(year);
    const daysInNewMonth = new Date(year, calendarMonth + 1, 0).getDate();
    const safeDay = Math.min(tempDate.getDate(), daysInNewMonth);
    setTempDate(clampDate(new Date(year, calendarMonth, safeDay)));
  };

  const handleMonthSelect = (monthId: number) => {
    setCalendarMonth(monthId);
    const daysInNewMonth = new Date(calendarYear, monthId + 1, 0).getDate();
    const safeDay = Math.min(tempDate.getDate(), daysInNewMonth);
    setTempDate(clampDate(new Date(calendarYear, monthId, safeDay)));
  };

  const handleMonthYearApply = () => {
    setShowMonthYearPicker(false);
  };

  const handleConfirmPress = () => {
    onConfirm(tempDate);
  };

  const handleClearPress = () => {
    onClear?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            <View style={styles.selectedDateBox}>
              <Text style={styles.selectedDateLabel}>Selected Date</Text>
              <Text style={styles.selectedDateValue}>
                {tempDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>

            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => handleMonthChange(-1)}
                activeOpacity={0.7}
              >
                <Text style={styles.calendarNavButtonText}>‹</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMonthYearHeaderPress}
                style={styles.monthYearHeaderButton}
                activeOpacity={0.7}
              >
                <Text style={styles.calendarMonthYear}>
                  {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.monthYearHeaderIcon}>▼</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => handleMonthChange(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.calendarNavButtonText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarDayLabels}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.calendarDayLabel}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {getCalendarDays().map((day, index) => {
                const disabled = isDateDisabled(day);
                const isSelected =
                  day &&
                  isSameDay(tempDate, new Date(calendarYear, calendarMonth, day));

                return (
                  <TouchableOpacity
                    key={`${day || 'empty'}-${index}`}
                    style={[
                      styles.calendarDay,
                      !day && styles.calendarDayEmpty,
                      isSelected && styles.calendarDaySelected,
                      disabled && styles.calendarDayDisabled,
                    ]}
                    onPress={() => handleDaySelect(day)}
                    disabled={disabled}
                    activeOpacity={0.7}
                  >
                    {day && (
                      <Text
                        style={[
                          styles.calendarDayText,
                          isSelected && styles.calendarDayTextSelected,
                          disabled && styles.calendarDayTextDisabled,
                        ]}
                      >
                        {day}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {infoText ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>{infoText}</Text>
              </View>
            ) : null}

            <View style={styles.actionsRow}>
              {showClearButton && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.clearButton]}
                  onPress={handleClearPress}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, styles.clearButtonText]}>
                    {clearLabel}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={handleConfirmPress}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>{confirmLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showMonthYearPicker && (
          <View style={styles.monthYearOverlay}>
            <TouchableOpacity
              style={styles.overlayBackground}
              activeOpacity={1}
              onPress={() => setShowMonthYearPicker(false)}
            />
            <View style={styles.monthYearOverlayContent}>
              <View style={styles.overlayHeader}>
                <Text style={styles.overlayTitle}>Select Month & Year</Text>
                <TouchableOpacity
                  onPress={() => setShowMonthYearPicker(false)}
                  style={styles.overlayCloseButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.overlayCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView
                  ref={yearScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.yearScroll}
                  contentContainerStyle={styles.yearScrollContent}
                >
                  {getYears().map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearButton,
                        calendarYear === year && styles.yearButtonSelected,
                      ]}
                      onPress={() => handleYearSelect(year)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.yearButtonText,
                          calendarYear === year && styles.yearButtonTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Month</Text>
                <View style={styles.monthGrid}>
                  {months.map(month => {
                    const disabled =
                      new Date(calendarYear, month.id + 1, 0).getTime() <
                        computedMinDate.getTime() ||
                      new Date(calendarYear, month.id, 1).getTime() >
                        computedMaxDate.getTime();

                    return (
                      <TouchableOpacity
                        key={month.id}
                        style={[
                          styles.monthButton,
                          calendarMonth === month.id && styles.monthButtonSelected,
                          disabled && styles.monthButtonDisabled,
                        ]}
                        onPress={() => !disabled && handleMonthSelect(month.id)}
                        disabled={disabled}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.monthButtonText,
                            calendarMonth === month.id && styles.monthButtonTextSelected,
                            disabled && styles.monthButtonTextDisabled,
                          ]}
                        >
                          {month.short}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                style={styles.overlayApplyButton}
                onPress={handleMonthYearApply}
                activeOpacity={0.7}
              >
                <Text style={styles.overlayApplyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(20),
  },
  modalContainer: {
    width: '100%',
    maxWidth: s(420),
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: s(24),
    padding: s(24),
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: s(15),
    right: s(15),
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: ms(16),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.darkGray,
  },
  title: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: ms(20),
    color: Colors.darkGray,
    textAlign: 'center',
  },
  description: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.normal,
    fontSize: ms(14),
    color: 'rgba(30, 30, 30, 0.7)',
    textAlign: 'center',
    marginTop: vs(8),
    marginBottom: vs(16),
  },
  selectedDateBox: {
    backgroundColor: Colors.lightGreen,
    borderRadius: s(16),
    paddingVertical: vs(12),
    paddingHorizontal: s(16),
    marginBottom: vs(16),
  },
  selectedDateLabel: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.6)',
  },
  selectedDateValue: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: ms(18),
    color: Colors.darkGray,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  calendarNavButton: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: ms(24),
    color: Colors.white,
  },
  monthYearHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  calendarMonthYear: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(16),
    color: Colors.darkGray,
  },
  monthYearHeaderIcon: {
    fontSize: ms(12),
    color: Colors.primary,
  },
  calendarDayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: vs(10),
  },
  calendarDayLabel: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(12),
    color: Colors.darkGray,
    width: `${100 / 7}%`,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: vs(15),
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayEmpty: {
    backgroundColor: 'transparent',
  },
  calendarDayDisabled: {
    opacity: 0.4,
  },
  calendarDaySelected: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
  },
  calendarDayText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(14),
    color: Colors.darkGray,
  },
  calendarDayTextSelected: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
  },
  calendarDayTextDisabled: {
    color: 'rgba(30, 30, 30, 0.3)',
  },
  infoBox: {
    backgroundColor: 'rgba(59, 183, 126, 0.1)',
    borderRadius: s(12),
    padding: s(12),
    marginBottom: vs(18),
  },
  infoText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.medium,
    fontSize: ms(12),
    color: 'rgba(30, 30, 30, 0.7)',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: s(12),
  },
  actionButton: {
    flex: 1,
    paddingVertical: vs(14),
    borderRadius: s(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: ms(16),
    color: Colors.white,
  },
  clearButtonText: {
    color: Colors.darkGray,
  },
  monthYearOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  monthYearOverlayContent: {
    backgroundColor: Colors.white,
    borderRadius: s(20),
    padding: s(20),
    width: '90%',
    maxWidth: s(420),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(16),
    paddingBottom: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  overlayTitle: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: ms(18),
    color: Colors.darkGray,
  },
  overlayCloseButton: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCloseText: {
    fontSize: ms(16),
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textSecondary,
  },
  pickerSection: {
    marginBottom: vs(16),
  },
  pickerLabel: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(14),
    color: Colors.darkGray,
    marginBottom: vs(10),
  },
  yearScroll: {
    maxHeight: vs(60),
  },
  yearScrollContent: {
    gap: s(10),
    paddingHorizontal: s(5),
  },
  yearButton: {
    paddingHorizontal: s(18),
    paddingVertical: vs(10),
    borderRadius: s(12),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: s(80),
    alignItems: 'center',
  },
  yearButtonSelected: {
    backgroundColor: Colors.primary,
  },
  yearButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(14),
    color: Colors.darkGray,
  },
  yearButtonTextSelected: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
  },
  monthButton: {
    width: `${(100 - 4 * 2.5) / 4}%`,
    paddingVertical: vs(12),
    borderRadius: s(12),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  monthButtonSelected: {
    backgroundColor: Colors.primary,
  },
  monthButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  monthButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.semiBold,
    fontSize: ms(14),
    color: Colors.darkGray,
  },
  monthButtonTextSelected: {
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
  },
  monthButtonTextDisabled: {
    color: 'rgba(30, 30, 30, 0.4)',
  },
  overlayApplyButton: {
    backgroundColor: Colors.primary,
    borderRadius: s(12),
    paddingVertical: vs(12),
    alignItems: 'center',
  },
  overlayApplyButtonText: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.weights.bold,
    fontSize: ms(16),
    color: Colors.white,
  },
});

export default CalendarDatePickerModal;

