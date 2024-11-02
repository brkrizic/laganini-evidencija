import React, { useEffect, useState } from "react";
import { Table, Spin, notification, Button, Dropdown, Menu, Input } from "antd";
import "./styles/stylesTable.css";
import { ArtikliService } from "../api/ArtikliService";
import { useBaseUrl } from "../contexts/BaseUrlContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfDocument from "../validation/PdfDocument";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import MainPdfDocument from "../validation/MainPdfDocument";
dayjs.extend(customParseFormat);

const UkupnaEvidencija = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [artikliStorage, setArtikliStorage] = useState([]);

    // Filter
    const [naziv, setNaziv] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const { baseUrl } = useBaseUrl();

    const fetchData = async () => {
        setLoading(true); // Start loading
        try {
            const res = await ArtikliService.getAllArtikli(baseUrl);
            const resData = res.data;
            const updatedData = handleIzracunaj(resData); // Update data here
            setDataSource(updatedData); // Set updated data to state
            setFilteredData(updatedData);
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

    const handleIzracunaj = (data) => {
        return data.map(artikl => {
            const evidencijaStanja = parseFloat(artikl.kupljenaKolicina || 0) - parseFloat(artikl.prodajnaKolicina || 0);
            const razlika = parseFloat(artikl.evidencijaRobe || 0) - evidencijaStanja;

            return {
                ...artikl,
                evidencijaStanja: evidencijaStanja,
                razlika: razlika
            };
        });
    };

    // Table columns definition
    const columns = [
        {
            title: "Naziv",
            dataIndex: "naziv",
            key: "naziv",
            className: "mainColumn",
        },
        {
            title: "Evidencija stanja (l/kg/kom)",
            dataIndex: "evidencijaStanja",
            key: "evidencijaStanja",
            align: "center",
        },
        {
            title: "Evidencija robe (l/kg/kom)",
            dataIndex: "evidencijaRobe",
            key: "evidencijaRobe",
            align: "center",
        },
        {
            title: "Razlika (l/kg/kom)",
            dataIndex: "razlika",
            key: "razlika",
            align: "center",
            render: (record) => {
                const style = { color: record < 0 ? 'red' : record > 0 ? '#0f0cde' : 'inherit' };
                return <strong><span style={style}>{record}</span></strong>;
            }
        },
        {
            title: "Ukupno prodano (l/kg/kom)",
            dataIndex: "prodajnaKolicina",
            key: "prodajnaKolicina",
            align: "center",
        },
        {
            title: "Ukupno kupljeno (l/kg/kom)",
            dataIndex: "kupljenaKolicina",
            key: "kupljenaKolicina",
            align: "center",
        },
    ];

    const handleFilter = () => {
        const newFilteredData = dataSource.filter(item =>
            item.naziv.toLowerCase().includes(naziv.toLowerCase())
        );
        setFilteredData(newFilteredData);
        setVisible(false);
    };

    const resetFilter = () => {
        setFilteredData(dataSource);
        setNaziv('');
    };

    const resetAllArtikl = async () => {
        const confirm = window.confirm("Are you sure you want to reset all article values?");
        if (!confirm) return;
    
        setResetLoading(true); // Set loading state for reset action
        const updatePromises = dataSource.map(async (artikl) => {
            const artiklObj = {
                naziv: artikl.naziv,
                prodajnaKolicina: 0,
                kupljenaKolicina: 0,
                evidencijaRobe: 0
            };
    
            try {
                // Make sure to pass the correct baseUrl and id
                const response = await ArtikliService.editArtikl(baseUrl, artikl.id, artiklObj);
                console.log(`Updated ${artikl.naziv}:`, response.data); // Log the successful response
            } catch (error) {
                console.error(`Error updating artikl ${artikl.naziv}:`, error);
                throw error; // Re-throw error to catch it later if needed
            }
        });
    
        try {
            await Promise.all(updatePromises);
            notification.success({
                message: "Success",
                description: "All articles have been reset successfully."
            });
            await fetchData(); // Ensure data is re-fetched after reset
        } catch (error) {
            notification.error({
                message: "Error",
                description: "Some articles could not be reset. Please check the console for details."
            });
        } finally {
            setResetLoading(false); // Stop loading
        }
    };    

    const filterData = (
        <Menu>
            <div style={{ margin: '10px' }}>
                <Menu.Item>
                    <div style={{ marginRight: '5px' }}>
                        <label>Naziv:</label>
                    </div>
                    <Input value={naziv} onChange={(e) => setNaziv(e.target.value)}></Input>
                </Menu.Item>
            </div>
            <div style={{ textAlign: 'right', margin: '10px', marginTop: '35px' }}>
                <Button type="default" onClick={resetFilter}>Resetiraj</Button>
                <Button type="primary" onClick={handleFilter}>Filtriraj</Button>
            </div>
        </Menu>
    );

    const handleVisibleChange = (flag) => {
        setVisible(flag);
    }

    return (
        <div>
            <div style={{ backgroundColor: "#0063a6", height: "50px", width: "100%" }}>
                <div style={{ marginTop: "-10px" }}>
                    <h1 style={{ textAlign: "center", color: "white", marginTop: "-10px" }}>Ukupna evidencija</h1>
                </div>
            </div>
            <div style={{ margin: '10px' }}>
                <Dropdown
                    overlay={filterData}
                    trigger={['click']}
                    onVisibleChange={handleVisibleChange}
                    visible={visible}
                >
                    <Button>Filtriraj</Button>
                </Dropdown>
                {/* <Button onClick={() => resetAllArtikl(dataSource)} loading={resetLoading}>
                    Resetiraj vrijednosti artikla
                </Button> */}
                <div style={{ textAlign: "right", marginTop: "-30px"}}>
                    <PDFDownloadLink document={<MainPdfDocument 
                                                    date={dayjs()}
                                                    artikli={dataSource}
                                                    title={"Ukupna Evidencija"}
                                                />} fileName="ukupnaEvidencija.pdf">
                        {({ blob, url, loading, error }) =>
                            loading ? <Spin>'Učitavanje dokumenta...'</Spin> : 'Preuzmi PDF'
                        }
                    </PDFDownloadLink>
                </div>
            </div>
            <Spin spinning={loading}>
                <div style={{ display: "flex", flexDirection: "row", margin: "10px", marginLeft: "10px" }}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"  // assuming each item has a unique 'id'
                        style={{ width: "100%", textAlign: "center" }}
                    />
                </div>
            </Spin>
        </div>
    );
};

export default UkupnaEvidencija;
