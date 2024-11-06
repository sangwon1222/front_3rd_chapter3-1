import { Box, Flex, useToast } from '@chakra-ui/react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AddSchedule } from '@templates/AddSchedule.tsx';
import { AlertDuplicateSchedule } from '@templates/AlertDialog.tsx';
import { CalendarManager } from '@templates/CalenderManager.tsx';
import { Notification } from '@templates/Notification.tsx';
import { ScheduleManager } from '@templates/ScheduleManager.tsx';
import { useState } from 'react';

function App() {
  const toast = useToast();
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : '요청 처리 중 알 수 없는 오류 발생';
        toast({
          title: message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : '요청 처리 중 알 수 없는 오류 발생';
        toast({
          title: message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
      },
    }),
  });

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Box w="full" h="100vh" m="auto" p={5}>
        <Flex gap={6} h="full">
          {/* 일정 추가 */}
          <AddSchedule />

          {/* 일정 보기 */}
          <CalendarManager />

          {/* 일정 검색 */}
          <ScheduleManager />
        </Flex>

        <AlertDuplicateSchedule
          isOverlapDialogOpen={isOverlapDialogOpen}
          setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        />

        <Notification />
      </Box>
      <ReactQueryDevtools initialIsOpen={false} position="right" />
    </QueryClientProvider>
  );
}

export default App;
