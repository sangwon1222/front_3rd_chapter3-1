import { Text } from '@chakra-ui/react';
import { useDeleteEvent } from '@hooks/events/useDeleteEvent';
import { useNotifications } from '@hooks/useNotifications';
import { useSearch } from '@hooks/useSearch';
import useScheduleForm from '@stores/useScheduleForm';
import { Schedule } from '@templates/Schedule';
import { useCallback } from 'react';
import { Event } from 'src/types';

export const FilteredEvents = () => {
  const { filteredEvents } = useSearch();
  const { notifiedEvents } = useNotifications();

  const { deleteEvent } = useDeleteEvent();

  const setForm = useScheduleForm((state) => state.setForm);
  const setEditingForm = useCallback((event: Event) => setForm(event), [setForm]);
  return (
    <>
      {filteredEvents.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        filteredEvents.map((event) => (
          <div key={event.id} style={{ width: '100%' }}>
            <Schedule
              event={event}
              notifiedEvents={notifiedEvents}
              editEvent={setEditingForm}
              deleteEvent={deleteEvent}
            />
          </div>
        ))
      )}
    </>
  );
};
