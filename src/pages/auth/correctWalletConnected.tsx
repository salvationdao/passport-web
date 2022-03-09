import { Box, Modal, Typography } from "@mui/material"
import { FancyButton } from "../../components/fancyButton"
import { colors } from "../../theme"
import { useAuth } from "../../containers/auth"
import { useWeb3 } from "../../containers/web3"
import { useState, useEffect } from "react"
import { AddressDisplay } from "../../helpers/web3"

export const CorrectWalletConnected = () => {
	const { logout, user } = useAuth()
	const { account } = useWeb3()
	const [correctWalletConnected, setCorrectWalletConnected] = useState(false)

	//Compares user's passport address to wallet address
	const correctWalletCheck = (userPubAddr: string, metaMaskAcc: string) => {
		return userPubAddr.toUpperCase() === metaMaskAcc.toUpperCase()
	}

	//compares addresses everytime there's a change
	useEffect(() => {
		if (!user) return
		if (!user.public_address || !account) return
		setCorrectWalletConnected(correctWalletCheck(user.public_address, account))
	}, [user, account])

	return (
		<Modal open={!correctWalletConnected} sx={{ backdropFilter: "blur(5px)" }}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					backgroundColor: "background.paper",
					border: `4px solid ${colors.darkNeonBlue}`,
					padding: "1rem",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					maxWidth: "600px",
					minHeight: "300px",
					justifyContent: "space-between",
				}}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						justifyContent: { xs: "space-around", lg: "space-between" },
						flexGrow: "1",
						padding: ".5rem",
					}}
				>
					<Box>
						<Typography
							variant="h1"
							color={colors.darkNeonPink}
							sx={{ textTransform: "uppercase", textAlign: "center", textDecoration: "underline" }}
						>
							Attention!
						</Typography>
						<Typography variant="h2" sx={{ fontSize: "1.25rem", paddingTop: ".25rem", textAlign: "center" }}>
							Mismatching wallets
						</Typography>
					</Box>
					<Typography variant="subtitle2" sx={{ textAlign: "center", margin: { lg: "1rem 0 .5rem 0" } }}>
						If you switch accounts, you will be unable use the Xsyn Passport until the connected wallet account address
						<Box component="span" sx={{ color: colors.darkNeonBlue }}>
							{` (${AddressDisplay(account ? account : "")}) `}
						</Box>
						matches the address of this passport session{" "}
						<Box component="span" sx={{ color: colors.darkNeonBlue }}>
							{` (${user && user.public_address ? AddressDisplay(user.public_address) : null}).`}
						</Box>
					</Typography>
					<Typography variant="subtitle2" sx={{ textAlign: "center" }}>
						You may change your connected wallet in your Web3 wallet, or logout.
					</Typography>
				</Box>

				<FancyButton sx={{ alignSelf: "flex-end" }} onClick={logout} borderColor={colors.darkerNeonPink}>
					Logout
				</FancyButton>
			</Box>
		</Modal>
	)
}