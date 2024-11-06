import { ChakraProvider, useToast, UseToastOptions } from '@chakra-ui/react';
import { useCreateEvent } from '@hooks/events/useCreateEvent';
import { useDeleteEvent } from '@hooks/events/useDeleteEvent';
import { useFetchEvents } from '@hooks/events/useFetchEvents';
import { useUpdateEvent } from '@hooks/events/useUpdateEvent';
import useCalendarViewStore from '@stores/useCalendarViewStore';
import useScheduleForm from '@stores/useScheduleForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddSchedule } from '@templates/AddSchedule';
import { CalendarManager } from '@templates/CalenderManager';
import { ScheduleManager } from '@templates/ScheduleManager';
import { screen, act, renderHook, waitFor, fireEvent, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { createTestQueryClient } from '../__mocks__/createTestQueryClient';
import { createEvent } from '../__mocks__/Factory';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };

import { AlertDuplicateSchedule } from '@/components/templates/AlertDialog';
import { Notification } from '@/components/templates/Notification';
import DialogProvider from '@/context/DialogProvider';
import { Event } from '@/types';

const initialEvents = [...events] as const;

let toastCalls: any[] = [];
// toast mock
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react');
  return {
    ...actual,
    useToast: vi.fn().mockImplementation(() => (options: UseToastOptions) => {
      toastCalls.push(options);
    }),
  };
});

const createWrapper =
  (queryClient: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <DialogProvider>
            <ScheduleManager />
            <AddSchedule />
            <CalendarManager />
            <AlertDuplicateSchedule />
            <Notification />
            {children}
          </DialogProvider>
        </ChakraProvider>
      </QueryClientProvider>
    );
  };

