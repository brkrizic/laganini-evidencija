import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Spin, notification } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import "./styles/stylesTable.css";
import { ArtikliService } from "../api/ArtikliService";

const UkupnaEvidencija = () => {
    const [dataSource, setDataSource] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [form] = Form.useForm();
    const [ukupnoKupljeno, setUkupnoKupljeno] = useState(0);
    const [ukupnoProdano, setUkupnoProdano] = useState(0);
    const [evidencijaRobe, setEvidencijaRobe] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        async function fetchApi() {
            try {
                const res = await ArtikliService.getAllArtikli();
                const storedData = res.data;
                const nazivData = storedData.naziv;
                if (storedData) {
                    const updatedData = handleEvidencijaStanja(storedData);
                    setDataSource(updatedData);
                    console.log("Datasource: " + dataSource);
                }
            } catch (error) {
                console.error("Error:", error.message);
                notification.error({
                    message: "Error fetching data",
                    description: error.message,
                });
            } finally {
                setLoading(false);
            }
        }
        fetchApi();
    }, []);

    const handleEvidencijaStanja = (data) => {
        return data.map(d => ({
            ...d,
            evidencijaStanja: parseFloat(d.kupljenaKolicina) - parseFloat(d.prodajnaKolicina),
        }));
    };

    // Table columns definition
    const columns = [
        {
            title: "Naziv",
            dataIndex: "naziv",
            key: "naziv",
            className: "mainColumn"
        },
        {
            title: "Evidencija stanja (L)",
            dataIndex: "evidencijaStanja",
            key: "evidencijaStanja",
            align: "center",
            render: (evidencijaStanja) => (
                <p style={{ textAlign: "center" }}>{evidencijaStanja}</p>
            )
        },
        {
            title: "Evidencija robe (L)",
            dataIndex: "evidencijaRobe",
            key: "evidencijaRobe",
            align: "center",
            render: (evidencijaRobe) => (
                <p style={{ textAlign: "center" }}>{evidencijaRobe}</p>
            )
        },
        {
            title: "Razlika (L)",
            dataIndex: "razlika",
            key: "razlika",
            align: "center",
            render: (_, record) => {
                const razlika = record.evidencijaRobe - record.evidencijaStanja;
                let color;

                if (razlika < 0) {
                    color = 'red';
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
        // {
        //     title: "Akcije",
        //     key: "action",
        //     align: "center",
        //     render: (_, record) => (
        //         <>
        //             <Button
        //                 type="default"
        //                 onClick={() => showEditModal(record)}
        //                 icon={<EditOutlined />}
        //                 style={{ color: "blue" }}
        //             >
        //             </Button>
        //             <Button
        //                 type="danger"
        //                 onClick={() => handleDelete(record.key)}
        //                 icon={<DeleteOutlined />}
        //                 style={{ marginLeft: 8, color: "red" }}
        //             >
        //             </Button>
        //         </>
        //     ),
        // },
        {
            title: "Ukupno prodano (L)",
            key: "prodajnaKolicina",
            dataIndex: "prodajnaKolicina"
        },
        {
            title: "Ukupno kupljeno (L)",
            key: "kupljenaKolcina",
            dataIndex: "kupljenaKolicina"
        }
    ];

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
        setEvidencijaRobe(item.evidencijaRobe);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const updatedValues = {
                ...values,
                evidencijaStanja: ukupnoKupljeno - ukupnoProdano,
                evidencijaRobe,
                ukupnoKupljeno,
                ukupnoProdano,
                razlika: evidencijaRobe - (ukupnoKupljeno - ukupnoProdano),
            };

            const newItem = { key: Date.now().toString(), ...updatedValues };

            if (currentItem) {
                // Update operation
                const updatedData = dataSource.map((item) =>
                    item.key === currentItem.key ? { ...item, ...updatedValues } : item
                );
                const finalData = handleEvidencijaStanja(updatedData);
                setDataSource(finalData);
                await ArtikliService.saveArtikl(finalData);
                notification.success({
                    message: "Item updated successfully",
                });
            } else {
                // Create operation
                const finalData = handleEvidencijaStanja([...dataSource, newItem]);
                setDataSource(finalData);
                await ArtikliService.saveArtikl(newItem);
                notification.success({
                    message: "Item added successfully",
                });
            }
            setIsModalVisible(false);
        } catch (error) {
            console.log('Validate Failed:', error);
        }
    };

    const handleDelete = async (key) => {
        setLoading(true);
        try {
            const updatedData = await ArtikliService.deleteArtikl(key);
            const finalData = handleEvidencijaStanja(updatedData);
            setDataSource(finalData);
            notification.success({
                message: "Item deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting item:", error);
            notification.error({
                message: "Error deleting item",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ backgroundColor: "#0063a6", height: "50px", width: "100%"}}>
                <div style={{ marginTop: "-10px"}}>
                    <h1 style={{ textAlign: "center", color: "white", marginTop: "-10px"}}>Ukupna evidencija</h1>
                </div>
            </div>
            {/* <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>
                Add Item
            </Button> */}
            <Spin spinning={loading}>
                <div style={{ display: "flex", flexDirection: "row", margin: "10px", marginLeft: "10px" }}>
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        rowKey="key"
                        style={{ width: "100%", textAlign: "center" }}
                    />
                </div>
            </Spin>
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
                    >
                        <Input
                            type="number"
                            value={evidencijaRobe}
                            onChange={e => setEvidencijaRobe(parseFloat(e.target.value) || 0)}
                        />
                    </Form.Item>
                    <Form.Item
                        name="ukupnoProdano"
                        label="Ukupno Prodano"
                    >
                        <Input
                            type="number"
                            value={ukupnoProdano}
                            onChange={(e) => setUkupnoProdano(parseFloat(e.target.value) || 0)}
                        />
                    </Form.Item>
                    <Form.Item
                        name="ukupnoKupljeno"
                        label="Ukupno Kupljeno"
                    >
                        <Input
                            type="number"
                            value={ukupnoKupljeno}
                            onChange={(e) => setUkupnoKupljeno(parseFloat(e.target.value) || 0)}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UkupnaEvidencija;
