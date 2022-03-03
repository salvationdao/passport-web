import SortIcon from "@mui/icons-material/Sort"
import { Box, CircularProgress, InputBase, MenuItem, Pagination, Paper, Select, styled, SwipeableDrawer, Typography, useMediaQuery } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { GradientCardIconImagePath } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { SearchBar } from "../../components/searchBar"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { SortChip } from "../profile/profile"
import { DesktopTransactionTable } from "./desktopTransactionTable"
import { MobileTransactionTable } from "./mobileTransactionTable"

type GroupType = "All" | "Ungrouped" | string

export const TransactionsPage = () => {
	const history = useHistory()
	const { user } = useAuth()
	const { send, state } = useWebsocket()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const [openFilterDrawer, setOpenFilterDrawer] = useState(false)

	// Transaction data
	const [search, setSearch] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	// Sort / Filters / Page size
	const [sort, setSort] = useState<{ sortBy: string; sortDir: string }>()
	const [selectedGroupID, setSelectedGroupID] = useState<GroupType>("All")
	const [pageSize, setPageSize] = useState(20)

	// Ungrouped transactions
	const [totalPages, setTotalPages] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const [transactionIDs, setTransactionIDs] = useState<string[]>([])

	// Group IDs
	const [transactionGroupIDs, setTransactionGroupIDs] = useState<string[]>([])

	useEffect(() => {
		if (state !== SocketState.OPEN || !send || !user) return
		;(async () => {
			setLoading(true)
			try {
				// Get transaction IDs
				const filterItems = []

				switch (selectedGroupID) {
					case "All":
						// Get all transactions; don't push any filters
						break
					case "Ungrouped":
						// Get only ungrouped transactions
						filterItems.push({
							columnField: "group_id",
							operatorValue: "=",
							value: "''",
						})
						break
					default:
						// Get transactions of a specific group
						filterItems.push({
							columnField: "group_id",
							operatorValue: "=",
							value: selectedGroupID,
						})
				}

				const resp = await send<{ total: number; transactionIDs: string[] }>(HubKey.TransactionList, {
					pageSize,
					page: currentPage - 1,
					search,
					filter: {
						linkOperator: "and",
						items: filterItems,
					},
					...sort,
				})
				setTransactionIDs(resp.transactionIDs)
				setTotalPages(Math.ceil(resp.total / pageSize))
				setError(undefined)
			} catch (e) {
				if (typeof e === "string") {
					setError(e)
				} else if (e instanceof Error) {
					setError(e.message)
				}
			} finally {
				setLoading(false)
			}
		})()
	}, [send, state, search, user, currentPage, sort, selectedGroupID, pageSize])

	useEffect(() => {
		if (state !== SocketState.OPEN || !send || !user) return
		;(async () => {
			setLoading(true)
			try {
				// Get transaction group IDs
				const groupIDs = await send<string[]>(HubKey.TransactionGroups)
				setTransactionGroupIDs(groupIDs)
			} catch (e) {
				if (typeof e === "string") {
					setError(e)
				} else if (e instanceof Error) {
					setError(e.message)
				}
			} finally {
				setLoading(false)
			}
		})()
	}, [send, state, user])

	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/login")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	const renderFilters = () => {
		return (
			<>
				<Box>
					<Typography
						variant="subtitle1"
						sx={{
							display: "flex",
							alignItems: "center",
							marginBottom: ".5rem",
						}}
					>
						Sort By
					</Typography>
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							flexWrap: "wrap",
							gap: ".5rem",
						}}
					>
						{(() => {
							const newSort = {
								sortBy: "created_at",
								sortDir: "asc",
							}
							return (
								<SortChip
									active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
									label="Oldest first"
									onClick={() => {
										setSort(newSort)
									}}
								/>
							)
						})()}
						{(() => {
							const newSort = {
								sortBy: "created_at",
								sortDir: "desc",
							}
							return (
								<SortChip
									active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
									label="Newest first"
									onClick={() => {
										setSort(newSort)
									}}
								/>
							)
						})()}
					</Box>
				</Box>
			</>
		)
	}

	if (!user) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
	}

	return (
		<>
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
				{renderFilters()}
			</SwipeableDrawer>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100%",
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
						<TransactionGroupBox
							sx={{
								minWidth: 0,
							}}
						>
							<Box
								sx={{
									display: "flex",
									flexWrap: "wrap",
									justifyContent: "space-between",
									alignItems: "baseline",
									marginBottom: ".5rem",
									"@media (max-width: 500px)": {
										flexDirection: "column",
										alignItems: "start",
										marginBottom: "1rem",
									},
								}}
							>
								<Select
									value={selectedGroupID}
									onChange={(e) => {
										setSelectedGroupID(e.target.value)
										setCurrentPage(1)
									}}
									input={<GroupSelectionInput />}
									displayEmpty
								>
									<MenuItem value={"All"}>
										<em>All</em>
									</MenuItem>
									<MenuItem value={"Ungrouped"}>Ungrouped</MenuItem>
									{transactionGroupIDs.map((g, index) => (
										<MenuItem key={`${g}-${index}-group_filter`} value={g}>
											{g}
										</MenuItem>
									))}
								</Select>
								<FancyButton size="small" onClick={() => setOpenFilterDrawer(true)} endIcon={<SortIcon />}>
									Sort By
								</FancyButton>
							</Box>
							{isWiderThan1000px ? (
								<Box
									sx={{
										overflowX: "auto",
									}}
								>
									<DesktopTransactionTable transactionIDs={transactionIDs} />
								</Box>
							) : (
								<MobileTransactionTable transactionIDs={transactionIDs} />
							)}
							{transactionIDs.length === 0 && (
								<Box
									sx={{
										flex: 1,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										padding: "1rem",
										minHeight: "200px",
									}}
								>
									{loading ? (
										<CircularProgress />
									) : (
										<Typography variant="subtitle2" color={colors.darkerGrey}>
											{error ? error : `No transaction history ${selectedGroupID && "for"} ${selectedGroupID}`}
										</Typography>
									)}
								</Box>
							)}
							<Box
								sx={{
									display: "flex",
									flexWrap: "wrap",
									justifyContent: "space-between",
									alignItems: "center",
									marginTop: "1rem",
								}}
							>
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
									count={totalPages}
									color="primary"
									page={currentPage}
									onChange={(_, p) => {
										setCurrentPage(p)
									}}
								/>
							</Box>
						</TransactionGroupBox>
					</Paper>
				</Box>
			</Box>
		</>
	)
}

