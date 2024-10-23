import { Button, Input, Modal, Select, DatePicker, notification } from "antd";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import OtpremnicaDetails from "../modal/OtpremnicaDetails";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import { DeleteOutlined } from "@ant-design/icons";
import DeleteModal from "../modal/DeleteModal";
import { ArtikliService } from "../api/ArtikliService";
import { OtpremniceService } from "../api/OtpremniceService";
import { formatDateForDisplay, formatDateForServer } from "../convert/dateConverter";
dayjs.extend(customParseFormat);

const { Option } = Select;

const Otpremnice = () => {
    const [artikli, setArtikli] = useState([]);
    const [nazivOtpremnice, setNazivOtpremnice] = useState("");
    const [nazivArtikla, setNazivArtikla] = useState("");
    const [postojeciArtikli, setPostojeciArtikli] = useState([]);
    const [iznosOtpremnice, setIznosOtpremnice] = useState("");
    const [visibleModal, setVisibleModal] = useState(false);
    const [brojArtikla, setBrojArtikla] = useState("");
    const [visibleArtiklModal, setVisibleArtiklModal] = useState(false);
    const [otpremnice, setOtpremnice] = useState([]);
    const [arrObjArtikl, setArrObjArtikl] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOtpremnica, setSelectedOtpremnica] = useState(null);
    const [datum, setDatum] = useState(dayjs('01/01/2024', 'DD/MM/YYYY'));
    const [deleteModal, setDeleteModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resArtikli = await ArtikliService.getAllArtikli();
                const artikliData = resArtikli.data;
                setArtikli(artikliData);
                const artikliNaziv = artikliData.map((artikl) => artikl.naziv);
                setPostojeciArtikli(artikliNaziv);

                const resOtpremnice = await OtpremniceService.getAllOtpremnice();
                const otpremniceData = resOtpremnice.data;
                setOtpremnice(otpremniceData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = () => {
        setVisibleModal(!visibleModal);
        setBrojArtikla("");
        setArrObjArtikl([]);
        setNazivOtpremnice("");
    };

    const handleBrojArtikla = (e) => {
        const currentValue = e.target.value;
        const convertedValue = parseInt(currentValue) || 0;
        setBrojArtikla(convertedValue);
    };

    const handleNazivOtpremnice = (e) => {
        setNazivOtpremnice(e.target.value);
    };

    const updateArtiklStorage = async (objArr) => {
        const updatedArtikl = artikli.map((artikl) => {
            const foundArtikl = objArr.find((obj) => obj.naziv === artikl.nazivArtikla);
            if (foundArtikl) {
                return {
                    ...artikl,
                    ukupnoKupljeno: parseFloat(artikl.ukupnoKupljeno) + parseFloat(foundArtikl.kolicina),
                };
            }
            return artikl;
        });

        for (const artikl of updatedArtikl) {
            await ArtikliService.editArtikl(artikl);
        }
        console.log("Artikli updated: " + JSON.stringify(updatedArtikl));
    };

    const handleSave = () => {
        const objArtikl = {
            // id: uuidv4(),
            nazivArtikla: nazivArtikla,
            kolicina: iznosOtpremnice
        };

        setArrObjArtikl((prev) => [...prev, objArtikl]);
        console.log("Current articles: ", arrObjArtikl);

        setNazivArtikla("");
        setIznosOtpremnice("");
    };

    const handleOk = async () => {
        if (arrObjArtikl.length === 0) {
            alert("Please insert at least one article.");
            return;
        }

        const key = uuidv4(); // Generate a unique key

        const otpremnicaObj = {
            // id: key,
            date: formatDateForServer(datum),
            artikli: arrObjArtikl
        };

        await OtpremniceService.saveOtpremnica(otpremnicaObj);
        console.log("Otpremnica saved: ", otpremnicaObj);

        notification.success({
            message: "Otpremnica uspješno pohranjena!",
            placement: "topRight"
        })

        // await updateArtiklStorage(arrObjArtikl);

        const res = await OtpremniceService.getAllOtpremnice();
        const otpremniceData = res.data;
        setOtpremnice(otpremniceData);

        setVisibleArtiklModal(false);
        setVisibleModal(false);
        setNazivOtpremnice("");
        setBrojArtikla("");
        setArrObjArtikl([]);
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
    };

    const deleteItem = async (id) => {
        await OtpremniceService.deleteOtpremnica(id);
        setDeleteModal(false);
        notification.success({
            message: "Otpremnica uspješno izbrisana!",
            placement: "topRight"
        })

        const res = await OtpremniceService.getAllOtpremnice();
        const otpremniceData = res.data;
        setOtpremnice(otpremniceData);
    };

    const handleCount = (id) => {
       const otpremnica = otpremnice.find(o => o.id === id);
       return otpremnica ? otpremnica.artikli.length : 0;
    }

    return (
        <>
            <h1 style={{ textAlign: "center" }}>Otpremnice</h1>
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

                            <label>Broj artikla</label>
                            <Input value={brojArtikla} onChange={handleBrojArtikla} />
                            <Button type="primary" onClick={() => setVisibleArtiklModal(true)}>Dodaj Artikl</Button>
                        </div>
                        {visibleArtiklModal && brojArtikla !== 0 && Array.from({ length: brojArtikla }).map((_, index) => (
                            <div key={index}>
                                <h3>
                                    {`Unesi ${index + 1}. artikl: `}
                                </h3>
                                <label>Naziv artikla</label>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Select an artikl"
                                    onChange={(value) => setNazivArtikla(value)}
                                    value={nazivArtikla}
                                >
                                    {postojeciArtikli.map((artikl, idx) => (
                                        <Option key={idx} value={artikl}>{artikl}</Option>
                                    ))}
                                </Select>
                                <label>Iznos otpremnice</label>
                                <Input value={iznosOtpremnice} onChange={(e) => setIznosOtpremnice(e.target.value)} />
                                <Button onClick={handleSave}>Spremi Artikl</Button>
                            </div>
                        ))}
                        <Button type="primary" onClick={handleOk}>Spremi Otpremnicu</Button>
                    </Modal>
                )}
                <div>
                    <ul style={{ listStyleType: "none", display: "flex", flexWrap: "wrap", padding: 0 }}>
                        {otpremnice.map((o) => (
                            <div key={o.id}>
                                <Button
                                    style={{ height: "160px", width: "160px", margin: "10px" }}
                                    onClick={() => handleOpenModalDetails(o)}
                                >
                                    <li>
                                        <h3>{formatDateForDisplay(dayjs(o.date))}</h3>
                                        <p>{`Broj Artikla: ${handleCount(o.id)}`}</p>
                                    </li>
                                </Button>
                                <div style={{ display: "flex", flexDirection: "column", margin: "10px", marginTop: "-10px" }}>
                                    <button onClick={() => handleDelete(o.id)}><DeleteOutlined /></button>
                                </div>
                            </div>
                        ))}
                    </ul>
                </div>
                {deleteModal && (
                    <DeleteModal
                        isOpen={deleteModal}
                        title={"otpremnicu"}
                        handleDelete={() => deleteItem(keyToDelete)}
                        onClose={() => setDeleteModal(false)}
                    />
                )}
                <OtpremnicaDetails
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    otpremnica={selectedOtpremnica}
                    title={"Otpremnica"}
                />
            </div>
        </>
    );
};

export default Otpremnice;
