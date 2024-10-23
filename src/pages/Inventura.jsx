// import { Button, Input, Modal, Select, Form, List, DatePicker } from "antd";
// import React, { useEffect, useState } from "react";
// import { otpremnicaStorage } from "../storage/otpremniceStorage";
// import { artiklStorage } from "../storage/artikliStorage";
// import { v4 as uuidv4 } from 'uuid';
// import OtpremnicaDetails from "../modal/OtpremnicaDetails";
// import UkupnaEvidencija from "./UkupnaEvidencija";
// import { inventuraStorage } from "../storage/inventuraStorage";
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// import dayjs from 'dayjs';
// dayjs.extend(customParseFormat);

// const { Option } = Select;

// const Inventura = () => {
//     const [artikli, setArtikli] = useState([]);
//     const [nazivOtpremnice, setNazivOtpremnice] = useState("");
//     const [nazivArtikla, setNazivArtikla] = useState("");
//     const [postojeciArtikli, setPostojeciArtikli] = useState([]);
//     const [iznosOtpremnice, setIznosOtpremnice] = useState("");
//     const [visibleModal, setVisibleModal] = useState(false);
//     const [brojArtikla, setBrojArtikla] = useState("");
//     const [visibleArtiklModal, setVisibleArtiklModal] = useState(false);
//     const [otpremnice, setOtpremnice] = useState([]);
//     const [arrObjArtikl, setArrObjArtikl] = useState([]);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [selectedOtpremnica, setSelectedOtpremnica] = useState(null);
//     const [datum, setDatum] = useState(dayjs('01/01/2015', 'DD/MM/YYYY'));

//     const arrArtikl = Array.from({ length: brojArtikla }, (v, i) => i + 1);

//     useEffect(() => {
//         const artikliData = artiklStorage.getAll();
//         setArtikli(artikliData);

//         const artikliNaziv = artikliData.map((artikl) => artikl.artikl);
//         setPostojeciArtikli(artikliNaziv);

//         const otpremniceData = inventuraStorage.getAll();
//         setOtpremnice(otpremniceData);
//     }, []);

//     const handleOpenModal = () => {
//         setVisibleModal(!visibleModal);
//         setBrojArtikla("");
//         setArrObjArtikl([]);
//         setNazivOtpremnice("");
//     };

//     const handleBrojArtikla = (e) => {
//         const currentValue = e.target.value;
//         const convertedValue = parseInt(currentValue) || 0;
//         setBrojArtikla(convertedValue);
//     };

//     const handleNazivOtpremnice = (e) => {
//         setNazivOtpremnice(e.target.value);
//     };

//     const handleDatum = (date) => {
//         setDatum(date);
//     }

//     const handleClear = () => {
//         inventuraStorage.clearAll();
//         setOtpremnice([]);
//         console.log("LocalStorage cleared!");
//     };

//     const updateArtiklStorage = (objArr) => {
//         const updatedArtikl = artikli.map((artikl) => {
//             const foundArtikl = objArr.find((obj) => obj.nazivArtikla === artikl.artikl);
//             if (foundArtikl) {
//                 return {
//                     ...artikl,
//                     evidencijaRobe: parseInt(artikl.evidencijaRobe) + parseInt(foundArtikl.iznosOtpremnice),
//                 };
//             }
//             return artikl;
//         });

//         updatedArtikl.forEach((artikl) => {
//             artiklStorage.editArtikl(artikl);
//         });
//         console.log("Artikli updated: " + updatedArtikl);
//     }

//     const handleSave = () => {
//         const objArtikl = {
//             key: uuidv4(),
//             nazivArtikla: nazivArtikla,
//             iznosOtpremnice: iznosOtpremnice
//         };

//         setArrObjArtikl((prev) => [...prev, objArtikl]);
//         console.log("Current articles: ", arrObjArtikl);

//         setNazivArtikla("");
//         setIznosOtpremnice("");
//     };

//     const handleOk = () => {
//         if (arrObjArtikl.length === 0) {
//             alert("Please insert at least one article.");
//             return;
//         }

//         const key = uuidv4(); // Generate a unique key

