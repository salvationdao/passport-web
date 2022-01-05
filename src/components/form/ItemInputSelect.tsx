import * as React from "react"
import { Controller, Control } from "react-hook-form"
import { ListPage } from "../../pages/listPages"
import { Dialog, DialogContent, DialogTitle, Paper, InputBase, IconButton, Divider, Typography } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Box } from "@mui/material"

interface ItemInputSelectProps {
	label: string
	name: string
	control: Control<any, object>
	required?: string
	helperText?: string
	disabled?: boolean
	renderItem?: (value: any) => string
}

/** Form input for setting related items (uses a Dialog with a ItemTablePage) */
export const ItemInputSelect = (props: ItemInputSelectProps) => {
	const { label, name, control, required, helperText, disabled } = props
	const renderItem = !!props.renderItem ? props.renderItem : (value: any) => `${value}`

	const [showDialog, setShowDialog] = React.useState(false)
	const onClose = () => setShowDialog(false)

	return (
		<Box sx={{ marginTop: "8px", marginBottom: "8px" }}>
			<Typography variant="subtitle1">{label}</Typography>
			<Controller
				name={name}
				control={control}
				rules={required !== undefined ? { required: required } : undefined}
				defaultValue=""
				render={({ field, fieldState }) => {
					return (
						<>
							<Paper
								sx={{
									padding: "2px 0",
									display: "flex",
									alignItems: "center",
									width: "100%",
									border: 1,
									borderColor: !!fieldState.error ? "error.main" : "divider",
								}}
							>
								<InputBase
									sx={{
										marginLeft: 2,
										flex: 1,
										"& .MuiInputBase-input": {
											color: "common.black",
											WebkitTextFillColor: "unset",
										},
									}}
									value={!!field.value ? renderItem(field.value) : ""}
									disabled
									error={!!fieldState.error}
								/>
								<Divider sx={{ margin: "4px" }} orientation="vertical" />
								<IconButton color="primary" onClick={() => setShowDialog(true)} disabled={disabled} size="large" sx={{ padding: "4.5px 7px" }}>
									<FontAwesomeIcon icon={["fas", "pen"]} />
								</IconButton>
							</Paper>
							{/*{(!!fieldState.error || !!helperText) && (*/}
							{/*	// <FormHelperText  error={fieldState.error}>{fieldState.error ? fieldState.error.message : helperText}</FormHelperText>*/}
							{/*)}*/}

							<Dialog onClose={onClose} open={showDialog} fullWidth maxWidth="lg" PaperProps={{ sx: { height: "100%" } }}>
								<DialogTitle>
									<Typography variant="h6">{label}</Typography>
									<IconButton
										aria-label="close"
										onClick={onClose}
										size="large"
										sx={{
											position: "absolute",
											right: 1,
											top: 1,
											color: "text.secondary",
										}}
									>
										<FontAwesomeIcon icon={["fal", "times"]} />
									</IconButton>
								</DialogTitle>
								<DialogContent>
									<ListPage.View
										id={name}
										onRowClick={(data) => {
											field.onChange(data)
											setShowDialog(false)
										}}
									/>
								</DialogContent>
							</Dialog>
						</>
					)
				}}
			/>
		</Box>
	)
}
