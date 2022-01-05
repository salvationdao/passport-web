import { useTranslation } from "react-i18next"
import { Perm, PermGroup } from "../types/enums"

type PermTranslationGroup = Record<string, PermTranslation[]>

export interface PermTranslation {
	perm: Perm
	label: string
	description: string
}

const capitalize = (str: string) => {
	if (str.length === 0) return str
	return str[0].toUpperCase() + str.substr(1)
}

/**
 * Hook used to pull Perm Details with Translations
 */
export const usePermTranslations = () => {
	const { t } = useTranslation(["translation"])

	const genericPermissionGroup = (group: PermGroup, name: string) => {
		const prefix = group.toString()

		return [
			{
				perm: Perm[`${prefix}Read` as keyof typeof Perm],
				label: t("Read {name}").replace("{name}", capitalize(name)),
				description: t("Users with this permission can read the details of {name}.").replace("{name}", name),
			},
			{
				perm: Perm[`${prefix}List` as keyof typeof Perm],
				label: t("List {name}").replace("{name}", capitalize(name)),
				description: t("Users with this permission can see a list of {name}.").replace("{name}", name),
			},
			{
				perm: Perm[`${prefix}Create` as keyof typeof Perm],
				label: t("Create {name}").replace("{name}", capitalize(name)),
				description: t("Users with this permission can create new {name}.").replace("{name}", name),
			},
			{
				perm: Perm[`${prefix}Update` as keyof typeof Perm],
				label: t("Update {name}").replace("{name}", capitalize(name)),
				description: t("Users with this permission can update existing {name}.").replace("{name}", name),
			},
			{
				perm: Perm[`${prefix}Archive` as keyof typeof Perm],
				label: t("Archive {name}").replace("{name}", capitalize(name)),
				description: t("Users with this permission can archive {name}.").replace("{name}", name),
			},
			{
				perm: Perm[`${prefix}Unarchive` as keyof typeof Perm],
				label: t("Unarchive {name}").replace("{name}", capitalize(name)),
				description: t("Users with this permission can unarchive {name}.").replace("{name}", name),
			},
		]
	}

	const permissions: PermTranslationGroup = {
		[PermGroup.Product]: genericPermissionGroup(PermGroup.Product, t("products")),
		[PermGroup.User]: [
			...genericPermissionGroup(PermGroup.User, t("users")),
			{
				perm: Perm.UserForceDisconnect,
				label: t("Force Disconnect"),
				description: t("Users with this permission can force disconnect users via the Admin Portal."),
			},
		],
		[PermGroup.Organisation]: genericPermissionGroup(PermGroup.Organisation, t("organisations")),
		[PermGroup.Role]: genericPermissionGroup(PermGroup.Role, t("roles")),
		[PermGroup.Other]: [
			{
				perm: Perm.AdminPortal,
				label: t("Admin Portal"),
				description: t("Users with this permission can access the Admin Portal."),
			},
			{
				perm: Perm.ImpersonateUser,
				label: t("Impersonate User"),
				description: t("Users with this permission can impersonate other users."),
			},
			{
				perm: Perm.UserActivityList,
				label: t("List User Activity"),
				description: t("Users with this permission can see a list of user activity."),
			},
		],
	}

	/**
	 * Grabs a list of Permission Translations (without grouping)
	 */
	const getPermissions = (perms: Perm[]) => {
		let output: PermTranslation[] = []
		Object.keys(permissions).forEach((group) => {
			output = output.concat(permissions[group].filter((p) => perms.includes(p.perm)))
		})
		return output
	}

	/**
	 * Grabs a list of Permission Translations (with grouping)
	 */
	const getGroupedPermissions = (perms: Perm[]) => {
		let output: PermTranslationGroup = {}
		Object.keys(permissions).forEach((group) => {
			const groupedPermissions = permissions[group].filter((p) => perms.includes(p.perm))
			if (groupedPermissions.length > 0) {
				output[group] = groupedPermissions
			}
		})
		return output
	}

	return {
		permissions,
		getPermissions,
		getGroupedPermissions,
	}
}
