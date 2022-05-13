import { Box, Divider, Modal, Stack, Tooltip, Typography } from "@mui/material"
import React, { useCallback, useMemo } from "react"
import { useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { colors } from "../../theme"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { StyledFancyButton } from "./profile"
import { useSnackbar } from "../../containers/snackbar"
import { useAuth } from "../../containers/auth"

export const lockOptions: LockOptionsProps[] = [
	{
		type: "withdrawals",
		title: "This account will not be able to withdraw SUPs from the On-World Wallet.",
	},
	{
		type: "minting",
		title: "This account will not be able to mint any On-World Assets.",
	},
	{
		type: "account",
		title: "This account will not be able to withdraw SUPs, mint assets or spend On-World SUPs.",
	},
]

export interface LockOptionsProps {
	type: string
	title: string
}

interface LockBaseProps {
	option: LockOptionsProps
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

interface LockButtonProps {
	setLockOption: React.Dispatch<React.SetStateAction<LockOptionsProps | undefined>>
}
interface LockModalProps {
	open: boolean
}

export const LockButton: React.FC<LockBaseProps & LockButtonProps> = ({ option, setOpen, setLockOption }) => {
	const { user } = useAuth()

	console.log(user)
	const isLocked = useMemo(() => {
		if (option.type === "withdrawals" && user?.withdraw_lock) {
			return true
		}
		if (option.type === "minting" && user?.mint_lock) {
			return true
		}
		if (option.type === "account" && user?.total_lock) {
			return true
		}
		return false
	}, [option.type, user?.mint_lock, user?.total_lock, user?.withdraw_lock])
	return (
		<Tooltip placement="right" title={option ? option.title : ""}>
			<Box>
				<StyledFancyButton
					disabled={isLocked}
					sx={{ width: "100%" }}
					onClick={() => {
						setLockOption(option)
						setOpen(true)
					}}
				>
					{`Lock ${option?.type}`}
				</StyledFancyButton>
			</Box>
		</Tooltip>
	)
}

export const LockModal = ({ open, option, setOpen }: LockBaseProps & LockModalProps) => {
	const { send } = useWebsocket()
	const { displayMessage } = useSnackbar()

	const lockRequest = useCallback(
		async (type: string) => {
			try {
				const resp = await send<boolean>(HubKey.UserLock, {
					type,
				})
				if (resp) {
					displayMessage(`Successfully locked ${type}.`, "success")
				}
			} catch (e) {
				displayMessage(typeof e === "string" ? e : `Could not lock ${type}, try again or contact support.`, "error")
			}
		},
		[displayMessage, send],
	)

	return (
		<Modal open={open && option?.title !== ""} onClose={() => setOpen(false)}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					maxWidth: "50rem",
					boxShadow: 6,
					backgroundColor: colors.darkerNavyBackground,
				}}
			>
				<Box
					sx={{
						px: "3.2rem",
						py: "2.4rem",
					}}
				>
					<Stack spacing={2}>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<WarningAmberIcon color="warning" sx={{ fontSize: "3rem", mr: "1.3rem" }} />
							<Typography variant="h5">{`Locking ${option?.type}`}</Typography>
						</Box>
						<Divider />

						<Typography variant="body2">{option?.title}</Typography>

						<Typography variant="body2">
							If your account has been compromised, locking your account can help mitigate the damage an unauthorised user can do.
						</Typography>
						<Typography variant="body2">In order to get your unlock your account, you will have to speak to an Admin directly.</Typography>
					</Stack>

					<StyledFancyButton variant="outlined" onClick={() => setOpen(false)}>
						Cancel
					</StyledFancyButton>
					<StyledFancyButton
						variant="outlined"
						onClick={() => {
							if (!option) return
							lockRequest(option.type)
							setOpen(false)
						}}
					>
						Confirm
					</StyledFancyButton>
				</Box>
			</Box>
		</Modal>
	)
}