const TransactionGroupBox = styled("div")({
	flex: "1",
	alignSelf: "stretch",
	display: "flex",
	flexDirection: "column",
	overflowX: "auto",
	"&:not(:last-child)": {
		marginBottom: "2rem",
	},
})

const GroupSelectionInput = styled(InputBase)(({ theme }) => ({
	padding: 2,
	borderRadius: ".5rem",
	transition: theme.transitions.create(["background-color"]),
	"&:hover": {
		backgroundColor: "rgba(255, 255, 255, .2)",
	},
	"& .MuiInputBase-input": {
		display: "flex",
		alignItems: "end",
		borderRadius: ".5rem",
		padding: 0,
		fontSize: "1.2rem",
		fontFamily: fonts.bizmoblack,
		fontStyle: "italic",
		letterSpacing: "2px",
		textTransform: "uppercase",
		"&:focus": {
			borderRadius: 4,
			borderColor: "#80bdff",
			boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
		},
	},
}))

const PageSizeSelectionInput = styled(InputBase)(({ theme }) => ({
	padding: 2,
	borderRadius: ".5rem",
	transition: theme.transitions.create(["background-color"]),
	"&:hover": {
		backgroundColor: "rgba(255, 255, 255, .2)",
	},
	"& .MuiInputBase-input": {
		display: "flex",
		alignItems: "end",
		borderRadius: ".5rem",
		padding: 0,
		fontSize: ".9em",
		color: colors.darkGrey,
		"&:focus": {
			borderRadius: 4,
			borderColor: "#80bdff",
			boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
		},
	},
}))
