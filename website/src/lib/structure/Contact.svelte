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
    if (tab === activeTab || isSwitching) return;

    clearTimeout(switchTimer);
    clearTimeout(revealTimer);

    previousTab = activeTab;
    activeTab = tab;
    isSwitching = true;
    nextVisible = false;

    revealTimer = setTimeout(() => {
      nextVisible = true;
    }, 110);

    switchTimer = setTimeout(() => {
      previousTab = null;
      isSwitching = false;
      nextVisible = false;
    }, 1040);
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
          de votre projet.
        </h1>
        <p>
          Chaque collaboration commence par une conversation claire, directe et bien cadrée.
        </p>
      </div>

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
</section>

<style>
  .contact {
    position: relative;
    height: 100vh;
    overflow: hidden;
    color: white;
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
        rgba(0, 0, 0, 0.82) 0%,
        rgba(0, 0, 0, 0.46) 40%,
        rgba(0, 0, 0, 0.74) 100%
      );
  }

  .container {
    position: relative;
    z-index: 2;
    height: 100vh;
    box-sizing: border-box;
    padding: clamp(5.5rem, 8vh, 7rem) clamp(1.5rem, 6vw, 8vw) clamp(1.6rem, 3vw, 2.4rem);
    display: flex;
    justify-content: space-between;
    gap: clamp(3rem, 7vw, 7rem);
  }

  .right {
    width: min(100%, 520px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }

  .hero {
    margin-bottom: 2rem;
  }

  .hero h1 {
    font-family: "Titre", serif;
    font-size: clamp(2.8rem, 4.8vw, 4.6rem);
    line-height: 0.95;
    font-weight: 400;
    letter-spacing: -0.03em;
  }

  .hero p {
    margin-top: 1rem;
    max-width: 34rem;
    font-family: "General Sans", sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.72);
  }

  .form {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.08);
    padding: clamp(1.3rem, 2.4vw, 2.35rem);
    border-radius: 2px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.08);
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
    font-family: "General Sans", sans-serif;
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
    font-family: "General Sans", sans-serif;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    padding-bottom: clamp(0rem, 3vh, 1rem);
    min-width: 0;
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
    overflow: hidden;
  }

  .panel {
    min-height: inherit;
    display: flex;
    align-items: flex-end;
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
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: nowrap;
    max-width: 100%;
  }

  .headline,
  .headline-link {
    margin: 0;
    font-family: "General Sans", sans-serif;
    font-size: clamp(1.55rem, 3.65vw, 3.9rem);
    font-weight: 500;
    line-height: 0.94;
    letter-spacing: -0.045em;
    color: #f5f2eb;
    text-decoration: none;
    white-space: nowrap;
  }

  .headline-link {
    max-width: 100%;
  }

  .email-panel .headline-link {
    font-size: clamp(1.55rem, 3.35vw, 3.55rem);
    line-height: 0.96;
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
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.08);
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
    background: rgba(255, 255, 255, 0.12);
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
    font-family: "General Sans", sans-serif;
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    white-space: nowrap;
    color: inherit;
    border: 1px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.10);
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
  }

  .copy-btn {
    flex: 0 0 auto;
    min-width: 36px;
    width: 36px;
    padding: 0;
    margin-bottom: 0;
  }

  .copy-btn.has-label {
    width: auto;
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
    .contact,
    .container {
      height: auto;
      min-height: 100vh;
    }

    .container {
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
    }

    .content-stage {
      min-height: clamp(9rem, 24vw, 12rem);
    }
  }

  @media (max-width: 768px) {
    .container {
      flex-direction: column;
      padding-left: 1.1rem;
      padding-right: 1.1rem;
      gap: 2rem;
      align-items: center;
    }

    .right,
    .contact-info {
      align-items: center;
      text-align: center;
    }

    .contact-info {
      justify-content: flex-start;
    }

    .hero h1 {
      font-size: clamp(2.2rem, 11vw, 3.6rem);
    }

    .hero p {
      font-size: 0.95rem;
      margin-left: auto;
      margin-right: auto;
    }

    .nav-btn {
      padding: 0 1.15rem;
      font-size: 0.84rem;
    }

    .headline,
    .headline-link {
      font-size: clamp(1.2rem, 6.1vw, 2.3rem);
      line-height: 0.98;
    }

    .email-panel {
      align-items: center;
      flex-direction: column;
      gap: 0.65rem;
    }

    .email-panel .headline-link {
      font-size: clamp(1.2rem, 6.1vw, 2.3rem);
    }

    .content-stage {
      min-height: 6.2rem;
      display: flex;
      justify-content: center;
    }

    .tabs,
    .socials-group {
      justify-content: center;
    }

    .form {
      text-align: left;
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
