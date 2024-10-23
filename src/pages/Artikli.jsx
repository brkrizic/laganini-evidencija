import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { DeleteOutlined } from "@ant-design/icons";
import { ArtikliService } from "../api/ArtikliService";
import DeleteModal from "../modal/DeleteModal";
import { notification } from "antd";

const Artikli = () => {
    const [nazivArtikl, setNazivArtikl] = useState("");
    const [artikli, setArtikli] = useState([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [id, setId] = useState();

    useEffect(() => {
        async function fetchApi() {
            try {
                const response = await ArtikliService.getAllArtikli(); // Added await
                console.log("Response Data:", response);
                setArtikli(response.data); // No need to use response.data here since the function already returns data
                console.log(artikli);
            } catch (error) {
                console.error("Error:", error.message);
                if (error.response) {
                    console.error("Response data:", error.response.data);
                }
            }
        }
        fetchApi();
    }, [artikli]);

    const handleNazivArtikla = (e) => {
        setNazivArtikl(e.target.value);
    }

    const spremiArtikl = async () => { // Make this function async to await saveArtikl
        const key = uuidv4();
        const artikliObj = {
            key: key,
            naziv: nazivArtikl,
            evidencijaRobe: 0,
            evidencijaStanja: 0,
            razlika: 0,
            ukupnoKupljeno: 0,
            ukupnoProdano: 0
        };

        try {
            await ArtikliService.saveArtikl(artikliObj); // Await saveArtikl
            setArtikli((prev) => [...prev, artikliObj]);
            setNazivArtikl("");

            notification.success({
                message: "Uspješno dodan artikl!",
                placement: "topRight"
            })
        } catch (error) {
            console.error("Error saving artikl:", error);
        }
    }

    const handleDelete = async (key) => { // Make this function async to await deleteArtikl
        try {
            await ArtikliService.deleteArtikl(key); // Await deleteArtikl
            setArtikli((prev) => prev.filter(artikl => artikl.key !== key));
            setDeleteModal(false);

            notification.success({
                message: "Uspješno brisanje",
                placement: "topRight"
            })

            setArtikli(prev => [...prev, ])
        } catch (error) {
            console.error("Error deleting artikl:", error);
            notification.error({
                message: "Neuspješno brisanje",
                placement: "topRight"
            })
        }
    }
    const btnDelete = (key) => {
        setDeleteModal(true);
        setId(key);
    }

    return (
        <div>
            <h1 style={{ textAlign: "center"}}>Artikli</h1>
            <div style={{ marginLeft: "10px"}}>
                <h3>Unesi novi artikl</h3>
                <label>Naziv: </label>
                <input value={nazivArtikl} onChange={handleNazivArtikla}></input>
                <button onClick={spremiArtikl}>Spremi</button>
            </div>

            <div>
                <ul style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", padding: "0", listStyleType: "none" }}>
                    {artikli.map(artikl => (
                        <div key={artikl.id} style={{ border: "1px solid black", margin: "10px", width: "270px", height: "76px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" }}>
                            <li>
                                <p style={{ textAlign: "center", margin: "0" }}>{artikl.naziv}</p>
                            </li>
                            <button onClick={() => btnDelete(artikl.id)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                                <DeleteOutlined />
                            </button>
                        </div>
                    ))}
                </ul>
            </div>
            <DeleteModal
                isOpen={deleteModal}
                handleDelete={() => handleDelete(id)}
                onClose={() => setDeleteModal(false)}
            />
        </div>
    );
}

export default Artikli;
