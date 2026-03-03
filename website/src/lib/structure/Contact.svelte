<script>
  let name = "";
  let email = "";
  let message = "";

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ name, email, message });
    alert("Message envoyé");
  }
</script>

<section class="contact">

  <!-- HERO -->
  <div class="hero">
    <h1>
      Let’s create<br>
      something remarkable.
    </h1>
    <p>
      Chaque collaboration commence par une conversation.
    </p>
  </div>

  <!-- MAIN CONTACT BLOCK -->
  <div class="contact-wrapper">

    <!-- FORM -->
    <form class="form" on:submit={handleSubmit}>

      <div class="field">
        <input type="text" bind:value={name} required />
        <label>Votre nom</label>
      </div>

      <div class="field">
        <input type="email" bind:value={email} required />
        <label>Email</label>
      </div>

      <div class="field">
        <textarea rows="5" bind:value={message} required></textarea>
        <label>Votre message</label>
      </div>

      <button type="submit">
        Envoyer →
      </button>

    </form>

    <!-- SIDE INFO -->
    <div class="info">
      <h2>Contact direct</h2>

      <div class="info-block">
        <span>Email</span>
        <a href="mailto:contact@agence3terres.fr">
          contact@agence3terres.fr
        </a>
      </div>

      <div class="info-block">
        <span>Localisation</span>
        <p>Paris, France</p>
      </div>

      <div class="info-block">
        <span>Disponibilité</span>
        <p>Ouvert à tous vos projets</p>
      </div>

    </div>

  </div>

  <!-- SIGNATURE SECTION -->
  <div class="signature">
    <h2>
      contact@agence3terres.fr
    </h2>
  </div>

</section>

<style>

/* GLOBAL */

.contact {
  background: linear-gradient(to bottom, #ffffff, #f5f5f5);
  color: #111;
  padding: 0 10vw;
  overflow: hidden;
}

/* HERO */

.hero {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero h1 {
  font-family: 'Aboreto', serif;
  font-size: clamp(3rem, 6vw, 6rem);
  line-height: 1.1;
  font-weight: 400;
}

.hero p {
  margin-top: 20px;
  font-size: 1.1rem;
  opacity: 0.6;
}

/* WRAPPER */

.contact-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 100px;
  padding: 100px 0;
}

/* FORM */

.form {
  width: 55%;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(20px);
  padding: 60px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.05);
}

.field {
  position: relative;
  margin-bottom: 40px;
}

input,
textarea {
  width: 100%;
  border: none;
  border-bottom: 1px solid rgba(0,0,0,0.2);
  background: transparent;
  padding: 10px 0;
  font-size: 1rem;
  outline: none;
}

label {
  position: absolute;
  left: 0;
  top: 10px;
  font-size: 0.9rem;
  opacity: 0.5;
  transition: all 0.3s ease;
  pointer-events: none;
}

input:focus + label,
input:not(:placeholder-shown) + label,
textarea:focus + label,
textarea:not(:placeholder-shown) + label {
  top: -15px;
  font-size: 0.7rem;
  opacity: 0.7;
}

button {
  margin-top: 20px;
  padding: 14px 30px;
  border: 1px solid #111;
  background: transparent;
  cursor: pointer;
  letter-spacing: 2px;
  transition: all 0.4s ease;
}

button:hover {
  background: #111;
  color: white;
}

/* INFO */

.info {
  width: 35%;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.info h2 {
  font-family: 'Aboreto', serif;
  font-size: 2rem;
}

.info-block span {
  font-size: 0.8rem;
  letter-spacing: 2px;
  opacity: 0.5;
}

.info-block a,
.info-block p {
  font-size: 1.1rem;
  margin-top: 5px;
  display: block;
}

/* SIGNATURE */

.signature {
  padding: 150px 0 100px 0;
}

.signature h2 {
  font-family: 'Aboreto', serif;
  font-size: clamp(1rem, 5vw, 5rem);
  opacity: 0.05;
  word-break: break-word;
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .contact-wrapper {
    flex-direction: column;
    gap: 60px;
  }

  .form,
  .info {
    width: 100%;
  }
}

</style>