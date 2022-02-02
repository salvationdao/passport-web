import { Box } from "@mui/material"
import { useHistory } from "react-router"
import { AuthContainer } from "../containers"
import { Perm } from "../types/enums"
import { ItemTable, ItemTableProps } from "./itemTable"

interface ItemTablePageProps {
	readPermission?: Perm
	createPermission?: Perm
	onRowClickLink?: (row: any) => string
}

export const ItemTablePage = (props: ItemTablePageProps & ItemTableProps) => {
	const { readPermission, createPermission, onRowClickLink, ...rest } = props
	const { hasPermission } = AuthContainer.useContainer()
	const { push } = useHistory()

	const hasReadPermission = readPermission === undefined || hasPermission(readPermission)
	const onRowClick = !!rest.onRowClick ? rest.onRowClick : !!onRowClickLink && hasReadPermission ? (row: any) => push(onRowClickLink(row)) : undefined

	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<ItemTable {...rest} onRowClick={onRowClick} hideCreateButton={!!createPermission ? !hasPermission(createPermission) : rest.hideCreateButton} />
		</Box>
	)
}
ItemTablePage.defaultProps = {
	updateSearchParams: true,
}
