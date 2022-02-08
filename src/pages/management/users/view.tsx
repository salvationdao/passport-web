import { useEffect, useState } from "react"
import Moment from "react-moment"
import { useHistory, useParams } from "react-router-dom"
import { User } from "../../../types/types"
import { AuthContainer } from "../../../containers"
import { Spaced } from "../../../components/spaced"
import { Spread } from "../../../components/spread"
import { ItemLink } from "../../../components/itemLink"
import { Loading } from "../../../components/loading"
import { Perm } from "../../../types/enums"
import { Avatar, Box, Button, Tooltip, Typography } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { UserEdit } from "./edit"
import { DetailList } from "../../../components/detailList"
import { ArchiveToggleButton } from "../../../components/archiveToggleButton"
import { useQuery } from "../../../hooks/useSend"
import HubKey from "../../../keys"
import { OnlineStatusBadge } from "../../../components/userAvatar"
import useSubscription from "../../../hooks/useSubscription"
import { useWebsocket } from "../../../containers/socket"

export const UserPage = () => {
	const { username } = useParams<{ username: string }>()
	const isNew = !username
	const token = localStorage.getItem("token")
	const history = useHistory()
	const { subscribe } = useWebsocket()

	const { user: me, hasPermission } = AuthContainer.useContainer()

	const { query: forceDisconnect, loading: disconnecting } = useQuery(HubKey.UserForceDisconnect)
	const [user, setUser] = useState<User>()
	const [loading, setLoading] = useState<boolean>(true)
	// Get User
	useEffect(() => {
		if (!subscribe || username === "") return
		return subscribe<User>(
			HubKey.UserUpdated,
			(u) => {
				setUser(u)
				setLoading(false)
			},
			{
				username: username,
			},
		)
	}, [username, subscribe])

	// Update online status
	const { payload: onlineStatus } = useSubscription<boolean>(HubKey.UserOnlineStatus, { username })
	useEffect(() => {
		if (onlineStatus === undefined) return
		setUser((user) => {
			return user === undefined
				? undefined
				: {
						...user,
						online: onlineStatus,
				  }
		})
	}, [onlineStatus, setUser])

	// Editing
	const [editMode, _setEditMode] = useState(isNew)
	const canEdit =
		(isNew && hasPermission(Perm.UserCreate)) || (me && user && (me.id === user.id || me.role.tier < user.role.tier) && hasPermission(Perm.UserUpdate))

	const setEditMode = (value: boolean) => {
		_setEditMode(value)
		history.push({ search: value ? "edit=true" : undefined })
	}
	useEffect(() => {
		// Set edit mode based on edit search param
		if (isNew) return
		const params = new URLSearchParams(history.location.search)
		_setEditMode(params.get("edit") === "true")
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [history.location.search])

	// Edit Mode?
	if (!isNew && !user && loading) return <Loading />
	if (editMode) {
		return (
			<UserEdit
				user={user}
				isNew={isNew}
				stopEditMode={() => {
					if (isNew) history.push(`/organisations`)
					else setEditMode(false)
				}}
				onUpdate={(u) => setUser({ ...user, ...u })}
			/>
		)
	}

	// Loading
	if (!user) return <Loading />

	const fullName = `${user.firstName} ${user.lastName}`

	const details = [
		{ label: "Name", value: fullName },
		{ label: "Email", value: user.email },
		{ label: "Role", value: <ItemLink label={user.role.name} to={`/roles/${user.role.name}`} iconName="role" /> },
		{
			label: "Organisation",
			value: user.organisation ? (
				<ItemLink label={user.organisation?.name} to={`/organisations/${user.organisation?.slug}`} iconName="organisation" />
			) : (
				"N/A"
			),
		},
		{ label: "Created At", value: <Moment date={user.createdAt} format="YYYY/MM/DD - h:mma" /> },
	]

	return (
		<Box
			sx={{
				maxWidth: "800px",
				margin: "1rem auto",
			}}
		>
			{/*{error && <Alert severity="error">{error}</Alert>}*/}
			<Spread>
				<Spaced>
					<OnlineStatusBadge
						overlap="circular"
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						variant="dot"
						sx={{
							"& .MuiBadge-badge": {
								transform: user.online ? "scale(1) translate(50%, 50%)" : "scale(0) translate(50%, 50%)",
							},
						}}
					>
						<Avatar
							alt={fullName}
							src={!!user.avatarID ? `/api/files/${user.avatarID}?token=${encodeURIComponent(token || "")}` : undefined}
							sx={{ height: "75px", width: "75px" }}
						/>
					</OnlineStatusBadge>
					<div>
						<Typography variant="h2">{fullName}</Typography>
						<Typography variant="subtitle1" color="textSecondary">
							{user.email}
						</Typography>
					</div>
				</Spaced>

				<Spaced>
					{user.online && !!me && user.id !== me.id && user.role.tier > me.role.tier && hasPermission(Perm.UserForceDisconnect) && (
						<Tooltip
							title={
								<Typography>
									{"Force Disconnect "}
									<Typography color="primary">{`${user.firstName} ${user.lastName}`}</Typography>
								</Typography>
							}
						>
							<Button
								color="error"
								variant="contained"
								startIcon={<FontAwesomeIcon icon={["fal", "times"]} />}
								disabled={disconnecting}
								onClick={(e) => {
									e.stopPropagation()
									forceDisconnect({ id: user.id })
								}}
							>
								Disconnect
							</Button>
						</Tooltip>
					)}

					<ArchiveToggleButton
						name={fullName}
						id={user.id}
						archiveHubKey={HubKey.UserArchive}
						unarchiveHubKey={HubKey.UserUnarchive}
						archived={!!user.deletedAt}
						onUpdate={(value: User) => setUser({ ...user, deletedAt: value.deletedAt })}
						archivePerm={Perm.UserArchive}
						unarchivePerm={Perm.UserUnarchive}
					/>
					{canEdit && (
						<Tooltip title="Edit user">
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
