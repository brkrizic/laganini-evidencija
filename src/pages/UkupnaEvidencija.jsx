import React, { useEffect, useState } from "react";
import { Table, Spin, notification } from "antd";
import "./styles/stylesTable.css";
import { ArtikliService } from "../api/ArtikliService";

const UkupnaEvidencija = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true); // Start loading
        try {
            const res = await ArtikliService.getAllArtikli();
            const resData = res.data;
            const updatedData = resData; // Update data here
            setDataSource(updatedData); // Set updated data to state
        } catch (error) {
            console.log(error);
            notification.error({
                message: "Error fetching data",
                description: error.message,
            });
        } finally {
            setLoading(false); // Stop loading
        }
    };

    useEffect(() => {
        fetchData();
    }, []);



    // Table columns definition
    const columns = [
        {
            title: "Naziv",
            dataIndex: "naziv",
            key: "naziv",
            className: "mainColumn",
        },
        {
            title: "Evidencija stanja (l/kg)",
            dataIndex: "evidencijaStanja",
            key: "evidencijaStanja",
            align: "center",
        },
        {
            title: "Evidencija robe (l/kg)",
            dataIndex: "razlika",
            key: "razlika",
            align: "center",
        },
        {
            title: "Razlika (l/kg)",
            dataIndex: "evidencijaRobe",
            key: "evidencijaRobe",
            align: "center",
        },
        {
            title: "Ukupno prodano (l/kg)",
            dataIndex: "prodajnaKolicina",
            key: "prodajnaKolicina",
            align: "center",
        },
        {
            title: "Ukupno kupljeno (l/kg)",
            dataIndex: "kupljenaKolicina",
            key: "kupljenaKolicina",
            align: "center",
        },
    ];

    return (
        <div>
            <div style={{ backgroundColor: "#0063a6", height: "50px", width: "100%" }}>
                <div style={{ marginTop: "-10px" }}>
                    <h1 style={{ textAlign: "center", color: "white", marginTop: "-10px" }}>Ukupna evidencija</h1>
                </div>
            </div>
            <Spin spinning={loading}>
                <div style={{ display: "flex", flexDirection: "row", margin: "10px", marginLeft: "10px" }}>
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        rowKey="id"  // assuming each item has a unique 'id'
                        style={{ width: "100%", textAlign: "center" }}
                    />
                </div>
            </Spin>
        </div>
    );
};

export default UkupnaEvidencija;
