import { Box, Paper, Typography } from "@mui/material"
import React, { useState } from "react"
import { GradientCardIconImagePath } from "../assets"
import { Navbar } from "../components/home/navbar"
import { SearchBar } from "../components/searchBar"
import { colors, fonts } from "../theme"

export const TransactionsPage = () => {
	const [search, setSearch] = useState("")

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>
			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					padding: "0 3rem",
					marginBottom: "3rem",
				}}
			>
				<Paper
					sx={{
						flexGrow: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
						maxWidth: "1700px",
						margin: "0 auto",
						padding: "2rem",
					}}
				>
					<Box
						component="img"
						src={GradientCardIconImagePath}
						alt="Transactions icon"
						sx={{
							width: "100%",
							maxWidth: "200px",
						}}
					/>
					<Typography
						variant="h1"
						sx={{
							marginBottom: "2rem",
							textTransform: "uppercase",
							fontFamily: fonts.bizmosemi_bold,
						}}
					>
						Transactions
					</Typography>
					<Box
						sx={{
							alignSelf: "center",
							width: "100%",
							maxWidth: "600px",
							marginBottom: "2rem",
						}}
					>
						<SearchBar
							label="Search"
							placeholder={`Search your transaction history...`}
							value={search}
							onChange={(value: string) => {
								setSearch(value)
							}}
							fullWidth
						/>
					</Box>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							maxWidth: "1000px",
						}}
					>
						{/*
                        // To
                        // From
                        // Amount
                        // Status
                        // Date/time
                        // Tx Ref
                        // Tx Description
                        */}
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns:
									"minmax(150px, 1fr) minmax(300px, 2fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)",
								gap: "1rem",
								padding: ".5rem .5rem",
								borderBottom: `1px solid ${colors.navyBlue}`,
								"& > *": {
									overflowX: "auto",
									whiteSpace: "nowrap",
								},
							}}
						>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Transaction #
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Transaction Description
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									To
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									From
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Status
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Date
								</Typography>
							</Box>
						</Box>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns:
									"minmax(150px, 1fr) minmax(300px, 2fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)",
								gap: "1rem",
								padding: ".5rem .5rem",
								"&:nth-child(even)": {
									backgroundColor: "#160d45",
								},
								"& > *": {
									overflowX: "auto",
									whiteSpace: "nowrap",
								},
							}}
						>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									supremacy|early_contributor|14
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Supremacy early contributor dispersion.
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									0x0bF823885962361b7D40A2e5bCA0c3C479549Be0
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									XsynSale
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									success
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									2022-02-24 10:53:47
								</Typography>
							</Box>
						</Box>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns:
									"minmax(150px, 1fr) minmax(300px, 2fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)",
								gap: "1rem",
								padding: ".5rem .5rem",
								"&:nth-child(even)": {
									backgroundColor: "#160d45",
								},
								"& > *": {
									overflowX: "auto",
									whiteSpace: "nowrap",
								},
							}}
						>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									supremacy|early_contributor|14
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Supremacy early contributor dispersion.
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									0x0bF823885962361b7D40A2e5bCA0c3C479549Be0
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									XsynSale
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									success
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="caption"
									sx={{
										textTransform: "uppercase",
									}}
								>
									2022-02-24 10:53:47
								</Typography>
							</Box>
						</Box>
					</Box>
				</Paper>
			</Box>
		</Box>
	)
}
