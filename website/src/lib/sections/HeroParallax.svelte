<script>
	import { onMount, onDestroy } from "svelte";
	import gsap from "gsap";
	import ScrollTrigger from "gsap/ScrollTrigger";
	import Lenis from "@studio-freight/lenis";

	let lenis;

	let parallaxEl1, parallaxEl2, parallaxEl3;
	let sectionTitleEl1, sectionTitleEl2, sectionTitleEl3;
	let contentEl1, contentEl2, contentEl3;

	function initParallax(parallaxEl) {
		parallaxEl.querySelectorAll("[data-parallax-layers]").forEach((triggerElement) => {
			let tl = gsap.timeline({
				scrollTrigger: {
					trigger: triggerElement,
					start: "0% 0%",
					end: "100% 0%",
					scrub: true
				}
			});

			const layers = [
				{ layer: "1", yPercent: 70 },
				{ layer: "2", yPercent: 55 },
				{ layer: "3", yPercent: 40 },
				{ layer: "4", yPercent: 10 }
			];

			layers.forEach((layerObj, idx) => {
				tl.to(
					triggerElement.querySelectorAll(
						`[data-parallax-layer="${layerObj.layer}"]`
					),
					{
						yPercent: layerObj.yPercent,
						ease: "none"
					},
					idx === 0 ? undefined : "<"
				);
			});
		});
	}

	function fadeTitleAndContent(titleEl, contentEl) {
		gsap.fromTo(
			titleEl,
			{ opacity: 0, y: 40 },
			{
				opacity: 1,
				y: 0,
				scrollTrigger: {
					trigger: titleEl,
					start: "top 80%",
					end: "bottom 20%",
					scrub: true
				}
			}
		);

		gsap.fromTo(
			contentEl,
			{ opacity: 0, y: 60 },
			{
				opacity: 1,
				y: 0,
				scrollTrigger: {
					trigger: contentEl,
					start: "top 85%",
					end: "bottom 20%",
					scrub: true
				}
			}
		);
	}

	// === TRANSITION TYPE CODEPEN ENTRE SECTIONS ===
	function codepenStyleTransitions() {
		const sections = document.querySelectorAll(".parallax");

		sections.forEach((section) => {
			const bgImage = section.querySelector(".parallax__bg-image");
			const bgOverlay = section.querySelector(".parallax__bg-overlay");

			ScrollTrigger.create({
				trigger: section,
				start: "top 90%",
				end: "top 10%",
				scrub: 2, // plus lent = plus fluide
				onUpdate: (self) => {
					let progress = self.progress; // 0 → 1

					// apparition progressive + défloutage
					let opacity = Math.min(1, Math.max(0, progress * 1.2));
					let blur = 25 - opacity * 25; // plus fort au départ

					bgImage.style.opacity = opacity;
					bgImage.style.filter = `blur(${blur}px)`;

					// voile noir plus sombre au début
					bgOverlay.style.opacity = opacity * 1;
				}
			});
		});
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		lenis = new Lenis({ smooth: true });
		lenis.on("scroll", ScrollTrigger.update);

		gsap.ticker.add((time) => {
			lenis.raf(time * 1000);
		});

		gsap.ticker.lagSmoothing(0);

		initParallax(parallaxEl1);
		initParallax(parallaxEl2);
		initParallax(parallaxEl3);

		fadeTitleAndContent(sectionTitleEl1, contentEl1);
		fadeTitleAndContent(sectionTitleEl2, contentEl2);
		fadeTitleAndContent(sectionTitleEl3, contentEl3);

		codepenStyleTransitions();
	});

	onDestroy(() => {
		ScrollTrigger.getAll().forEach((t) => t.kill());
		lenis?.destroy();
	});
</script>

