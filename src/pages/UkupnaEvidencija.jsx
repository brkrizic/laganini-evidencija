import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input } from "antd";
import { artiklStorage } from "../storage/artikliStorage"; // Ensure this path is correct
import { DeleteFilled, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import "./styles/stylesTable.css";

const UkupnaEvidencija = () => {
    const [dataSource, setDataSource] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [razlika, setRazlika] = useState(0);
    const [form] = Form.useForm();

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
                        <p style={{textAlign: "center"}}>{_}</p>
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
                        <p style={{textAlign: "center"}}>{_}</p>
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

                if(razlika < 0){
                    color = 'red'; //Negative difference
                } else if(razlika > 0){
                    color = '#5ce65c';
                } else {
                    color = 'black';
                }

                return (
                    <span style={{ color }}>
                        <strong><p style={{textAlign: "center"}}>{razlika}</p></strong>
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
                        icon={<EditOutlined/>}
                        style={{ color: "blue"}}
                        >
                    </Button>
                    <Button
                        type="danger"
                        onClick={() => handleDelete(record.key)}
                        icon={<DeleteOutlined/>}
                        style={{ marginLeft: 8 , color:"red"}}
                    >
                    </Button>
                </>
            ),
        },
    ];

    useEffect(() => {
        // Load data from localStorage on component mount
        const storedData = artiklStorage.getAll();
        if (storedData) {
            console.log(storedData);
            setDataSource(storedData);
        }
    }, []);

    // Clear all articles from local storage and reset data source
    const clearLocalStorage = () => {
        localStorage.removeItem("ArtiklData"); // Remove the specific key
        setDataSource([]); // Update the UI to reflect the cleared data
        console.log("Local storage cleared.");
    };

    const showAddModal = () => {
        setCurrentItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (item) => {
        setCurrentItem(item);
        form.setFieldsValue(item); // Populate form with the selected item
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            const newItem = { 
                key: Date.now().toString(), ...values, 
                razlika: values.evidencijaRobe - values.evidencijaStanja,
            };
            if (currentItem) {
                // Update operation
                const updatedData = dataSource.map((item) =>
                    item.key === currentItem.key ? { ...item, ...values } : item
                );
                setDataSource(updatedData);
                artiklStorage.saveArtikl(updatedData); // Save the updated data to local storage
            } else {
                // Create operation
                setDataSource([...dataSource, newItem]);
                artiklStorage.addArtikl(newItem); // Save new item to local storage
            }
            setIsModalVisible(false);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleDelete = (key) => {
        const updatedData = artiklStorage.deleteArtikl(key);
        setDataSource(updatedData); // Update state to reflect deletion
    };

    return (
        <div style={{margin: "10px"}}>
            <h1 style={{ textAlign: "center" }}>Ukupna evidencija</h1>
            <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>
                Add Item
            </Button>
            <Button onClick={clearLocalStorage} type="danger" style={{ marginLeft: 8 }}>
                Clear All
            </Button>
            <Table 
                columns={columns} 
                dataSource={dataSource} 
                rowKey="key" 
                style={{width: "50%", textAlign: "center"}}
                />
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
                        name="evidencijaStanja"
                        label="Evidencija stanja"
                        rules={[{ required: true, message: "Please input the evidencija stanja!" }]}
                    >
                        <Input type="number"/>
                    </Form.Item>
                    <Form.Item
                        name="evidencijaRobe"
                        label="Evidencija robe"
                        rules={[{ required: true, message: "Please input the evidencija robe!" }]}
                    >
                        <Input type="number"/>
                    </Form.Item>
                    {/* <Form.Item
                        name="razlika"
                        label="Razlika"
                    >
                        <Input readOnly/>
                    </Form.Item> */}
                </Form>
            </Modal>
        </div>
    );
};

export default UkupnaEvidencija;
