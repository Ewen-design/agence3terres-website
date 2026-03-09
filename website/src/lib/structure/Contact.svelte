<script>
  let name = "";
  let email = "";
  let message = "";

  const mail = "contact@agence3terres.fr";

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ name, email, message });
    alert("Message envoyé");
  }

  function copyEmail() {
    navigator.clipboard.writeText(mail);
  }
</script>

<section class="contact">

  <div class="background">
    <img src="images/photo.webp" alt="">
    <div class="overlay"></div>
  </div>

  <div class="container">

    <!-- RIGHT SIDE -->
    <div class="right">

      <div class="hero">
        <h1>
          Let’s create<br>
          remarkable.
        </h1>
        <p>
          Chaque collaboration commence par une conversation.
        </p>
      </div>

      <form class="form" on:submit={handleSubmit}>

        <div class="field">
          <input type="text" bind:value={name} required placeholder=" " />
          <label>Votre nom</label>
        </div>

        <div class="field">
          <input type="email" bind:value={email} required placeholder=" " />
          <label>Email</label>
        </div>

        <div class="field">
          <textarea rows="5" bind:value={message} required placeholder=" "></textarea>
          <label>Votre message</label>
        </div>

        <button type="submit">
          Envoyer →
        </button>

      </form>

    </div>

    <!-- LEFT SIDE -->
    <div class="contact-info">

      <div class="socials">
        <a href="#" target="_blank">Instagram</a>
        <a href="#" target="_blank">Linkedin</a>
        <a href="#" target="_blank">Facebook</a>
      </div>

      <div class="email">

        <a href="mailto:contact@agence3terres.fr">
          contact@agence3terres.fr
        </a>

        <button class="copy" on:click={copyEmail}>
          copier
        </button>

      </div>

    </div>

  </div>

</section>

<style>

/* SECTION */

.contact{
  position:relative;
  height:100vh;
  overflow:hidden;
  color:white;
}

/* BACKGROUND */

.background{
  position:absolute;
  inset:0;
  z-index:0;
}

.background img{
  width:100%;
  height:100%;
  object-fit:cover;
}

.overlay{
  position:absolute;
  inset:0;
  background:
  linear-gradient(
  to right,
  rgba(0,0,0,0.8) 0%,
  rgba(0,0,0,0.45) 40%,
  rgba(0,0,0,0.7) 100%
  );
}

/* LAYOUT */

.container{
  position:relative;
  z-index:2;
  height:100%;
  padding:8vh 8vw;
  display:flex;
  justify-content:space-between;
}

/* RIGHT SIDE */

.right{
  width:500px;
  display:flex;
  flex-direction:column;
  margin-top:4vh; /* descend le bloc */
}

/* HERO */

.hero{
  margin-bottom:40px;
}

.hero h1{
  font-family:'Aboreto', serif;
  font-size:clamp(2.5rem,4vw,3.5rem);
  line-height:1.2;
  font-weight:400;
}

.hero p{
  margin-top:15px;
  opacity:0.75;
}

/* FORM */

.form{

  backdrop-filter:blur(20px);
  background:rgba(255,255,255,0.08);

  padding:50px;

  border-radius:3px;

  box-shadow:
  0 20px 60px rgba(0,0,0,0.3);

  border:0px solid rgba(255,255,255,0.15);
}

/* FIELDS */

.field{
  position:relative;
  margin-bottom:35px;
}

input,
textarea{
  width:100%;
  border:none;
  border-bottom:1px solid rgba(255,255,255,0.4);
  background:transparent;
  padding:10px 0;
  font-size:1rem;
  outline:none;
  color:white;
}

label{
  position:absolute;
  left:0;
  top:10px;
  font-size:0.9rem;
  opacity:0.6;
  transition:all .3s ease;
  pointer-events:none;
}

input:focus + label,
input:not(:placeholder-shown) + label,
textarea:focus + label,
textarea:not(:placeholder-shown) + label{
  top:-14px;
  font-size:0.7rem;
  opacity:0.8;
}

/* BUTTON */

.form button{
  margin-top:10px;
  padding:14px 30px;
  border:1px solid white;
  background:transparent;
  color:white;
  cursor:pointer;
  letter-spacing:2px;
  transition:all .3s ease;
}

.form button:hover{
  background:white;
  color:black;
}

/* LEFT SIDE CONTACT */

.contact-info{
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
}

/* SOCIALS */

.socials{
  display:flex;
  gap:30px;
  margin-bottom:20px;
}

.socials a{
  font-size:1.1rem;
  text-decoration:none;
  color:white;
  opacity:0.85;
  transition:opacity .3s;
}

.socials a:hover{
  opacity:1;
}

/* EMAIL */

.email{
  display:flex;
  align-items:center;
  gap:16px;
}

.email a{
  font-family:'Aboreto', serif;
  font-size:clamp(1.8rem,2.5vw,2.5rem);
  text-decoration:none;
  color:white;
}

.copy{
  font-size:0.85rem;
  padding:8px 12px;
  border:1px solid rgba(255,255,255,0.6);
  background:transparent;
  color:white;
  cursor:pointer;
  transition:all .3s;
}

.copy:hover{
  background:white;
  color:black;
}

/* RESPONSIVE */

@media (max-width:1000px){

.container{
  flex-direction:column;
  gap:60px;
}

.right{
  width:100%;
}

}

</style>