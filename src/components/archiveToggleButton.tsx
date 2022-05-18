import { useState, useCallback } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, Alert, Box } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Perm } from "../types/enums"
import { AuthContainer } from "../containers"
import HubKey from "../keys"
import { usePassportCommandsUser } from "../hooks/usePassport"

interface Props {
	/** The name of the object being archived/unarchived; used for dialog text */
	name: string
	id: string
	archiveHubKey: HubKey
	unarchiveHubKey: HubKey
	archived: boolean
	onUpdate: (value: any) => void
	archivePerm: Perm
	unarchivePerm: Perm
}

/** Archive/Unarchive button with confirmation dialog */
export const ArchiveToggleButton = (props: Props) => {
	const { name, id, archiveHubKey, unarchiveHubKey, archived, onUpdate, archivePerm, unarchivePerm } = props
	const { hasPermission } = AuthContainer.useContainer()

	const [open, setOpen] = useState(false)
	const onClose = () => setOpen(false)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	const { send } = usePassportCommandsUser("/commander")
	const toggleArchive = useCallback(async () => {
		setLoading(true)
		try {
			const resp = await send(archived ? unarchiveHubKey : archiveHubKey, { id })
			onUpdate(resp)
			setOpen(false)
		} catch (e) {
			setError(typeof e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setLoading(false)
		}
	}, [send, onUpdate, archiveHubKey, unarchiveHubKey, setOpen, archived, id])

	return (
		<>
			{!archived && hasPermission(archivePerm) && (
				<Tooltip title="Archive user">
					<Button variant="contained" onClick={() => setOpen(true)} startIcon={<FontAwesomeIcon icon={["fas", "archive"]} />}>
						Archive
					</Button>
				</Tooltip>
			)}
			{!!archived && hasPermission(unarchivePerm) && (
				<Tooltip title="Unarchive user">
					<Button variant="contained" onClick={() => setOpen(true)} startIcon={<FontAwesomeIcon icon={["fas", "archive"]} />}>
						Unarchive
					</Button>
				</Tooltip>
			)}
			<Dialog open={open} onClose={onClose}>
				<DialogTitle>{archived ? "Unarchive User?" : "Archive User?"}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						<span>{`Are you sure you want to ${archived ? "unarchive" : "archive"} `}</span>
						<Box component="span" sx={{ color: "primary.main" }}>
							{name}
						</Box>
						<span>{"?"}</span>
					</DialogContentText>
					{!!error && <Alert severity="error">{error}</Alert>}
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose} variant="contained">
						Cancel
					</Button>
					<Button
						onClick={toggleArchive}
						variant="contained"
						color="primary"
						autoFocus
						startIcon={<FontAwesomeIcon icon={["fas", "archive"]} />}
						disabled={loading}
					>
						{archived ? "Unarchive" : "Archive"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}
