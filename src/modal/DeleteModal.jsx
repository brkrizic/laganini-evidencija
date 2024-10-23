import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal, Spin } from "antd";
import React, { useEffect, useState } from "react";

const DeleteModal = (props) => {
    const [isOpen, setIsOpen] = useState(props.isOpen);

    useEffect(() => {
        setIsOpen(props.isOpen);
    }, [props.isOpen]);

    const handleOnClose = () => {
        setIsOpen(false);
        props.onClose();
    }

    return (
        <>
            <Modal
                visible={isOpen}
                onOk={props.handleDelete}
                onCancel={handleOnClose}
                okText="Delete"
                okType="danger"
                cancelText="Cancel"
            >
                <Spin spinning={props.loading}>
                <div style={{ textAlign: 'center', display: "flex", flexDirection: "row"}}>
                    <ExclamationCircleOutlined style={{ fontSize: '24px', color: 'red', marginRight:"30px" }} />
                    <p>Jeste li sigurni da želite izbrisati?</p>
                </div>
                </Spin>
            </Modal>
        </>
    );
}
export default DeleteModal;