<!-- =================== SECTION 1 — LE LAC =================== -->
<div class="parallax fullbleed" bind:this={parallaxEl1}>
	<div 
	  class="parallax__bg-image"
	  style="background-image:url('https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp')">
	</div>
	<div class="parallax__bg-overlay"></div>

	<section class="parallax__header">
		<div class="parallax__visuals">
			<div data-parallax-layers class="parallax__layers">
				<img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp"
					data-parallax-layer="1"
					class="parallax__layer-img"/>

				<img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795b4d5ac529e7d3a562_osmo-parallax-layer-2.webp"
					data-parallax-layer="2"
					class="parallax__layer-img"/>

				<div data-parallax-layer="3" class="parallax__layer-title">
					<h2 class="parallax__title">
						<span class="title-gold-metal">Le lac</span>
					</h2>
				</div>

				<img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795bb5aceca85011ad83_osmo-parallax-layer-1.webp"
					data-parallax-layer="4"
					class="parallax__layer-img"/>
			</div>

			<div class="parallax__fade"></div>
		</div>
	</section>

	<section class="parallax__section-title" bind:this={sectionTitleEl1}>
		<h2>
			<span class="title-white">Le reflet d’un</span>
			<span class="title-gold-metal"> art</span>
		</h2>
	</section>

	<section class="parallax__content" bind:this={contentEl1}>
		<p>
Dans le silence apaisant d’un lac, chaque détail trouve son écho. Chez 3 Terres, nous nous plaçons comme la surface limpide où se reflète l’essence de votre marque. L’aigle qui se penche vers son reflet symbolise cette vérité : nous sommes le miroir fidèle de votre identité, sublimant ce qui vous rend unique.

Le lac, c’est aussi la promesse d’un partenariat serein, où la confiance est notre boussole et la transparence notre horizon. Ici, tout commence par l’écoute, pour que chaque mouvement créatif soit le prolongement naturel de votre vision.
		</p>
	</section>
</div>

<!-- =================== SECTION 2 — LA VILLE =================== -->
<div class="parallax fullbleed" bind:this={parallaxEl2}>
	<div 
	  class="parallax__bg-image"
	  style="background-image:url('https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp')">
	</div>
	<div class="parallax__bg-overlay"></div>

	<section class="parallax__header">
		<div class="parallax__visuals">
			<div data-parallax-layers class="parallax__layers">
				<img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp"
					data-parallax-layer="1"
					class="parallax__layer-img"/>

				<img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795b4d5ac529e7d3a562_osmo-parallax-layer-2.webp"
					data-parallax-layer="2"
					class="parallax__layer-img"/>

				<div data-parallax-layer="3" class="parallax__layer-title">
					<h2 class="parallax__title">
						<span class="title-gold-metal">La ville</span>
					</h2>
				</div>

				<img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795bb5aceca85011ad83_osmo-parallax-layer-1.webp"
					data-parallax-layer="4"
					class="parallax__layer-img"/>
			</div>

			<div class="parallax__fade"></div>
		</div>
	</section>

	<section class="parallax__section-title" bind:this={sectionTitleEl2}>
		<h2>
			<span class="title-white">Les lumières de la</span>
			<span class="title-gold-metal"> création</span>
		</h2>
	</section>

	<section class="parallax__content" bind:this={contentEl2}>
		<p>
Au cœur de la ville, l’aigle déploie ses ailes entre lignes d’architectures et éclats de lumière. Cet univers urbain est le théâtre de notre créativité : élégant, moderne, vibrant. 3 Terres puise dans l’énergie de la ville l’audace d’inventer, de façonner des univers visuels qui marient esthétisme et ingéniosité.

Ici, chaque projet est pensé comme une œuvre vivante, inspirée par les tendances, mais taillée pour résister au temps. La ville nous enseigne l’art du mouvement et de l’adaptation, et c’est cette pulsation que nous insufflons dans vos campagnes.
		</p>
	</section>
</div>

<!-- =================== SECTION 3 — LA MONTAGNE =================== -->
<div class="parallax fullbleed" bind:this={parallaxEl3}>
	<div 
	  class="parallax__bg-image"
	  style="background-image:url('https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp')">
	</div>
	<div class="parallax__bg-overlay"></div>

	<section class="parallax__header">
		<div class="parallax__visuals">
			<div data-parallax-layers class="parallax__layers">
				<img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp"
					data-parallax-layer="1"
					class="parallax__layer-img"/>

				<img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795b4d5ac529e7d3a562_osmo-parallax-layer-2.webp"
					data-parallax-layer="2"
					class="parallax__layer-img"/>

				<div data-parallax-layer="3" class="parallax__layer-title">
					<h2 class="parallax__title">
						<span class="title-gold-metal">La montagne</span>
					</h2>
				</div>

				<img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795bb5aceca85011ad83_osmo-parallax-layer-1.webp"
					data-parallax-layer="4"
					class="parallax__layer-img"/>
			</div>

			<div class="parallax__fade"></div>
		</div>
	</section>

	<section class="parallax__section-title" bind:this={sectionTitleEl3}>
		<h2>
			<span class="title-white">Les sommets de</span>
			<span class="title-gold-metal"> l’ambition</span>
		</h2>
	</section>

	<section class="parallax__content" bind:this={contentEl3}>
		<p>
