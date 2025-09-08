export async function loadContent() {
	// Load navigation
	const navResp = await fetch('assets/html/navigation.html');
	document.querySelector('#nav').innerHTML = await navResp.text();

	// Load header
	const headerResp = await fetch('assets/html/header.html');
	document.querySelector('#header').innerHTML = await headerResp.text();

	// Load footer
	const footerResp = await fetch('assets/html/footer.html');
	document.querySelector('#footer').innerHTML = await footerResp.text();

	// Hook up hamburger toggle
	const hamburger = document.getElementById('hamburger');
	if (hamburger) {
		hamburger.addEventListener('click', () => {
			document.getElementById('nav-links').classList.toggle('show');
		});
	}

	// highlight current page
	const currentPage = window.location.pathname.split("/").pop();
	const navContainer = document.getElementById('nav');
	const navLinks = navContainer.querySelectorAll("a");

	navLinks.forEach(link => {
		if (link.getAttribute("href") === currentPage) {
			link.parentElement.classList.add("current");
		}
	});
}
