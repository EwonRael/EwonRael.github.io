document.querySelectorAll(".download-button.locked").forEach(button => {
	button.addEventListener("animationend", () => button.classList.remove("shake"))
	button.addEventListener("click", () => {
		button.classList.remove("shake")
		void button.offsetWidth
		button.classList.add("shake")
		const row = button.closest(".series-buttons")
		if (row.querySelector(".locked-message")) return
		row.classList.add("has-locked-message")
		const message = document.createElement("p")
		message.className = "locked-message"
		message.textContent = "Free download unlocked when the funding goal is met."
		message.addEventListener("click", () => goTo("../../about.html#model"))
		row.append(message)
		void message.offsetWidth
		message.classList.add("show")
	})
})
