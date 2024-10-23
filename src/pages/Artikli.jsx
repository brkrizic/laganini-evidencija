import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { DeleteOutlined } from "@ant-design/icons";
import { ArtikliService } from "../api/ArtikliService";
import DeleteModal from "../modal/DeleteModal";
import { Spin, notification } from "antd";

const Artikli = () => {
    const [nazivArtikl, setNazivArtikl] = useState("");
    const [artikli, setArtikli] = useState([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [id, setId] = useState();
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        async function fetchApi() {
            setLoadingFetch(true);
            try {
                const response = await ArtikliService.getAllArtikli();
                setArtikli(response.data);
            } catch (error) {
                console.error("Error:", error.message);
                if (error.response) {
                    console.error("Response data:", error.response.data);
                }
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

        setLoadingSave(true);
        try {
            await ArtikliService.saveArtikl(artikliObj);
            setArtikli((prev) => [...prev, artikliObj]);
            setNazivArtikl("");

            notification.success({
                message: "Uspješno dodan artikl!",
                placement: "topRight"
            });
        } catch (error) {
            console.error("Error saving artikl:", error);
        } finally {
            setLoadingSave(false);
        }
    }

    const handleDelete = async (key) => {
        setLoadingDelete(true);
        try {
            await ArtikliService.deleteArtikl(key);
            setArtikli((prev) => prev.filter(artikl => artikl.key !== key));
            setDeleteModal(false);

            notification.success({
                message: "Uspješno brisanje",
                placement: "topRight"
            });
        } catch (error) {
            console.error("Error deleting artikl:", error);
            notification.error({
                message: "Neuspješno brisanje",
                placement: "topRight"
            });
        } finally {
            setLoadingDelete(false);
        }
    }

    const btnDelete = (key) => {
        setDeleteModal(true);
        setId(key);
    }

    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Artikli</h1>
            <div style={{ marginLeft: "10px" }}>
                <h3>Unesi novi artikl</h3>
                <label>Naziv: </label>
                <input value={nazivArtikl} onChange={handleNazivArtikla}></input>
                <button onClick={spremiArtikl} disabled={loadingSave}>
                    {loadingSave ? <Spin /> : 'Spremi'}
                </button>
            </div>

            <Spin spinning={loadingFetch}>
                <div>
                    <ul style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", padding: "0", listStyleType: "none" }}>
                        {artikli.map(artikl => (
                            <div key={artikl.id} style={{ border: "1px solid black", margin: "10px", width: "270px", height: "76px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" }}>
                                <li>
                                    <p style={{ textAlign: "center", margin: "0" }}>{artikl.naziv}</p>
                                </li>
                                <button onClick={() => btnDelete(artikl.id)} style={{ border: "none", background: "none", cursor: "pointer" }} disabled={loadingDelete}>
                                    {loadingDelete && id === artikl.id ? <Spin /> : <DeleteOutlined />}
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
            />
        </div>
    );
}

export default Artikli;
