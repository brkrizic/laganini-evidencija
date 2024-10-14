const artiklStorage = {
    getAll: () => {
        const data = localStorage.getItem("ArtiklData");
        return data ? JSON.parse(data) : [];
    },
    
    saveArtikl: (data) => {
        localStorage.setItem("ArtiklData", JSON.stringify(data));
    },

    addArtikl: (newArtikl) => {
        const data = artiklStorage.getAll();
        data.push(newArtikl);
        artiklStorage.saveArtikl(data);
    },

    deleteArtikl: (key) => {
        const currentData = artiklStorage.getAll();
        const updatedData = currentData.filter(item => item.key !== key);
        artiklStorage.saveArtikl(updatedData); // Save updated data to local storage
        return updatedData; // Return the updated data
    },

    editArtikl: (updatedArtikl) => {
        const data = artiklStorage.getAll();
        const index = data.findIndex(d => d.key === updatedArtikl.key);
        if (index !== -1) {
            data[index] = updatedArtikl;
            artiklStorage.saveArtikl(data);
        }
    }
};

export { artiklStorage };