Face à la montagne, l’aigle s’élève toujours plus haut, porté par le vent et la volonté. Ce sommet est notre troisième terre : le symbole d’une ambition sans limite. 3 Terres vous accompagne dans l’ascension de vos projets, avec la conviction que chaque défi est une occasion d’aller plus loin, de dépasser l’horizon.

La montagne est exigence et grandeur : elle nous rappelle que le succès se construit par la persévérance, la précision et l’inspiration. Ensemble, nous gravissons les reliefs de votre communication pour atteindre les cimes où votre marque brillera avec force et clarté.
		</p>
	</section>
</div>

<style>

.fullbleed {
	width: 100vw;
	position: relative;
	left: 50%;
	right: 50%;
	margin-left: -50vw;
	margin-right: -50vw;
}

.parallax {
	overflow: hidden;
	background: black;
	position: relative;
}

/* === COUCHE DE TRANSITION TYPE CODEPEN === */
.parallax__bg-image {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	background-size: cover;
	background-position: center;
	opacity: 0;
	filter: blur(25px);
	will-change: opacity, filter;
	z-index: 1;
}

.parallax__bg-overlay {
	position: absolute;
	inset: 0;
	background: black;
	opacity: 0;
	will-change: opacity;
	z-index: 2;
}

/* PARALLAX VISUALS */
.parallax__header {
	min-height: 100svh;
	display: flex;
	position: relative;
	justify-content: center;
	align-items: center;
	z-index: 3;
}

.parallax__visuals {
	width: 100%;
	height: 120%;
	position: absolute;
	top: 0;
	left: 0;
}

.parallax__layers {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	overflow: hidden;
}

.parallax__layer-img {
	object-fit: cover;
	width: 100%;
	height: 117.5%;
	position: absolute;
	top: -17.5%;
	left: 0;
	pointer-events: none;
}

.parallax__layer-title {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100svh;
	position: absolute;
	top: 0;
	left: 0;
}

.parallax__title {
	font-family: "Aboreto", serif;
	font-size: 11vw;
	margin: 0;
	line-height: 1;
	letter-spacing: 0.04em;
	text-shadow: 0 10px 40px rgba(0,0,0,.6);
}

.parallax__fade {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 20%;
	background: linear-gradient(to top, black, transparent);
}

/* TITRES */
.parallax__section-title {
	min-height: 30vh;
	padding-top: 8vh;
	padding-bottom: 2vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: black;
	position: relative;
	z-index: 3;
}

.parallax__section-title h2 {
	font-family: "Aboreto", serif;
	font-size: clamp(2rem, 5vw, 5rem);
	letter-spacing: .08em;
	margin: 0;
}

/* DORÉ MÉTALLIQUE */
.title-white {
	color: white;
}

.title-gold-metal {
	background: linear-gradient(
		to right,
		#f8f1c7 0%,
		#e6c77a 35%,
		#d4af37 55%,
		#b8962e 75%,
		#9c7a1f 100%
	);
	background-size: 200% 100%;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-shadow: 0 2px 6px rgba(212,175,55,.35);
}

/* CONTENT */
.parallax__content {
	min-height: 80svh;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	color: white;
	padding-left: 30%;
	padding-right: 30%;
	box-sizing: border-box;
	padding-top: 2vh;
	background: black;
	position: relative;
	z-index: 3;
}

.parallax__content p {
	font-family: "Playfair Display", serif;
	font-weight: 300;
	font-size: 1.15rem;
	line-height: 1.9;
	text-align: center;
	opacity: .9;
}

@media (max-width: 900px) {
	.parallax__content {
		padding-left: 10%;
		padding-right: 10%;
	}
}
</style>
