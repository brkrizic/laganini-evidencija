import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input } from "antd";
import { artiklStorage } from "../storage/artikliStorage"; // Ensure this path is correct
import { DeleteFilled, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import "./styles/stylesTable.css";

const UkupnaEvidencija = () => {
    const [dataSource, setDataSource] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [form] = Form.useForm();
    const [ukupnoKupljeno, setUkupnoKupljeno] = useState(0);
    const [ukupnoProdano, setUkupnoProdano] = useState(0);
    const [evidencijaRobe, setEvidencijaRobe] = useState(0);

    useEffect(() => {
        // Load data from localStorage on component mount
        const storedData = artiklStorage.getAll();
        if (storedData) {
            console.log(storedData);
            const updatedData = handleEvidencijaStanja(storedData);
            setDataSource(updatedData);
        }
    }, []);

    const handleEvidencijaStanja = (data) => {
        return data.map(d => ({
            ...d,
            evidencijaStanja: parseInt(d.ukupnoKupljeno) - parseInt(d.ukupnoProdano),
        }));
    };

    // Table columns definition
    const columns = [
        {
            title: "Artikl",
            dataIndex: "artikl",
            key: "artikl",
            className: "mainColumn"
        },
        {
            title: "Evidencija stanja",
            dataIndex: "evidencijaStanja",
            key: "evidencijaStanja",
            align: "center",
            render: (_, record) => {
                return (
                    <span>
                        <p style={{ textAlign: "center" }}>{_}</p>
                    </span>
                );
            }
        },
        {
            title: "Evidencija robe",
            dataIndex: "evidencijaRobe",
            key: "evidencijaRobe",
            align: "center",
            render: (_, record) => {
                return (
                    <span>
                        <p style={{ textAlign: "center" }}>{_}</p>
                    </span>
                );
            }
        },
        {
            title: "Razlika",
            dataIndex: "razlika",
            key: "razlika",
            align: "center",
            render: (_, record) => {
                const razlika = record.evidencijaRobe - record.evidencijaStanja;
                let color;

                if (razlika < 0) {
                    color = 'red'; // Negative difference
                } else if (razlika > 0) {
                    color = '#5ce65c';
                } else {
                    color = 'black';
                }

                return (
                    <span style={{ color }}>
                        <strong><p style={{ textAlign: "center" }}>{razlika}</p></strong>
                    </span>
                );
            }
        },
        {
            title: "Akcije",
            key: "action",
            align: "center",
            render: (_, record) => (
                <>
                    <Button
                        type="default"
                        onClick={() => showEditModal(record)}
                        icon={<EditOutlined />}
                        style={{ color: "blue" }}
                    >
                    </Button>
                    <Button
                        type="danger"
                        onClick={() => handleDelete(record.key)}
                        icon={<DeleteOutlined />}
                        style={{ marginLeft: 8, color: "red" }}
                    >
                    </Button>
                </>
            ),
        },
        {
            title: "Ukupno prodano",
            key: "ukupnoProdano",
            dataIndex: "ukupnoProdano"
        },
        {
            title: "Ukupno kupljeno",
            key: "ukupnoKupljeno",
            dataIndex: "ukupnoKupljeno"
        }
    ];

    // Clear all articles from local storage and reset data source
    const clearLocalStorage = () => {
        localStorage.removeItem("ArtiklData"); // Remove the specific key
        setDataSource([]); // Update the UI to reflect the cleared data
        console.log("Local storage cleared.");
    };

    const showAddModal = () => {
        setCurrentItem(null);
        form.resetFields();
        setUkupnoKupljeno(0);
        setUkupnoProdano(0);
        setEvidencijaRobe(0);
        setIsModalVisible(true);
    };

    const showEditModal = (item) => {
        setCurrentItem(item);
        form.setFieldsValue(item); // Populate form with the selected item
        setUkupnoKupljeno(item.ukupnoKupljeno);
        setUkupnoProdano(item.ukupnoProdano);
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            const updatedValues = {
                ...values,
                evidencijaStanja: ukupnoKupljeno - ukupnoProdano,
                evidencijaRobe,
                ukupnoKupljeno,
                ukupnoProdano,
                razlika: values.evidencijaRobe - (ukupnoKupljeno - ukupnoProdano),
            };

            const newItem = {
                key: Date.now().toString(), ...updatedValues
            };

            if (currentItem) {
                // Update operation
                const updatedData = dataSource.map((item) =>
                    item.key === currentItem.key ? { ...item, ...updatedValues } : item
                );
                const finalData = handleEvidencijaStanja(updatedData);
                setDataSource(finalData);
                artiklStorage.saveArtikl(finalData); // Save the updated data to local storage
            } else {
                // Create operation
                const finalData = handleEvidencijaStanja([...dataSource, newItem]);
                setDataSource(finalData);
                artiklStorage.addArtikl(newItem); // Save new item to local storage
            }
            setIsModalVisible(false);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleDelete = (key) => {
        const updatedData = artiklStorage.deleteArtikl(key);
        const finalData = handleEvidencijaStanja(updatedData);
        setDataSource(finalData); // Update state to reflect deletion
    };

    return (
        <div style={{ margin: "10px" }}>
            <h1 style={{ textAlign: "center" }}>Ukupna evidencija</h1>
            <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>
                Add Item
            </Button>
            <Button onClick={clearLocalStorage} type="danger" style={{ marginLeft: 8 }}>
                Clear All
            </Button>
            <div style={{ display: "flex", flexDirection: "row", margin: "10px", marginLeft: "10px" }}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="key"
                    style={{ width: "100%", textAlign: "center" }}
                />
            </div>
            <Modal
                title={currentItem ? "Edit Item" : "Add Item"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="artikl"
                        label="Artikl"
                        rules={[{ required: true, message: "Please input the artikl!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="evidencijaRobe"
                        label="Evidencija robe"
                        // rules={[{ required: true, message: "Please input the evidencija robe!" }]}
                    >
                        <Input 
                            type="number" 
                            value={evidencijaRobe} 
                            onChange={e => setEvidencijaRobe(e)}/>
                    </Form.Item>
                    <Form.Item
                        name="ukupnoProdano"
                        label="Ukupno Prodano"
                        // rules={[{ required: true, message: "Please input the ukupno prodano!" }]}
                    >
                        <Input
                            type="number"
                            value={ukupnoProdano}
                            onChange={(e) => setUkupnoProdano(parseInt(e.target.value) || 0)}
                        />
                    </Form.Item>
                    <Form.Item
                        name="ukupnoKupljeno"
                        label="Ukupno Kupljeno"
                        // rules={[{ required: true, message: "Please input the ukupno kupljeno!" }]}
                    >
                        <Input
                            type="number"
                            value={ukupnoKupljeno}
                            onChange={(e) => setUkupnoKupljeno(parseInt(e.target.value) || 0)}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UkupnaEvidencija;
