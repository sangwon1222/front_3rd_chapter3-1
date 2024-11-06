import { createEvent } from '../../__mocks__/Factory';
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events = [
    createEvent({ id: '1', title: '11월 이벤트 1주', date: '2024-11-04' }),
    createEvent({ id: '2', title: '11월 이벤트 2주', date: '2024-11-14' }),
    createEvent({ id: '3', title: '7월 이벤트 3 1주', date: '2024-07-01' }),
    createEvent({ id: '4', title: '7월 이벤트 4 1주', date: '2024-07-04' }),
    createEvent({ id: '5', title: '7월 이벤트 5 1주', date: '2024-07-06' }),
    createEvent({ id: '6', title: '7월 이벤트 6 2주', date: '2024-07-12' }),
    createEvent({ id: '7', title: '7월 이벤트 7 4주', date: '2024-07-24' }),
    createEvent({ id: '8', title: '7월 이벤트 8 5주/iso/8월1주', date: '2024-07-30' }),
  ] as Event[];

  const searchEvents = [
    createEvent({ id: '1', title: 'AbCdEf', date: '2024-10-01' }),
    createEvent({ id: '2', title: 'aBcDeF', date: '2024-10-01' }),
    createEvent({ id: '3', title: 'abcdef', date: '2024-10-01' }),
    createEvent({ id: '4', title: 'ABCDEF', date: '2024-10-01' }),
  ] as Event[];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2024-11-14'), 'month');
    expect(result).toEqual([events[1]]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toEqual([events[2], events[3], events[4]]);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toEqual([events[2], events[3], events[4], events[5], events[6], events[7]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2024-11-04'), 'week');
    expect(result).toEqual([events[0]]);
  });

  test.each([
    {
      date: '2024-07-01',
      view: 'month',
      expected: [events[2], events[3], events[4], events[5], events[6], events[7]],
    },
    {
      date: '2024-07-01',
      view: 'week',
      expected: [events[2], events[3], events[4]],
    },
    {
      date: '2024-11-01',
      view: 'month',
      expected: [events[0], events[1]],
    },
    {
      date: '2024-11-04',
      view: 'week',
      expected: [events[0]],
    },
  ])('검색어가 없을 때 모든 이벤트를 반환한다', ({ date, view, expected }) => {
    const result = getFilteredEvents(events, '', new Date(date), view as 'week' | 'month');
    expect(result).toEqual(expected);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(searchEvents, 'abcdef', new Date('2024-10-01'), 'month');
    expect(result).toEqual(searchEvents);
  });

  const mock = [
    createEvent({ title: 'test 1', date: '2024-10-31' }),
    createEvent({ title: 'test 2', date: '2024-11-30' }),
    createEvent({ title: 'test 3', date: '2024-12-31' }),
  ] as Event[];
  test.each([
    { date: '2024-10-31', index: 0 },
    { date: '2024-11-30', index: 1 },
    { date: '2024-12-31', index: 2 },
  ])('월의 경계에 있는 이벤트를 올바르게 필터링한다', ({ date, index }) => {
    const result = getFilteredEvents(mock, '', new Date(date), 'month');
    expect(result).toEqual([mock[index]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2024-11-06'), 'month');
    expect(result).toEqual([]);
  });
});
