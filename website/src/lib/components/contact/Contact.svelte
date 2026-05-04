<script>
  import { onDestroy } from "svelte";

  let name = "";
  let email = "";
  let message = "";

  const mail = "contact@agence3terres.com";

  const socialLinks = [
    {
      href: "/",
      label: "Instagram",
      icon: "/images/instagram.png",
      className: "icon-instagram"
    },
    {
      href: "/",
      label: "Facebook",
      icon: "/images/facebook.png",
      className: "icon-facebook"
    },
    {
      href: "/",
      label: "X",
      icon: "/images/X.png",
      className: "icon-x"
    }
  ];

  let activeTab = "inquiries";
  let previousTab = null;
  let isSwitching = false;
  let nextVisible = false;
  let copied = false;
  let switchTimer;
  let revealTimer;
  let copyTimer;

  function handleSubmit(event) {
    event.preventDefault();
    console.log({ name, email, message });
    alert("Message envoyé");
  }

  function handleButtonMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function setTab(tab) {
    if (tab === activeTab) return;

    clearTimeout(switchTimer);
    clearTimeout(revealTimer);

    previousTab = activeTab;
    activeTab = tab;
    isSwitching = true;
    nextVisible = false;

    revealTimer = setTimeout(() => {
      nextVisible = true;
    }, 90);

    switchTimer = setTimeout(() => {
      previousTab = null;
      isSwitching = false;
      nextVisible = false;
    }, 820);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(mail);
      copied = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copied = false;
      }, 1800);
    } catch (error) {
      console.error(error);
    }
  }

  onDestroy(() => {
    clearTimeout(switchTimer);
    clearTimeout(revealTimer);
    clearTimeout(copyTimer);
  });
</script>

