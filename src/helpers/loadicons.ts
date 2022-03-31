import { library as IconLibrary, IconProp, IconPrefix } from "@fortawesome/fontawesome-svg-core"

import {
	faUser,
	faUsers,
	faUserTag,
	faUserSecret,
	faUserChart,
	faMoneyCheckAlt,
	faUserCircle,
	faEnvelope,
	faChevronDown,
	faChevronUp,
	faChartPieAlt,
	faCheck,
	faTimes,
	faFilter,
	faSearch,
	faBuilding,
	faCog,
	faSignOut,
	faFile,
	faPlus,
	faFileImport,
	faBooks,
} from "@fortawesome/pro-light-svg-icons"
import {
	faExternalLink as fasExternalLink,
	faFilter as fasFilter,
	faUserSecret as fasUserSecret,
	faUser as fasUser,
	faUserTag as fasUserTag,
	faUserChart as fasUserChart,
	faBuilding as fasBuilding,
	faFile as fasFile,
	faArchive as fasArchive,
	faSave as fasSave,
	faEdit as fasEdit,
	faPen as fasPen,
	faEye as fasEye,
	faEyeSlash as fasEyeSlash,
	faCamera as fasCamera,
	faBooks as fasBooks,
	faImages as fasImages,
} from "@fortawesome/pro-solid-svg-icons"

export const loadIcons = () => {
	IconLibrary.add(
		faUser,
		faUsers,
		faUserTag,
		faUserSecret,
		faUserChart,
		faMoneyCheckAlt,
		faUserCircle,
		faEnvelope,
		faChevronDown,
		faChevronUp,
		faChartPieAlt,
		faCheck,
		faTimes,
		faFilter,
		faSearch,
		faBuilding,
		faCog,
		faSignOut,
		faFile,
		faPlus,
		faFileImport,
		faBooks,

		fasExternalLink,
		fasFilter,
		fasUserSecret,
		fasUser,
		fasUserTag,
		fasUserChart,
		fasBuilding,
		fasFile,
		fasArchive,
		fasSave,
		fasEdit,
		fasPen,
		fasEye,
		fasEyeSlash,
		fasCamera,
		fasBooks,
		fasImages,
	)
}

export const GetItemIcon = (name: string, prefix?: IconPrefix): IconProp => {
	const p = prefix || "fal"
	switch (name) {
		case "user":
			return [p, "user"]
		case "role":
			return [p, "user-tag"]
		case "userActivity":
			return [p, "user-chart"]
		case "organisation":
			return [p, "building"]
		case "blob":
			return [p, "file"]
		case "product":
			return [p, "books"]
	}
	return [p, "user"]
}
