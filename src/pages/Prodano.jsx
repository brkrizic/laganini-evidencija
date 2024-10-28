import { Button, Input, Modal, Select, DatePicker, notification, Spin } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import ProdanoDetails from "../modal/ProdanoDetails";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import DeleteModal from "../modal/DeleteModal";
import { ArtikliService } from "../api/ArtikliService";
import { ProdanoService } from "../api/ProdanoService";
import { formatDateForDisplay, formatDateForServer } from "../convert/dateConverter";
import { useBaseUrl } from "../contexts/BaseUrlContext";
import ArtikliSelect from "./common/ArtikliSearch";
dayjs.extend(customParseFormat);

const { Option } = Select;

const Prodano = () => {
    const [artikli, setArtikli] = useState([]);
    const [nazivProdano, setNazivProdano] = useState("");
    const [nazivArtikla, setNazivArtikla] = useState("");
    const [postojeciArtikli, setPostojeciArtikli] = useState([]);
    const [iznosProdano, setIznosProdano] = useState("");
    const [visibleModal, setVisibleModal] = useState(false);
    const [prodano, setProdano] = useState([]);
    const [arrObjArtikl, setArrObjArtikl] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProdano, setSelectedProdano] = useState(null);
    const [datum, setDatum] = useState(dayjs());
    const [deleteModal, setDeleteModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState(null);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [idObjProdano, setIdObjProdano] = useState();

    const { baseUrl } = useBaseUrl();

    useEffect(() => {
        const fetchData = async () => {
            setLoadingFetch(true);
            try {
                const resArtikli = await ArtikliService.getAllArtikli(baseUrl);
                const artikliData = resArtikli.data;
                setArtikli(artikliData);
                setPostojeciArtikli(artikliData.map((artikl) => artikl.naziv));

                const resProdano = await ProdanoService.getAllProdano(baseUrl);
                setProdano(resProdano.data);
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
        resetForm();
    };

    const resetForm = () => {
        setArrObjArtikl([]);
        setNazivProdano("");
        setNazivArtikla("");
        setIznosProdano("");
        setDatum(dayjs());
    };

    const handleSaveArtikl = () => {
        const objArtikl = {
            nazivArtikla,
            kolicina: iznosProdano
        };

        setArrObjArtikl((prev) => [...prev, objArtikl]);
        setNazivArtikla("");
        setIznosProdano("");
    };

    const handleOk = async () => {
        setLoadingSave(true);
        if (arrObjArtikl.length === 0) {
            notification.warning({ message: "Please insert at least one article." });
            setLoadingSave(false);
            return;
        }

        const prodanoObj = {
            date: formatDateForServer(datum),
            artikli: arrObjArtikl
        };

        try {
            await ProdanoService.saveProdano(baseUrl, prodanoObj);
            await updateArtiklStorage(arrObjArtikl);

            const res = await ProdanoService.getAllProdano(baseUrl);
            setProdano(res.data);

            setVisibleModal(false);
            resetForm();
            notification.success({ message: "Prodano uspješno pohranjena!", placement: "topRight" });
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSave(false);
        }
    };

    const updateArtiklStorage = async (objArr) => {
        setLoadingSave(true);
        const updatedArtikli = artikli.map((artikl) => {
            const foundArtikl = objArr.find((obj) => obj.nazivArtikla === artikl.naziv);
            if (foundArtikl) {
                return {
                    ...artikl,
                    prodajnaKolicina: parseFloat(artikl.prodajnaKolicina) + parseFloat(foundArtikl.kolicina),
                };
            }
            return artikl;
        });

        try {
            await Promise.all(
                updatedArtikli.map(async (artikl) => {
                    await ArtikliService.editArtikl(baseUrl, artikl.id, artikl);
                })
            );
        } catch (error) {
            console.log("Error updating artikli: ", error);
        } finally {
            setLoadingSave(false);
        }
    };

    const handleOpenModalDetails = (prodano) => {
        setModalOpen(true);
        setSelectedProdano(prodano);
    };

    const handleDatum = (date) => {
        setDatum(date);
    };

    const handleDelete = (key) => {
        setDeleteModal(true);
        setKeyToDelete(key);
        setIdObjProdano(key);
    };

    const deleteItem = async (id) => {
        setLoadingDelete(true);
        try {
            await ProdanoService.deleteProdano(baseUrl, id);
            await updateDeletionArtiklStorage(id);

            const res = await ProdanoService.getAllProdano(baseUrl);
            setProdano(res.data);

            notification.success({ message: "Prodano uspješno izbrisana!", placement: "topRight" });
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingDelete(false);
            setDeleteModal(false);
        }
    };

    const updateDeletionArtiklStorage = async (id) => {
        const prodanoItem = prodano.find(o => o.id === id);
        if (!prodanoItem) return;

        const updatedArtikli = artikli.map(artikl => {
            const foundArtikl = prodanoItem.artikli.find(a => a.nazivArtikla === artikl.naziv);
            if (foundArtikl) {
                return {
                    ...artikl,
                    prodajnaKolicina: parseFloat(artikl.prodajnaKolicina) - parseFloat(foundArtikl.kolicina)
                };
            }
            return artikl;
        });

        try {
            await Promise.all(
                updatedArtikli.map(async (artikl) => {
                    await ArtikliService.editArtikl(baseUrl, artikl.id, artikl);
                })
            );
        } catch (error) {
            console.log("Error updating artikli after deletion: ", error);
        }
    };

    const handleSelectProdano = (id) => {
        setIdObjProdano(id);
    };

    const handleOnClose = async () => {
        setModalOpen(false);
        const res = await ProdanoService.getAllProdano(baseUrl);
        setProdano(res.data);
    };

    const handleCount = useCallback((id) => {
        const prodanoItem = prodano.find(o => o.id === id);
        return prodanoItem ? prodanoItem.artikli.length : 0;
    }, [prodano]);

    return (
        <>
        <div style={{ backgroundColor: "#0063a6", height: "50px", width: "100%" }}>
            <div style={{ marginTop: "-10px" }}>
                <h1 style={{ textAlign: "center", color: "white", marginTop: "0px" }}>Prodano</h1>
            </div>
        </div>
        <div style={{ margin: "10px" }}>
            <Button onClick={handleOpenModal} type="primary">
                Nova prodano
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
                        <Input value={iznosProdano} onChange={(e) => setIznosProdano(e.target.value)} />
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
                <div style={{ marginLeft: "0px", marginRight: "0px", width: "100%" }}>
                    <ul style={{ listStyleType: "none", display: "flex", flexWrap: "wrap", padding: 0 }}>
                        {prodano.map((o) => (
                            <div key={o.id}>
                                <Button
                                    style={{ height: "160px", width: "160px", margin: "10px" }}
                                    onClick={() => {
                                        handleOpenModalDetails(o);
                                        handleSelectProdano(o.id);
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
            <ProdanoDetails
                isOpen={modalOpen}
                onClose={() => handleOnClose()}
                storageItem={selectedProdano}
                title={"Prodano"}
                id={idObjProdano}
                storage={prodano}
            />
        </div>
    </>
    );
};

export default Prodano;
