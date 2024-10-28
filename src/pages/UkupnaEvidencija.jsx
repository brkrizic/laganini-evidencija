import React, { useEffect, useState } from "react";
import { Table, Spin, notification, Button, Dropdown, Menu, Input, Slider } from "antd";
import "./styles/stylesTable.css";
import { ArtikliService } from "../api/ArtikliService";
import { baseUrl } from "../url/baseUrl";
import { useBaseUrl } from "../contexts/BaseUrlContext";

const UkupnaEvidencija = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    //Filter
    const [naziv, setNaziv] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [evidencijaStanja, setEvidencijaStanja] = useState('');
    const [evidencijaRobe, setEvidencijaRobe] = useState();
    const [razlika, setRazlika] = useState('');
    const [ukupnoProdano, setUkupnoProdano] = useState('');
    const [ukupnoKupljeno, setUkupnoKupljeno] = useState('');

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


    useEffect(() => {
        console.log(naziv);
    }, [naziv]);

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
    }


    const filterData = (
        <Menu>
            <div style={{ margin: '10px'}}>
                <Menu.Item>
                    <div style={{ marginRight: '5px'}}>
                        <label>Naziv:</label>
                    </div>
                <Input value={naziv} onChange={(e) => setNaziv(e.target.value)}></Input>
            </Menu.Item>
            </div>
            {/* <div style={{ margin: '10px'}}>
                <Menu.Item>
                    <div style={{ marginRight: '5px'}}>
                        <label>Razlika:</label>
                    </div>
                <Input value={razlika} onChange={(e) => setRazlika(e.target.value)}></Input>
            </Menu.Item>
            </div> */}
            <div style={{ textAlign: 'right', margin: '10px', marginTop: '35px'}}>
                <Button type="default" onClick={() => resetFilter()}>Resetiraj</Button>
                <Button type="primary" onClick={() => handleFilter()}>Filtriraj</Button>
            </div>
        </Menu>
    )

    const handleVisibleChange = (flag) => {
        setVisible(flag)
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
