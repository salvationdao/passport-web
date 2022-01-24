import { UserPage } from "./management/users/view"
import { OrganisationPage } from "./management/organisations/view"
import { RolePage } from "./management/roles/view"
import { ProductPage } from "./management/products/view"
import { AssetPage } from "./management/assets/view"

export const ViewPage = {
	Role: RolePage,
	Organisation: OrganisationPage,
	User: UserPage,
	Product: ProductPage,
	Asset: AssetPage,
}
