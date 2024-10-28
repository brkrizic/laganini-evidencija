import { Select } from "antd";
import React, { useState } from "react";

const { Option } = Select;

const ArtikliSelect = ({ postojeciArtikli, setNazivArtikla, nazivArtikla }) => {
    return (
        <Select
            showSearch // Enable search functionality
            style={{ width: '100%' }}
            placeholder="Select or type an artikl"
            onChange={(value) => setNazivArtikla(value)}
            onSearch={(value) => setNazivArtikla(value)} // Update state while typing
            filterOption={(input, option) => 
                option.children.toLowerCase().includes(input.toLowerCase())
            } // Filter options based on input
            value={nazivArtikla}
        >
            {postojeciArtikli.map((artikl, idx) => (
                <Option key={idx} value={artikl}>
                    {artikl}
                </Option>
            ))}
        </Select>
    );
};

export default ArtikliSelect;
