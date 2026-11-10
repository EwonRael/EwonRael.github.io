const UK_USES_POUNDS = true

const UK_ZONES = ["Europe/London", "Europe/Belfast", "Europe/Jersey", "Europe/Guernsey", "Europe/Isle_of_Man"]
const EURO_ZONES = ["Atlantic/Madeira", "Atlantic/Azores", "Africa/Ceuta"]

const CURRENCIES = {
	USD: { symbol: "$", name: "US dollars" },
	EUR: { symbol: "€", name: "euros" },
	GBP: { symbol: "£", name: "pounds sterling" }
}

function readTimezone() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || ""
	} catch (error) {
		return ""
	}
}

function pickCurrency(timezone) {
	if (UK_ZONES.includes(timezone)) return UK_USES_POUNDS ? "GBP" : "EUR"
	if (timezone.startsWith("Europe/") || EURO_ZONES.includes(timezone)) return "EUR"
	return "USD"
}

const timezone = readTimezone()
const currencyCode = pickCurrency(timezone)

window.region = {
	timezone,
	cuba: timezone === "America/Havana",
	code: currencyCode,
	symbol: CURRENCIES[currencyCode].symbol,
	name: CURRENCIES[currencyCode].name,
	format(amount, decimals) {
		return this.symbol + Number(amount).toFixed(decimals) + " " + this.code
	}
}
