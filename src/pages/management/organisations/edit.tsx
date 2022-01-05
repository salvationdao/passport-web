import { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { Organisation } from "../../../types/types"
import { useForm } from "react-hook-form"
import { Spaced } from "../../../components/spaced"
import { Button, Typography, Paper } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { InputField } from "../../../components/form/inputField"
import { Alert } from "@mui/material"
import HubKey from "../../../keys"
import { useWebsocket } from "../../../containers/socket"

interface FormInput {
	name?: string
}

interface OrganisationEditProps {
	organisation?: Organisation
	isNew: boolean
	stopEditMode: () => void
	onUpdate: (organisation: Organisation) => void
}

export const OrganisationEdit = (props: OrganisationEditProps) => {
	const { organisation, isNew, stopEditMode, onUpdate } = props

	const { send } = useWebsocket()
	const { replace } = useHistory()

	// Setup form
	const { control, handleSubmit, reset } = useForm<FormInput>()
	const [submitting, setSubmitting] = useState(false)
	const [successMessage, setSuccessMessage] = useState<string>()
	const [errorMessage, setErrorMessage] = useState<string>()

	const onSaveForm = handleSubmit(async (data) => {
		setSubmitting(true)
		try {
			const resp = await send<Organisation>(
				isNew ? HubKey.OrganisationCreate : HubKey.OrganisationUpdate,
				organisation !== undefined ? { slug: organisation?.slug, ...data } : data,
			)
			if (!!resp) {
				onUpdate(resp)
				setSuccessMessage(`Organisation has been ${isNew ? "created" : "updated"}.`)
				if (isNew) {
					replace(`/organisations/${resp.slug}`)
				} else {
					replace(`/organisations/${resp.slug}?edit=true`)
				}
			}
			setErrorMessage(undefined)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
			setSuccessMessage(undefined)
		} finally {
			setSubmitting(false)
		}
	})

	// Load defaults
	useEffect(() => {
		if (!organisation) return
		reset(organisation)
	}, [organisation, reset])

	return (
		<Paper
			component="form"
			onSubmit={onSaveForm}
			sx={{
				maxWidth: "800px",
				margin: "0 auto",
				padding: 2,
				pb: 0,
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Typography variant="h2" color="primary" gutterBottom>
				{`${isNew ? "Create" : "Edit"} Organisation`}
			</Typography>

			<InputField label="Name" name="name" control={control} rules={{ required: "Name is required." }} disabled={submitting} />

			<Spaced alignRight height="60px">
				<Button variant="contained" color="primary" onClick={onSaveForm} disabled={submitting} startIcon={<FontAwesomeIcon icon={["fas", "save"]} />}>
					Save
				</Button>
				{!!stopEditMode && (
					<Button variant="contained" onClick={stopEditMode} disabled={submitting}>
						Cancel
					</Button>
				)}

				<div>
					{!!successMessage && <Alert severity="success">{successMessage}</Alert>}
					{!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}
				</div>
			</Spaced>
		</Paper>
	)
}
