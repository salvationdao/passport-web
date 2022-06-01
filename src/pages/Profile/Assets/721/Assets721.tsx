import { Box, MenuItem, Pagination, Select, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { GradientHeartIconImagePath } from "../../../../assets"
import { FancyButton } from "../../../../components/fancyButton"
import { PageSizeSelectionInput } from "../../../../components/pageSizeSelectionInput"
import { SearchBar } from "../../../../components/searchBar"
import { useDebounce } from "../../../../hooks/useDebounce"
import { usePagination } from "../../../../hooks/usePagination"
import { usePassportCommandsUser } from "../../../../hooks/usePassport"
import HubKey from "../../../../keys"
import { colors, fonts } from "../../../../theme"
import { UserAsset } from "../../../../types/purchased_item"
import { User } from "../../../../types/types"
import WarMachine from "../../../../assets/images/WarMachine.png"
import { SortDrawer } from "./SortDrawer"
import { Asset721ItemCard } from "./Asset721ItemCard"
import { SingleAsset721View } from "./SingleAssetView/SingleAsset721View"

export interface FilterSortOptions {
	sort: { column: string; direction: string }
	showOffWorldOnly?: boolean
	rarities: Set<string>
}

const initialFilterSort: FilterSortOptions = { sort: { column: "name", direction: "asc" }, showOffWorldOnly: false, rarities: new Set() }

export const Assets721 = ({ user, loggedInUser }: { user: User; loggedInUser: User }) => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>()
	const { send } = usePassportCommandsUser("/commander")
	const { asset_hash } = useParams<{ username: string; asset_hash: string }>()
	const history = useHistory()

	// Collection data
	const [search, setSearch] = useDebounce("", 300)
	const { page, changePage, totalItems, setTotalItems, totalPages, pageSize, setPageSize } = usePagination({ pageSize: 20, page: 1 })
	const [userAssets, setUserAssets] = useState<UserAsset[]>([])
	// Filter/Sort
	const [filterSortDrawerOpen, setFilterSortDrawerOpen] = useState(false)
	const [filterSortOptions, setFilterSortOptions] = useState<FilterSortOptions>(initialFilterSort)

	useEffect(() => {
		console.log(filterSortOptions)
		const filtersItems: any[] = []

		if (filterSortOptions.showOffWorldOnly !== undefined) {
			filtersItems.push({
				// filter by on_chain_status
				columnField: "on_chain_status",
				operatorValue: filterSortOptions.showOffWorldOnly ? "=" : "!=",
				value: "STAKABLE",
			})
		}

		const attributeFilterItems: any[] = []
		filterSortOptions.rarities.forEach((v) =>
			attributeFilterItems.push({
				// NOTE: "rarity" trait is now "tier" on the backend
				trait: "tier",
				value: v,
				operatorValue: "contains",
			}),
		)
		;(async () => {
			try {
				setLoading(true)
				const resp = await send<{ assets: UserAsset[]; total: number }>(HubKey.AssetList721, {
					user_id: user.id,
					search,
					page,
					page_size: pageSize,
					attribute_filter: {
						linkOperator: "or",
						items: attributeFilterItems,
					},
					filter: {
						linkOperator: "and",
						items: filtersItems,
					},
					sort: filterSortOptions.sort,
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
	}, [user, search, page, pageSize, setLoading, send, setUserAssets, setTotalItems, setError, filterSortOptions])

	if (!!asset_hash) return <SingleAsset721View assetHash={asset_hash} edit={loggedInUser?.id === user.id} />

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
							Owned Assets
						</Typography>
					</Stack>

					<SearchBar
						label="Search"
						placeholder="Keywords..."
						value={search}
						size="small"
						onChange={(value: string) => setSearch(value)}
						sx={{
							ml: "auto",
							width: "500px",
							minWidth: "200px",
							maxWidth: "800px",
						}}
					/>
				</Stack>

				<Stack direction="row" alignItems="center" sx={{ mb: "1rem" }}>
					<FancyButton
						onClick={() => setFilterSortDrawerOpen(true)}
						size="small"
						sx={{
							ml: "auto",
							"@media (max-width: 630px)": {
								width: "100%",
							},
						}}
					>
						Filters / Sort
					</FancyButton>
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
							return <Asset721ItemCard key={a.id} userAsset={a} username={user.username} />
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

			<SortDrawer
				showOffWorldFilter={false}
				open={filterSortDrawerOpen}
				setOpen={setFilterSortDrawerOpen}
				setFilterSortOptions={setFilterSortOptions}
			/>
		</>
	)
}
