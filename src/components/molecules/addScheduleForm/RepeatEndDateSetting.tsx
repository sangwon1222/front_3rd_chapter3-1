import useScheduleForm from '@stores/useScheduleForm';
import React from 'react';

import { InputWithLabel } from '../InputWithLabel';

export const RepeatEndDateSetting: React.FC = () => {
  const endDate = useScheduleForm((state) => state.repeatEndDate);
  const setEndDate = useScheduleForm((state) => state.setRepeatEndDate);

  return <InputWithLabel type="date" value={endDate} onChange={setEndDate} label="반복 종료일" />;
};
