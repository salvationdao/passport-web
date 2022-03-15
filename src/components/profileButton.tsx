import { Avatar, Box, IconButton, IconButtonProps } from "@mui/material"
import { useHistory } from "react-router-dom"
import { API_ENDPOINT_HOSTNAME } from "../config"
import { AuthContainer } from "../containers"

interface ProfileButtonProps extends Omit<IconButtonProps, "size"> {
	size?: string
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ size = "3rem", sx, onClick, ...props }) => {
	const history = useHistory()
	const { user } = AuthContainer.useContainer()
	const token = localStorage.getItem("token")

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		if (onClick) onClick(event)
		history.push("/profile")
	}

	if (!user) return null

	return (
		<IconButton
			onClick={handleClick}
			sx={{
				position: "relative",
				width: "fit-content",
				padding: 0,
				"& .Avatar, & .Avatar-border": {
					transition: "transform .2s cubic-bezier(.3, .7, .4, 1.5)",
				},
				"&:hover .Avatar": {},
				"&:hover .Avatar-border": {
					transform: "translate(-50%, -50%) scale(1.2)",
				},
				"&:active .Avatar": {
					transform: "scale(0.9)",
				},
				"&:active .Avatar-border": {
					transform: "translate(-50%, -50%) scale(1.0)",
				},
				"&:disabled": {
					"&:hover .Avatar": {
                        transform: "none"
                    },
					"&:hover .Avatar-border": {
                        transform: "translate(-50%, -50%)"
                    },
					"&:active .Avatar": {
                        transform: "none"
                    },
					"&:active .Avatar-border": {
                        transform: "translate(-50%, -50%)"
                    },
				},
				...sx,
			}}
			{...props}
		>
			<Box
				className="Avatar-border"
				sx={(theme) => ({
					zIndex: -1,
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%) scale(1.1)",
					display: "block",
					width: "100%",
					height: "100%",
					borderRadius: "50%",
					border: `2px solid ${theme.palette.secondary.main}`,
				})}
			/>
			{!!user && user.faction && !user.avatar_id ? (
				<Avatar
					className="Avatar"
					src={`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${user.faction.logo_blob_id}`}
					sx={{
						height: size,
						width: size,
					}}
				/>
			) : (
				<Avatar
					className="Avatar"
					src={user.avatar_id ? `/api/files/${user.avatar_id}?token=${encodeURIComponent(token || "")}` : undefined}
					sx={{
						height: size,
						width: size,
					}}
				/>
			)}
		</IconButton>
	)
}
