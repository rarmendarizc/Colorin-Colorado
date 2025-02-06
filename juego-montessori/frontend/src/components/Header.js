import React from "react";
import nubeHeader from "../assets/nube-header.png"; // Ruta de la imagen de la nube

const Header = () => {
  return (
    <div style={styles.headerContainer}>
      <img src={nubeHeader} alt="Nubes Header" style={styles.image} />
    </div>
  );
};

const styles = {
  headerContainer: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    zIndex: "1", // Para que esté detrás del contenido
  },
  image: {
    width: "100%",
    height: "auto", // Se adapta proporcionalmente
    display: "block",
  },
};

export default Header;
