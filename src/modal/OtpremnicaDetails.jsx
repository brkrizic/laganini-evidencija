import { Form, Modal, Switch, Input, notification } from "antd";
import React, { useEffect, useState } from "react";
import { formatDateForDisplay } from "../convert/dateConverter";
import { OtpremniceService } from "../api/OtpremniceService";
import { ArtikliService } from "../api/ArtikliService";
import { useBaseUrl } from "../contexts/BaseUrlContext";

const OtpremnicaDetails = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(props.isOpen);
    const [isChecked, setIsChecked] = useState(false);
    const [artikliStorage, setArtikliStorage] = useState(props.storageItem?.artikli || []);
    const [artikli, setArtikli] = useState([]);

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
                    description: `Količina za "${item.nazivArtikla}" mora biti veća od 0.`,
                    placement: 'topRight'
                });
                return; // Stop the save process if validation fails
            }
        }
    
        try {
            const updatedStorage = {
                date: props.storageItem.date,
                artikli: artikliStorage
            };
    
            // Log updatedStorage for debugging
            console.log("Updated Storage:", updatedStorage);
    
            // Array of promises to update each article
            const updatedArtiklPromises = artikliStorage.map(async (artiklStorageItem) => {
                const foundArtikl = artikli.find(artikl => artikl.naziv === artiklStorageItem.nazivArtikla);
                if (foundArtikl) {
                    // Replace the kupljenaKolicina with the new value
                    const updatedArtikl = {
                        ...foundArtikl,
                        kupljenaKolicina: parseFloat(artiklStorageItem.kolicina) // Replace value
                    };
    
                    // Log each updated artikl for debugging
                    console.log("Updating Artikl:", updatedArtikl);
    
                    await ArtikliService.editArtikl(baseUrl, foundArtikl.id, updatedArtikl);
                    return updatedArtikl; // Return the updated article (optional)
                }
                return null; // If not found, return null (optional)
            });
    
            // Update the Otpremnica
            await OtpremniceService.editOtpremnica(baseUrl, props.storageItem.id, updatedStorage);
            
            // Await the completion of all updates
            await Promise.all(updatedArtiklPromises);
    
            notification.success({
                message: 'Uspješno ažurirano!',
                placement: 'topRight'
            });
            
            // Optional: Refresh local state if needed
            setArtikliStorage(prev => [...prev]); // Update state to re-render if necessary
    
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
        updatedArtikli[index][key] = value;
        setArtikliStorage(updatedArtikli);
    };

    // const handleSameDate = (date) => {
    //     // This function checks if the date already exists in the storage
    //     const duplicateDate = artikliStorage.some(item => formatDateForDisplay(item.date) === formatDateForDisplay(date));
    //     if (duplicateDate) {
    //         notification.error({
    //             message: `Otpremnica s datumom ${formatDateForDisplay(date)} već postoji!`,
    //             placement: 'topRight'
    //         });
    //         return true; // Indicate a duplicate date was found
    //     }
    //     return false; // No duplicate found
    // }

    return (
        <Modal
            open={isModalOpen}
            onCancel={handleOnClose}
            cancelText="Odustani"
            onOk={handleOnOk}
            okText="Spremi promjene"
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
        </Modal>
    );
};

export default OtpremnicaDetails;

