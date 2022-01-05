import { UserActivityList } from "./management/userActivity"
import { UserList } from "./management/users/list"
import { OrganisationList } from "./management/organisations/list"
import { RoleList } from "./management/roles/list"
import { ProductList } from "./management/products/list"

/** View returns a pre-defined ItemTable (in read only mode) based on the provided id. */
const View = (props: { id: string; onRowClick?: (data: any) => void }) => {
	const { id, onRowClick } = props
	switch (id) {
		case "role_id":
		case "role":
			return <RoleList onRowClick={onRowClick} hideCreateButton />
		case "organisation_id":
		case "organisation":
			return <OrganisationList onRowClick={onRowClick} hideCreateButton />
		case "user_id":
		case "user":
			return <UserList onRowClick={onRowClick} hideCreateButton />
		case "product_id":
		case "product":
			return <ProductList onRowClick={onRowClick} hideCreateButton />
	}
	return <></>
}

export const ListPage = {
	Roles: RoleList,
	Organisations: OrganisationList,
	Users: UserList,
	UserActivity: UserActivityList,
	Products: ProductList,

	View,
}
