import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UkupnaEvidencija from "./pages/UkupnaEvidencija";
import Otpremnice from "./pages/Otpremnice";
import Prodano from "./pages/Prodano";
import Inventura from "./pages/Inventura";
import Header from "./header/Header";
import Artikli from "./pages/Artikli";


function App() {
  return (
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path="/">
          <Route index element={<UkupnaEvidencija/>}></Route>
          <Route path="Otpremnice" element={<Otpremnice/>}></Route>
          <Route path="Prodano" element={<Prodano/>}></Route>
          <Route path="Inventura" element={<Inventura/>}></Route>
          <Route path="Artikli" element={<Artikli/>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
