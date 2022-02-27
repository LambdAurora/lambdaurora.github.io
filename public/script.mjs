for (const sidenav_trigger of document.querySelectorAll("a.ls_sidenav_trigger")) {
	const target = sidenav_trigger.attributes["ls_data_target"].value;
	const sidenav = document.getElementById(target);

	if (sidenav) {
		sidenav_trigger.addEventListener("click", e => {
			let current_display = sidenav.style.display;

			if (!current_display) {
				sidenav.style.display = "block";
				setTimeout(() => {
					sidenav.style.transform = "translateX(0%)";
				}, 10);
			} else {
				sidenav.style.removeProperty("transform");
				setTimeout(() => {
					sidenav.style.removeProperty("display");
				}, 500);
			}
		});
	}
}
