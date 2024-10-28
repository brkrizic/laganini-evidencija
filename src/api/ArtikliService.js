import React from "react";
//import { apiKey, baseUrl } from "../url/baseUrl";
import headers from "../url/headers";
import axios from "axios";
import { useBaseUrl } from "../contexts/BaseUrlContext";

export const ArtikliService = {
    getAllArtikli: async (baseUrl) => {
        try {
            const response = await axios.get(`${baseUrl}/api/artikli`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    saveArtikl: async (baseUrl, params) => {
        try {
            const response = await axios.post(`${baseUrl}/api/artikli`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    deleteArtikl: async (baseUrl, id) => {
        try {
            const response = await axios.delete(`${baseUrl}/api/artikli/${id}`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    editArtikl: async (baseUrl, id, params) => {
        try {
            const response = await axios.put(`${baseUrl}/api/artikli/${id}`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }
}