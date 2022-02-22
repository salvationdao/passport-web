import React from "react"
import { Navbar } from "../components/home/navbar"
import Locker from "../assets/images/locker.png"
import { Box, Button, Paper, TextField, Typography } from "@mui/material"
import { BuyTokens } from "../components/buyTokens"
import { colors } from "../theme"
import Arrow from "../assets/images/arrow.png"
import { FancyButton } from "../components/fancyButton"

export const WithdrawPage = () => {
	return (
		<div>
			<Navbar sx={{ marginBottom: "2rem" }} />
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexWrap: "wrap",
					marginBottom: "3rem",
					padding: "0 3rem",
					"@media (max-width: 630px)": {
						flexDirection: "column",
						alignItems: "stretch",
					},
				}}
			>
				<Paper sx={{ width: "100%", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", height: "85vh" }}>
					<Box
						component="img"
						src={Locker}
						alt="Image of a Safe"
						sx={{
							height: "12rem",
							marginBottom: "1.5rem",
						}}
					/>
					<Typography variant="h2" sx={{ textTransform: "uppercase", marginBottom: "1rem" }}>
						Withdraw Sups
					</Typography>
					{
						//this is a place holder for the actual withdraw sups functionality, it does nothing but look ok
					}
					<Box
						sx={{
							width: "80%",
							maxWidth: "750px",
							position: "relative",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<Box
							sx={{
								width: "100%",
								filter: "blur(4px) brightness(20%)",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							<Box sx={{ position: "relative", width: "100%" }}>
								<Box
									sx={{
										display: "flex",
										backgroundColor: colors.darkNavyBlue,
										borderRadius: "10px",
										padding: "1rem",
										marginBottom: "1rem",
									}}
								>
									<Box sx={{ flexGrow: "2" }}>
										<Typography sx={{ color: colors.darkGrey }} variant="h6">
											From:{" "}
										</Typography>
										<TextField
											disabled
											fullWidth
											variant="filled"
											type="number"
											sx={{
												backgroundColor: colors.darkNavyBlue,
												"& .MuiFilledInput-root": {
													background: "inherit",
												},
												"& .MuiFilledInput-underline:after": {
													borderBottomColor: colors.skyBlue,
												},
												input: { color: colors.skyBlue, fontSize: "1.2rem" },
											}}
											inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
										/>
									</Box>

									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											justifyContent: "space-between",
											alignItems: "flex-end",
										}}
									></Box>
								</Box>
								<Box
									component="img"
									src={Arrow}
									alt="token image"
									sx={{
										height: "3rem",
										position: "absolute",
										top: "0",
										left: "0",
										right: "0",
										bottom: "0",
										margin: "auto",
										zIndex: 2,
									}}
								/>
								<Box sx={{ display: "flex", backgroundColor: colors.darkNavyBlue, borderRadius: "10px", padding: "1rem", marginTop: "1rem" }}>
									<Box sx={{ flexGrow: "2" }}>
										<Typography sx={{ color: colors.darkGrey }} variant="h6">
											To:
										</Typography>
										<TextField
											disabled
											fullWidth
											variant="filled"
											type="number"
											sx={{
												backgroundColor: colors.darkNavyBlue,
												"& .MuiFilledInput-root": {
													background: "inherit",
												},
												"& .MuiFilledInput-underline:after": {
													borderBottomColor: colors.skyBlue,
												},
												input: { color: colors.skyBlue, fontSize: "1.2rem" },
											}}
											inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
										/>
									</Box>
								</Box>
							</Box>
							<FancyButton disabled borderColor={colors.skyBlue} sx={{ marginTop: "1.5rem", width: "50%" }}>
								Withdraw SUPS
							</FancyButton>
						</Box>
						<Box
							sx={{
								position: "absolute",
								width: "100%",
								height: "100%",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								padding: "1rem",
							}}
						>
							<Typography variant="h3" sx={{ textTransform: "uppercase", textAlign: "center", lineHeight: "1.6" }} color={colors.darkGrey}>
								Withdrawing of $SUPs will be available after the token sale
							</Typography>
						</Box>
					</Box>
				</Paper>
			</Box>
		</div>
	)
}
