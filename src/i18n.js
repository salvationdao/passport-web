import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import vi from "./locales/vi/translation.json"
import ar from "./locales/ar/translation.json"
import da from "./locales/da/translation.json"
import el from "./locales/el/translation.json"
import es from "./locales/es/translation.json"
import fa from "./locales/fa/translation.json"
import hi from "./locales/hi/translation.json"
import pa from "./locales/pa/translation.json"
import so from "./locales/so/translation.json"
import zh from "./locales/zh/translation.json"

const resources = {
	vi: {
		translation: vi,
	},
	ar: {
		translation: ar,
	},
	da: {
		translation: da,
	},
	el: {
		translation: el,
	},
	es: {
		translation: es,
	},
	fa: {
		translation: fa,
	},
	hi: {
		translation: hi,
	},
	pa: {
		translation: pa,
	},
	so: {
		translation: so,
	},
	zh: {
		translation: zh,
	},
}

i18n.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		// debug: true,
		fallbackLng: "en",
		lng: "en",

		// setting key and namespace separators to false, so that keys can just be the fallback text in english
		keySeparator: false, // we do not use keys in form messages.welcome
		namespaceSeparator: false,

		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	})

export default i18n
