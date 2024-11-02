import { Form, Modal, Switch, Input, notification } from "antd";
import React, { useEffect, useState } from "react";
import { formatDateForDisplay } from "../convert/dateConverter";
import { OtpremniceService } from "../api/OtpremniceService";
import { ArtikliService } from "../api/ArtikliService";
import { useBaseUrl } from "../contexts/BaseUrlContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfDocument from "../validation/PdfDocument";  // Make sure the path is correct

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
            if (item.kolicina == null || isNaN(item.kolicina) || item.kolicina <= 0) {
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
    
            console.log("Updated Storage:", updatedStorage); // Log updated storage
    
            // Update the Otpremnica
            await OtpremniceService.editOtpremnica(baseUrl, props.storageItem.id, updatedStorage);
    
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
       //handleSaveUpdate();
       handleOnClose();
    };

    const handleSwitchChange = (checked) => {
        setIsChecked(checked);
    };

    const handleArtiklChange = (index, key, value) => {
        const numericValue = parseFloat(value); // Ensure it's a number
    
        // Check if the value is valid
        if (!isNaN(numericValue) && numericValue >= 0) {
            const updatedArtikli = [...artikliStorage];
            updatedArtikli[index][key] = numericValue; // Use the numeric value
            setArtikliStorage(updatedArtikli);
        } else {
            notification.warning({
                message: 'Neispravna količina!',
                description: `Količina mora biti broj veći ili jednak nuli.`,
                placement: 'topRight'
            });
        }
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
            okText="Uredu"
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
            <div>
                <PDFDownloadLink document={<PdfDocument 
                                                date={formatDateForDisplay(props.storageItem?.date)}
                                                artikli={artikliStorage}
                                                title={"Otpremnica"}
                                            />} fileName="otpremnics.pdf">
                    {({ blob, url, loading, error }) =>
                        loading ? 'Učitavanje dokumenta...' : 'Preuzmi PDF'
                    }
                </PDFDownloadLink>
            </div>
        </Modal>
    );
};

export default OtpremnicaDetails;

