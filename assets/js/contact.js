(() => {
	const form = document.querySelector("#contactForm");
	if (!form) return;

	const note = document.getElementById("formNote");
	const btn = form.querySelector('[type="submit"]');

	const clearErrors = () =>
		[...form.querySelectorAll(".field__error")].forEach((el) => {
			el.textContent = "";
		});

	const setNote = (msg, type = "idle") => {
		if (!note) return;
		note.textContent = msg;
		note.style.color =
			type === "success"
				? "var(--blue-700)"
				: type === "error"
					? "#dc2626"
					: "";
	};

	const setLoading = (loading) => {
		btn.disabled = loading;
		btn.setAttribute("aria-busy", String(loading));
		if (loading) {
			btn._origHTML = btn.innerHTML;
			btn.innerHTML = "Sending…";
		} else if (btn._origHTML) {
			btn.innerHTML = btn._origHTML;
		}
	};

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		clearErrors();

		if (!form.checkValidity()) {
			const bad = form.querySelector(":invalid");
			if (bad) {
				const errEl = document.getElementById(bad.id + "Err");
				const msg = bad.validity.valueMissing
					? "This field is required."
					: bad.validity.typeMismatch
						? `Please enter a valid ${bad.type}.`
						: bad.validationMessage;
				if (errEl) errEl.textContent = msg;
				setNote("Please fix the highlighted field above.", "error");
				bad.focus();
			}
			return;
		}

		setLoading(true);
		setNote("Sending your message…");

		try {
			const res = await fetch("https://api.web3forms.com/submit", {
				method: "POST",
				body: new FormData(form),
			});
			const result = await res.json();

			if (result.success) {
				setNote(
					"Message sent — we’ll be in touch within 1–2 business days.",
					"success",
				);
				form.reset();
			} else {
				setNote(
					"Something went wrong. Please try again or email info@yecbelize.com directly.",
					"error",
				);
			}
		} catch {
			setNote(
				"Unable to send — check your connection or email info@yecbelize.com directly.",
				"error",
			);
		} finally {
			setLoading(false);
		}
	});

	[...form.querySelectorAll("input, textarea, select")].forEach((el) => {
		el.addEventListener("input", () => {
			const errEl = document.getElementById(el.id + "Err");
			if (errEl) errEl.textContent = "";
		});
	});
})();
