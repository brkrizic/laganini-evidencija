import React from "react";
import Inventura from "../pages/Inventura";
import { Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const buttons = [
    {
        name: "Ukupna evidencija",
        path: "/"
    }, 
    {
        name: "Otpremnice",
        path: "/otpremnice"
    }, 
    {
        name: "Prodano",
        path: "/prodano"
    }, 
    {
        name: "Inventura",
        path: "/inventura"
    },
    {
        name: "Artikli",
        path: "/artikli"
    }
]

return(
    <div style={{ width: "99%", margin: "10px"}}>
        {buttons.map((btn, index) => (
        <Button 
            key={index} 
            onClick={() => navigate(btn.path)} 
            style={{ 
                width: "250px", 
                backgroundColor: location.pathname === btn.path ? "#0d487f" : "",
                color: location.pathname === btn.path ? "white" : ""
            }}
        >
            {btn.name}
        </Button>
        ))}
  </div>
);
}
export default Header;