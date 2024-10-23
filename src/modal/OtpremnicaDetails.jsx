import { Form, Modal, Switch, Input, notification } from "antd";
import React, { useEffect, useState } from "react";
import { formatDateForDisplay } from "../convert/dateConverter";
import { OtpremniceService } from "../api/OtpremniceService";
import { ArtikliService } from "../api/ArtikliService";

const OtpremnicaDetails = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(props.isOpen);
    const [isChecked, setIsChecked] = useState(false);
    const [artikliStorage, setArtikliStorage] = useState(props.storageItem?.artikli || []);
    const [artikli, setArtikli] = useState([]);

    useEffect(() => {
        const fetchArtikli = async () => {
            try {
                const res = await ArtikliService.getAllArtikli();
                setArtikli(res.data);
            } catch (error) {
                console.error("Failed to fetch artikli:", error);
            }
        };

        fetchArtikli();
        setIsModalOpen(props.isOpen);
        setArtikliStorage(props.storageItem?.artikli || []);
    }, [props.isOpen, props.storageItem]);

    const handleSaveUpdate = async () => {
        try {
            const updatedStorage = {
                date: props.storageItem.date,
                artikli: artikliStorage
            };

            const updatedArtikl = artikli.map(artikl => {
                const foundArtikl = artikliStorage.find(a => a.nazivArtikla === artikl.naziv);
                if (foundArtikl) {
                    return {
                        ...artikl,
                        kupljenaKolicina: parseFloat(foundArtikl.kolicina) // Replace previous quantity with new one
                    };
                }
                return artikl;
            });

            await OtpremniceService.editOtpremnica(props.storageItem.id, updatedStorage);
            await Promise.all(updatedArtikl.map(async (artikl) => {
                await ArtikliService.editArtikl(artikl.id, artikl);
            }));

            notification.success({
                message: 'Uspješno ažurirano!',
                placement: 'topRight'
            });
            handleOnClose();
        } catch (error) {
            console.error('Error saving updates:', error);
            notification.error({
                message: 'Greška prilikom ažuriranja!',
                placement: 'topRight'
            });
        }
    };

    const handleOnClose = () => {
        setIsModalOpen(false);
        setIsChecked(false);
        props.onClose();
    };

    const handleOnOk = () => {
        handleSaveUpdate();
    };

    const handleSwitchChange = (checked) => {
        setIsChecked(checked);
    };

    const handleArtiklChange = (index, key, value) => {
        const updatedArtikli = [...artikliStorage];

        // Replace the previous input for 'kolicina' with the new value
        if (key === 'kolicina') {
            updatedArtikli[index][key] = value; // Replace previous input
        } else {
            updatedArtikli[index][key] = value; // For other fields, keep existing logic
        }

        setArtikliStorage(updatedArtikli);
    };

    return (
        <Modal
            open={isModalOpen}
            onCancel={handleOnClose}
            onOk={handleOnOk}
            title={props.title}
        >
            <Form>
                <Form.Item>
                    <p>{`Datum: ${props.storageItem ? formatDateForDisplay(props.storageItem.date) : ""}`}</p>
                    <p>Artikli:</p>
                    <div style={{ textAlign: "right", marginBottom: "5px", display: "flex", flexDirection: "row", marginLeft: "370px" }}>
                        <p>Uređivanje</p>
                        <div style={{ marginTop: "13px", marginLeft: "8px" }}>
                            <Switch size="small" checked={isChecked} onChange={handleSwitchChange} />
                        </div>
                    </div>
                    <table style={{ paddingLeft: 20, borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Naziv artikla</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Kolicina</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artikliStorage.length > 0 ? artikliStorage.map((a, index) => (
                                <tr key={index}>
                                    {isChecked ? (
                                        <>
                                            <td style={{ border: '1px solid black', padding: '8px' }}>
                                                <Input value={a.nazivArtikla} onChange={(e) => handleArtiklChange(index, 'nazivArtikla', e.target.value)} />
                                            </td>
                                            <td style={{ border: '1px solid black', padding: '8px', textAlign: "center" }}>
                                                <Input value={a.kolicina} onChange={(e) => handleArtiklChange(index, 'kolicina', e.target.value)} />
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ border: '1px solid black', padding: '8px' }}>{a.nazivArtikla}</td>
                                            <td style={{ border: '1px solid black', padding: '8px', textAlign: "center" }}>{a.kolicina}</td>
                                        </>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'center', padding: '8px' }}>Artikli nisu dostupni.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default OtpremnicaDetails;
