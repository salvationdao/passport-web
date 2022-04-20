import { Avatar, Badge } from "@mui/material"
import { styled } from "@mui/material/styles"
import useSubscription from "../hooks/useSubscription"
import HubKey from "../keys"
import { User } from "../types/types"

export const OnlineStatusBadge = styled(Badge)(({ theme }) => ({
	"& .MuiBadge-badge": {
		backgroundColor: theme.palette.success.main,
		color: theme.palette.success.main,
		boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
		"&::after": {
			position: "absolute",
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			borderRadius: "50%",
			animation: "ripple 1.2s infinite ease-in-out",
			border: "1px solid currentColor",
			content: '""',
		},
	},
	"@keyframes ripple": {
		"0%": {
			transform: "scale(.8)",
			opacity: 1,
		},
		"100%": {
			transform: "scale(2.4)",
			opacity: 0,
		},
	},
}))

/** User Avatar w/ online status badge */
export const UserAvatar = ({ user }: { user: User }) => {
	const onlineStatus = useSubscription<boolean>(`/user/${user.id}`, HubKey.UserOnlineStatus)
	const avatar = (
		<Avatar
			alt={`${user.first_name} ${user.last_name}`}
			src={!!user.avatar_id ? `/api/files/${user.avatar_id}?token=${encodeURIComponent(localStorage.getItem("token") || "")}` : undefined}
			sx={{ height: "35px", width: "35px" }}
		/>
	)

	return (
		<OnlineStatusBadge
			key={`user-online-badge-${user.id}-${onlineStatus}`}
			overlap="circular"
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			variant="dot"
			sx={{
				"& .MuiBadge-badge": {
					transform: onlineStatus ? "scale(1) translate(50%, 50%)" : "scale(0) translate(50%, 50%)",
				},
			}}
		>
			{avatar}
		</OnlineStatusBadge>
	)
}
