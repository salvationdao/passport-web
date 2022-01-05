import { Loading } from "../components/loading"
import { AuthContainer } from "../containers"
import { UserEdit } from "./management/users/edit"

export const Settings = () => {
	const { user } = AuthContainer.useContainer()
	if (!user) return <Loading />
	return <UserEdit user={user} />
}
