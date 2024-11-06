import { Input } from '@atoms/Input';
import { FormControl, FormLabel, InputProps, Tooltip } from '@chakra-ui/react';
import React from 'react';

interface PropsType extends Omit<InputProps, 'onChange'> {
  type?: string;
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  toolTipLabel: string;
  toolTipIsOpen: boolean;
}

export const InputWithToolTipLabel: React.FC<PropsType> = ({
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  toolTipLabel,
  toolTipIsOpen,
  ...rest
}) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Tooltip label={toolTipLabel} isOpen={toolTipIsOpen} placement="top">
        <Input type={type} value={value} onChange={onChange} {...rest} onBlur={onBlur} />
      </Tooltip>
    </FormControl>
  );
};
