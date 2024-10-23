import { Form, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { formatDateForDisplay } from "../convert/dateConverter";

const OtpremnicaDetails = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(props.isOpen);

    useEffect(() => {
        setIsModalOpen(props.isOpen);
    }, [props.isOpen]);

    const handleOnClose = () => {
        setIsModalOpen(false);
        props.onClose();
    }

    return (
        <>
            <Modal
                open={isModalOpen}
                onCancel={handleOnClose}
                onOk={handleOnClose}
                title={props.title}
            >
            <Form>
                <Form.Item>
                        {/* <h3>{`Naziv ${props.title}: ${props.otpremnica?.naziv || ""}`}</h3> */}
                        <p>{`Datum: ${props.otpremnica ? formatDateForDisplay(props.otpremnica.date) : ""}`}</p>
                        {/* <p>{`Broj artikla: ${props.otpremnica?.brojArtikla || 0}`}</p> */}
                        <p>Artikli:</p>
                        <table style={{ paddingLeft: 20, borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid black', padding: '8px' }}>Naziv artikla</th>
                                    <th style={{ border: '1px solid black', padding: '8px' }}>Kolicina</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.otpremnica?.artikli?.map((a, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid black', padding: '8px' }}>{a.nazivArtikla}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: "center" }}>{a.kolicina}</td>
                                    </tr>
                                )) || (
                                    <tr>
                                        <td colSpan="2" style={{ textAlign: 'center', padding: '8px' }}>Artikli nisu dostupni.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                </Form.Item>
            </Form>
            </Modal>
        </>
    );
}
export default OtpremnicaDetails;