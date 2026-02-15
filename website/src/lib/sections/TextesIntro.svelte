<script>
	import { onMount } from "svelte";
	import gsap from "gsap";
	import ScrollTrigger from "gsap/ScrollTrigger";

	gsap.registerPlugin(ScrollTrigger);

	let leftWrapper;
	let rightWrapper;
	let bgText;

	onMount(() => {

		// Fade titre fond
		gsap.fromTo(
			bgText,
			{ opacity: 0 },
			{
				opacity: 1,
				scrollTrigger: {
					trigger: ".creative-section",
					start: "top 90%",
					end: "top 20%",
					scrub: true
				}
			}
		);

		// Apparition indépendante (SUR WRAPPER)
		gsap.from(leftWrapper, {
			y: 300,
			scrollTrigger: {
				trigger: leftWrapper,
				start: "top 110%",
				scrub: true
			}
		});

		gsap.from(rightWrapper, {
			y: 80,
			scrollTrigger: {
				trigger: rightWrapper,
				start: "top 85%",
				scrub: true
			}
		});

		// PARALLAX FORTEMENT DIFFÉRENCIÉ (SUR WRAPPER)
		gsap.to(leftWrapper, {
			yPercent: -60,
			ease: "none",
			scrollTrigger: {
				trigger: ".panels",
				start: "top bottom",
				end: "bottom top",
				scrub: 3
			}
		});

		gsap.to(rightWrapper, {
			yPercent: -8,
			ease: "none",
			scrollTrigger: {
				trigger: ".panels",
				start: "top bottom",
				end: "bottom top",
				scrub: 1
			}
		});
	});
</script>

<section class="creative-section">
	<div class="bg-fixed">
		<div class="bg-text" bind:this={bgText}>
			<div>L'agence</div>
			<div>créative</div>
			<div>d'expériences</div>
			<div class="accent">SINGULIÈRES</div>
		</div>
	</div>

	<div class="panels">

		<!-- WRAPPER ANIMÉ -->
		<div class="panel-wrapper" bind:this={leftWrapper}>
			<div class="panel left">
				<p>
					<i><b>L’artisanat d’émotions</b></i>
				</p>
			</div>
		</div>

		<!-- WRAPPER ANIMÉ -->
		<div class="panel-wrapper" bind:this={rightWrapper}>
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
@import url("https://fonts.googleapis.com/css2?family=Aboreto&family=Playfair+Display:ital,wght@0,400;1,400&display=swap");

.creative-section {
	position: relative;
	min-height: 140vh;
	background: linear-gradient(
		to bottom,
		#f5f6f7 0%,
		#eef1f4 100%
	);
}

.bg-fixed {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 0;
	background: linear-gradient(
		to bottom,
		#f5f6f7 0%,
		#eef1f4 100%
	);
}

.bg-text {
	font-family: "Aboreto", serif;
	color: #1a1a1a;
	font-size: clamp(3rem, 6vw, 6rem);
	line-height: 1.05;
	text-align: center;
	letter-spacing: .04em;
}

.bg-text div {
	margin: .3rem 0;
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

/* GRID */
.panels {
	position: relative;
	z-index: 2;
	display: grid;
	grid-template-columns: 1fr 2fr;
	gap: 4rem;
	max-width: 1050px;
	margin: 0 auto;
	padding: 28vh 2rem 35vh;
	align-items: start;
}

/* WRAPPER (animé) */
.panel-wrapper {
	will-change: transform;
}

/* BLUR PARFAIT (inchangé) */
.panel {
	background: rgba(255, 255, 255, 0.35);
	backdrop-filter: blur(8px);
	-webkit-backdrop-filter: blur(8px);
	border-radius: 3px;
	box-shadow: 0 10px 40px rgba(0,0,0,0.05);
	
	height: fit-content;
}

/* TITRE */
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

/* TEXTE */
.panel.right {
	padding: 2rem;
	font-family: system-ui, -apple-system, BlinkMacSystemFont,
	"Segoe UI", Roboto, sans-serif;
	font-size: 1.05rem;
	line-height: 1.8;
	color: #505050;
}

@media (max-width: 900px) {
	.panels {
		grid-template-columns: 1fr;
		gap: 3rem;
	}
}
</style>
