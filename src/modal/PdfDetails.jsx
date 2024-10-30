import { Modal } from "antd";
import React, { useEffect, useState } from "react";

const PdfDetails = (props) => {
    const [isOpenModal, setIsOpenModal] = useState(props.isOpen)

    useEffect(() => {
        setIsOpenModal(props.isOpen);
    }, [props.isOpen]);

    return (
        <Modal
            visible={isOpenModal}
        >
            {props.data}
        </Modal>
    );
}
export default PdfDetails;