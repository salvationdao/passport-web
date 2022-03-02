import SortIcon from "@mui/icons-material/Sort"
import { Box, CircularProgress, Pagination, Paper, styled, SwipeableDrawer, Typography, useMediaQuery } from "@mui/material"
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

	// Ungrouped transactions
	const [totalPages, setTotalPages] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const [ungroupedTransactionIDs, setUngroupedTransactionIDs] = useState<string[]>([])
	const [sort, setSort] = useState<{ sortBy: string; sortDir: string }>()

	// Group transactions
	const [transactionGroupIDs, setTransactionGroupIDs] = useState<string[]>([])

	useEffect(() => {
		if (state !== SocketState.OPEN || !send || !user) return
		;(async () => {
			setLoading(true)
			try {
				// Get ungrouped transaction IDs
				const pageSize = 5
				const resp = await send<{ total: number; transactionIDs: string[] }>(HubKey.TransactionList, {
					pageSize,
					page: currentPage - 1,
					search,
					filter: {
						linkOperator: "and",
						items: [
							{
								columnField: "group_id",
								operatorValue: "isnull",
								value: "null",
							},
						],
					},
					...sort,
				})
				setUngroupedTransactionIDs(resp.transactionIDs)
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
	}, [send, state, search, user, currentPage, sort])

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
									variant="outlined"
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
									variant="outlined"
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
						<TransactionGroupBox>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									flexWrap: "wrap",
									marginBottom: ".5rem",
									"@media (max-width: 500px)": {
										flexDirection: "column",
										alignItems: "start",
										marginBottom: "1rem",
									},
								}}
							>
								<Typography
									variant="h3"
									component="h2"
									sx={{
										fontFamily: fonts.bizmoblack,
										fontStyle: "italic",
										letterSpacing: "2px",
										textTransform: "uppercase",
									}}
								>
									Uncategorized
								</Typography>
								<FancyButton size="small" onClick={() => setOpenFilterDrawer(true)} endIcon={<SortIcon />}>
									Sort By
								</FancyButton>
							</Box>
							{isWiderThan1000px ? (
								<DesktopTransactionTable transactionIDs={ungroupedTransactionIDs} />
							) : (
								<MobileTransactionTable transactionIDs={ungroupedTransactionIDs} />
							)}
							{ungroupedTransactionIDs.length === 0 && (
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
											{error ? error : "No transaction history"}
										</Typography>
									)}
								</Box>
							)}
							<Pagination
								sx={{
									alignSelf: "center",
									marginTop: "1rem",
								}}
								count={totalPages}
								color="primary"
								page={currentPage}
								onChange={(_, p) => {
									setCurrentPage(p)
								}}
							/>
						</TransactionGroupBox>
						{transactionGroupIDs.map((g, index) => (
							<TransactionGroup key={`${g}-${index}`} groupID={g} search={search} />
						))}
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

interface TransactionGroupProps {
	groupID: string
	search: string
}

const TransactionGroup = ({ groupID, search }: TransactionGroupProps) => {
	const { user } = useAuth()
	const { state, send } = useWebsocket()
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [transactionIDs, setTransactionIDs] = useState<string[]>([])
	const [sort, setSort] = useState<{ sortBy: string; sortDir: string }>()
	const [openFilterDrawer, setOpenFilterDrawer] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	useEffect(() => {
		if (state !== SocketState.OPEN || !send || !user) return
		;(async () => {
			setLoading(true)
			try {
				const pageSize = 5
				const resp = await send<{ total: number; transactionIDs: string[] }>(HubKey.TransactionList, {
					pageSize,
					page: currentPage - 1,
					search,
					filter: {
						linkOperator: "and",
						items: [
							{
								columnField: "group_id",
								operatorValue: "=",
								value: groupID,
							},
						],
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
	}, [send, state, search, user, currentPage, sort, groupID])

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
									variant="outlined"
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
									variant="outlined"
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
			<TransactionGroupBox>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						flexWrap: "wrap",
						marginBottom: ".5rem",
						"@media (max-width: 500px)": {
							flexDirection: "column",
							alignItems: "start",
							marginBottom: "1rem",
						},
					}}
				>
					<Typography
						variant="h3"
						component="h2"
						sx={{
							fontFamily: fonts.bizmoblack,
							fontStyle: "italic",
							letterSpacing: "2px",
							textTransform: "uppercase",
						}}
					>
						{groupID}
					</Typography>
					<FancyButton size="small" onClick={() => setOpenFilterDrawer(true)} endIcon={<SortIcon />}>
						Sort By
					</FancyButton>
				</Box>

				{isWiderThan1000px ? <DesktopTransactionTable transactionIDs={transactionIDs} /> : <MobileTransactionTable transactionIDs={transactionIDs} />}
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
								{error ? error : `No transaction history for ${groupID}`}
							</Typography>
						)}
					</Box>
				)}
				<Pagination
					sx={{
						alignSelf: "center",
						marginTop: "1rem",
					}}
					count={totalPages}
					color="secondary"
					page={currentPage}
					onChange={(_, p) => {
						setCurrentPage(p)
					}}
				/>
			</TransactionGroupBox>
		</>
	)
}
