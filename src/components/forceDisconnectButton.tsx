import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Tooltip, Typography } from "@mui/material"
import { useAuth } from "../containers/auth"
import { useQuery } from "../hooks/useSend"
import useSubscription from "../hooks/useSubscription"
import HubKey from "../keys"
import { Perm } from "../types/enums"
import { User } from "../types/types"

export const ForceDisconnectButton = ({ user }: { user: User }) => {
	const { user: me, hasPermission } = useAuth()
	const { query: forceDisconnect, loading: disconnecting } = useQuery(HubKey.UserForceDisconnect)
	const { payload: onlineStatus } = useSubscription<boolean>(HubKey.UserOnlineStatus, { id: user.id })

	if (!me || user.id === me.id || user.role.tier <= me.role.tier || !hasPermission(Perm.UserForceDisconnect)) return null

	const online = onlineStatus !== undefined ? onlineStatus : user.online

	if (!online) return null

	return (
		<Tooltip
			title={
				<Typography>
					{"Force Disconnect "}
					<Typography color="primary">{`${user.first_name} ${user.last_name}`}</Typography>
				</Typography>
			}
		>
			<Button
				color="error"
				variant="contained"
				size="small"
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
	)
}
