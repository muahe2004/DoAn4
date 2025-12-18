import { Autocomplete, TextField } from "@mui/material";

export interface AutoOption { [key: string]: any; }

interface AutocompletePrimaryProps {
  labelKey?: string;
  valueKey?: string;
  options: AutoOption[];
  value: AutoOption | null;
  onChange: (value: AutoOption) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  freeSolo?: boolean;
  className?: string;
}

export default function AutocompletePrimary({
  labelKey = "name",
  valueKey = "id",
  options = [],
  value,
  onChange,
  inputValue,
  onInputChange,
  placeholder = "",
  freeSolo = false,
  className = "primary-autocomplete",
}: AutocompletePrimaryProps) {
  return (
    <Autocomplete
      className={className}
      freeSolo={freeSolo}
      options={options}
      value={value}
      getOptionLabel={(option: any) =>
        typeof option === "string" ? option : option?.[labelKey] || ""
      }
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        onInputChange?.(newInputValue);
      }}
      onChange={(e, val) => {
        if (typeof val === "string") {
          onChange({
            [valueKey]: "",
            [labelKey]: val,
          });
        } else {
          onChange({
            [valueKey]: val ? String(val[valueKey]) : "",
            [labelKey]: val ? val[labelKey] : "",
          });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          className="primary-text__field"
          placeholder={placeholder}
        />
      )}
    />
  );
}