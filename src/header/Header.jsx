import React from "react";
import Inventura from "../pages/Inventura";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const buttons = [
    {
        name: "Ukupna evidencija",
        onClick: () => navigate("/")
    }, 
    {
        name: "Otpremnice",
        onClick: () => navigate("/otpremnice")
    }, 
    {
        name: "Prodano",
        onClick: () => navigate("/prodano")
    }, 
    {
        name: "Inventura",
        onClick: () => navigate("/inventura")
    },
    {
        name: "Artikli",
        onClick: () => navigate("/artikli")
    }
]

return(
    <div>
    {buttons.map((btn, index) => (
      <Button key={index} onClick={btn.onClick}>
        {btn.name}
      </Button>
    ))}
  </div>
);
}
export default Header;