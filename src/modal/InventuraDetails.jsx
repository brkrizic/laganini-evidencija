import { Form, Input, Modal, notification, Switch, Spin } from "antd"; // Import Spin from antd
import React, { useEffect, useState } from "react";
import { InventuraService } from "../api/InventuraService";
import { ArtikliService } from "../api/ArtikliService";
import { formatDateForDisplay } from "../convert/dateConverter";
import { useBaseUrl } from "../contexts/BaseUrlContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfDocument from "../validation/PdfDocument";

const InventuraDetails = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(props.isOpen);
    const [isChecked, setIsChecked] = useState(false);
    const [artikliStorage, setArtikliStorage] = useState(props.storageItem?.artikli || []);
    const [artikli, setArtikli] = useState([]);
    const [loading, setLoading] = useState(false); // Loading state

    const { baseUrl } = useBaseUrl();

    useEffect(() => {
        const fetchArtikli = async () => {
            try {
                const res = await ArtikliService.getAllArtikli(baseUrl);
                setArtikli(res.data);
            } catch (error) {
                console.error("Failed to fetch artikli:", error);
            }
        };
        fetchArtikli();
    }, [baseUrl]); // Added baseUrl as a dependency

    useEffect(() => {
        setIsModalOpen(props.isOpen);
        setArtikliStorage(props.storageItem?.artikli || []);
    }, [props.isOpen, props.storageItem]);

    const handleSaveUpdate = async () => {
        // Validate all kolicina values before proceeding with the save
        for (const item of artikliStorage) {
            const kolicinaValue = String(item.kolicina);
            if (kolicinaValue.trim() === "" || parseFloat(kolicinaValue) <= 0) {
                notification.warning({
                    message: 'Neispravna količina!',
                    description: 'Sva količina polja moraju biti veća od 0.',
                    placement: 'topRight'
                });
                return;
            }
        }

        try {
            setLoading(true); // Start loading
            const updatedStorage = {
                date: props.storageItem.date,
                artikli: artikliStorage
            };

            console.log("Updated Storage:", updatedStorage);

            const updatedArtikl = artikli.map(artikl => {
                const foundArtikl = artikliStorage.find(a => a.nazivArtikla === artikl.naziv);
                if (foundArtikl) {
                    return {
                        ...artikl,
                        evidencijaRobe: parseFloat(foundArtikl.kolicina)
                    };
                }
                return artikl;
            });

            await InventuraService.editInventura(baseUrl, props.storageItem.id, updatedStorage);

            console.log("Updated Artikli:", updatedArtikl);

            await Promise.all(updatedArtikl.map(async (artikl) => {
                await ArtikliService.editArtikl(baseUrl, artikl.id, artikl);
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
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleOnClose = () => {
        setIsModalOpen(false);
        setIsChecked(false);
        props.onClose();
    };

    const handleOnOk = () => {
        //handleSaveUpdate();
        handleOnClose();
    };

    const handleSwitchChange = (checked) => {
        setIsChecked(checked);
    };

    const handleArtiklChange = (index, key, value) => {
        const updatedArtikli = [...artikliStorage];
        updatedArtikli[index][key] = value;
        setArtikliStorage(updatedArtikli);
    };

    return (
        <Modal
            open={isModalOpen}
            onCancel={handleOnClose}
            cancelText="Odustani"
            onOk={handleOnOk}
            okText="Spremi promjene"
            title={props.title}
        >
            {loading ? ( // Display spinner if loading
                <Spin tip="Učitavanje..." style={{ display: 'block', textAlign: 'center' }} />
            ) : (
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
                                    <th style={{ border: '1px solid black', padding: '8px' }}>Količina</th>
                                </tr>
                            </thead>
                            <tbody>
                                {artikliStorage.length > 0 ? artikliStorage.map((a, index) => (
                                    <tr key={index}>
                                        {isChecked ? (
                                            <>
                                                <td style={{ border: '1px solid black', padding: '8px' }}>{a.nazivArtikla}</td>
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
            )}
            <div>
                <PDFDownloadLink document={<PdfDocument 
                                                date={formatDateForDisplay(props.storageItem?.date)}
                                                artikli={artikliStorage}
                                                title={"Inventura"}
                                            />} fileName="inventura.pdf">
                    {({ blob, url, loading, error }) =>
                        loading ? 'Učitavanje dokumenta...' : 'Preuzmi PDF'
                    }
                </PDFDownloadLink>
            </div>
        </Modal>
    );
};

export default InventuraDetails;
