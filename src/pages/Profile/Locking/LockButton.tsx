import { Tooltip } from "@mui/material"
import { useMemo } from "react"
import { FancyButton } from "../../../components/fancyButton"
import { ENVIRONMENT } from "../../../config"
import { useAuth } from "../../../containers/auth"

export interface LockOptionsProps {
	type: string
	title: string
}

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

interface LockButtonProps {
	option: LockOptionsProps
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	setLockOption: React.Dispatch<React.SetStateAction<LockOptionsProps | undefined>>
}

export const LockButton = ({ option, setOpen, setLockOption }: LockButtonProps) => {
	const { user } = useAuth()

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
		<Tooltip title={option ? option.title : ""}>
			<FancyButton
				disabled={isLocked}
				sx={{ minWidth: "15rem", width: ENVIRONMENT !== "production" ? "calc(50% - .25rem)" : "100%" }}
				onClick={() => {
					setLockOption(option)
					setOpen(true)
				}}
				size="small"
			>
				{`Lock ${option?.type}`}
			</FancyButton>
		</Tooltip>
	)
}
