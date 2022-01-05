import { useState, useEffect } from "react"
import Moment from "react-moment"
import { useParams, useHistory } from "react-router-dom"
import { Organisation } from "../../../types/types"
import { AuthContainer } from "../../../containers"
import { Spaced } from "../../../components/spaced"
import { Spread } from "../../../components/spread"
import { Loading } from "../../../components/loading"
import { Perm } from "../../../types/enums"
import { DetailList } from "../../../components/detailList"
import { Typography, Button, Tooltip } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ArchiveToggleButton } from "../../../components/archiveToggleButton"
import { OrganisationEdit } from "./edit"
import { useQuery } from "../../../hooks/useSend"
import HubKey from "../../../keys"
import { Alert } from "@mui/material"
import { GetItemIcon } from "../../../helpers/loadicons"
import { Box } from "@mui/material"

export const OrganisationPage = () => {
	const { slug } = useParams<{ slug: string }>()
	const isNew = !slug

	const history = useHistory()
	const { hasPermission } = AuthContainer.useContainer()

	// Get Organisation
	const { loading, error, payload: organisation, setPayload: setOrganisation } = useQuery<Organisation>(HubKey.OrganisationGet, !isNew, { slug })

	// Editing
	const [editMode, _setEditMode] = useState(isNew)
	const canEdit = (isNew && hasPermission(Perm.OrganisationCreate)) || hasPermission(Perm.OrganisationUpdate)

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
	if (!isNew && !organisation && loading) return <Loading />
	if (editMode) {
		return (
			<OrganisationEdit
				organisation={organisation}
				isNew={isNew}
				stopEditMode={() => {
					if (isNew) history.push(`/organisations`)
					else setEditMode(false)
				}}
				onUpdate={(o) => setOrganisation({ ...organisation, ...o })}
			/>
		)
	}

	// Loading
	if (!organisation && loading) return <Loading />
	if (!organisation) return <></>

	const details = [
		{ label: "Name", value: organisation.name },
		{ label: "Created At", value: <Moment date={organisation.createdAt} format="YYYY/MM/DD - h:mma" /> },
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
					<FontAwesomeIcon icon={GetItemIcon("organisation", "fas")} size="2x" />
					<Typography variant="h2">{organisation.name}</Typography>
				</Spaced>

				<Spaced>
					<ArchiveToggleButton
						name={organisation.name}
						id={organisation.id}
						archiveHubKey={HubKey.OrganisationArchive}
						unarchiveHubKey={HubKey.OrganisationUnarchive}
						archived={!!organisation.deletedAt}
						onUpdate={(value: Organisation) => setOrganisation({ ...organisation, deletedAt: value.deletedAt })}
						archivePerm={Perm.OrganisationArchive}
						unarchivePerm={Perm.OrganisationUnarchive}
					/>
					{canEdit && (
						<Tooltip title="Edit organisation">
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
