import { VStack } from '@chakra-ui/react';
import { SearchInput } from '@molecules/searchSchedule/searchInput';
import { FilteredEvents } from '@organisms/FilteredEvents';
import React from 'react';

import { TEST_ID } from '@/constants/testID';
import { useEventOperations } from '@/hooks/useEventOperations';

export const ScheduleManager: React.FC = () => {
  const { fetch } = useEventOperations();
  const { isLoading } = fetch;

  if (isLoading) return <div>Loading...</div>;
  return (
    <VStack data-testid={TEST_ID.EVENT_LIST} w="500px" h="full" overflowY="auto">
      {/* 검색어 입력 */}
      <SearchInput />

      {/* 검색 결과 이벤트 */}
      <FilteredEvents />
    </VStack>
  );
};
