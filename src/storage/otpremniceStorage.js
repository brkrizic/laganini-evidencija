const otpremnicaStorage = {
    getAll: () => {
        const data = localStorage.getItem("OtpremniceData");
        return data ? JSON.parse(data) : [];
    },
    saveOtpremnica: (newOtpremnica) => {
        const data = otpremnicaStorage.getAll();
        data.push(newOtpremnica);
        localStorage.setItem("OtpremniceData", JSON.stringify(data));
    },
    deleteOtpremnica: (key) => {
        let data = otpremnicaStorage.getAll();
        data = data.filter(d => d.key !== key);
        localStorage.setItem("OtpremniceData", JSON.stringify(data));
    },
    editOtpremnica: (updatedOtpremnica) => {
        let data = otpremnicaStorage.getAll();
        const index = data.findIndex(d => d.key === updatedOtpremnica.key);
        if (index !== -1) {
            data[index] = updatedOtpremnica;
            localStorage.setItem("OtpremniceData", JSON.stringify(data));
        }
    },
    clearAll: () => localStorage.clear()
};

export { otpremnicaStorage };
