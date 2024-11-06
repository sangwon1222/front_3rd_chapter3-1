import { VStack } from '@chakra-ui/react';
import { useFetchEvents } from '@hooks/events/useFetchEvents';
import { SearchInput } from '@molecules/searchSchedule/searchInput';
import { FilteredEvents } from '@organisms/FilteredEvents';
import React from 'react';

export const ScheduleManager: React.FC = () => {
  const { isLoading } = useFetchEvents();

  if (isLoading) return <div>Loading...</div>;
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      {/* 검색어 입력 */}
      <SearchInput />

      {/* 검색 결과 이벤트 */}
      <FilteredEvents />
    </VStack>
  );
};
