import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import UkupnaEvidencija from "./pages/UkupnaEvidencija";
import Otpremnice from "./pages/Otpremnice";
import Prodano from "./pages/Prodano";
import Inventura from "./pages/Inventura";
import Header from "./header/Header";
import Artikli from "./pages/Artikli";
import Konverzacija from "./pages/Konverzacija";
import { BaseUrlProvider } from "./contexts/BaseUrlContext";
import Postavke from "./pages/Postavke";


function App() {
  return (
    <HashRouter>
    <Header/>
    <BaseUrlProvider>
      <Routes>
        <Route path="/">
          <Route index element={<UkupnaEvidencija/>}></Route>
          <Route path="Otpremnice" element={<Otpremnice/>}></Route>
          <Route path="Prodano" element={<Prodano/>}></Route>
          <Route path="Inventura" element={<Inventura/>}></Route>
          <Route path="Artikli" element={<Artikli/>}></Route>
          <Route path="Konverzacija" element={<Konverzacija/>}></Route>
          <Route path="Postavke" element={<Postavke/>}></Route>
        </Route>
      </Routes>
      </BaseUrlProvider>
    </HashRouter>
  );
}

export default App;
