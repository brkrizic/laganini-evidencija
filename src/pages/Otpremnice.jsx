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
import { decimalNonDecimal } from "../validation/regex";
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
    const [datum, setDatum] = useState(dayjs());
    const [deleteModal, setDeleteModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState(null);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [idObjOtpremnica, setIdObjOtpremnica] = useState();
    const [order, setOrder] = useState('');

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

                const resOtpremnice = await OtpremniceService.getAllOtpremnice(baseUrl, order);
                const otpremniceData = resOtpremnice.data;
                setOtpremnice(otpremniceData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoadingFetch(false);
            }
        };
        fetchData();
    }, [order]);

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
        
        // Create a temporary object to hold the total quantities
        const totalQuantityUpdates = {};
    
        // Aggregate quantities from objArr
        objArr.forEach(item => {
            // Ensure kolicina is parsed to a float, defaulting to 0 if not valid
            const kolicina = parseFloat(item.kolicina) || 0;
            if (!totalQuantityUpdates[item.nazivArtikla]) {
                totalQuantityUpdates[item.nazivArtikla] = 0;
            }
            totalQuantityUpdates[item.nazivArtikla] += kolicina;
        });
    
        try {
            // Loop through the total quantity updates
            await Promise.all(
                Object.keys(totalQuantityUpdates).map(async (nazivArtikla) => {
                    // Find the artikl in the current artikli state
                    const artiklToUpdate = artikli.find(artikl => artikl.naziv === nazivArtikla);
                    
                    if (artiklToUpdate) {
                        // Calculate the new kupljenaKolicina safely
                        const newKupljenaKolicina = (parseFloat(artiklToUpdate.kupljenaKolicina) || 0) + totalQuantityUpdates[nazivArtikla];
    
                        // Update the artikl object
                        const updatedArtikl = {
                            ...artiklToUpdate,
                            kupljenaKolicina: newKupljenaKolicina,
                        };
                        
                        // Save the updated artikl to the database
                        await ArtikliService.editArtikl(baseUrl, updatedArtikl.id, updatedArtikl);
                    } else {
                        console.warn(`Article not found for update: ${nazivArtikla}`);
                    }
                })
            );
    
            console.log("All artikli successfully updated with new quantities:", totalQuantityUpdates);
        } catch (error) {
            console.error("Error updating artikli: ", error);
        } finally {
            setLoadingSave(false);
        }
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
        if(!decimalNonDecimal.test(iznosOtpremnice) ||parseFloat(iznosOtpremnice) <= 0){
            notification.warning({
                message: 'Neispravna količina',
                description: 'Količina mora biti u ispravnom formatu',
                placement: 'topRight'
            });
            return;
        }
        const objArtikl = {
            nazivArtikla: nazivArtikla,
            kolicina: iznosOtpremnice
        };

        setArrObjArtikl((prev) => [...prev, objArtikl]);
        setNazivArtikla("");
        setIznosOtpremnice("");
    };

    const checkIfOtpremnicaExists = async (date) => {
        const existingOtpremnica = otpremnice.find(o => formatDateForDisplay(dayjs(o.date)) === formatDateForDisplay(dayjs(date)));
        return existingOtpremnica;
    };

    const handleOk = async () => {
        console.log("Starting handleOk");
        setLoadingSave(true);
        if (arrObjArtikl.length === 0) {
            alert("Please insert at least one article.");
            return;
        }
    
        // Collect total quantities for each article to be processed
        const totalArticles = {};
        console.log("arrObjArtikli" + arrObjArtikl);
        arrObjArtikl.forEach(({ nazivArtikla, kolicina }) => {
            if (!totalArticles[nazivArtikla]) {
                totalArticles[nazivArtikla] = 0;
            }
            totalArticles[nazivArtikla] += parseFloat(kolicina);
        });
    
        try {
            console.log("Checking if otpremnica exists for date:", datum);
            const existingOtpremnica = await checkIfOtpremnicaExists(datum);
            
            // Check for an existing entry for the same date
            if (existingOtpremnica) {
                notification.error({
                    message: `Otpremnica s datumom ${formatDateForDisplay(datum)} već postoji!`,
                    placement: 'topRight'
                });
                return; // Stop the execution here if the entry exists
            }
            
            console.log("Creating a new otpremnica");
            const otpremnicaObj = {
                date: formatDateForServer(datum),
                artikli: arrObjArtikl // Ensure unique entries here too
            };
    
            await OtpremniceService.saveOtpremnica(baseUrl, otpremnicaObj);
            await updateArtiklStorage(arrObjArtikl);
    
            notification.success({
                message: "Otpremnica uspješno pohranjena!",
                placement: "topRight"
            });
    
            console.log("Refreshing otpremnice state");
            const res = await OtpremniceService.getAllOtpremnice(baseUrl, order);
            setOtpremnice(res.data);
    
            setVisibleArtiklModal(false);
            setVisibleModal(false);
            setNazivOtpremnice("");
            setArrObjArtikl([]);
        } catch (error) {
            console.error("Error in handleOk:", error);
            notification.error({
                message: "Došlo je do greške pri spremanju otpremnice.",
                placement: "topRight"
            });
        } finally {
            setLoadingSave(false);
        }
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

        const res = await OtpremniceService.getAllOtpremnice(baseUrl, order);
        setOtpremnice(res.data);
    };

    const handleCount = (id) => {
        const otpremnica = otpremnice.find(o => o.id === id);
        return otpremnica ? otpremnica.artikli.length : 0;
    }

    const updateDeletionArtiklStorage = async (id) => {
        const otpremnica = otpremnice.find(o => o.id === id);
        if (!otpremnica) return;
    
        // Create a mapping of article names to their quantities to be subtracted
        const quantitiesToSubtract = {};
        
        otpremnica.artikli.forEach(({ nazivArtikla, kolicina }) => {
            if (!quantitiesToSubtract[nazivArtikla]) {
                quantitiesToSubtract[nazivArtikla] = 0;
            }
            quantitiesToSubtract[nazivArtikla] += parseFloat(kolicina); // Ensure kolicina is treated as a float
        });
    
        const updatedArtikl = artikli.map(artikl => {
            const quantityToSubtract = quantitiesToSubtract[artikl.naziv];
            if (quantityToSubtract) {
                return {
                    ...artikl,
                    kupljenaKolicina: (parseFloat(artikl.kupljenaKolicina) || 0) - quantityToSubtract
                };
            }
            return artikl; // No change for articles not found in the deleted otpremnica
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
        const res = await OtpremniceService.getAllOtpremnice(baseUrl, order);
        const resData = res.data;
        setOtpremnice(resData);
    }

    const handleSort = () => {
        setOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
    }

    const handleSameDate = (date) => {
        // This function checks if the date already exists in the storage
        const duplicateDate = artikli.some(item => formatDateForDisplay(item.date) === formatDateForDisplay(date));
        if (duplicateDate) {
            notification.error({
                message: `Otpremnica s datumom ${formatDateForDisplay(date)} već postoji!`,
                placement: 'topRight'
            });
            return true; // Indicate a duplicate date was found
        }
        return false; // No duplicate found
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
            <div style={{ margin: "10px" }}>
                <Button onClick={() => handleSort()}>Sortiraj</Button>
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
