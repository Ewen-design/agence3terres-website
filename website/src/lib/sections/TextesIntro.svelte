<script>
	import { onMount, onDestroy } from "svelte";
	import { registerParallax, unregisterParallax } from "../scrollEngine.js";

	let section;
	let leftWrapper;
	let rightWrapper;
	let bgText;
	let bgLayer;

	let sectionMetrics = null;
	let isMobile = false;

	const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

	function checkMobile() {
		isMobile = window.innerWidth <= 900;
	}

	function measure() {
		if (!section) return;

		const scrollY = window.scrollY;
		const sectionRect = section.getBoundingClientRect();

		sectionMetrics = {
			top: sectionRect.top + scrollY,
			height: sectionRect.height
		};
	}

	function resetMobileTransforms() {
		if (bgLayer) bgLayer.style.transform = `translate3d(0, 0, 0)`;

		if (bgText) {
			bgText.style.transform = `translate3d(0, 0, 0)`;
			bgText.style.opacity = isMobile ? 1 : 0.9;
		}

		if (leftWrapper) leftWrapper.style.transform = `translate3d(0, 0, 0)`;
		if (rightWrapper) rightWrapper.style.transform = `translate3d(0, 0, 0)`;
	}

	function updateParallax(scrollY) {
		if (!section || !sectionMetrics) return;

		if (isMobile) {
			resetMobileTransforms();
			return;
		}

		const winH = window.innerHeight;
		const sectionCenter = sectionMetrics.top - scrollY + sectionMetrics.height / 2;
		const sectionProgress = clamp((sectionCenter - winH / 2) / winH, -1, 1);

		if (bgLayer) {
			const bgSpeed = -400;
			const bgOffset = sectionProgress * bgSpeed;
			bgLayer.style.transform = `translate3d(0, ${bgOffset}px, 0)`;
		}

		if (bgText) {
			const textSpeed = -24;
			const textOffset = sectionProgress * textSpeed;
			const fade = clamp(1 - Math.abs(sectionProgress) * 1.15, 0, 1);

			bgText.style.transform = `translate3d(0, ${textOffset}px, 0)`;
			bgText.style.opacity = fade;
		}

		if (leftWrapper) {
			const rect = leftWrapper.getBoundingClientRect();
			const center = rect.top + rect.height / 2;
			const progress = clamp((center - winH / 2) / winH, -1, 1);
			const speed = -140;
			const offset = progress * speed;

			leftWrapper.style.transform = `translate3d(0, ${offset}px, 0)`;
		}

		if (rightWrapper) {
			const rect = rightWrapper.getBoundingClientRect();
			const center = rect.top + rect.height / 2;
			const progress = clamp((center - winH / 2) / winH, -1, 1);
			const speed = -40;
			const offset = progress * speed;

			rightWrapper.style.transform = `translate3d(0, ${offset}px, 0)`;
		}
	}

	function handleResize() {
		checkMobile();
		measure();
		resetMobileTransforms();
	}

	onMount(() => {
		checkMobile();
		measure();
		resetMobileTransforms();

		window.addEventListener("resize", handleResize);
		window.addEventListener("load", handleResize);

		registerParallax(updateParallax);
	});

	onDestroy(() => {
		unregisterParallax(updateParallax);
		window.removeEventListener("resize", handleResize);
		window.removeEventListener("load", handleResize);
	});
</script>

<section class="creative-section" bind:this={section}>
	<div class="bg-wrap">
		<div class="bg-layer" bind:this={bgLayer}>
			<div class="bg-text" bind:this={bgText}>
				<div>L'agence</div>
				<div>créative</div>
				<div>d'expériences</div>
				<div class="accent">SINGULIÈRES</div>
			</div>
		</div>
	</div>

	<div class="panels">
		<div class="panel-wrapper left-wrap" bind:this={leftWrapper}>
			<div class="panel left">
				<p>
					<i><b>L’artisanat d’émotions</b></i>
				</p>
			</div>
		</div>

		<div class="panel-wrapper right-wrap" bind:this={rightWrapper}>
			<div class="panel right">
				<p>
					3 Terres est une agence de création d’expériences de marque.
					Nous façonnons des univers singuliers, à la croisée du design,
					de la technologie et de la narration, pour faire vivre les marques autrement.
					Nous croyons que chaque projet mérite une vision créative forte,
					pensée pour générer de l’émotion et du sens.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
.creative-section {
	position: relative;
	min-height: 140vh;
	overflow: hidden;
	background: linear-gradient(
		to bottom,
		#f5f6f7 0%,
		#eef1f4 100%
	);
}

.bg-wrap {
	position: absolute;
	inset: 0;
	overflow: hidden;
	z-index: 0;
}

