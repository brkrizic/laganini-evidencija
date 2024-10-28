import React from "react";
import { apiKey, baseUrl } from "../url/baseUrl";
import headers from "../url/headers";
import axios from "axios";

export const ProdanoService = {
    getAllProdano: async (baseUrl) => {
        try {
            const response = await axios.get(`${baseUrl}/api/prodano`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    saveProdano: async (baseUrl, params) => {
        try {
            const response = await axios.post(`${baseUrl}/api/prodano`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    deleteProdano: async (baseUrl, id) => {
        try {
            const response = await axios.delete(`${baseUrl}/api/prodano/${id}`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    editProdano: async (baseUrl, id, params) => {
        try {
            const response = await axios.put(`${baseUrl}/api/prodano/${id}`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }
}