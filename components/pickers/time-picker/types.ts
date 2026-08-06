export type TimeSuggestion = {
  label: string;
  value: string;
};

export type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions?: TimeSuggestion[];
  disabled?: boolean;
};
