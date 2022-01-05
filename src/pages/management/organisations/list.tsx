import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ItemTablePage } from "../../../components/itemTablePage"
import { Spaced } from "../../../components/spaced"
import { GetItemIcon } from "../../../helpers/loadicons"
import HubKey from "../../../keys"
import { Perm } from "../../../types/enums"

interface Props {
	onRowClick?: (data: any) => void
	hideCreateButton?: boolean
}

export const OrganisationList = (props: Props) => (
	<ItemTablePage
		name="Organisation"
		hubKey={HubKey.OrganisationList}
		columns={[
			{
				field: "name",
				headerName: "Name",
				flex: 1,
				renderCell: (p) => (
					<Spaced>
						<FontAwesomeIcon icon={GetItemIcon("organisation", "fas")} />
						<span>{p.row.name}</span>
					</Spaced>
				),
			},
			{ field: "created_at", headerName: "Date Created", width: 200, type: "dateTime", valueGetter: (p) => new Date(p.row.createdAt) },
			{ field: "updated_at", headerName: "Date Updated", width: 200, type: "dateTime", valueGetter: (p) => new Date(p.row.updatedAt) },
		]}
		sortBy="created_at"
		sortDir="asc"
		createPermission={Perm.OrganisationCreate}
		readPermission={Perm.OrganisationRead}
		onRowClickLink={(row) => `/organisations/${row.slug}`}
		onRowClick={props.onRowClick}
		hideCreateButton={props.hideCreateButton}
	/>
)
