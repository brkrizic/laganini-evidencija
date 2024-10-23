import React from "react";
import { apiKey, baseUrl } from "../url/baseUrl";
import headers from "../url/headers";
import axios from "axios";

export const ArtikliService = {
    getAllArtikli: async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/artikli`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    saveArtikl: async (params) => {
        try {
            const response = await axios.post(`${baseUrl}/api/artikli`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    deleteArtikl: async (id) => {
        try {
            const response = await axios.delete(`${baseUrl}/api/artikli/${id}`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    editArtikl: async (id, params) => {
        try {
            const response = await axios.put(`${baseUrl}/api/artikli/${id}`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }
}