<section class="contact">
  <div class="background">
    <img src="/images/telephone2.webp" alt="" />
    <div class="overlay"></div>
  </div>

  <div class="container">
    <div class="right">
      <div class="hero">
        <h1>
          Parlons<br />
          de&nbsp;votre&nbsp;projet.
        </h1>
        <p>
          Chaque collaboration commence par une conversation claire, directe et bien cadrée.
        </p>
      </div>

      <div class="form-shell">
        <form id="contact-form" class="form" on:submit={handleSubmit}>
          <div class="field">
            <input id="contact-name" type="text" bind:value={name} required placeholder=" " />
            <label for="contact-name">Votre nom</label>
          </div>

          <div class="field">
            <input id="contact-email" type="email" bind:value={email} required placeholder=" " />
            <label for="contact-email">Email</label>
          </div>

          <div class="field">
            <textarea id="contact-message" rows="5" bind:value={message} required placeholder=" "></textarea>
            <label for="contact-message">Votre message</label>
          </div>
        </form>

        <button
          type="submit"
          form="contact-form"
          class="nav-btn submit-btn"
          data-cursor="button"
          on:mousemove={handleButtonMove}
        >
          <span class="nav-btn-flip" data-text="Envoyer">
            <span class="nav-btn-text">Envoyer</span>
          </span>
        </button>
      </div>
    </div>

    <div class="contact-info">
      <div class="tabs" role="tablist" aria-label="Informations de contact">
        {#each [
          { key: "inquiries", text: "Contact" },
          { key: "socials", text: "Nous suivre" },
          { key: "location", text: "Nous trouver" }
        ] as tab}
          <button
            class="nav-btn tab-btn"
            class:is-active={activeTab === tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
            id={`tab-${tab.key}`}
            data-cursor="button"
            on:mousemove={handleButtonMove}
            on:click={() => setTab(tab.key)}
          >
            <span class="nav-btn-flip" data-text={tab.text}>
              <span class="nav-btn-text">{tab.text}</span>
            </span>
          </button>
        {/each}
      </div>

      <div class="content-stage">
        {#if previousTab}
          <div
            class="panel panel-out"
            role="tabpanel"
            id={`panel-${previousTab}`}
            aria-labelledby={`tab-${previousTab}`}
          >
            {#if previousTab === "inquiries"}
              <div class="email-panel">
                <a class="headline-link" href={`mailto:${mail}`}>{mail}</a>
                <button
                  type="button"
                  class="nav-btn copy-btn"
                  class:has-label={copied}
                  aria-label={copied ? "Email copié" : "Copier l'adresse email"}
                  data-cursor="button"
                  on:mousemove={handleButtonMove}
                  on:click={copyEmail}
                >
                  {#if copied}
                    <span class="nav-btn-flip" data-text="Copié">
                      <span class="nav-btn-text">Copié</span>
                    </span>
                  {:else}
                    <span class="copy-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false">
                        <path
                          d="M9 4h10v10H9zM5 8h10v10H5z"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.75"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                  {/if}
                </button>
              </div>
            {:else if previousTab === "socials"}
              <div class="socials-group">
                {#each socialLinks as social}
                  <a
                    class="social-link"
                    href={social.href}
                    aria-label={social.label}
                    data-cursor="button"
                    on:mousemove={handleButtonMove}
                    on:click|preventDefault
                  >
                    <img src={social.icon} alt={social.label} class={`icon ${social.className}`} />
                  </a>
                {/each}
              </div>
            {:else}
              <p class="headline">Paris, France</p>
            {/if}
          </div>
        {/if}

        <div
          class="panel panel-in"
          class:is-visible={!isSwitching || nextVisible}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {#if activeTab === "inquiries"}
            <div class="email-panel">
              <a class="headline-link" href={`mailto:${mail}`}>{mail}</a>
              <button
                type="button"
                class="nav-btn copy-btn"
                class:has-label={copied}
                aria-label={copied ? "Email copié" : "Copier l'adresse email"}
                data-cursor="button"
                on:mousemove={handleButtonMove}
                on:click={copyEmail}
              >
                {#if copied}
                  <span class="nav-btn-flip" data-text="Copié">
                    <span class="nav-btn-text">Copié</span>
                  </span>
                {:else}
                  <span class="copy-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path
                        d="M9 4h10v10H9zM5 8h10v10H5z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.75"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                {/if}
              </button>
            </div>
          {:else if activeTab === "socials"}
            <div class="socials-group">
              {#each socialLinks as social}
                <a
                  class="social-link"
                  href={social.href}
                  aria-label={social.label}
                  data-cursor="button"
                  on:mousemove={handleButtonMove}
                  on:click|preventDefault
                >
                  <img src={social.icon} alt={social.label} class={`icon ${social.className}`} />
                </a>
              {/each}
            </div>
          {:else}
            <p class="headline">Paris, France</p>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <p class="contact-legal">
    Agence 3 Terres — Tous droits réservés — Mentions légales
  </p>
</section>

<style>
  .contact {
    --contact-left-pad: clamp(1.5rem, 6vw, 8vw);
    --contact-right-pad: clamp(0.75rem, 1.8vw, 1.6rem);
    --contact-bottom-pad: clamp(1.6rem, 3vw, 2.4rem);
    --contact-top-pad: clamp(5.5rem, 8vh, 7rem);
    --contact-panel-width: min(45vw, 660px);
    --contact-panel-gap: var(--contact-right-pad);
    position: relative;
    min-height: 100svh;
    overflow: hidden;
    color: white;
    background: #050505;
  }

  .contact::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: var(--contact-panel-width);
    background: #050505;
    z-index: 1;
  }

  .contact-legal {
    display: none;
  }

  .background {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .background img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        to right,
        rgba(0, 0, 0, 0.16) 0%,
        rgba(0, 0, 0, 0.12) 36%,
        rgba(0, 0, 0, 0.62) 100%
      );
  }

  .container {
    position: relative;
    z-index: 2;
    min-height: 100svh;
    box-sizing: border-box;
    padding: var(--contact-top-pad) var(--contact-right-pad) var(--contact-bottom-pad) var(--contact-left-pad);
    display: grid;
    grid-template-columns:
      minmax(0, calc(var(--contact-panel-width) - var(--contact-left-pad) - var(--contact-right-pad)))
      minmax(20rem, 34rem);
    justify-content: start;
    column-gap: var(--contact-panel-gap);
  }

  .right {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }

  .hero {
    margin-bottom: 2rem;
  }

  .form-shell {
    --contact-surface: rgba(255, 255, 255, 0.055);
    --contact-surface-hover: rgba(255, 255, 255, 0.075);
    width: min(100%, 30rem);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero h1 {
    font-family: "Clash Display", sans-serif;
    font-size: clamp(2.8rem, 4.8vw, 4.6rem);
    line-height: 0.95;
    font-weight: 200;
    letter-spacing: -0.03em;
  }

  .hero p {
    margin-top: 1rem;
    max-width: 28rem;
    font-family: "Clash Display", sans-serif;
     font-weight: 400;
    font-size: 1rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.72);
  }

  .form {
    background: var(--contact-surface);
    padding: clamp(1.3rem, 2.4vw, 2.35rem);
    border-radius: 2px;
    box-shadow: none;
    border: 0px solid rgba(255, 255, 255, 0.12);
    width: 100%;
  }

  .field {
    position: relative;
    margin-bottom: 1.55rem;
  }

  input,
  textarea {
    width: 100%;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.38);
    background: transparent;
    padding: 0.85rem 0;
    font-family: "Clash Display", sans-serif;
    font-size: 1rem;
    outline: none;
    color: white;
  }

  textarea {
    resize: vertical;
    min-height: 6.8rem;
  }

  label {
    position: absolute;
    left: 0;
    top: 0.85rem;
    font-family: "Clash Display", sans-serif;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.58);
    transition: all 0.3s ease;
    pointer-events: none;
  }

  input:focus + label,
  input:not(:placeholder-shown) + label,
  textarea:focus + label,
  textarea:not(:placeholder-shown) + label {
    top: -0.9rem;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.86);
  }

  .contact-info {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    padding-bottom: clamp(0rem, 3vh, 1rem);
    padding-left: 3rem;
    min-width: 0;
    max-width: none;
  }

  .tabs {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
    margin-bottom: 0.15rem;
  }

  .content-stage {
    position: relative;
    min-height: clamp(6.6rem, 9vw, 8.2rem);
    width: 100%;
    overflow: visible;
  }

  .panel {
    min-height: inherit;
    display: flex;
    align-items: flex-end;
    width: max-content;
    max-width: none;
    transition:
      transform 0.98s cubic-bezier(.16,.84,.2,1),
      opacity 0.72s ease,
      filter 0.72s ease;
    will-change: transform, opacity;
  }

  .panel-in {
    position: relative;
    transform: translateY(116%);
    opacity: 0;
    filter: blur(12px);
  }

  .panel-in.is-visible {
    transform: translateY(0%);
    opacity: 1;
    filter: blur(0);
  }

  .panel-out {
    position: absolute;
    inset: 0;
    transform: translateY(0%);
    opacity: 1;
    filter: blur(0);
  }

  .panel-out .email-panel,
  .panel-out .headline,
  .panel-out .socials-group {
    transform: translateY(-72%);
    opacity: 0;
    transition:
      transform 0.98s cubic-bezier(.16,.84,.2,1),
      opacity 0.72s ease,
      filter 0.72s ease;
    filter: blur(12px);
  }

  .email-panel {
    display: grid;
    grid-template-columns: max-content auto;
    align-items: center;
    justify-content: flex-start;
    column-gap: 0.8rem;
    width: max-content;
    max-width: none;
    min-width: max-content;
  }

  .headline,
  .headline-link {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(1.55rem, 3.65vw, 3.9rem);
    font-weight: 500;
    line-height: 0.94;
    letter-spacing: -0.045em;
    color: #ffffff;
    text-decoration: none;
    white-space: nowrap;
  }

  .headline-link {
    max-width: none;
    min-width: auto;
  }

  .email-panel .headline-link {
    font-size: clamp(1.55rem, 3.35vw, 3.55rem);
    line-height: 0.96;
    white-space: nowrap;
  }

  .socials-group {
    display: flex;
    align-items: center;
    gap: clamp(0.9rem, 1.5vw, 1.2rem);
  }

  .social-link {
    position: relative;
    width: clamp(3.6rem, 5vw, 4.8rem);
    height: clamp(3.6rem, 5vw, 4.8rem);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition:
      transform 0.35s cubic-bezier(.22,.61,.36,1),
      background 0.35s ease,
      border-color 0.35s ease,
      box-shadow 0.35s ease;
  }

  .social-link:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.24);
  }

  .social-link::before,
  .social-link::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .social-link::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(235, 232, 255, 1) 0%,
      rgba(210, 210, 230, 0.98) 22%,
      rgba(130, 110, 220, 0.62) 45%,
      rgba(35, 30, 95, 0.14) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .social-link::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(150, 140, 230, 0.42) 0%,
      rgba(130, 110, 220, 0.18) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .social-link:hover::before,
  .social-link:hover::after {
    opacity: 1;
  }

  .nav-btn {
    font-family: "Clash Display", sans-serif;
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: inherit;
    border: 0px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1),
      color 0.45s cubic-bezier(.22,.61,.36,1),
      border-color 0.45s cubic-bezier(.22,.61,.36,1);
  }

  .tab-btn.is-active {
    background: #f2f0ec;
    color: #0d0d0d;
    border-color: rgba(255, 255, 255, 0.5);
  }

  .submit-btn {
    margin-top: 1rem;
    padding: 0 1.5rem;
    background: var(--contact-surface);
  }

  .submit-btn:hover {
    background: var(--contact-surface-hover);
  }

  .copy-btn {
    flex: 0 0 auto;
    min-width: 36px;
    width: 36px;
    padding: 0;
    margin-bottom: 0;
    position: relative;
    z-index: 1;
  }

  .copy-btn.has-label {
    min-width: 5.1rem;
    padding: 0 0.85rem;
  }

  .copy-icon {
    width: 1.15rem;
    height: 1.15rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .copy-icon svg {
    width: 100%;
    height: 100%;
    display: block;
    overflow: visible;
    stroke: currentColor;
    vector-effect: non-scaling-stroke;
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
    white-space: nowrap;
    color: inherit;
  }

  .nav-btn:hover .nav-btn-text,
  .tab-btn.is-active .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after,
  .tab-btn.is-active .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .nav-btn::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(235, 232, 255, 1) 0%,
      rgba(210, 210, 230, 0.98) 22%,
      rgba(130, 110, 220, 0.62) 45%,
      rgba(35, 30, 95, 0.14) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .nav-btn::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(150, 140, 230, 0.42) 0%,
      rgba(130, 110, 220, 0.18) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after,
  .tab-btn.is-active::before,
  .tab-btn.is-active::after {
    opacity: 1;
  }

  .icon {
    display: block;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .icon-instagram {
    width: clamp(1.55rem, 2vw, 2rem);
    height: clamp(1.55rem, 2vw, 2rem);
  }

  .icon-facebook {
    width: clamp(1.35rem, 1.8vw, 1.8rem);
    height: clamp(1.35rem, 1.8vw, 1.8rem);
  }

  .icon-x {
    width: clamp(1.4rem, 1.9vw, 1.85rem);
    height: clamp(1.4rem, 1.9vw, 1.85rem);
  }

  @media (max-width: 1000px) {
    .contact::before {
      width: min(50vw, 580px);
    }

    .contact,
    .container {
      height: auto;
      min-height: 100vh;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 3rem;
      justify-content: flex-start;
    }

    .right,
    .contact-info {
      width: 100%;
    }

    .contact-info {
      padding-bottom: 0;
      padding-left: 0;
      max-width: none;
    }

    .content-stage {
      min-height: clamp(9rem, 24vw, 12rem);
    }
  }

  @media (max-width: 768px) {
    .contact {
      min-height: 200svh;
      overflow: clip;
    }

    .contact::before {
      inset: 80svh 0 0;
      width: auto;
      background: #050505;
    }

    .background {
      position: fixed;
      inset: 0;
      height: 100svh;
    }

    .overlay {
      background:
        linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.1) 0%,
          rgba(0, 0, 0, 0.18) 48%,
          rgba(0, 0, 0, 0.56) 100%
        );
    }

    .container {
      min-height: 200svh;
    }

    .container {
      display: flex;
      flex-direction: column;
      padding:
        0
        1.05rem
        calc(env(safe-area-inset-bottom, 0px) + 1.4rem);
      align-items: stretch;
      gap: 0;
    }

    .right {
      display: contents;
    }

    .hero,
    .contact-info,
    .form-shell {
      width: min(100%, 32rem);
      position: relative;
      z-index: 3;
    }

    .hero {
      order: 1;
      min-height: 116svh;
      margin: 0;
      padding:
        calc(env(safe-area-inset-top, 0px) + 80vh)
        0
        1.4rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: clamp(4rem, 8svh, 6.5rem);
      text-align: left;
      background: transparent;
    }

    .contact-info {
      order: 2;
      margin: -1.5rem 0 2rem auto;
      justify-content: flex-start;
      align-items: flex-end;
      text-align: right;
      margin-top: 2rem;
      padding-bottom: 0;
      padding-left: 0;
      background: transparent;
    }

    .form-shell {
      order: 3;
      margin: 1rem auto 0 0;
      align-items: stretch;
      background: transparent;
    }

    .hero h1 {
      font-size: clamp(2.95rem, 10.8vw, 3.75rem);
      max-width: 9ch;
    }

    .hero p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.42;
      max-width: 16rem;
      color: rgba(255, 255, 255, 0.76);
    }

    .form {
      padding: 1rem 1rem 0.8rem;
      background: transparent;
      border-color: rgba(255, 255, 255, 0.14);
    }

    .field {
      margin-bottom: 1rem;
    }

    input,
    textarea {
      padding: 0.72rem 0;
      font-size: 0.95rem;
    }

    textarea {
      min-height: 4.8rem;
    }

    label {
      top: 0.72rem;
      font-size: 0.84rem;
    }

    .nav-btn {
      padding: 0 1.15rem;
      font-size: 0.84rem;
    }

    .submit-btn {
      margin-top: 0.8rem;
      align-self: flex-start;
    }

    .headline,
    .headline-link {
      font-size: clamp(1.2rem, 6.1vw, 2.3rem);
      line-height: 0.98;
    }

    .email-panel {
      width: 100%;
      justify-content: flex-end;
      align-items: center;
      column-gap: 0.45rem;
    }

    .email-panel .headline-link {
      font-size: clamp(1.2rem, 6.1vw, 2.3rem);
      text-align: right;
    }

    .content-stage {
      min-height: 5.1rem;
      display: flex;
      justify-content: flex-end;
      overflow: hidden;
    }

    .panel {
      width: 100%;
      max-width: 100%;
      justify-content: flex-end;
    }

    .tabs,
    .socials-group {
      justify-content: flex-end;
    }

    .socials-group {
      width: 100%;
    }

    .headline {
      width: 100%;
      text-align: right;
    }

    .tabs {
      gap: 0.55rem;
      margin-bottom: 1.4rem;
      justify-content: flex-end;
    }

    .copy-btn {
      width: 40px;
      min-width: 40px;
      height: 40px;
    }

    .copy-icon {
      width: 1.2rem;
      height: 1.2rem;
      flex: 0 0 auto;
    }

    .form {
      text-align: left;
    }

    .contact-legal {
      display: block;
      position: absolute;
      left: 50%;
      bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);
      transform: translateX(-50%);
      width: min(100% - 2.1rem, 30rem);
      margin: 0;
      z-index: 4;
      font-family: "Clash Display", sans-serif;
      font-size: 0.76rem;
      color: rgba(255, 255, 255, 0.42);
      text-align: center;
      line-height: 1.4;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel,
    .panel-out .email-panel,
    .panel-out .headline,
    .panel-out .socials-group,
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after,
    .nav-btn::before,
    .nav-btn::after,
    .social-link,
    label {
      transition: none;
    }

    .panel-in,
    .panel-in.is-visible,
    .panel-out {
      transform: none;
      opacity: 1;
    }
  }
</style>