//         const otpremnicaObj = {
//             key: key,
//             datum: datum.format("DD/MM/YYYY"),
//             naziv: nazivOtpremnice,
//             brojArtikla: brojArtikla,
//             artikl: arrObjArtikl
//         };

//         inventuraStorage.saveInventura(otpremnicaObj);
//         console.log("Otpremnica saved: ", otpremnicaObj);

//         updateArtiklStorage(arrObjArtikl);

//         setOtpremnice(inventuraStorage.getAll());

//         setVisibleArtiklModal(false);
//         setVisibleModal(false);
//         setNazivOtpremnice("");
//         setBrojArtikla("");
//         setArrObjArtikl([]);
//     };

//     const handleOpenModalDetails = (otpremnica) => {
//         setModalOpen(true);
//         setSelectedOtpremnica(otpremnica);
//     }

//     return (
//         <>
//             <h1 style={{ textAlign: "center" }}>Inventura</h1>
//             <div style={{ margin: "10px" }}>
//                 <Button onClick={handleOpenModal} type="primary">
//                     Nova inventura
//                 </Button>
//                 <Button onClick={handleClear}>
//                     Clear All
//                 </Button>
//             </div>
//             <div>
//                 {visibleModal && (
//                     <Modal
//                         visible={visibleModal}
//                         onCancel={() => setVisibleModal(false)}
//                         footer={null}
//                     >
//                         <div>
//                             <label>Datum</label>
//                                 <DatePicker
//                                     defaultValue={datum} 
//                                     format="DD/MM/YYYY" 
//                                     value={datum} 
//                                     onChange={handleDatum}
//                                     style={{ width: "472px"}}
//                                     />
//                             {/* <label>Naziv inventure</label>
//                             <Input value={nazivOtpremnice} onChange={handleNazivOtpremnice} /> */}
//                             <label>Broj artikla</label>
//                             <Input value={brojArtikla} onChange={handleBrojArtikla} />
//                             <Button type="primary" onClick={() => setVisibleArtiklModal(true)}>Dodaj Artikl</Button>
//                         </div>
//                         {visibleArtiklModal && brojArtikla !== 0 && arrArtikl.map((a, index) => (
//                             <div key={index}>
//                                 <h3>
//                                     {`Unesi ${index + 1}. artikl: `}
//                                 </h3>
//                                 <label>Naziv artikla</label>
//                                 <Select
//                                     style={{ width: '100%' }}
//                                     placeholder="Select an artikl"
//                                     onChange={(value) => setNazivArtikla(value)}
//                                     value={nazivArtikla}
//                                 >
//                                     {postojeciArtikli.map((artikl, idx) => (
//                                         <Option key={idx} value={artikl}>{artikl}</Option>
//                                     ))}
//                                 </Select>
//                                 <label>Iznos inventure</label>
//                                 <Input value={iznosOtpremnice} onChange={(e) => setIznosOtpremnice(e.target.value)} />
//                                 <Button onClick={handleSave}>Spremi artikl</Button>
//                             </div>
//                         ))}
//                         <Button type="primary" onClick={handleOk}>Spremi Inventuru</Button>
//                     </Modal>
//                 )}
//                 <div>
//                     <ul style={{ listStyleType: "none" }}>
//                         {otpremnice.map(o => (
//                             <Button
//                                 key={o.key}
//                                 style={{ height: "160px", width: "160px", margin: "10px" }}
//                                 onClick={() => handleOpenModalDetails(o)}
//                             >
//                                 <li key={o.key}>
//                                     <h3>{o.datum}</h3>
//                                     {/* <h3>{`Naziv: ${o.naziv}`}</h3> */}
//                                     <p>{`Broj Artikla: ${o.brojArtikla}`}</p>
//                                     {/* <p>{`Artikli: ${o.artikl.length}`}</p> */}
//                                 </li>
//                             </Button>
//                         ))}
//                     </ul>
//                 </div>
//                 <OtpremnicaDetails
//                     isOpen={modalOpen}
//                     onClose={() => setModalOpen(false)}
//                     otpremnica={selectedOtpremnica}
//                     title={"Inventura"}
//                 />
//             </div>
//         </>
//     );
// };

// export default Inventura;
