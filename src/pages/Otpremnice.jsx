import { Button, Input, Modal, Select, DatePicker, notification, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import OtpremnicaDetails from "../modal/OtpremnicaDetails";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import DeleteModal from "../modal/DeleteModal";
import { ArtikliService } from "../api/ArtikliService";
import { OtpremniceService } from "../api/OtpremniceService";
import { formatDateForDisplay, formatDateForServer } from "../convert/dateConverter";
import { useBaseUrl } from "../contexts/BaseUrlContext";
import ArtikliSelect from "./common/ArtikliSearch";
dayjs.extend(customParseFormat);

const { Option } = Select;

const Otpremnice = () => {
    const [artikli, setArtikli] = useState([]);
    const [nazivOtpremnice, setNazivOtpremnice] = useState("");
    const [nazivArtikla, setNazivArtikla] = useState("");
    const [postojeciArtikli, setPostojeciArtikli] = useState([]);
    const [iznosOtpremnice, setIznosOtpremnice] = useState("");
    const [visibleModal, setVisibleModal] = useState(false);
    const [visibleArtiklModal, setVisibleArtiklModal] = useState(false);
    const [otpremnice, setOtpremnice] = useState([]);
    const [arrObjArtikl, setArrObjArtikl] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOtpremnica, setSelectedOtpremnica] = useState(null);
    const [datum, setDatum] = useState(dayjs('01/01/2024', 'DD/MM/YYYY'));
    const [deleteModal, setDeleteModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState(null);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [idObjOtpremnica, setIdObjOtpremnica] = useState();

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

                const resOtpremnice = await OtpremniceService.getAllOtpremnice(baseUrl);
                const otpremniceData = resOtpremnice.data;
                setOtpremnice(otpremniceData);
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
        setNazivOtpremnice("");
    };

    const handleNazivOtpremnice = (e) => {
        setNazivOtpremnice(e.target.value);
    };

    const updateArtiklStorage = async (objArr) => {
        setLoadingSave(true);
        const updatedArtikl = artikli.map((artikl) => {
            const foundArtikl = objArr.find((obj) => obj.nazivArtikla === artikl.naziv);
            if (foundArtikl) {
                return {
                    ...artikl,
                    kupljenaKolicina: parseFloat(artikl.kupljenaKolicina) + parseFloat(foundArtikl.kolicina),
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
            kolicina: iznosOtpremnice
        };

        setArrObjArtikl((prev) => [...prev, objArtikl]);
        setNazivArtikla("");
        setIznosOtpremnice("");
    };

    const handleOk = async () => {
        setLoadingSave(true);
        if (arrObjArtikl.length === 0) {
            alert("Please insert at least one article.");
            return;
        }

        const otpremnicaObj = {
            date: formatDateForServer(datum),
            artikli: arrObjArtikl
        };

        try {
            await OtpremniceService.saveOtpremnica(baseUrl, otpremnicaObj);
            await updateArtiklStorage(arrObjArtikl);

            const res = await OtpremniceService.getAllOtpremnice(baseUrl);
            setOtpremnice(res.data);

            setVisibleArtiklModal(false);
            setVisibleModal(false);
            setNazivOtpremnice("");
            setArrObjArtikl([]);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingSave(false);
        }

        notification.success({
            message: "Otpremnica uspješno pohranjena!",
            placement: "topRight"
        });
    };

    const handleOpenModalDetails = (otpremnica) => {
        setModalOpen(true);
        setSelectedOtpremnica(otpremnica);
    };

    const handleDatum = (date) => {
        setDatum(date);
    };

    const handleDelete = (key) => {
        setDeleteModal(true);
        setKeyToDelete(key);
        setIdObjOtpremnica(key);
    };

    const deleteItem = async (id) => {
        setLoadingDelete(true);
        try {
            await OtpremniceService.deleteOtpremnica(baseUrl, id);
            await updateDeletionArtiklStorage(id);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingDelete(false);
        }

        setDeleteModal(false);
        notification.success({
            message: "Otpremnica uspješno izbrisana!",
            placement: "topRight"
        });

        const res = await OtpremniceService.getAllOtpremnice(baseUrl);
        setOtpremnice(res.data);
    };

    const handleCount = (id) => {
        const otpremnica = otpremnice.find(o => o.id === id);
        return otpremnica ? otpremnica.artikli.length : 0;
    }

    const updateDeletionArtiklStorage = async (id) => {
        const otpremnica = otpremnice.find(o => o.id === id);
        if(!otpremnica) return;

        const updatedArtikl = artikli.map(artikl => {
            const foundArtikl = otpremnica.artikli.find(a => a.nazivArtikla === artikl.naziv);
            if(foundArtikl){
                return {
                    ...artikl,
                    kupljenaKolicina: parseFloat(artikl.kupljenaKolicina) - parseFloat(foundArtikl.kolicina)
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

    const handleSelectOtpremnica = (id) => {
        setIdObjOtpremnica(id);
    }

    const handleOnClose = async () => {
        setModalOpen(false);
        const res = await OtpremniceService.getAllOtpremnice(baseUrl);
        const resData = res.data;
        setOtpremnice(resData);
    }

    return (
        <>
            <div style={{ backgroundColor: "#0063a6", height: "50px", width: "100%" }}>
                <div style={{ marginTop: "-10px" }}>
                    <h1 style={{ textAlign: "center", color: "white", marginTop: "0px" }}>Otpremnice</h1>
                </div>
            </div>
            <div style={{ margin: "10px" }}>
                <Button onClick={handleOpenModal} type="primary">
                    Nova otpremnica
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
                            >

                            </ArtikliSelect>
                            <label>Količina</label>
                            <Input value={iznosOtpremnice} onChange={(e) => setIznosOtpremnice(e.target.value)} />
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
                            {otpremnice.map((o) => (
                                <div key={o.id}>
                                    <Button
                                        style={{ height: "160px", width: "160px", margin: "10px" }}
                                        onClick={() => {
                                            handleOpenModalDetails(o);
                                            handleSelectOtpremnica(o.id);
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
                <OtpremnicaDetails
                    isOpen={modalOpen}
                    onClose={() => handleOnClose()}
                    storageItem={selectedOtpremnica}
                    title={"Otpremnica"}
                    id={idObjOtpremnica}
                    storage={otpremnice}
                />
            </div>
        </>
    );
};

export default Otpremnice;
