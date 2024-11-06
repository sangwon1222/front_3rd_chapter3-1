import { Button, useToast, UseToastOptions } from '@chakra-ui/react';
import { useCreateEvent } from '@hooks/events/useCreateEvent';
import { useFetchEvents } from '@hooks/events/useFetchEvents';
import { useUpdateEvent } from '@hooks/events/useUpdateEvent';
import { editingEventValidation } from '@services/editingEventValidation';
import useScheduleForm from '@stores/useScheduleForm';
import { findOverlappingEvents } from '@utils/eventOverlap';
import { useMemo } from 'react';

export const EditingEventButton = () => {
  const isEditing = useScheduleForm((state) => state.isEditing);
  const id = useScheduleForm((state) => state.id);
  const title = useScheduleForm((state) => state.title);
  const date = useScheduleForm((state) => state.date);
  const description = useScheduleForm((state) => state.description);
  const location = useScheduleForm((state) => state.location);
  const category = useScheduleForm((state) => state.category);
  const repeat = useScheduleForm((state) => state.repeat);
  const notificationTime = useScheduleForm((state) => state.notificationTime);

  const startTime = useScheduleForm((state) => state.startTime);
  const endTime = useScheduleForm((state) => state.endTime);
  const startTimeError = useScheduleForm((state) => state.startTimeError);
  const endTimeError = useScheduleForm((state) => state.endTimeError);

  const { events } = useFetchEvents();
  const { createEvent } = useCreateEvent();
  const { updateEvent } = useUpdateEvent();

  const memoForm = useMemo(
    () => ({
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat,
      notificationTime,
      startTimeError,
      endTimeError,
    }),
    [
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat,
      notificationTime,
      startTimeError,
      endTimeError,
    ]
  );

  const resetForm = useScheduleForm((state) => state.resetForm);
  const toast = useToast();

  const handleSubmit = () => {
    const { valid, toastData } = editingEventValidation(memoForm);
    if (!valid) {
      toast(toastData as UseToastOptions);
      return;
    }

    if (isEditing) {
      updateEvent({ id, ...memoForm });
      resetForm();
      return;
    }

    const overlapping = findOverlappingEvents(memoForm, events);
    if (overlapping.length > 0) {
      console.log(overlapping);
      // setOverlappingEvents(overlapping);
      // setIsOverlapDialogOpen(true);
      return;
    }
    createEvent(memoForm);
    resetForm();
  };
  return (
    <Button data-testid="event-submit-button" onClick={handleSubmit} colorScheme="blue">
      {isEditing ? '일정 수정' : '일정 추가'}
    </Button>
  );
};
