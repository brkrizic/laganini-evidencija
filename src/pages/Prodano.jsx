import { Button, Input, Modal, Select, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import { artiklStorage } from "../storage/artikliStorage";
import { v4 as uuidv4 } from 'uuid';
import OtpremnicaDetails from "../modal/OtpremnicaDetails";
import { prodanoStorage } from "../storage/prodanoStorage";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
dayjs.extend(customParseFormat);

const { Option } = Select;

const Prodano = () => {
    const [artikli, setArtikli] = useState([]);
    const [nazivOtpremnice, setNazivOtpremnice] = useState("");
    const [nazivArtikla, setNazivArtikla] = useState("");
    const [postojeciArtikli, setPostojeciArtikli] = useState([]);
    const [iznosOtpremnice, setIznosOtpremnice] = useState("");
    const [visibleModal, setVisibleModal] = useState(false);
    const [brojArtikla, setBrojArtikla] = useState(0);
    const [visibleArtiklModal, setVisibleArtiklModal] = useState(false);
    const [otpremnice, setOtpremnice] = useState([]);
    const [arrObjArtikl, setArrObjArtikl] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOtpremnica, setSelectedOtpremnica] = useState(null);
    const [datum, setDatum] = useState(dayjs('01/01/2015', 'DD/MM/YYYY'));

    useEffect(() => {
        const artikliData = artiklStorage.getAll();
        setArtikli(artikliData);

        const artikliNaziv = artikliData.map((artikl) => artikl.artikl);
        setPostojeciArtikli(artikliNaziv);

        const prodanoData = prodanoStorage.getAll();
        setOtpremnice(prodanoData);
    }, []);

    const handleOpenModal = () => {
        setVisibleModal(true);
        setBrojArtikla(0);
        setArrObjArtikl([]);
        setNazivOtpremnice("");
    };

    const handleBrojArtikla = (e) => {
        setBrojArtikla(parseInt(e.target.value) || 0);
    };

    const handleNazivOtpremnice = (e) => {
        setNazivOtpremnice(e.target.value);
    };

    const handleClear = () => {
        prodanoStorage.clearAll();
        setOtpremnice([]);
        console.log("LocalStorage cleared!");
    };

    const updateArtiklStorage = (objArr) => {
        const updatedArtikli = artikli.map((artikl) => {
            const foundArtikl = objArr.find((obj) => obj.nazivArtikla === artikl.artikl);
            if (foundArtikl) {
                return {
                    ...artikl,
                    ukupnoProdano: parseInt(artikl.ukupnoProdano) + parseInt(foundArtikl.iznosOtpremnice)
                };
            }
            return artikl;
        });

        updatedArtikli.forEach((artikl) => {
            artiklStorage.editArtikl(artikl);
        });
        console.log("Artikli updated: " + updatedArtikli);
    };

    const handleSave = () => {
        if (!nazivArtikla || !iznosOtpremnice) return;

        const objArtikl = {
            key: uuidv4(),
            nazivArtikla: nazivArtikla,
            iznosOtpremnice: iznosOtpremnice
        };

        setArrObjArtikl((prev) => [...prev, objArtikl]);

        setNazivArtikla("");
        setIznosOtpremnice("");
    };

    const handleOk = () => {
        if (arrObjArtikl.length === 0) {
            alert("Please insert at least one article.");
            return;
        }

        const otpremnicaObj = {
            key: uuidv4(),
            datum: datum.format('DD/MM/YYYY'),
            naziv: nazivOtpremnice,
            brojArtikla: brojArtikla,
            artikl: arrObjArtikl
        };

        prodanoStorage.saveProdano(otpremnicaObj);
        console.log("Otpremnica saved: ", otpremnicaObj);

        updateArtiklStorage(arrObjArtikl);

        setOtpremnice(prodanoStorage.getAll());

        setVisibleArtiklModal(false);
        setVisibleModal(false);
        setNazivOtpremnice("");
        setBrojArtikla(0);
        setArrObjArtikl([]);
    };

    const handleOpenModalDetails = (otpremnica) => {
        setModalOpen(true);
        setSelectedOtpremnica(otpremnica);
    };

    const handleDatum = (date) => {
        setDatum(date);
    };

    return (
        <>
            <h1 style={{ textAlign: "center" }}>Prodano</h1>
            <div style={{ margin: "10px" }}>
                <Button onClick={handleOpenModal} type="primary">
                    Novo Prodano
                </Button>
                <Button onClick={handleClear}>
                    Clear All
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
                                style={{ width: "472px"}}
                            />
                            {/* <label>Naziv prodano</label>
                            <Input value={nazivOtpremnice} onChange={handleNazivOtpremnice} /> */}
                            <label>Broj artikla</label>
                            <Input value={brojArtikla} onChange={handleBrojArtikla} />
                            <Button type="primary" onClick={() => setVisibleArtiklModal(true)}>Dodaj Artikl</Button>
                        </div>
                        {visibleArtiklModal && brojArtikla !== 0 && Array.from({ length: brojArtikla }, (_, index) => (
                            <div key={index}>
                                <h3>{`Unesi ${index + 1}. artikl: `}</h3>
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
                                <label>Iznos prodano</label>
                                <Input value={iznosOtpremnice} onChange={(e) => setIznosOtpremnice(e.target.value)} />
                                <Button onClick={handleSave}>Spremi Artikl</Button>
                            </div>
                        ))}
                        <Button type="primary" onClick={handleOk}>Spremi Prodano</Button>
                    </Modal>
                )}
                <div>
                    <ul style={{ listStyleType: "none" }}>
                        {otpremnice.map(o => (
                            <Button
                                key={o.key}
                                style={{ height: "160px", width: "160px", margin: "10px" }}
                                onClick={() => handleOpenModalDetails(o)}
                            >
                                <li key={o.key}>
                                    <h3>{o.datum}</h3>
                                    <p>{`Broj Artikla: ${o.brojArtikla}`}</p>
                                </li>
                            </Button>
                        ))}
                    </ul>
                </div>
                {selectedOtpremnica && (
                    <OtpremnicaDetails
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        otpremnica={selectedOtpremnica}
                        title={"Prodano"}
                    />
                )}
            </div>
        </>
    );
};

export default Prodano;
