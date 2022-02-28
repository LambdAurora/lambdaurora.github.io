for (const sidenav_trigger of document.querySelectorAll("a.ls_sidenav_trigger")) {
	const target = sidenav_trigger.attributes["ls_data_target"].value;
	const sidenav = document.getElementById(target);
	const sidenav_darkened_trigger = document.querySelector(`div.ls_sidenav_darkened[ls_data_target="${target}"]`);

	let last_timeout;

	if (sidenav && sidenav_darkened_trigger) {
		sidenav_darkened_trigger.addEventListener("click", _ => {
			if (last_timeout) {
				clearTimeout(last_timeout);
				last_timeout = undefined;
			}

			sidenav_darkened_trigger.style.removeProperty("display");
			sidenav.style.removeProperty("transform");
			last_timeout = setTimeout(() => {
				sidenav.style.removeProperty("display");
			}, 500);
		});

		sidenav_trigger.addEventListener("click", _ => {
			if (last_timeout) {
				clearTimeout(last_timeout);
				last_timeout = undefined;
			}

			sidenav_darkened_trigger.style.display = "block";
			sidenav.style.display = "block";
			last_timeout = setTimeout(() => {
				sidenav.style.transform = "translateX(0%)";
			}, 10);
		});
	}
}
