import { useState, useEffect, useCallback } from "react"
import { useHistory } from "react-router-dom"
import { Role } from "../../../types/types"
import { useForm } from "react-hook-form"
import { Spaced } from "../../../components/spaced"
import { Spread } from "../../../components/spread"
import { Perm } from "../../../types/enums"
import { Typography, Button, Checkbox, Paper, Box } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { InputField } from "../../../components/form/inputField"
import { Alert } from "@mui/material"
import { PermTranslation, usePermTranslations } from "../../../hooks/usePermTranslations"
import HubKey from "../../../keys"
import { useWebsocket } from "../../../containers/socket"

interface FormInput {
	name?: string
	permissions?: string[]
}

interface RoleEditProps {
	role?: Role
	isNew: boolean
	stopEditMode: () => void
	onUpdate: (role: Role) => void
}

interface PermItem {
	checked: boolean
	item: PermTranslation
}

export const RoleEdit = (props: RoleEditProps) => {
	const { role, isNew, stopEditMode, onUpdate } = props

	const { send } = useWebsocket()
	const { replace } = useHistory()

	// Setup form
	const { control, handleSubmit, reset } = useForm<FormInput>()
	const [submitting, setSubmitting] = useState(false)
	const [successMessage, setSuccessMessage] = useState<string>()
	const [errorMessage, setErrorMessage] = useState<string>()

	const onSaveForm = handleSubmit(async ({ name }) => {
		setSubmitting(true)

		try {
			let permissions: Perm[] = []
			perms?.forEach((g) => g.forEach((p) => p.checked && permissions.push(p.item.perm)))

			const input = {
				name,
				permissions,
			}

			const resp = await send<Role>(isNew ? HubKey.RoleCreate : HubKey.RoleUpdate, role !== undefined ? { id: role.id, ...input } : input)
			if (!!resp) {
				onUpdate(resp)
				setSuccessMessage(`User has been ${isNew ? "created" : "updated"}.`)
				if (isNew) {
					replace(`/roles/${resp.name}`)
				} else {
					replace(`/roles/${resp.name}?edit=true`)
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

	// Permissions
	const [{ permissions }] = useState(usePermTranslations())
	const getPermGroups = useCallback(() => {
		let result = new Map<string, PermItem[]>()

		Object.keys(permissions).forEach((group) => {
			result.set(
				group,
				permissions[group].map((p) => ({ checked: false, item: p })),
			)
		})

		return result
	}, [permissions])

	const [perms, setPerms] = useState<Map<string, PermItem[]>>(getPermGroups())

	// Load defaults
	useEffect(() => {
		if (!role) return
		reset(role)

		if (role.permissions) {
			const loadedPerms = getPermGroups()
			loadedPerms.forEach((g) => {
				g.forEach((p) => {
					if (role.permissions.indexOf(p.item.perm) !== -1) p.checked = true
				})
			})
			setPerms(loadedPerms)
		}
	}, [role, reset, getPermGroups])

	return (
		<Paper
			component="form"
			onSubmit={onSaveForm}
			sx={{
				padding: 2,
				pb: 0,
				maxWidth: "1250px",
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Typography variant="h2" color="primary" gutterBottom>
				{`${isNew ? "Create" : "Edit"} Role`}
			</Typography>

			<InputField label="Name" name="name" control={control} rules={{ required: "Name is required." }} disabled={submitting} />

			<Typography variant="h6" sx={{ marginTop: 2 }}>
				Permissions
			</Typography>
			<Box display="flex" sx={{ overflowY: "auto", flexFlow: "wrap", justifyContent: "space-evenly" }}>
				{Object.keys(permissions).map((group) => {
					const permGroup = perms.get(group)
					if (!permGroup) return null

					const allChecked = permGroup.every((p) => p.checked)
					const isIndeterminate = !allChecked && permGroup.some((p) => p.checked)

					return (
						<Box key={`permGroup-${group}`} sx={{ marginBottom: 1 }}>
							{/* Perm Group */}
							<Spread
								sx={{
									mt: 1,
									px: 1,
									border: 1,
									borderColor: "grey.400",
									borderTopLeftRadius: 4,
									borderTopRightRadius: 4,
									cursor: "pointer",
									"&:hover": {
										backgroundColor: "primary.light",
										color: "primary.contrastText",
										"& .PrivateSwitchBase-input": {
											color: "primary.contrastText",
										},
									},
								}}
								onClick={() => {
									setPerms(
										new Map(
											perms.set(
												group,
												permGroup.map((p) => {
													return { checked: !allChecked, item: p.item }
												}),
											),
										),
									)
								}}
							>
								<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
									{group}
								</Typography>
								<Checkbox checked={allChecked} indeterminate={isIndeterminate} disabled={submitting} />
							</Spread>

							{/* Perm */}
							{permGroup.map((p, i) => (
								<Box
									key={`RoleEditPerm${p.item.perm}`}
									sx={{
										padding: 1,
										border: 1,
										borderTop: "unset",
										borderColor: "divider",
										backgroundColor: i % 2 === 0 ? "unset" : "lightgrey",
										cursor: "pointer",
										"&:hover": {
											backgroundColor: "primary.light",
											color: "primary.contrastText",
											"& .PrivateSwitchBase-input": {
												color: "primary.contrastText",
											},
										},
									}}
									onClick={() => {
										const index = permGroup.indexOf(p)
										setPerms(
											new Map(
												perms.set(group, [
													...permGroup.slice(0, index),
													{ checked: !p.checked, item: p.item },
													...permGroup.slice(index + 1),
												]),
											),
										)
									}}
								>
									<Spread>
										<Box>
											<Typography variant="subtitle2">{p.item.label}</Typography>
											<Typography sx={{ opacity: 0.7, maxWidth: "340px" }}>{p.item.description}</Typography>
										</Box>
										<Checkbox key={`RoleEditPerm${p.item.perm}`} checked={p.checked} disabled={submitting} />
									</Spread>
								</Box>
							))}
						</Box>
					)
				})}
			</Box>

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