describe('일정 CRUD 및 기본 기능', () => {
  let queryEvent: {
    current: {
      fetchEvents: ReturnType<typeof useFetchEvents>;
      updateEvent: ReturnType<typeof useUpdateEvent>;
      createEvent: ReturnType<typeof useCreateEvent>;
      deleteEvent: ReturnType<typeof useDeleteEvent>;
    };
  };
  const toast = useToast();
  const queryClient = createTestQueryClient(toast);
  const wrapper = createWrapper(queryClient);

  beforeEach(async () => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    queryClient.clear();
    useCalendarViewStore.setState({ currentDate: new Date() });

    // GIVEN: 초기상태 불러오기
    queryEvent = renderHook(
      () => ({
        fetchEvents: useFetchEvents(),
        createEvent: useCreateEvent(),
        updateEvent: useUpdateEvent(),
        deleteEvent: useDeleteEvent(),
      }),
      { wrapper }
    ).result;
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );

    const testEvent = createEvent({
      id: String(initialEvents.length + 1),
      title: '새 이벤트',
      date: '2024-10-01',
      startTime: '00:00',
      endTime: '01:00',
      category: '업무',
      notificationTime: 1,
    });

    const editArea = await waitFor(() => screen.getByTestId('edit-schedule'));

    const title = within(editArea).getByTestId('schedule-title');
    await userEvent.type(title, testEvent.title);

    const date = within(editArea).getByTestId('schedule-date');
    await userEvent.type(date, testEvent.date);

    const startTime = within(editArea).getByTestId('schedule-start-time');
    await userEvent.type(startTime, testEvent.startTime);

    const endTime = within(editArea).getByTestId('schedule-end-time');
    await userEvent.type(endTime, testEvent.endTime);

    const description = within(editArea).getByTestId('schedule-description');
    await userEvent.type(description, testEvent.description);

    const location = within(editArea).getByTestId('schedule-location');
    await userEvent.type(location, testEvent.location);

    const category = within(editArea).getByTestId('schedule-category');
    await userEvent.selectOptions(category, testEvent.category);

    const notificationTime = within(editArea).getByTestId('schedule-notification-time');
    await userEvent.selectOptions(notificationTime, String(testEvent.notificationTime));

    const eventSubmitButton = within(editArea).getByTestId('event-submit-button');
    await userEvent.click(eventSubmitButton);

    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length + 1)
    );

    expect(queryEvent.current.fetchEvents.events).toContainEqual(testEvent);
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );

    // WHEN: 일정의 첫번째 데이터 수정
    const testEvent = queryEvent.current.fetchEvents.events[0];

    const editButton = await waitFor(() => screen.getByTestId(`event-edit-${testEvent.id}`));
    act(() => fireEvent.click(editButton));
    await waitFor(() =>
      expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 수정')
    );

    const editEvent = createEvent({
      id: testEvent.id,
      title: '수정된 이벤트',
      date: '2024-11-01',
      startTime: '01:00',
      endTime: '02:00',
      category: '기타',
      notificationTime: 10,
      repeat: { type: 'daily', interval: 10, endDate: '2024-11-11' },
    });

    const editArea = await waitFor(() => screen.getByTestId('edit-schedule'));

    // WHEN: 일정의 첫번째 데이터의 모든 필드 수정한다.
    const title = within(editArea).getByTestId('schedule-title');
    act(() => fireEvent.change(title, { target: { value: editEvent.title } }));

    const date = within(editArea).getByTestId('schedule-date');
    act(() => fireEvent.change(date, { target: { value: editEvent.date } }));

    const startTime = within(editArea).getByTestId('schedule-start-time');
    act(() => fireEvent.change(startTime, { target: { value: editEvent.startTime } }));

    const endTime = within(editArea).getByTestId('schedule-end-time');
    act(() => fireEvent.change(endTime, { target: { value: editEvent.endTime } }));

    const description = within(editArea).getByTestId('schedule-description');
    act(() => fireEvent.change(description, { target: { value: editEvent.description } }));

    const location = within(editArea).getByTestId('schedule-location');
    act(() => fireEvent.change(location, { target: { value: editEvent.location } }));

    const category = within(editArea).getByTestId('schedule-category');
    await userEvent.selectOptions(category, editEvent.category);

    const repeatSetting = within(editArea).getByTestId('schedule-repeat-setting');
    act(() => fireEvent.change(repeatSetting, { target: { checked: true } }));

    useScheduleForm.setState({ isRepeating: true });

    const repeatType = await waitFor(() => screen.getByTestId('schedule-repeat-type'));
    await userEvent.selectOptions(repeatType, editEvent.repeat.type);

    const repeatInterval = within(editArea).getByTestId('schedule-interval');
    act(() => fireEvent.change(repeatInterval, { target: { value: editEvent.repeat.interval } }));

    const repeatEndDate = within(editArea).getByTestId('schedule-repeat-end-date');
    act(() => fireEvent.change(repeatEndDate, { target: { value: editEvent.repeat.endDate } }));

    const notificationTime = within(editArea).getByTestId('schedule-notification-time');
    await userEvent.selectOptions(notificationTime, String(editEvent.notificationTime));

    const eventSubmitButton = within(editArea).getByTestId('event-submit-button');
    await userEvent.click(eventSubmitButton);

    // THEN: 일정의 첫번째 데이터의 모든 필드가 새 데이터로 업데이트 되어야 한다.
    await waitFor(() => expect(queryEvent.current.fetchEvents.events).toContainEqual(editEvent));
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );
    const testEvent = queryEvent.current.fetchEvents.events[0];

    // WHEN: 일정을 삭제하면
    const deleteButton = await waitFor(() => screen.getByTestId(`event-delete-${testEvent.id}`));
    act(() => fireEvent.click(deleteButton));

    // THEN: 삭제된 일정은 조회되지 않는다.
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).not.toContainEqual(testEvent)
    );
    const scheduleList = await waitFor(() => screen.findByTestId('event-list'));

    expect(within(scheduleList).queryByText(testEvent.title)).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  let queryEvent: {
    current: {
      fetchEvents: ReturnType<typeof useFetchEvents>;
      updateEvent: ReturnType<typeof useUpdateEvent>;
      createEvent: ReturnType<typeof useCreateEvent>;
      deleteEvent: ReturnType<typeof useDeleteEvent>;
    };
  };
  const toast = useToast();
  const queryClient = createTestQueryClient(toast);
  const wrapper = createWrapper(queryClient);

  beforeEach(async () => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    queryClient.clear();
    useCalendarViewStore.setState({ currentDate: new Date() });

    // GIVEN: 초기상태 불러오기
    queryEvent = renderHook(
      () => ({
        fetchEvents: useFetchEvents(),
        createEvent: useCreateEvent(),
        updateEvent: useUpdateEvent(),
        deleteEvent: useDeleteEvent(),
      }),
      { wrapper }
    ).result;
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );
    const prevBtn = await waitFor(() => screen.getByTestId('calendar-prev-btn'));
    act(() => fireEvent.click(prevBtn));

    const viewBtn = await waitFor(() => screen.getByTestId('calendar-view-button'));
    act(() => fireEvent.change(viewBtn, { target: { value: 'week' } }));

    expect(screen.queryByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );
    // View 버튼 클릭
    const viewBtn = await screen.findByTestId('calendar-view-button');
    act(() => {
      fireEvent.change(viewBtn, { target: { value: 'week' } });
    });

    // THEN: 일정과 달력에 이벤트가 표기되어 있어야 한다.
    const scheduleList = await waitFor(() => screen.findByTestId('event-list'));

    expect(within(scheduleList).getByText('점심 약속')).toBeInTheDocument();
    expect(within(scheduleList).getByText('식당 A')).toBeInTheDocument();
    expect(within(scheduleList).getByText('카테고리: 개인')).toBeInTheDocument();
    expect(within(scheduleList).getByText('19:00 - 22:00')).toBeInTheDocument();
    expect(within(scheduleList).getByText('2024-10-01')).toBeInTheDocument();

    const calender = await waitFor(() => screen.findByTestId('calender'));
    expect(within(calender).getByText('점심 약속')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );
    // View 버튼 클릭
    const viewBtn = await screen.findByTestId('calendar-view-button');
    act(() => {
      fireEvent.change(viewBtn, { target: { value: 'month' } });
    });

    const prevBtn = await waitFor(() => screen.getByTestId('calendar-prev-btn'));
    act(() => fireEvent.click(prevBtn));

    // THEN: 일정이 표시되지 않아야 한다.
    const scheduleList = await waitFor(() => screen.findByTestId('event-list'));
    expect(within(scheduleList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );
    // View 버튼 클릭
    const viewBtn = await screen.findByTestId('calendar-view-button');
    act(() => {
      fireEvent.change(viewBtn, { target: { value: 'month' } });
    });

    const scheduleList = await waitFor(() => screen.findByTestId('event-list'));

    // THEN: 모든 일정이 표시되어야 한다.
    expect(within(scheduleList).getByText('점심 약속')).toBeInTheDocument();
    expect(within(scheduleList).getByText('식당 A')).toBeInTheDocument();
    expect(within(scheduleList).getByText('카테고리: 개인')).toBeInTheDocument();
    expect(within(scheduleList).getByText('19:00 - 22:00')).toBeInTheDocument();
    expect(within(scheduleList).getByText('2024-10-01')).toBeInTheDocument();

    expect(within(scheduleList).getByText('팀원 회의')).toBeInTheDocument();
    expect(within(scheduleList).getByText('회의실 C')).toBeInTheDocument();
    expect(within(scheduleList).getByText('14:00 - 16:00')).toBeInTheDocument();
    expect(within(scheduleList).getAllByText('카테고리: 업무')).toHaveLength(3);
    expect(within(scheduleList).getAllByText('2024-10-15')).toHaveLength(2);

    expect(within(scheduleList).getByText('기존 회의')).toBeInTheDocument();
    expect(within(scheduleList).getByText('회의실 B')).toBeInTheDocument();
    expect(within(scheduleList).getByText('09:00 - 10:00')).toBeInTheDocument();

    expect(within(scheduleList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(scheduleList).getByText('회의실 D')).toBeInTheDocument();
    expect(within(scheduleList).getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(within(scheduleList).getByText('2024-10-24')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );

    const prevBtn = await waitFor(() => screen.getByTestId('calendar-prev-btn'));
    let month = 10;
    while (month !== 1) {
      month -= 1;
      act(() => fireEvent.click(prevBtn));
    }
    expect(screen.getByText(/1월/)).toBeInTheDocument();
    const calender = await waitFor(() => screen.findByTestId('calender'));
    expect(within(calender).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  let queryEvent: {
    current: {
      fetchEvents: ReturnType<typeof useFetchEvents>;
      updateEvent: ReturnType<typeof useUpdateEvent>;
      createEvent: ReturnType<typeof useCreateEvent>;
      deleteEvent: ReturnType<typeof useDeleteEvent>;
    };
  };
  const toast = useToast();
  const queryClient = createTestQueryClient(toast);
  const wrapper = createWrapper(queryClient);

  beforeEach(async () => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    queryClient.clear();
    useCalendarViewStore.setState({ currentDate: new Date() });

    // GIVEN: 초기상태 불러오기
    queryEvent = renderHook(
      () => ({
        fetchEvents: useFetchEvents(),
        createEvent: useCreateEvent(),
        updateEvent: useUpdateEvent(),
        deleteEvent: useDeleteEvent(),
      }),
      { wrapper }
    ).result;
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const searchInput = await waitFor(() => screen.findByTestId('search-schedule'));
    act(() => fireEvent.change(searchInput, { target: { value: '검색 결과가 없는 검색어' } }));

    const eventList = await waitFor(() => screen.getByTestId('event-list'));
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const searchInput = await waitFor(() => screen.findByTestId('search-schedule'));
    act(() => fireEvent.change(searchInput, { target: { value: '팀 회의' } }));

    const scheduleList = await waitFor(() => screen.findByTestId('event-list'));

    expect(within(scheduleList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(scheduleList).getByText('회의실 D')).toBeInTheDocument();
    expect(within(scheduleList).getByText('카테고리: 업무')).toBeInTheDocument();
    expect(within(scheduleList).getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(within(scheduleList).getByText('2024-10-24')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const searchInput = await waitFor(() => screen.findByTestId('search-schedule'));
    act(() => fireEvent.change(searchInput, { target: { value: '' } }));

    const scheduleList = await waitFor(() => screen.findByTestId('event-list'));

    // THEN: 모든 일정이 표시되어야 한다.
    expect(within(scheduleList).getByText('점심 약속')).toBeInTheDocument();
    expect(within(scheduleList).getByText('식당 A')).toBeInTheDocument();
    expect(within(scheduleList).getByText('카테고리: 개인')).toBeInTheDocument();
    expect(within(scheduleList).getByText('19:00 - 22:00')).toBeInTheDocument();
    expect(within(scheduleList).getByText('2024-10-01')).toBeInTheDocument();

    expect(within(scheduleList).getByText('팀원 회의')).toBeInTheDocument();
    expect(within(scheduleList).getByText('회의실 C')).toBeInTheDocument();
    expect(within(scheduleList).getByText('14:00 - 16:00')).toBeInTheDocument();
    expect(within(scheduleList).getAllByText('카테고리: 업무')).toHaveLength(3);
    expect(within(scheduleList).getAllByText('2024-10-15')).toHaveLength(2);

    expect(within(scheduleList).getByText('기존 회의')).toBeInTheDocument();
    expect(within(scheduleList).getByText('회의실 B')).toBeInTheDocument();
    expect(within(scheduleList).getByText('09:00 - 10:00')).toBeInTheDocument();

    expect(within(scheduleList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(scheduleList).getByText('회의실 D')).toBeInTheDocument();
    expect(within(scheduleList).getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(within(scheduleList).getByText('2024-10-24')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  let queryEvent: {
    current: {
      fetchEvents: ReturnType<typeof useFetchEvents>;
      updateEvent: ReturnType<typeof useUpdateEvent>;
      createEvent: ReturnType<typeof useCreateEvent>;
      deleteEvent: ReturnType<typeof useDeleteEvent>;
    };
  };
  const toast = useToast();
  const queryClient = createTestQueryClient(toast);
  const wrapper = createWrapper(queryClient);

  beforeEach(async () => {
    // GIVEN: 각 테스트마다 초기 상태가 반영된 핸들러 설정
    queryClient.clear();
    useCalendarViewStore.setState({ currentDate: new Date() });

    // GIVEN: 초기상태 불러오기
    queryEvent = renderHook(
      () => ({
        fetchEvents: useFetchEvents(),
        createEvent: useCreateEvent(),
        updateEvent: useUpdateEvent(),
        deleteEvent: useDeleteEvent(),
      }),
      { wrapper }
    ).result;
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );

    const events = queryEvent.current.fetchEvents.events;
    const testEvent = createEvent({
      id: String(events.length + 1),
      date: events[0].date,
      startTime: events[0].startTime,
      endTime: events[0].endTime,
    });

    const editArea = await waitFor(() => screen.getByTestId('edit-schedule'));

    const title = within(editArea).getByTestId('schedule-title');
    await userEvent.type(title, testEvent.title);

    const date = within(editArea).getByTestId('schedule-date');
    await userEvent.type(date, testEvent.date);

    const startTime = within(editArea).getByTestId('schedule-start-time');
    await userEvent.type(startTime, testEvent.startTime);

    const endTime = within(editArea).getByTestId('schedule-end-time');
    await userEvent.type(endTime, testEvent.endTime);

    const description = within(editArea).getByTestId('schedule-description');
    await userEvent.type(description, testEvent.description);

    const location = within(editArea).getByTestId('schedule-location');
    await userEvent.type(location, testEvent.location);

    const category = within(editArea).getByTestId('schedule-category');
    await userEvent.selectOptions(category, testEvent.category);

    const notificationTime = within(editArea).getByTestId('schedule-notification-time');
    await userEvent.selectOptions(notificationTime, String(testEvent.notificationTime));

    const eventSubmitButton = within(editArea).getByTestId('event-submit-button');
    await waitFor(() => expect(eventSubmitButton).toHaveTextContent('일정 추가'));
    await userEvent.click(eventSubmitButton);

    await waitFor(() => expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument());
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );

    const events = queryEvent.current.fetchEvents.events;

    const otherEvent = createEvent({
      date: events[3].date,
      startTime: events[3].startTime,
      endTime: events[3].endTime,
    }) as Event;

    const editArea = await waitFor(() => screen.getByTestId('edit-schedule'));
    const scheduleList = await waitFor(() => screen.findByTestId('event-list'));
    const editButton = await waitFor(() =>
      within(scheduleList).getByTestId(`event-edit-${events[0].id}`)
    );
    await userEvent.click(editButton);

    // WHEN: 다른 이벤트와 일정이 겹치게 세팅
    const date = within(editArea).getByTestId('schedule-date');
    fireEvent.change(date, { target: { value: otherEvent.date } });

    const startTime = within(editArea).getByTestId('schedule-start-time');
    fireEvent.change(startTime, { target: { value: otherEvent.startTime } });

    const endTime = within(editArea).getByTestId('schedule-end-time');
    fireEvent.change(endTime, { target: { value: otherEvent.endTime } });

    const eventSubmitButton = within(editArea).getByTestId('event-submit-button');
    await waitFor(() => expect(eventSubmitButton).toHaveTextContent('일정 수정'));
    await userEvent.click(eventSubmitButton);

    await waitFor(() => expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument());
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    // GIVEN: 기존 일정 가져오기
    await waitFor(() =>
      expect(queryEvent.current.fetchEvents.events).toHaveLength(initialEvents.length)
    );

    // WHEN: 알림 충족하는 시간이 되었을 때
    vi.advanceTimersByTime(1000 * 60 * 60 * 18 + 1000 * 60 * 50);

    const alert = await waitFor(() => screen.getByTestId('notification-alert'));
    expect(within(alert).getByText('10분 후 점심 약속 일정이 시작됩니다.')).toBeInTheDocument();
  });
});
