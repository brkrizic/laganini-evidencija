import { Form, Modal } from "antd";
import React, { useEffect, useState } from "react";

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
                title="Otpremnica details"
            >
            <Form>
                <Form.Item>
                        <h3>{`Naziv otpremnice: ${props.otpremnica?.naziv || ""}`}</h3>
                        <p>{`Broj artikla: ${props.otpremnica?.brojArtikla || 0}`}</p>
                        <p>Artikli:</p>
                        <ul style={{ paddingLeft: 20 }}>
                            {props.otpremnica?.artikl?.map((a, index) => (
                                <li key={index}>
                                    <p>{`Naziv artikla: ${a.nazivArtikla}`}</p>
                                    <p>{`Iznos otpremnice: ${a.iznosOtpremnice}`}</p>
                                </li>
                            )) || <p>No articles available.</p>}
                        </ul>
                </Form.Item>
            </Form>
            </Modal>
        </>
    );
}
export default OtpremnicaDetails;