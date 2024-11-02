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
import { decimalNonDecimal } from "../validation/regex";
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
        if(nazivArtikla === ""){
            notification.warning({
                message: 'Neispravan artikl!',
                description: `Naziv artikla ne može biti prazan.`,
                placement: 'topRight'
            });
            return;
        }
        if(!decimalNonDecimal.test(iznosProdano) ||parseFloat(iznosProdano) <= 0){
            notification.warning({
                message: 'Neispravna količina',
                description: 'Količina mora biti u ispravnom formatu',
                placement: 'topRight'
            });
            return;
        }
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
        try {
            // Create a map for the incoming articles for quick lookup
            const objMap = new Map(objArr.map(obj => [obj.nazivArtikla, parseFloat(obj.kolicina)]));
    
            const updatedArtikli = artikli.map((artikl) => {
                const foundKolicina = objMap.get(artikl.naziv);
                if (foundKolicina !== undefined) {
                    // Update prodajnaKolicina only if found
                    return {
                        ...artikl,
                        prodajnaKolicina: (parseFloat(artikl.prodajnaKolicina) || 0) + foundKolicina,
                    };
                }
                return artikl; // Return the original artikl if not found
            });
    
            // Log the updated articles for debugging
            console.log("Updated artikli: ", updatedArtikli);
    
            // Perform the batch update for all articles
            await Promise.all(
                updatedArtikli.map(async (artikl) => {
                    await ArtikliService.editArtikl(baseUrl, artikl.id, artikl);
                })
            );
    
            console.log("Artikli successfully updated:", updatedArtikli);
        } catch (error) {
            console.error("Error updating artikli: ", error);
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
                            </div> : "Spremi Prodano"}
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
