/* 1. Target the specific section */
.section.rightimagethentext .columns-img-col {
  position: relative;
  min-height: 400px; /* Ensures space is reserved */
}

/* 2. Hide existing media (picture, video) */
.section.rightimagethentext .columns-img-col picture,
.section.rightimagethentext .columns-img-col video {
  display: none !important;
}

/* 3. Inject your image as a background */
.section.rightimagethentext .columns-img-col::before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  background-image: url('https://atlascopco.scene7.com/is/image/atlascopco/two-women-employees-shaking-hands?$landscape1600$');
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 8px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}



