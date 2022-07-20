import {
	Box,
	FormControl,
	InputLabel,
	MenuItem,
	Pagination,
	Select,
	SelectChangeEvent,
	Stack,
	Typography
} from "@mui/material"
import {useEffect, useState} from "react"
import {useHistory} from "react-router-dom"
import {FancyButton} from "../../../../components/fancyButton"
import {PageSizeSelectionInput} from "../../../../components/pageSizeSelectionInput"
import {SearchBar} from "../../../../components/searchBar"
import {useDebounce} from "../../../../hooks/useDebounce"
import {usePagination} from "../../../../hooks/usePagination"
import {usePassportCommandsUser} from "../../../../hooks/usePassport"
import HubKey from "../../../../keys"
import {colors} from "../../../../theme"
import {UserAsset} from "../../../../types/purchased_item"
import {User} from "../../../../types/types"
import WarMachine from "../../../../assets/images/WarMachine.png"
import {Asset721ItemCard} from "./Asset721ItemCard"
import {Autocomplete} from "@mui/lab";
import TextField from "@mui/material/TextField";

export interface FilterSortOptions {
	sort: { column: string; direction: string }
	showOffWorldOnly?: boolean
	rarities: Set<string>
}

enum AssetsOn {
	All = "ALL",
	XSYN = "XSYN",
	Supremacy = "SUPREMACY"
}


export const Assets721 = ({user, loggedInUser}: { user: User; loggedInUser: User }) => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>()
	const {send} = usePassportCommandsUser("/commander")
	const history = useHistory()

	// Collection data
	const [search, setSearch] = useDebounce("", 300)
	const [assetsOn, setAssetsOn] = useState<string>("ALL")
	const [assetType, setAssetType] = useState<string>("all")
	const {
		page,
		changePage,
		totalItems,
		setTotalItems,
		totalPages,
		pageSize,
		setPageSize,
	} = usePagination({pageSize: 20, page: 1})
	const [userAssets, setUserAssets] = useState<UserAsset[]>([])

	useEffect(() => {
		;(async () => {
			try {
				setLoading(true)
				const resp = await send<{ assets: UserAsset[]; total: number }>(HubKey.AssetList721, {
					user_id: user.id,
					search,
					page,
					page_size: pageSize,
					assets_on: assetsOn,
					asset_type: assetType,
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
	}, [user, search, page, pageSize, setLoading, send, setUserAssets, setTotalItems, setError, assetsOn, assetType])

	return (
		<Box sx={{
			display: "flex",
			flexDirection: "column",
			flex: 1,
			gap: "1rem",
			padding: "1rem",
			overflow: "auto",
		}}>
			<Box
				sx={{
					display: "flex",
					flexDirection: "row",
					flexWrap: "wrap",
					gap:'1rem'
				}}
			>
				<SearchBar
					label="Search"
					placeholder="Keywords..."
					value={search}
					size="small"
					onChange={(value: string) => setSearch(value)}
					sx={{
						flex: 1,
						minWidth: '400px'
					}}
				/>
				<FormControl size="small" variant="filled" sx={{ minWidth: "200px", flex: 1}}>
					<InputLabel>Asset Type</InputLabel>
					<Select
						value={assetType}
						onChange={( e)=> {
							setAssetType(e.target.value)
						}
						}
						label="Assets On"
					>
						<MenuItem key={"all"} value={"all"}>All</MenuItem>
						<MenuItem key={"mech"} value={"mech"}>War Machine</MenuItem>
						<MenuItem key={"mech_skin"} value={"mech_skin"}>War Machine Submodel</MenuItem>
						<MenuItem key={"mystery_crate"} value={"mystery_crate"}>Crate</MenuItem>
						<MenuItem key={"power_core"} value={"power_core"}>Energy Core</MenuItem>
						<MenuItem key={"weapon"} value={"weapon"}>Weapon</MenuItem>
						<MenuItem key={"weapon_skin"} value={"weapon_skin"}>Weapon Submodel</MenuItem>
					</Select>
				</FormControl>
				<FormControl size="small" variant="filled" sx={{ minWidth: "200px", flex: 1}}>
					<InputLabel>Assets On</InputLabel>
					<Select
						value={assetsOn}
						onChange={( e)=> {
							setAssetsOn(e.target.value)
						}
					}
						label="Assets On"
					>
						<MenuItem key={"ALL"} value={"ALL"}>ALL</MenuItem>
						<MenuItem key={"XSYN"} value={"XSYN"}>XSYN</MenuItem>
						<MenuItem key={"SUPREMACY"} value={"SUPREMACY"}>SUPREMACY</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{userAssets && userAssets.length > 0 ? (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
						gap: "1rem",
					}}
				>
					{userAssets.map((a) => {
						return <Asset721ItemCard key={a.id} userAsset={a} username={user.username}/>
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
							<Stack alignItems="center" sx={{zIndex: 2}}>
								<Typography variant="body1" sx={{
									textTransform: "uppercase",
									fontSize: "1.3rem",
									textAlign: "center",
								}}>
									Inventory Is Empty
								</Typography>
								{loggedInUser.id === user.id && <FancyButton size="small" sx={{p: "0.5rem 2rem"}}
																			 onClick={() => history.push("/store")}>
									Go To Store
								</FancyButton>}
							</Stack>
						</Stack>
					)}
				</Stack>
			)}
			<Box
				sx={{
					mt: "auto",
					pt: "1.5rem",
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: "auto",

				}}>
				<Stack>
					<Typography sx={{ml: ".2rem"}}>
						Showing {userAssets ? userAssets.length : 0} of {totalItems}
					</Typography>
					<Select
						value={pageSize}
						onChange={(e) => {
							setPageSize(typeof e.target.value === "number" ? e.target.value : parseInt(e.target.value))
							changePage(1)
						}}
						input={<PageSizeSelectionInput/>}
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
			</Box>
		</Box>
	)
}
