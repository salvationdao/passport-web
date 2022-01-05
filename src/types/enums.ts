export enum Perm {
	RoleList = "RoleList",
	RoleCreate = "RoleCreate",
	RoleRead = "RoleRead",
	RoleUpdate = "RoleUpdate",
	RoleArchive = "RoleArchive",
	RoleUnarchive = "RoleUnarchive",

	UserList = "UserList",
	UserCreate = "UserCreate",
	UserRead = "UserRead",
	UserUpdate = "UserUpdate",
	UserArchive = "UserArchive",
	UserUnarchive = "UserUnarchive",
	UserForceDisconnect = "UserForceDisconnect",

	OrganisationList = "OrganisationList",
	OrganisationCreate = "OrganisationCreate",
	OrganisationRead = "OrganisationRead",
	OrganisationUpdate = "OrganisationUpdate",
	OrganisationArchive = "OrganisationArchive",
	OrganisationUnarchive = "OrganisationUnarchive",

	ProductList = "ProductList",
	ProductCreate = "ProductCreate",
	ProductRead = "ProductRead",
	ProductUpdate = "ProductUpdate",
	ProductArchive = "ProductArchive",
	ProductUnarchive = "ProductUnarchive",

	AdminPortal = "AdminPortal",
	ImpersonateUser = "ImpersonateUser",
	UserActivityList = "UserActivityList",
}

export enum PermGroup {
	Role = "Role",
	Organisation = "Organisation",
	User = "User",
	Product = "Product",
	Other = "Other",
}

export enum ObjectType {
	Blob = "Blob",
	Organisation = "Organisation",
	Role = "Role",
	User = "User",
	Product = "Product",
}

export enum FilterBy {
	All = "All",
	Active = "Active",
	Archived = "Archived",
}

export enum SortDir {
	Ascending = "Ascending",
	Descending = "Descending",
}
