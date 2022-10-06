import { Box, Stack, Typography } from "@mui/material"
import { colors } from "../../../../../theme"
import { UserAsset } from "../../../../../types/purchased_item"
import { PercentageDisplay } from "../../Common/PercentageDisplay"
import { useHistory } from "react-router-dom"

export const Attributes = ({ userAsset, username }: { userAsset: UserAsset; username: string }) => {
	const { push } = useHistory()
	return (
		<Box
			sx={{
				flex: 1,
				flexBasis: "400px",
			}}
		>
			<Stack flexWrap="wrap" spacing="1.3rem">
				<Stack>
					<Typography variant="subtitle1" color={colors.neonPink} sx={{ textTransform: "uppercase" }}>
						Properties
					</Typography>

					<Stack flexWrap="wrap" direction="row">
						{userAsset.attributes.map((attr) => {
							const clickable = attr.asset_hash && attr.asset_hash !== ""
							if (typeof attr.value === "string" || attr.trait_type === "date") {
								return (
									<Stack
										onClick={() => {
											if (!clickable) return
											push(`/profile/${username}/asset/${attr.asset_hash}`)
										}}
										key={`stack-${attr.trait_type}-${attr.value}%`}
										sx={{
											m: ".3rem",
											px: "1.2rem",
											py: ".6rem",
											borderRadius: 2,
											border: clickable ? `${colors.neonPink} 1px solid` : "#00000030 1px solid",
											backgroundColor: `${colors.darkerNavyBlue}60`,
											cursor: clickable ? `pointer` : `default`,
											transition: "all .3s ease-in",
											":hover": {
												boxShadow: clickable ? "inset 0px 0px 10px #f72485,0px 0px 10px #f72485" : "",
											},
										}}
									>
										<Typography variant="subtitle1" color={colors.skyBlue} sx={{ textTransform: "uppercase" }}>
											{attr.trait_type}
										</Typography>
										<Typography variant="subtitle2">{attr.value}</Typography>
									</Stack>
								)
							}
							return null
						})}
					</Stack>
				</Stack>

				<Stack>
					<Typography variant="subtitle1" color={colors.neonPink} sx={{ mb: ".5rem", textTransform: "uppercase" }}>
						Stats
					</Typography>

					<Stack flexWrap="wrap" direction="row">
						{userAsset.attributes.map((attr) => {
							if ((!attr.display_type || attr.display_type === "number") && typeof attr.value === "number") {
								return (
									<PercentageDisplay
										key={`${attr.trait_type}-${attr.value}%`}
										displayValue={`${attr.value}`}
										percentage={0}
										size={100}
										circleSize={55}
										label={attr.trait_type}
										color={colors.skyBlue}
										sx={{ m: ".2rem" }}
									/>
								)
							}
							return null
						})}
					</Stack>
				</Stack>

				<Stack>
					<Typography variant="subtitle1" color={colors.neonPink} sx={{ mb: ".5rem", textTransform: "uppercase" }}>
						Boosts
					</Typography>

					<Stack flexWrap="wrap" direction="row">
						{userAsset.attributes.map((attr) => {
							if (attr.display_type === "boost_number" && typeof attr.value === "number") {
								return (
									<PercentageDisplay
										key={`${attr.trait_type}-${attr.value}%`}
										displayValue={`${attr.value}`}
										percentage={100}
										size={100}
										circleSize={55}
										label={attr.trait_type}
										color={colors.skyBlue}
										sx={{ m: ".2rem" }}
									/>
								)
							}
							return null
						})}

						{userAsset.attributes.map((attr) => {
							if (attr.display_type === "boost_percentage" && typeof attr.value === "number") {
								return (
									<PercentageDisplay
										key={`${attr.trait_type}-${attr.value}%`}
										displayValue={`${attr.value}%`}
										percentage={attr.value}
										size={100}
										circleSize={55}
										label={attr.trait_type}
										color={colors.skyBlue}
										sx={{ m: ".2rem" }}
									/>
								)
							}
							return null
						})}
					</Stack>
				</Stack>
			</Stack>
		</Box>
	)
}
