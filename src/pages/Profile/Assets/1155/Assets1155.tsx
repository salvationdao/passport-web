import { Box, MenuItem, Pagination, Select, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { GradientHeartIconImagePath } from "../../../../assets"
import { FancyButton } from "../../../../components/fancyButton"
import { PageSizeSelectionInput } from "../../../../components/pageSizeSelectionInput"
import { useDebounce } from "../../../../hooks/useDebounce"
import { usePagination } from "../../../../hooks/usePagination"
import { usePassportCommandsUser } from "../../../../hooks/usePassport"
import HubKey from "../../../../keys"
import { colors, fonts } from "../../../../theme"
import { User1155Asset } from "../../../../types/purchased_item"
import { User } from "../../../../types/types"
import WarMachine from "../../../../assets/images/WarMachine.png"
import { Asset1155ItemCard } from "./Asset1155ItemCard"
import { SingleAsset1155View } from "./SingleAssetView/SingleAsset1155View"

export interface FilterSortOptions {
	sort: { column: string; direction: string }
}

const initialFilterSort: FilterSortOptions = { sort: { column: "name", direction: "asc" } }

export const Assets1155 = ({ user, loggedInUser }: { user: User; loggedInUser: User }) => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>()
	const { send } = usePassportCommandsUser("/commander")
	const history = useHistory()

	// // Collection data
	// const [search, setSearch] = useDebounce("", 300)
	const { page, changePage, totalItems, setTotalItems, totalPages, pageSize, setPageSize } = usePagination({ pageSize: 20, page: 1 })
	const [userAssets, setUserAssets] = useState<User1155Asset[]>([])
	const { collection_slug, token_id, locked } = useParams<{ collection_slug: string; token_id: string; locked: string }>()
	// Filter/Sort
	// const [filterSortDrawerOpen, setFilterSortDrawerOpen] = useState(false)
	// const [filterSortOptions, setFilterSortOptions] = useState<FilterSortOptions>(initialFilterSort)

	useEffect(() => {
		;(async () => {
			try {
				setLoading(true)
				const resp = await send<{ assets: User1155Asset[]; total: number }>(HubKey.AssetList1155, {
					user_id: user.id,
					page,
					page_size: pageSize,
				})

				if (!resp) return
				setUserAssets(resp.assets)
				setTotalItems(resp.total)
			} catch (e) {
				console.error(e)
				setError(typeof e === "string" ? e : "Something went wrong, please try again.")
			} finally {
				setLoading(false)
			}
		})()
	}, [user, page, pageSize, setLoading, send, setUserAssets, setTotalItems, setError])

	if (!!collection_slug && !!token_id && !!locked) {
		const lock = locked === "true"

		return (
			<SingleAsset1155View
				tokenID={parseInt(token_id)}
				locked={lock}
				collection_slug={collection_slug}
				edit={loggedInUser?.id === user.id}
				ownerID={user.id}
			/>
		)
	}

	return (
		<>
			<Stack sx={{ flexGrow: 1, p: "2rem" }}>
				<Stack
					direction="row"
					sx={{
						flexWrap: "wrap",
						alignItems: "center",
						mb: ".5rem",
						"@media (max-width: 630px)": {
							flexDirection: "column",
							alignItems: "stretch",
						},
					}}
				>
					<Stack direction="row" alignItems="center">
						<Box
							component="img"
							src={GradientHeartIconImagePath}
							alt="Heart icon"
							sx={{
								mr: ".5rem",
								height: "3.6rem",
							}}
						/>
						<Typography
							sx={{
								fontFamily: fonts.bizmoextra_bold,
								fontSize: "1.5rem",
								whiteSpace: "nowrap",
							}}
						>
							Achievements Earned
						</Typography>
					</Stack>
				</Stack>

				{userAssets && userAssets.length > 0 ? (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
							gap: "1rem",
						}}
					>
						{userAssets.map((a) => {
							return <Asset1155ItemCard key={a.id} userAsset={a} username={user.username} />
						})}
					</Box>
				) : (
					<Stack
						alignItems="center"
						justifyContent="center"
						sx={{
							flex: 1,
							minHeight: "30rem",
						}}
					>
						{loading && (
							<Typography variant="subtitle2" color={colors.darkGrey}>
								Loading assets...
							</Typography>
						)}

						{!loading && error && (
							<Typography variant="subtitle2" color={colors.darkGrey}>
								An error occurred while loading assets.
							</Typography>
						)}

						{!loading && !error && (
							<Stack
								alignItems="center"
								justifyContent="center"
								sx={{
									position: "relative",
									flex: 1,
									width: "100%",
									height: "100%",
									overflow: "wrap",
								}}
							>
								<Box
									sx={{
										position: "absolute",
										width: "100%",
										height: "100%",
										background: `center url(${WarMachine})`,
										backgroundSize: "contain",
										backgroundRepeat: "no-repeat",
										opacity: 0.2,
										zIndex: 1,
									}}
								/>
								<Stack alignItems="center" sx={{ zIndex: 2 }}>
									<Typography variant="body1" sx={{ textTransform: "uppercase", fontSize: "1.3rem", textAlign: "center" }}>
										Your Inventory Is Empty
									</Typography>
									<FancyButton size="small" sx={{ p: "0.5rem 2rem" }} onClick={() => history.push("/store")}>
										Go To Store
									</FancyButton>
								</Stack>
							</Stack>
						)}
					</Stack>
				)}
				<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: "auto", pt: "1.5rem" }}>
					<Stack>
						<Typography sx={{ ml: ".2rem" }}>
							Showing {userAssets ? userAssets.length : 0} of {totalItems}
						</Typography>
						<Select
							value={pageSize}
							onChange={(e) => {
								setPageSize(typeof e.target.value === "number" ? e.target.value : parseInt(e.target.value))
								changePage(1)
							}}
							input={<PageSizeSelectionInput />}
						>
							<MenuItem value={5}>Display 5 results per page</MenuItem>
							<MenuItem value={10}>Display 10 results per page</MenuItem>
							<MenuItem value={20}>Display 20 results per page</MenuItem>
							<MenuItem value={50}>Display 50 results per page</MenuItem>
							<MenuItem value={100}>Display 100 results per page</MenuItem>
						</Select>
					</Stack>

					<Pagination
						page={page}
						count={totalPages}
						color="primary"
						showFirstButton
						showLastButton
						onChange={(_, newPageNumber) => changePage(newPageNumber)}
					/>
				</Stack>
			</Stack>
		</>
	)
}
