import * as React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import "./SearchEngine.css";

export type SearchEngineProps = {
    placeholder?: string;
    onSearch: (value: string) => void; 
};

export default function SearchEngine({ placeholder = "Tìm kiếm...", onSearch }: SearchEngineProps) {
    const [value, setValue] = React.useState("");
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const skipDebounceRef = React.useRef(false);
    const isFirstRenderRef = React.useRef(true);

    const clearDebounce = () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
    };

    React.useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }

        if (skipDebounceRef.current) {
            skipDebounceRef.current = false;
            return;
        }

        clearDebounce();
        debounceRef.current = setTimeout(() => {
            onSearch(value.trim());
        }, 400);

        return clearDebounce;
    }, [value, onSearch]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
    };

    const handleClear = () => {
        clearDebounce();
        skipDebounceRef.current = true;
        setValue("");
        onSearch(""); 
    };

    const handleSearch = () => {
        clearDebounce();
        skipDebounceRef.current = true;
        onSearch(value.trim());
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <TextField
            variant="outlined"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="primary-text__field search-engine__input"
            InputProps={{
                endAdornment: (
                <InputAdornment position="end">
                    {value && (
                        <IconButton onClick={handleClear} className="search-engine__icon" size="small">
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    )}
                    <IconButton onClick={handleSearch} size="small" className="search-engine__icon">
                        <SearchIcon />
                    </IconButton>
                </InputAdornment>
                ),
            }}
        />
    );
}