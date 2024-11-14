import { screen, waitFor, within } from '@testing-library/react';

import { TEST_ID } from '@/constants/testID';

export const checkAllEvent = async () => {
  const scheduleList = await waitFor(() => screen.findByTestId(TEST_ID.EVENT_LIST));

  expect(within(scheduleList).getByText('점심 약속')).toBeInTheDocument();
  expect(within(scheduleList).getByText('식당 A')).toBeInTheDocument();
  expect(within(scheduleList).getByText('카테고리: 개인')).toBeInTheDocument();
  expect(within(scheduleList).getByText('19:00 - 22:00')).toBeInTheDocument();
  expect(within(scheduleList).getByText('2024-10-01')).toBeInTheDocument();

  expect(within(scheduleList).getByText('팀원 회의')).toBeInTheDocument();
  expect(within(scheduleList).getByText('회의실 C')).toBeInTheDocument();
  expect(within(scheduleList).getByText('14:00 - 16:00')).toBeInTheDocument();

  expect(within(scheduleList).getByText('기존 회의')).toBeInTheDocument();
  expect(within(scheduleList).getByText('회의실 B')).toBeInTheDocument();
  expect(within(scheduleList).getByText('09:00 - 10:00')).toBeInTheDocument();

  expect(within(scheduleList).getByText('팀 회의')).toBeInTheDocument();
  expect(within(scheduleList).getByText('회의실 D')).toBeInTheDocument();
  expect(within(scheduleList).getByText('14:00 - 15:00')).toBeInTheDocument();
  expect(within(scheduleList).getByText('2024-10-24')).toBeInTheDocument();

  // 이벤트 중복 "카테고리: 업무"가 mock데이터에 3개이므로 길이로 검증 (id: 1,2,4)
  expect(within(scheduleList).getAllByText('카테고리: 업무')).toHaveLength(3);

  // 이벤트 중복 "2024-10-15"가 mock데이터에 2개이므로 길이로 검증 (id: 1,2)
  expect(within(scheduleList).getAllByText('2024-10-15')).toHaveLength(2);
};
