import { Box, LinearProgress, Modal, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { FancyButton } from "../../components/fancyButton"
import { useAuth } from "../../containers/auth"
import { useWeb3 } from "../../containers/web3"
import { AddressDisplay } from "../../helpers/web3"
import { colors } from "../../theme"

export const CorrectWalletConnected = () => {
	const { logout, user } = useAuth()
	const { account, disableWalletModal: loading } = useWeb3()
	const [correctWalletConnected, setCorrectWalletConnected] = useState<boolean | undefined>(false)

	//Compares user's passport address to wallet address
	const correctWalletCheck = (metaMaskAcc: string, userPubAddr?: string) => {
		if (userPubAddr) return userPubAddr.toUpperCase() === metaMaskAcc.toUpperCase()
	}

	//compares addresses everytime there's a change
	useEffect(() => {
		if (!user) return
		if (!account || !user.public_address) return
		setCorrectWalletConnected(correctWalletCheck(account, user.public_address))
	}, [user, account, loading])
	return (
		<Modal open={correctWalletConnected === false} sx={{ backdropFilter: "blur(5px)" }}>
			{loading ? (
				<Stack gap="2rem" sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
					<LinearProgress color="secondary" />
					<Typography variant="h2" sx={{ fontSize: "1.25rem", paddingTop: ".25rem", textAlign: "center" }}>
						Awaiting signature to connect wallet...
					</Typography>
					<LinearProgress color="secondary" />
				</Stack>
			) : (
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
							minWidth: "300px",
						}}
					>
						<Box sx={{ mb: "1rem" }}>
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
						<Typography variant="subtitle2" sx={{ margin: { lg: "1rem 0 .5rem 0" } }}>
							If you switch accounts, you will be unable use the Xsyn Passport until the connected wallet account address
							<Box component="span" sx={{ color: colors.darkNeonBlue }}>
								{` (${AddressDisplay(account ? account : "")}) `}
							</Box>
							matches the address of this passport session{" "}
							<Box component="span" sx={{ color: colors.darkNeonBlue }}>
								{` (${user && user.public_address ? AddressDisplay(user.public_address) : null}).`}
							</Box>
						</Typography>
						<br />
						<Typography variant="subtitle2">
							Please disconnect your wallets and then connect one through your profile or, please change to the wallet that belongs to
							this account.
						</Typography>
					</Box>

					<FancyButton sx={{ alignSelf: "flex-end" }} onClick={logout} borderColor={colors.darkerNeonPink}>
						Logout
					</FancyButton>
				</Box>
			)}
		</Modal>
	)
}
