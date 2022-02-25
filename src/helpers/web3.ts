export const AddressDisplay = (addr: string) => {
	return `${addr.slice(0, 6)}...${addr.slice(addr.length - 4, addr.length)}`
}
