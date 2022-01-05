import { useState, useCallback } from "react"
import { InputBase, CircularProgress } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import debounce from "../helpers"
import { Box } from "@mui/material"

interface SearchBarProps {
	value: string
	onChange: (value: string) => void
	/** Default "Search..." */
	placeholder?: string
	loading?: boolean
}

export const SearchBar = (props: SearchBarProps) => {
	// On search (delay query when typing)
	const [value, setValue] = useState<string>(props.value)
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		setValue(e.currentTarget.value)
		delayedQuery(e.currentTarget.value)
	}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const delayedQuery = useCallback(
		debounce((q: string) => props.onChange(q), 100),
		[],
	)

	return (
		<Box
			sx={{
				position: "relative",
				borderRadius: 1,
				border: "1px solid rgba(224, 224, 224, 1)",
				backgroundColor: "#FFFFFF26",
				"&:hover": {
					backgroundColor: "#FFFFFF40",
				},
				width: "100%",
				height: "30px",
				marginBottom: 1,
			}}
		>
			<Box
				sx={{
					px: 1,
					height: "100%",
					position: "absolute",
					pointerEvents: "none",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<FontAwesomeIcon icon={["fal", "search"]} />
			</Box>
			<InputBase
				value={value}
				onChange={onChange}
				placeholder={props.placeholder || "Search..."}
				inputProps={{
					"aria-label": "search",
				}}
				sx={{
					paddingLeft: 4,
					width: "100%",
				}}
				endAdornment={props.loading && <CircularProgress size="18px" sx={{ marginRight: "4px" }} />}
			/>
		</Box>
	)
}
