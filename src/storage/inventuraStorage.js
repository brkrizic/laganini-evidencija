const inventuraStorage = {
    getAll: () => {
        const data = localStorage.getItem("InventuraData");
        return data ? JSON.parse(data) : [];
    },
    saveInventura: (newInventura) => {
        const data = inventuraStorage.getAll();
        data.push(newInventura);
        localStorage.setItem("InventuraData", JSON.stringify(data));
    },
    deleteInventura: (key) => {
        let data = inventuraStorage.getAll();
        data = data.filter(d => d.key !== key);
        localStorage.setItem("InventuraData", JSON.stringify(data));
    },
    editInventura: (updatedInventura) => {
        let data = inventuraStorage.getAll();
        const index = data.findIndex(d => d.key === updatedInventura.key);
        if (index !== -1) {
            data[index] = updatedInventura;
            localStorage.setItem("InventuraData", JSON.stringify(data));
        }
    },
    clearAll: () => localStorage.clear()
};

export { inventuraStorage };
