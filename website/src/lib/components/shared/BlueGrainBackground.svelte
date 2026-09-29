<!-- Le même fond pour VisionSlider et les cartes de la home.
     Le parent doit être positionné et isolé ; son contenu passe au-dessus
     avec un z-index supérieur à 2. Ces calques ne capturent aucun clic. -->
<div class="blue-grain__color" aria-hidden="true"></div>
<div class="blue-grain__shade" aria-hidden="true"></div>
<div class="blue-grain__texture" aria-hidden="true"></div>

<style>
  .blue-grain__color,
  .blue-grain__shade,
  .blue-grain__texture {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .blue-grain__color {
    z-index: 1;
    background:
      radial-gradient(ellipse at 23% 34%, rgba(197, 195, 255, 0.88), transparent 53%),
      radial-gradient(ellipse at 76% 83%, rgba(174, 182, 247, 0.72), transparent 47%),
      radial-gradient(ellipse at 92% 12%, rgba(66, 77, 250, 0.85), transparent 52%),
      linear-gradient(125deg, #6472ff, #5360ef 58%, #7888f3);
  }

  .blue-grain__shade {
    z-index: 2;
    background: rgba(30, 35, 112, 0.16);
  }

  .blue-grain__texture {
    z-index: 2;
    background-image: url('/images/vision-grain.svg');
    background-size: 180px 180px;
    opacity: 0.14;
    mix-blend-mode: soft-light;
  }
</style>
