import SearchIcon from "@mui/icons-material/Search"
import { CircularProgress, InputAdornment, TextField, TextFieldProps } from "@mui/material"
import { useCallback, useState } from "react"
import debounce from "../helpers"

interface SearchBarProps extends Omit<TextFieldProps, "onChange"> {
	value: string
	onChange: (value: string) => void
	loading?: boolean
}

export const SearchBar: React.VoidFunctionComponent<SearchBarProps> = ({
	value: initValue,
	onChange: initOnChange,
	loading,
	placeholder,
	label,
	variant,
	InputProps,
	...props
}) => {
	// On search (delay query when typing)
	const [value, setValue] = useState<string>(initValue)
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		setValue(e.currentTarget.value)
		delayedQuery(e.currentTarget.value)
	}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const delayedQuery = useCallback(
		debounce((q: string) => initOnChange(q), 500),
		[],
	)

	return (
		<TextField
			label={label || "Search"}
			variant={variant || "filled"}
			value={value}
			onChange={onChange}
			placeholder={placeholder || "Search..."}
			InputProps={{
				"aria-label": "search",
				endAdornment: loading ? (
					<InputAdornment position="end">
						<CircularProgress />
					</InputAdornment>
				) : (
					<InputAdornment position="end">
						<SearchIcon />
					</InputAdornment>
				),
				...InputProps,
			}}
			{...props}
		/>
	)
}
