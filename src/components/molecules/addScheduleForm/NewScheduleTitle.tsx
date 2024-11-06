import useScheduleForm from '@stores/useScheduleForm';
import { useCallback } from 'react';

import { InputWithLabel } from '../InputWithLabel';

export const NewScheduleTitle = () => {
  const title = useScheduleForm((state) => state.title);
  const setTitle = useScheduleForm((state) => state.setTitle);

  const handleChange = useCallback((value: string) => setTitle(value), [setTitle]);

  return <InputWithLabel label="제목" value={title} onChange={handleChange} />;
};