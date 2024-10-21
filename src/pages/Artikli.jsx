import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { artiklStorage } from "../storage/artikliStorage";
import { Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const Artikli = () => {
    const [nazivArtikl, setNazivArtikl] = useState("");
    const [artikli, setArtikli] = useState([]);

    const apiKey = "14DFB1BA-063C-43D9-8D5C-3020B1D9782D"; // Replace with your dynamic key if necessary

    async function fetchApi() {
        try {
            const response = await axios.get("http://localhost:8080/api/artikli", {
                headers: {
                    "X-API-KEY": apiKey,
                    "Content-Type": "application/json"
                }
            });
            console.log("Response Data:", response.data);
        } catch (error) {
            console.error("Error:", error.message);
            if (error.response) {
                console.error("Response data:", error.response.data);
            }
        }
    }
    
    useEffect(() => {
        console.log("API Key being sent:", apiKey); // Log to confirm it's not null
        fetchApi();
    }, []);

    useEffect(() => {
        const sviArtikli = artiklStorage.getAll();
        setArtikli(sviArtikli);
        console.log(sviArtikli);
        console.log(artikli);
    }, []);

    const handleNazivArtikla = (e) => {
        setNazivArtikl(e.target.value);
    }

    const spremiArtikl = () => {
        const key = uuidv4();
        const artikliObj = {
            key: key,
            artikl: nazivArtikl,
            evidencijaRobe: 0,
            evidencijaStanja: 0,
            razlika: 0,
            ukupnoKupljeno: 0,
            ukupnoProdano: 0
        };

        artiklStorage.addArtikl(artikliObj);
        setArtikli((prev) => [...prev, artikliObj]);
        setNazivArtikl("");
    }

    const handleDelete = (key) => {
        artiklStorage.deleteArtikl(key);

    }

    return(
        <div>
            <h1>Artikli</h1>
            <div>
                <h3>Unesi novi artikl</h3>
                <label>Naziv: </label>
                <input value={nazivArtikl} onChange={handleNazivArtikla}></input>
                <button onClick={spremiArtikl}>Spremi</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column"}}>
                
                    {artikli.map(artikl => (
                        <div style={{ border: "1px solid black", margin: "10px", width: "90px", height: "76px"}}>
                            <p style={{textAlign: "center"}} key={artikl.key}>{artikl.artikl}</p>
                            <button onClick={handleDelete(artikl.key)}><DeleteOutlined/></button>
                        </div>
                    ))}
                
            </div>
        </div>
    );
}

export default Artikli;
