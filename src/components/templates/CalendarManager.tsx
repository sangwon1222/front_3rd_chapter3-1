import { Heading, VStack } from '@chakra-ui/react';
import React from 'react';

import { Calendar } from './Calendar';
import { CalendarController } from './CalendarController';

import { useEventOperations } from '@/hooks/useEventOperations';

export const CalendarManager: React.FC = () => {
  const { fetch } = useEventOperations();
  const { isLoading, error } = fetch;

  if (error) {
    return <div>{error.message}</div>;
  }

  if (isLoading) return <div>loading...</div>;
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>
      {/* week / month 컨트롤 */}
      <CalendarController />

      <Calendar />
    </VStack>
  );
};
