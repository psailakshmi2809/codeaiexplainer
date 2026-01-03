import NumberFormat from 'react-number-format';
import React from 'react';

interface NumberFormatProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { value: string } }) => void;
}

const NumberFormatField: React.FC<NumberFormatProps> = (props: NumberFormatProps) => {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
    />
  );
};

export default NumberFormatField;
