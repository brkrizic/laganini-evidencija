const prodanoStorage = {
    getAll: () => {
        const data = localStorage.getItem("ProdanoData");
        return data ? JSON.parse(data) : [];
    },
    saveProdano: (newProdano) => {
        const data = prodanoStorage.getAll();
        data.push(newProdano);
        localStorage.setItem("ProdanoData", JSON.stringify(data));
    },
    deleteProdano: (key) => {
        let data = prodanoStorage.getAll();
        data = data.filter(d => d.key !== key);
        localStorage.setItem("ProdanoData", JSON.stringify(data));
    },
    editProdano: (updatedProdano) => {
        let data = prodanoStorage.getAll();
        const index = data.findIndex(d => d.key === updatedProdano.key);
        if (index !== -1) {
            data[index] = updatedProdano;
            localStorage.setItem("ProdanoData", JSON.stringify(data));
        }
    },
    clearAll: () => localStorage.clear()
};

export { prodanoStorage };