import { ForceDisconnectButton } from "../../../components/forceDisconnectButton"
import { ItemLink } from "../../../components/itemLink"
import { ItemTablePage } from "../../../components/itemTablePage"
import { UserAvatar } from "../../../components/userAvatar"
import HubKey from "../../../keys"
import { Perm } from "../../../types/enums"
import { User } from "../../../types/types"

interface Props {
	onRowClick?: (data: any) => void
	hideCreateButton?: boolean
}

export const AssetsList = (props: Props) => {
	return (
		<ItemTablePage
			name="User"
			hubKey={HubKey.UserList}
			columns={[
				{
					field: "avatar_id",
					headerName: " ",
					width: 50,
					renderCell: (p) => <UserAvatar user={p.row as User} />,
					filterable: false,
					sortable: false,
					resizable: false,
					disableColumnMenu: true,
				},
				{
					field: "email",
					headerName: "Email",
					width: 250,
				},
				{
					field: "first_name",
					headerName: "First Name",
					valueGetter: (p) => p.row.firstName,
					width: 160,
				},
				{
					field: "last_name",
					headerName: "Last Name",
					valueGetter: (p) => p.row.lastName,
					width: 160,
				},
				{
					field: "role.name",
					headerName: "Role",
					width: 160,
					renderCell: (p) => <ItemLink label={p.row.role.name} iconName="role" to={`/roles/${p.row.role.name}`} />,
				},
				{
					field: "organisation.name",
					headerName: "Organisation",
					width: 250,
					renderCell: (p) =>
						p.row.organisation ? (
							<ItemLink label={p.row.organisation.name} iconName="organisation" to={`/organisations/${p.row.organisation.slug}`} />
						) : (
							<></>
						),
				},
				{ field: "created_at", headerName: "Date Created", width: 200, type: "dateTime", valueGetter: (p) => new Date(p.row.createdAt) },
				{ field: "updated_at", headerName: "Date Updated", width: 200, type: "dateTime", valueGetter: (p) => new Date(p.row.updatedAt) },
				{
					field: "actions",
					headerName: "Actions",
					width: 140,
					align: "right",
					headerAlign: "right",
					sortable: false,
					filterable: false,
					disableColumnMenu: true,
					renderCell: (p) => (
						<>
							<ForceDisconnectButton user={p.row as User} />
						</>
					),
				},
			]}
			sortBy="created_at"
			sortDir="asc"
			createPermission={Perm.UserCreate}
			readPermission={Perm.UserRead}
			onRowClickLink={(row) => `/users/${row.username}`}
			onRowClick={props.onRowClick}
			hideCreateButton={props.hideCreateButton}
		/>
	)
}
