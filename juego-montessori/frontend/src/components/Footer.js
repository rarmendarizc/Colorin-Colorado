import React from "react";
import cespedFooter from "../assets/cesped-footer.png"; // Ruta de la imagen del césped

const Footer = () => {
  return (
    <div style={styles.footerContainer}>
      <img src={cespedFooter} alt="Césped Footer" style={styles.image} />
    </div>
  );
};

const styles = {
  footerContainer: {
    position: "absolute",
    bottom: "0",
    left: "0",
    width: "100%",
    zIndex: "1",
  },
  image: {
    width: "100%",
    height: "auto",
    display: "block",
  },
};

export default Footer;
