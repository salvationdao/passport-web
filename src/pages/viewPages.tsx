import { AssetPage } from "./management/assets/view"
import { OrganisationPage } from "./management/organisations/view"
import { ProductPage } from "./management/products/view"
import { RolePage } from "./management/roles/view"
import { UserPage } from "./management/users/view"

export const ViewPage = {
	Role: RolePage,
	Organisation: OrganisationPage,
	User: UserPage,
	Product: ProductPage,
	Asset: AssetPage,
}
