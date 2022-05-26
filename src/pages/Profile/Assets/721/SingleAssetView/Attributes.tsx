import { Box, Stack, Typography } from "@mui/material"
import { colors } from "../../../../../theme"
import { UserAsset } from "../../../../../types/purchased_item"
import { PercentageDisplay } from "../../Common/PercentageDisplay"

export const Attributes = ({ userAsset }: { userAsset: UserAsset }) => {
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
							if (typeof attr.value === "string" || attr.trait_type === "date") {
								return (
									<Stack
										sx={{
											m: ".3rem",
											px: "1rem",
											py: "1rem",
											borderRadius: 2,
											border: "#00000030 1px solid",
											backgroundColor: `${colors.darkerNavyBlue}60`,
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
