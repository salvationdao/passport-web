import { useHistory } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { GetItemIcon } from "../helpers/loadicons"
import { Button } from "@mui/material"
import { styled } from "@mui/material/styles"

interface ItemLinkProps {
	label: string
	to: string
	target?: string
	icon?: IconProp
	/** If set will get icon from `GetItemIcon` method in `loadicons.ts` */
	iconName?: string
	disabled?: boolean
}

const ItemLinkButton = styled(Button)({
	justifyContent: "left",
})

const Label = styled("div")({
	marginLeft: "5px",
	overflowX: "hidden",
	textOverflow: "ellipsis",
})

export const ItemLink = (props: ItemLinkProps) => {
	const { label, to, target, disabled, iconName } = props
	const icon = !!iconName && GetItemIcon(iconName, "fas")

	const history = useHistory()

	return (
		<ItemLinkButton
			type="button"
			onClick={
				disabled
					? undefined
					: (e) => {
							e.stopPropagation()
							if (target !== undefined) window.open(to, target)
							else history.push(to)
					  }
			}
		>
			{!!icon ? <FontAwesomeIcon icon={icon} /> : !!props.icon ? <FontAwesomeIcon icon={props.icon} size="sm" /> : undefined}
			<Label>{label}</Label>
		</ItemLinkButton>
	)
}
