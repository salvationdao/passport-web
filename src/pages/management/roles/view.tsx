import { useState, useEffect } from "react"
import Moment from "react-moment"
import { useParams, useHistory } from "react-router-dom"
import { Role } from "../../../types/types"
import { AuthContainer } from "../../../containers"
import { Spaced } from "../../../components/spaced"
import { Spread } from "../../../components/spread"
import { Loading } from "../../../components/loading"
import { Perm } from "../../../types/enums"
import { DetailList } from "../../../components/detailList"
import { Typography, Button, Tooltip } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ArchiveToggleButton } from "../../../components/archiveToggleButton"
import { usePermTranslations } from "../../../hooks/usePermTranslations"
import { RoleEdit } from "./edit"
import { useQuery } from "../../../hooks/useSend"
import HubKey from "../../../keys"
import { Alert } from "@mui/material"
import { GetItemIcon } from "../../../helpers/loadicons"
import { Box } from "@mui/material"

export const RolePage = () => {
	const { name } = useParams<{ name: string }>()
	const isNew = !name

	const history = useHistory()
	const { hasPermission } = AuthContainer.useContainer()
	const { getGroupedPermissions } = usePermTranslations()

	// Get Role
	const { loading, error, payload: role, setPayload: setRole } = useQuery<Role>(HubKey.RoleGet, !isNew, { name })
	const permissions = role?.permissions ? getGroupedPermissions(role.permissions) : {}

	// Editing
	const [editMode, _setEditMode] = useState(isNew)
	const canEdit = (isNew && hasPermission(Perm.RoleCreate)) || hasPermission(Perm.RoleUpdate)

	const setEditMode = (value: boolean) => {
		_setEditMode(value)
		history.push({ search: value ? "edit=true" : undefined })
	}
	useEffect(() => {
		// Set edit mode based on edit search param
		if (isNew) return
		const params = new URLSearchParams(history.location.search)
		_setEditMode(params.get("edit") === "true")
	}, [history.location.search, isNew])

	// Edit Mode?
	if (!isNew && !role && loading) return <Loading />
	if (editMode) {
		return (
			<RoleEdit
				role={role}
				isNew={isNew}
				stopEditMode={() => {
					if (isNew) history.push(`/roles`)
					else setEditMode(false)
				}}
				onUpdate={(r) => setRole({ ...role, ...r })}
			/>
		)
	}

	// Loading
	if (!role && loading) return <Loading />
	if (!role) return <></>

	const details = [
		{ label: "Name", value: role.name },
		{
			label: "Permissions",
			value: (
				<div>
					{Object.keys(permissions).map((group) => (
						<div key={`PermGroup-${group}`}>
							<Typography variant="subtitle1">{group}</Typography>
							<ul>
								{permissions[group].map((p) => (
									<li key={`PermItem-${p.perm}`} title={p.description}>
										{p.label}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			),
		},
		{ label: "Created At", value: <Moment date={role.createdAt} format="YYYY/MM/DD - h:mma" /> },
	]

	return (
		<Box
			sx={{
				maxWidth: "800px",
				margin: "1rem auto",
			}}
		>
			{error && <Alert severity="error">{error}</Alert>}
			<Spread>
				<Spaced>
					<FontAwesomeIcon icon={GetItemIcon("role", "fas")} size="2x" />
					<Typography variant="h2">{role.name}</Typography>
				</Spaced>

				<Spaced>
					<ArchiveToggleButton
						name={role.name}
						id={role.id}
						archiveHubKey={HubKey.RoleArchive}
						unarchiveHubKey={HubKey.RoleUnarchive}
						archived={!!role.deletedAt}
						onUpdate={(value: Role) => setRole({ ...role, deletedAt: value.deletedAt })}
						archivePerm={Perm.RoleArchive}
						unarchivePerm={Perm.RoleUnarchive}
					/>
					{canEdit && (
						<Tooltip title="Edit role">
							<Button
								onClick={() => setEditMode(true)}
								variant="contained"
								color="primary"
								startIcon={<FontAwesomeIcon icon={["fas", "edit"]} />}
							>
								Edit
							</Button>
						</Tooltip>
					)}
				</Spaced>
			</Spread>

			<DetailList details={details} />
		</Box>
	)
}
