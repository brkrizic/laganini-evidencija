import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { DeleteOutlined } from "@ant-design/icons";
import { ArtikliService } from "../api/ArtikliService";
import DeleteModal from "../modal/DeleteModal";
import { Input, Spin, notification } from "antd";

const Artikli = () => {
    const [nazivArtikl, setNazivArtikl] = useState("");
    const [artikli, setArtikli] = useState([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [id, setId] = useState();
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [searchArtikl, setSearchArtikl] = useState("");

    useEffect(() => {
        const fetchApi = async () => {
            setLoadingFetch(true);
            try {
                const response = await ArtikliService.getAllArtikli();
                setArtikli(response.data);
            } catch (error) {
                console.error("Error:", error.message);
                notification.error({
                    message: "Error fetching artikli",
                    description: error.response ? error.response.data : "Unknown error occurred",
                    placement: "topRight"
                });
            } finally {
                setLoadingFetch(false);
            }
        }
        fetchApi();
    }, []);

    const handleNazivArtikla = (e) => {
        setNazivArtikl(e.target.value);
    }

    const spremiArtikl = async () => {
        const artikliObj = {
            naziv: nazivArtikl,
            evidencijaRobe: 0,
            evidencijaStanja: 0,
            razlika: 0,
            ukupnoKupljeno: 0,
            ukupnoProdano: 0
        };

        setLoadingSave(true);
        try {
            await ArtikliService.saveArtikl(artikliObj);
            const response = await ArtikliService.getAllArtikli();
            setArtikli(response.data);
            setNazivArtikl("");

            notification.success({
                message: "Uspješno dodavanje",
                description: "Artikl je uspješno dodan",
                placement: "topRight"
            });
        } catch (error) {
            console.error("Error saving artikl:", error);
            notification.error({
                message: "Error saving artikl",
                description: error.response ? error.response.data : "Unknown error occurred",
                placement: "topRight"
            });
        } finally {
            setLoadingSave(false);
        }
    }

    const handleDelete = async (key) => {
        setLoadingDelete(true);
        try {
            await ArtikliService.deleteArtikl(key);
            const res = await ArtikliService.getAllArtikli(); // Fetch updated list
            setArtikli(res.data);
            setDeleteModal(false);

            notification.success({
                message: "Uspješno brisanje",
                description: "Artikl je uspješno obrisan.",
                placement: "topRight"
            });
        } catch (error) {
            console.error("Error deleting artikl:", error);
            notification.error({
                message: "Neuspješno brisanje",
                description: error.response ? error.response.data : "Došlo je do greške prilikom brisanja artikla. Pokušajte ponovo.",
                placement: "topRight"
            });
        } finally {
            setLoadingDelete(false);
        }
    };
    
    const btnDelete = (key) => {
        setDeleteModal(true);
        setId(key);
    }

    const handleArtiklChange = (e) => {
        const value = e.target.value;
        setSearchArtikl(value);
    }

    return (
        <div style={{ width: '100%'}}>
            <div style={{ backgroundColor: "#0063a6", height: "50px", width: "100%"}}>
                <div style={{ marginTop: "-10px"}}>
                    <h1 style={{ textAlign: "center", color: "white", marginTop: "-10px"}}>Artikli</h1>
                </div>
            </div>
            <div style={{ marginLeft: "10px" }}>
                <h3>Unesi novi artikl</h3>
                <label>Naziv: </label>
                <input value={nazivArtikl} onChange={handleNazivArtikla}></input>
                <button onClick={spremiArtikl} disabled={loadingSave}>
                    {loadingSave ? <Spin /> : 'Spremi'}
                </button>
            </div>
            <div style={{ width: "300px", marginLeft: "900px"}}>
                <div style={{marginLeft: "-110px", marginBottom: "-24px"}}>
                    <label>Pretraži artikl:</label>
                </div>
                <Input 
                    placeholder="Pretraži artikl..." 
                    value={searchArtikl} 
                    onChange={handleArtiklChange} 
                    style={{width: "300px", height: "30px"}}/>
            </div>

            <Spin spinning={loadingFetch}>
                <div style={{ marginLeft: "10px"}}>
                    <ul style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", padding: "0", listStyleType: "none" }}>
                        {artikli.filter(artikl => 
                            artikl.naziv.toLowerCase().includes(searchArtikl.toLowerCase()) // Filtering based on search input
                        ).map(artikl => (
                            <div key={artikl.id} style={{ border: "1px solid black", margin: "10px", width: "270px", height: "76px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" }}>
                                <li>
                                    <p style={{ textAlign: "center", margin: "0" }}>{artikl.naziv}</p>
                                </li>
                                <button 
                                    onClick={() => btnDelete(artikl.id)} 
                                    style={{ 
                                        border: "none", 
                                        background: "none", 
                                        cursor: "pointer", 
                                        color:"red" }} 
                                        disabled={loadingDelete}
                                >
                                    <DeleteOutlined />
                                </button>
                            </div>
                        ))}
                    </ul>
                </div>
            </Spin>
            <DeleteModal
                isOpen={deleteModal}
                handleDelete={() => handleDelete(id)}
                onClose={() => setDeleteModal(false)}
                loading={loadingDelete}
            />
        </div>
    );
}

export default Artikli;
