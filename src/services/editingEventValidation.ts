import { EventForm } from 'src/types';

export const editingEventValidation = (
  form: Partial<EventForm> & { startTimeError?: string; endTimeError?: string }
) => {
  const { title, date, startTime, endTime, startTimeError, endTimeError } = form;

  if (!title || !date || !startTime || !endTime) {
    return {
      valid: false,
      toastData: {
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      },
    };
  }

  if (startTimeError || endTimeError) {
    return {
      valid: false,
      toastData: {
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      },
    };
  }

  return {
    valid: true,
    toastData: {
      title: '필수 정보 통과',
      status: 'success',
      duration: 3000,
      isClosable: true,
    },
  };
};
