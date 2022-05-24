import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconButton, InputAdornment, TextField, TextFieldProps } from "@mui/material"
import { useState } from "react"
import { Control, Controller } from "react-hook-form"

interface InputFieldProps {
	control: Control<any, object>
	rules?: any
	name: string
}

export const InputField = (props: InputFieldProps & TextFieldProps) => {
	const { control, name, rules, helperText, ...textFieldProps } = props
	const [type, setType] = useState(props.type)

	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			defaultValue=""
			render={({ field, fieldState }) => (
				<TextField
					{...textFieldProps}
					type={type}
					value={field.value || ""}
					onChange={field.onChange}
					inputRef={field.ref}
					error={!!fieldState.error}
					helperText={fieldState.error ? fieldState.error.message : helperText}
					InputProps={{
						endAdornment:
							props.type === "password" ? (
								<InputAdornment position={"end"}>
									<IconButton onClick={() => setType(type === "password" ? "text" : "password")} size="large">
										<FontAwesomeIcon icon={["fas", type === "password" ? "eye" : "eye-slash"]} size={"sm"} />
									</IconButton>
								</InputAdornment>
							) : undefined,
					}}
				/>
			)}
		/>
	)
}
InputField.defaultProps = {
	variant: "filled",
}
