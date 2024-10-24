import React from "react";
import { apiKey, baseUrl } from "../url/baseUrl";
import headers from "../url/headers";
import axios from "axios";

export const InventuraService = {
    getAllInventure: async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/inventure`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    saveInventura: async (params) => {
        try {
            const response = await axios.post(`${baseUrl}/api/inventure`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    deleteInventura: async (id) => {
        try {
            const response = await axios.delete(`${baseUrl}/api/inventure/${id}`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    editInventura: async (id, params) => {
        try {
            const response = await axios.put(`${baseUrl}/api/inventure/${id}`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }
}