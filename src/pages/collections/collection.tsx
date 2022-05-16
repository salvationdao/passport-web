import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import {
	Box,
	Collapse,
	Link,
	MenuItem,
	Pagination,
	Paper,
	Select,
	styled,
	Tab,
	TabProps,
	Tabs,
	tabsClasses,
	Typography,
	useMediaQuery,
} from "@mui/material"
import SwipeableDrawer from "@mui/material/SwipeableDrawer"
import React, { useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { PleaseEnlist } from "../../components/pleaseEnlist"
import { SearchBar } from "../../components/searchBar"
import { Sort } from "../../components/sort"
import { PageSizeSelectionInput } from "../../components/pageSizeSelectionInput"
import { colors } from "../../theme"
import { CollectionItemCard } from "./collectionItemCard"
import useUser from "../../containers/useUser"

export const CollectionPage: React.VoidFunctionComponent = () => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>()
	const [assetHashes, setAssetHashes] = useState<string[]>([])
	const [openFilterDrawer, setOpenFilterDrawer] = useState(false)

	// search and filter
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(20)
	const [total, setTotal] = useState(0)
	const [search, setSearch] = useState("")
	const [assetType, setAssetType] = useState<string>()

	const { username } = useParams<{ username: string }>()
	const history = useHistory()
	const user = useUser()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	const toggleAssetType = (assetType: string) => {
		setAssetType(assetType)
	}

	if (user && !user.faction) {
		return <PleaseEnlist />
	}

	return (
		<>
			{!isWiderThan1000px && (
				<SwipeableDrawer
					open={openFilterDrawer}
					onClose={() => setOpenFilterDrawer(false)}
					onOpen={() => setOpenFilterDrawer(true)}
					anchor="bottom"
					swipeAreaWidth={56}
					ModalProps={{ keepMounted: true }}
					PaperProps={{
						sx: {
							padding: "2rem",
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						},
					}}
				>
					<Sort
						assetType={assetType}
						search={search}
						page={currentPage - 1}
						pageSize={pageSize}
						setAssetHashes={setAssetHashes}
						setTotal={setTotal}
						setLoading={setLoading}
						setError={setError}
					/>
				</SwipeableDrawer>
			)}
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100%",
				}}
			>
				<Navbar />
				<Box
					sx={{
						display: "flex",
						width: "100%",
						flexDirection: "column",
						alignItems: "center",
						marginBottom: "2rem",
						padding: "0 2rem",
					}}
				>
					<Box
						component="img"
						src={SupremacyLogoImagePath}
						alt="Collection Logo"
						sx={{
							width: "100%",
							maxWidth: "300px",
							padding: ".5rem",
						}}
					/>
					<Typography
						variant="h1"
						sx={{
							textTransform: "uppercase",
							fontSize: "1.6rem",
							color: colors.neonPink,
						}}
					>
						Collection
					</Typography>
				</Box>
				<Box
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						width: "100%",
						maxWidth: "1700px",
						margin: "0 auto",
						marginBottom: "3rem",
						padding: "0 3rem",
						borderRadius: 0,
					}}
				>
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
							placeholder={`Search this collection...`}
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
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "1rem",
						}}
					>
						<Link
							variant="h5"
							underline="hover"
							sx={{
								display: "flex",
								alignItems: "center",
								textTransform: "uppercase",
							}}
							color={colors.white}
							component={"button"}
							onClick={() => history.goBack()}
						>
							<ChevronLeftIcon />
							Go Back
						</Link>
						<FancyButton onClick={() => setOpenFilterDrawer((prev) => !prev)} size="small" endIcon={<FilterAltIcon />}>
							Filters / Sort
						</FancyButton>
					</Box>

					<Box
						sx={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							width: "100%",
						}}
					>
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								width: "100%",
							}}
						>
							<Tabs
								value={assetType || "All"}
								onChange={(_, value) => {
									toggleAssetType(value)
								}}
								TabIndicatorProps={{
									hidden: true,
								}}
								aria-label="Filter tabs"
								variant="scrollable"
								scrollButtons="auto"
								allowScrollButtonsMobile
								sx={{
									[`& .${tabsClasses.scrollButtons}`]: {
										"&.Mui-disabled": { opacity: 0.3 },
									},
								}}
							>
								<StyledTab value="All" label="All" />
								<StyledTab value="Land" label="Land" />
								<StyledTab value="Pilot" label="Pilot" />
								<StyledTab value="Utility" label="Utility" />
								<StyledTab value="War Machine" label="War Machine" />
								<StyledTab value="Weapon" label="Weapons" />
							</Tabs>
						</Box>
						<Box
							sx={{
								flex: 1,
								display: "flex",
								// flexDirection: "columns",
								width: "100%",
							}}
						>
							{isWiderThan1000px && (
								<Collapse in={openFilterDrawer} orientation={"horizontal"}>
									<Box
										sx={{
											alignSelf: "start",
											width: "340px",
										}}
									>
										<Paper
											sx={{
												padding: "2rem",
												borderRadius: 0,
												"& > *:not(:last-child)": {
													marginBottom: "1rem",
												},
											}}
										>
											<Sort
												assetType={assetType}
												search={search}
												page={currentPage - 1}
												pageSize={pageSize}
												setAssetHashes={setAssetHashes}
												setTotal={setTotal}
												setLoading={setLoading}
												setError={setError}
											/>
										</Paper>
									</Box>
								</Collapse>
							)}

							<Box
								sx={{
									flex: 1,
									display: "flex",
									flexDirection: "column",
									minWidth: 0,
								}}
							>
								{assetHashes.length > 0 ? (
									<Paper
										sx={{
											flex: 1,
											display: "grid",
											gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
											gridAutoRows: "min-content",
											gap: "1rem",
											height: "100%",
											padding: "2rem",
										}}
									>
										{assetHashes.map((a, index) => {
											return <CollectionItemCard key={`${a}-${index}`} assetHash={a} username={username} />
										})}
									</Paper>
								) : (
									<Paper
										sx={{
											flex: 1,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											height: "100%",
											padding: "2rem",
										}}
									>
										<Typography variant="subtitle2" color={colors.darkGrey}>
											{loading ? "Loading assets..." : error ? "An error occurred while loading assets." : "No results found."}
										</Typography>
									</Paper>
								)}
							</Box>
						</Box>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
							<Select
								value={pageSize}
								onChange={(e) => {
									setPageSize(typeof e.target.value === "number" ? e.target.value : parseInt(e.target.value))
									setCurrentPage(1)
								}}
								input={<PageSizeSelectionInput />}
							>
								<MenuItem value={5}>Showing 5 results per page</MenuItem>
								<MenuItem value={10}>Showing 10 results per page</MenuItem>
								<MenuItem value={20}>Showing 20 results per page</MenuItem>
								<MenuItem value={50}>Showing 50 results per page</MenuItem>
								<MenuItem value={100}>Showing 100 results per page</MenuItem>
							</Select>
							<Pagination
								page={currentPage}
								count={Math.ceil(total / pageSize)}
								color="primary"
								onChange={(_, newPageNumber) => setCurrentPage(newPageNumber)}
							/>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}

const StyledTab = styled((props: TabProps) => <Tab {...props} />)(({ theme }) => ({
	textTransform: "uppercase",
	fontSize: "1.125rem",
	color: theme.palette.text.primary,
	backgroundColor: "transparent",

	"&.Mui-selected": {
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.secondary.main,
	},
}))
