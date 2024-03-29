import SortIcon from "@mui/icons-material/Sort"
import {
	Autocomplete,
	Box,
	CircularProgress,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Stack,
	styled,
	SwipeableDrawer,
	TextField,
	Typography,
	useMediaQuery,
} from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { PageSizeSelectionInput } from "../../components/pageSizeSelectionInput"
import { SearchBar } from "../../components/searchBar"
import { useAuth } from "../../containers/auth"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Transaction } from "../../types/types"
import { SortChip } from "../Profile/Assets/Common/SortChip"
import { DesktopTransactionTable } from "./desktopTransactionTable"
import { MobileTransactionTable } from "./mobileTransactionTable"

type GroupType = "All" | "Ungrouped" | string

export const TransactionsPage = () => {
	const history = useHistory()
	const { user } = useAuth()
	const { state, send } = usePassportCommandsUser("/commander")
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const [openFilterDrawer, setOpenFilterDrawer] = useState(false)

	// Transaction data
	const [search, setSearch] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	// Sort / Filters / Page size
	const [sort, setSort] = useState<{ sort_by: string; sort_dir: string }>()
	const [selectedGroup, setSelectedGroup] = useState<GroupType>("All")
	const [selectedSubGroup, setSelectedSubGroup] = useState<GroupType>("All")
	const [pageSize, setPageSize] = useState(20)

	// Ungrouped transactions
	const [totalPages, setTotalPages] = useState(0)
	const [currentPage, setCurrentPage] = useState(1)
	const [transactions, setTransactions] = useState<Transaction[]>([])

	// Groups
	const [transactionGroups, setTransactionGroups] = useState<{ [key: string]: string[] }>({})

	useEffect(() => {
		if (state !== WebSocket.OPEN || !send || !user) return
		;(async () => {
			setLoading(true)
			try {
				// Get transaction IDs
				const filterItems = []
				switch (selectedGroup) {
					case "All":
						// Get all transactions; don't push any filters
						break
					case "Ungrouped":
						// Get only ungrouped transactions
						filterItems.push({
							column: "group",
							operator: "=",
							value: "''",
						})
						break
					default:
						// Get transactions of a specific group
						filterItems.push({
							column: "group",
							operator: "=",
							value: selectedGroup,
						})

						// Add sub group filters if specified
						if (selectedSubGroup) {
							switch (selectedSubGroup) {
								case "All":
									break
								case "Ungrouped":
									filterItems.push({
										column: "sub_group",
										operator: "=",
										value: "''",
									})
									break
								default:
									filterItems.push({
										column: "sub_group",
										operator: "=",
										value: selectedSubGroup,
									})
							}
						}
				}

				const resp = await send<{ total: number; transactions: Transaction[] }>(HubKey.TransactionList, {
					page_size: pageSize,
					page: currentPage - 1,
					search,
					filter: {
						linkOperator: "and",
						items: filterItems,
					},
					...sort,
				})
				setTransactions(resp.transactions)
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
	}, [send, state, search, user, currentPage, pageSize, sort, selectedGroup, selectedSubGroup])

	useEffect(() => {
		if (state !== WebSocket.OPEN || !send || !user) return
		;(async () => {
			setLoading(true)
			try {
				// Get transaction group IDs
				const groups = await send<{ [key: string]: string[] }>(HubKey.TransactionGroups)
				setTransactionGroups(groups)
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
								sort_by: "created_at",
								sort_dir: "asc",
							}
							return (
								<SortChip
									active={sort?.sort_by === newSort.sort_by && sort.sort_dir === newSort.sort_dir}
									label="Oldest first"
									onClick={() => {
										setSort(newSort)
									}}
								/>
							)
						})()}
						{(() => {
							const newSort = {
								sort_by: "created_at",
								sort_dir: "desc",
							}
							return (
								<SortChip
									active={sort?.sort_by === newSort.sort_by && sort.sort_dir === newSort.sort_dir}
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
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<Navbar />
			<Box
				sx={{
					display: "flex",
					flex: 1,
					m: "0 2rem 2rem 2rem",
				}}
			>
				<Paper
					sx={{
						display: "flex",
						flex: 1,
						flexDirection: "column",
						alignItems: "center",
						padding: "1rem",
						overflow: "auto",
						borderRadius: 1.5,
						gap: "1rem",
					}}
				>
					<Typography
						variant="h2"
						sx={{
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
								flexWrap: "wrap",
								alignItems: "baseline",
								"@media (max-width: 500px)": {
									flexDirection: "column",
									alignItems: "start",
								},
							}}
						>
							<Stack spacing=".5rem" direction="row" alignItems="baseline">
								<Autocomplete
									value={selectedGroup}
									disablePortal
									id="combo-box-demo"
									options={[
										"All",
										"Ungrouped",
										...(Object.keys(transactionGroups) ? Object.keys(transactionGroups).map((k) => k) : []),
									]}
									sx={{ minWidth: 300 }}
									renderInput={(params) => <TextField {...params} label="Group" />}
									renderOption={(_, val) => (
										<MenuItem
											onClick={() => {
												if (val) {
													setSelectedGroup(val)
													setSelectedSubGroup("All")
													setCurrentPage(1)
												}
											}}
											sx={{
												"&:hover": {
													backgroundColor: "#1c0927",
												},
											}}
											key={val}
											value={val}
										>
											{val}
										</MenuItem>
									)}
								/>

								{transactionGroups[selectedGroup] && transactionGroups[selectedGroup].length > 0 && (
									<Autocomplete
										value={selectedSubGroup}
										disablePortal
										id="combo-box-demo"
										options={[
											"All",
											"No Sub Group",
											...transactionGroups[selectedGroup].map((s) => s).sort((a, b) => a.localeCompare(b)),
										]}
										sx={{ minWidth: 370 }}
										renderInput={(params) => <TextField {...params} label="Subgroup" />}
										renderOption={(_, val) => (
											<MenuItem
												onClick={() => {
													if (val) {
														setSelectedSubGroup(val)
														setCurrentPage(1)
													}
												}}
												sx={{
													"&:hover": {
														backgroundColor: "#1c0927",
													},
												}}
												key={val}
												value={val}
											>
												{val}
											</MenuItem>
										)}
									/>
								)}
							</Stack>
							<Box
								sx={{
									flex: 1,
									minHeight: ".5rem",
									minWidth: "1rem",
								}}
							/>
							<FancyButton size="small" onClick={() => setOpenFilterDrawer(true)} endIcon={<SortIcon />}>
								Sort By
							</FancyButton>
						</Box>
						{isWiderThan1000px ? (
							<Box
								sx={{
									overflowX: "auto",
									flex: 1,
								}}
							>
								<DesktopTransactionTable transactions={transactions} />
							</Box>
						) : (
							<MobileTransactionTable transactions={transactions} />
						)}
						{transactions.length === 0 && (
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
										{error ? error : `No transaction history ${selectedGroup && "for"} ${selectedGroup}`}
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
								marginTop: "auto",
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
			<SwipeableDrawer
				open={openFilterDrawer}
				onClose={() => setOpenFilterDrawer(false)}
				onOpen={() => setOpenFilterDrawer(true)}
				anchor="bottom"
				swipeAreaWidth={0}
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
		</Box>
	)
}

const TransactionGroupBox = styled("div")({
	flex: "1",
	overflowX: "auto",
	display: "flex",
	alignSelf: "stretch",
	flexDirection: "column",
	minWidth: 0,
	"&:not(:last-child)": {
		marginBottom: "2rem",
	},
})