.bg-layer {
	position: absolute;
	top: -14%;
	left: 0;
	width: 100%;
	height: 128%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(
		to bottom,
		#f5f6f7 0%,
		#eef1f4 100%
	);
	will-change: transform;
	transform: translate3d(0, 0, 0);
}

.bg-text {
	font-family: "Aboreto", serif;
	color: #1a1a1a;
	font-size: clamp(3rem, 6vw, 6rem);
	line-height: 1.05;
	text-align: center;
	letter-spacing: 0.04em;
	will-change: transform, opacity;
	transform: translate3d(0, 0, 0);
	opacity: 0.9;
}

.bg-text div {
	margin: 0.3rem 0;
}

.accent {
	font-family: "Playfair Display", serif;
	font-style: italic;
	background: linear-gradient(
		to right,
		#e8d7b5,
		#d4b483,
		#b89b6b
	);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.panels {
	position: relative;
	z-index: 2;
	display: grid;
	grid-template-columns: 1fr 2fr;
	gap: 4rem;
	max-width: 1050px;
	margin: 0 auto;
	padding: 55vh 2rem 35vh;
	align-items: start;
}

.panel-wrapper {
	will-change: transform;
	transform: translate3d(0, 0, 0);
}

.panel {
	background: rgba(255, 255, 255, 0.35);
	backdrop-filter: blur(8px);
	-webkit-backdrop-filter: blur(8px);
	border-radius: 3px;
	box-shadow: 0 10px 40px rgba(0,0,0,0.05);
	height: fit-content;
}

.panel.left {
	padding: 1rem;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	font-family: "Playfair Display", serif;
	font-size: 1.6rem;
	line-height: 1.4;
	color: #111;
}

.panel.right {
	padding: 2rem;
	font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
	font-size: 1.05rem;
	line-height: 1.8;
	color: #505050;
}

@media (max-width: 900px) {
	.creative-section {
		min-height: 100vh;
		min-height: 100svh;
		height: 100vh;
		height: 100svh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
		padding: 0;
	}

	.bg-wrap {
		position: relative;
		inset: auto;
		overflow: visible;
		z-index: 1;
		flex: 0 0 auto;
	}

	.bg-layer {
		position: relative;
		top: auto;
		left: auto;
		width: 100%;
		height: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		transform: none !important;
		will-change: auto;
		padding: 0;
	}

	.bg-text {
		position: relative;
		width: min(100%, 680px);
		margin: 0 auto;
		padding: 0 1rem;
		font-size: clamp(3rem, 15vw, 5.8rem);
		line-height: 0.92;
		text-align: center;
		letter-spacing: 0.01em;
		opacity: 1 !important;
		transform: none !important;
	}

	.bg-text div {
		margin: 0 0 0.1em;
	}

	.panels {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		max-width: 100%;
		width: 100%;
		margin: 0;
		padding: 1.75rem 1rem 0;
	}

	.panel-wrapper {
		transform: none !important;
		will-change: auto;
		width: 100%;
		max-width: 680px;
	}

	.left-wrap {
		margin-bottom: 1.5rem;
	}

	.right-wrap {
		margin-bottom: 0;
	}

	.panel {
		background: transparent;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		box-shadow: none;
		border-radius: 0;
	}

	.panel.left {
		padding: 0;
		display: block;
		text-align: center;
		font-family: "Playfair Display", serif;
		font-size: 1rem;
		line-height: 1.2;
		color: #111;
	}

	.panel.left p {
		margin: 0;
	}

	.panel.right {
		padding: 0;
		text-align: center;
		font-size: 1rem;
		line-height: 1.58;
		color: #666;
		max-width: 30rem;
		margin: 0 auto;
	}

	.panel.right p {
		margin: 0;
	}
}

@media (max-width: 640px) {
	.bg-text {
		width: min(100%, 560px);
		padding: 0 0.95rem;
		font-size: clamp(2.65rem, 15vw, 4.8rem);
		line-height: 0.93;
	}

	.panels {
		padding: 1.45rem 0.95rem 0;
	}

	.panel-wrapper {
		max-width: 560px;
	}

	.left-wrap {
		margin-bottom: 1.25rem;
	}

	.panel.left {
		font-size: 0.92rem;
	}

	.panel.right {
		font-size: 0.93rem;
		line-height: 1.56;
		max-width: 27rem;
	}
}

@media (max-width: 420px) {
	.bg-text {
		width: 100%;
		padding: 0 0.8rem;
		font-size: clamp(2.35rem, 14.5vw, 4rem);
		line-height: 0.94;
	}

	.panels {
		padding: 1.2rem 0.8rem 0;
	}

	.panel-wrapper {
		max-width: 100%;
	}

	.left-wrap {
		margin-bottom: 1rem;
	}

	.panel.left {
		font-size: 0.86rem;
	}

	.panel.right {
		font-size: 0.89rem;
		line-height: 1.55;
		max-width: 100%;
	}
}
</style>