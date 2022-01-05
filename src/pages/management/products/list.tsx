import { Box } from "@mui/system"
import { ItemTablePage } from "../../../components/itemTablePage"
import HubKey from "../../../keys"
import { Perm } from "../../../types/enums"

interface Props {
	onRowClick?: (data: any) => void
	hideCreateButton?: boolean
}

export const ProductList = (props: Props) => {
	const token = localStorage.getItem("token")
	return (
		<ItemTablePage
			name="Product"
			hubKey={HubKey.ProductList}
			columns={[
				{
					field: "image_id",
					headerName: " ",
					width: 60,
					renderCell: (p) =>
						p.row.imageID && (
							<Box
								sx={{
									height: "60px",
									marginLeft: "-10px",
									minWidth: "60px",
									backgroundColor: "grey",
									backgroundSize: "cover",
									backgroundPositionX: "center",
									backgroundImage: `url(/api/files/${p.row.imageID}?token=${encodeURIComponent(token || "")})`,
								}}
							/>
						),
					filterable: false,
					sortable: false,
					resizable: false,
					disableColumnMenu: true,
				},
				{
					field: "name",
					headerName: "Name",
					width: 260,
				},
				{
					field: "description",
					headerName: "Description",
					flex: 1,
				},
				{ field: "created_at", headerName: "Date Created", width: 200, type: "dateTime", valueGetter: (p) => new Date(p.row.createdAt) },
				{ field: "updated_at", headerName: "Date Updated", width: 200, type: "dateTime", valueGetter: (p) => new Date(p.row.updatedAt) },
			]}
			sortBy="created_at"
			sortDir="desc"
			createPermission={Perm.ProductCreate}
			readPermission={Perm.ProductRead}
			onRowClickLink={(row) => `/products/${row.slug}`}
			onRowClick={props.onRowClick}
			hideCreateButton={props.hideCreateButton}
		/>
	)
}
