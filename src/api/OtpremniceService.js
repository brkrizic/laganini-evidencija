import React from "react";
import { apiKey, baseUrl } from "../url/baseUrl";
import headers from "../url/headers";
import axios from "axios";

export const OtpremniceService = {
    getAllOtpremnice: async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/otpremnice`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    saveOtpremnica: async (params) => {
        try {
            const response = await axios.post(`${baseUrl}/api/otpremnice`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    deleteOtpremnica: async (id) => {
        try {
            const response = await axios.delete(`${baseUrl}/api/otpremnice/${id}`, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    },
    editOtpremnica: async (id, params) => {
        try {
            const response = await axios.put(`${baseUrl}/api/otpremnice/${id}`, params, {headers});
            console.log(response);
            return response;
        } catch (error) {
            console.log(error);
        }
    }
}