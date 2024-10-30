import { Button, Input, Modal, Select, DatePicker, notification, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import InventuraDetails from "../modal/InventuraDetails";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import DeleteModal from "../modal/DeleteModal";
import { ArtikliService } from "../api/ArtikliService";
import { InventuraService } from "../api/InventuraService";
import { formatDateForDisplay, formatDateForServer } from "../convert/dateConverter";
import { useBaseUrl } from "../contexts/BaseUrlContext";
import ArtikliSelect from "./common/ArtikliSearch";
dayjs.extend(customParseFormat);

const { Option } = Select;

const Inventura = () => {
    const [artikli, setArtikli] = useState([]);
    const [nazivInventura, setNazivInventure] = useState("");
    const [nazivArtikla, setNazivArtikla] = useState("");
    const [postojeciArtikli, setPostojeciArtikli] = useState([]);
    const [iznosInventure, setIznosInventure] = useState("");
    const [visibleModal, setVisibleModal] = useState(false);
    const [visibleArtiklModal, setVisibleArtiklModal] = useState(false);
    const [inventure, setInventure] = useState([]);
    const [arrObjArtikl, setArrObjArtikl] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedInventura, setSelectedInventura] = useState(null);
    const [datum, setDatum] = useState(dayjs());
    const [deleteModal, setDeleteModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState(null);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [idObjInventura, setIdObjInventura] = useState();

    const { baseUrl } = useBaseUrl();

    useEffect(() => {
        const fetchData = async () => {
            setLoadingFetch(true);
            try {
                const resArtikli = await ArtikliService.getAllArtikli(baseUrl);
                const artikliData = resArtikli.data;
                setArtikli(artikliData);
                const artikliNaziv = artikliData.map((artikl) => artikl.naziv);
                setPostojeciArtikli(artikliNaziv);

                const resInventure = await InventuraService.getAllInventure(baseUrl);
                const inventureData = resInventure.data;
                setInventure(inventureData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoadingFetch(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = () => {
        setVisibleModal(!visibleModal);
        setArrObjArtikl([]);
        setNazivInventure("");
    };

    const handleNazivInventure = (e) => {
        setNazivInventure(e.target.value);
    };

    const updateArtiklStorage = async (objArr) => {
        setLoadingSave(true);
        const updatedArtikl = artikli.map((artikl) => {
            const foundArtikl = objArr.find((obj) => obj.nazivArtikla === artikl.naziv);
            if (foundArtikl) {
                return {
                    ...artikl,
                    evidencijaRobe: parseFloat(artikl.evidencijaRobe) + parseFloat(foundArtikl.kolicina),
                };
            }
            return artikl;
        });

        try {
            await Promise.all(
                updatedArtikl.map(async (artikl) => {
                    await ArtikliService.editArtikl(baseUrl, artikl.id, artikl);
                })
            );
        } catch (error) {
            console.log("Error updating artikli: ", error);
        } finally {
            setLoadingSave(false);
        }
    };

    const handleSaveArtikl = () => {
        const objArtikl = {
            nazivArtikla: nazivArtikla,
            kolicina: iznosInventure
        };

        setArrObjArtikl((prev) => [...prev, objArtikl]);
        setNazivArtikla("");
        setIznosInventure("");
    };

    const handleOk = async () => {
        setLoadingSave(true);
        if (arrObjArtikl.length === 0) {
            alert("Please insert at least one article.");
            return;
        }

        const inventuraObj = {
            date: formatDateForServer(datum),
            artikli: arrObjArtikl
        };

        try {
            await InventuraService.saveInventura(baseUrl, inventuraObj);
            await updateArtiklStorage(arrObjArtikl);

            const res = await InventuraService.getAllInventure(baseUrl);
            setInventure(res.data);

            setVisibleArtiklModal(false);
            setVisibleModal(false);
            setNazivInventure("");
            setArrObjArtikl([]);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSave(false);
        }

        notification.success({
            message: "Inventura uspješno pohranjena!",
            placement: "topRight"
        });
    };

    const handleOpenModalDetails = (inventura) => {
        setModalOpen(true);
        setSelectedInventura(inventura);
    };

    const handleDatum = (date) => {
        setDatum(date);
    };

    const handleDelete = (key) => {
        setDeleteModal(true);
        setKeyToDelete(key);
        setIdObjInventura(key);
    };

    const deleteItem = async (id) => {
        setLoadingDelete(true);
        try {
            await InventuraService.deleteInventura(baseUrl, id);
            await updateDeletionArtiklStorage(id);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingDelete(false);
        }

        setDeleteModal(false);
        notification.success({
            message: "Inventura uspješno izbrisana!",
            placement: "topRight"
        });

        const res = await InventuraService.getAllInventure(baseUrl);
        setInventure(res.data);
    };

    const handleCount = (id) => {
        const inventura = inventure.find(o => o.id === id);
        return inventura ? inventura.artikli.length : 0;
    }

    const updateDeletionArtiklStorage = async (id) => {
        const inventura = inventure.find(o => o.id === id);
        if(!inventura) return;

        const updatedArtikl = artikli.map(artikl => {
            const foundArtikl = inventura.artikli.find(a => a.nazivArtikla === artikl.naziv);
            if(foundArtikl){
                return {
                    ...artikl,
                    evidencijaRobe: parseFloat(artikl.evidencijaRobe) - parseFloat(foundArtikl.kolicina)
                };
            }
            return artikl;
        });

        try {
            await Promise.all(
                updatedArtikl.map(async (artikl) => {
                    await ArtikliService.editArtikl(baseUrl, artikl.id, artikl);
                    console.log("Artikl updated: ", artikl);
                })
            );
            console.log("Artikli updated after deletion: ", JSON.stringify(updatedArtikl));
        } catch (error) {
            console.log("Error updating artikli after deletion: ", error);
        }
    };

    const handleSelectInventura = (id) => {
        setIdObjInventura(id);
    }

    const handleOnClose = async () => {
        setModalOpen(false);
        const res = await InventuraService.getAllInventure(baseUrl);
        const resData = res.data;
        setInventure(resData);
    }

    return (
        <>
            <div style={{ backgroundColor: "#0063a6", height: "50px", width: "100%" }}>
                <div style={{ marginTop: "-10px" }}>
                    <h1 style={{ textAlign: "center", color: "white", marginTop: "0px" }}>Inventure</h1>
                </div>
            </div>
            <div style={{ margin: "10px" }}>
                <Button onClick={handleOpenModal} type="primary">
                    Nova Inventura
                </Button>
            </div>
            <div>
                {visibleModal && (
                    <Modal
                        visible={visibleModal}
                        onCancel={() => setVisibleModal(false)}
                        footer={null}
                    >
                        <div>
                            <label>Datum</label>
                            <DatePicker
                                defaultValue={datum}
                                format="DD/MM/YYYY"
                                value={datum}
                                onChange={handleDatum}
                                style={{ width: "472px" }}
                            />
                        </div>
                        <div>
                            <h3>Unesi artikle:</h3>
                            <label>Naziv artikla</label>
                            <ArtikliSelect
                                postojeciArtikli={postojeciArtikli}
                                setNazivArtikla={setNazivArtikla}
                                nazivArtikla={nazivArtikla}
                            />
                            <label>Količina</label>
                            <Input value={iznosInventure} onChange={(e) => setIznosInventure(e.target.value)} />
                            <Button onClick={handleSaveArtikl}>Dodaj Artikl</Button>
                            <ul>
                                {arrObjArtikl.map((artikl, idx) => (
                                    <li key={idx}>{`${artikl.nazivArtikla}: ${artikl.kolicina}`}</li>
                                ))}
                            </ul>
                        </div>
                        <Button type="primary" onClick={handleOk}>
                            {loadingSave ? 
                                <div style={{ backgroundColor: "black"}}>
                                    <Spin />
                                </div> : "Spremi Otpremnicu"}
                        </Button>
                    </Modal>
                )}
                <Spin spinning={loadingFetch}>
                    <div style={{ marginLeft: "0px", marginRight: "0px", width: "100%"}}>
                        <ul style={{ listStyleType: "none", display: "flex", flexWrap: "wrap", padding: 0 }}>
                            {inventure.map((o) => (
                                <div key={o.id}>
                                    <Button
                                        style={{ height: "160px", width: "160px", margin: "10px" }}
                                        onClick={() => {
                                            handleOpenModalDetails(o);
                                            handleSelectInventura(o.id);
                                        }}
                                    >
                                        <li>
                                            <h3>{formatDateForDisplay(dayjs(o.date))}</h3>
                                            <p>{`Broj Artikla: ${handleCount(o.id)}`}</p>
                                        </li>
                                    </Button>
                                    <div style={{ display: "flex", flexDirection: "column", margin: "10px", marginTop: "-10px" }}>
                                        <button 
                                            onClick={() => handleDelete(o.id)}
                                            style={{ color: "red"}}
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </ul>
                    </div>
                </Spin>
                {deleteModal && (
                    <DeleteModal
                        isOpen={deleteModal}
                        title={"otpremnicu"}
                        handleDelete={() => deleteItem(keyToDelete)}
                        onClose={() => setDeleteModal(false)}
                        loading={loadingDelete}
                    />
                )}
                <InventuraDetails
                    isOpen={modalOpen}
                    onClose={() => handleOnClose()}
                    storageItem={selectedInventura}
                    title={"inventura"}
                    id={idObjInventura}
                    storage={inventure}
                />
            </div>
        </>
    );
};

export default Inventura;
