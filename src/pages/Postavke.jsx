import { Button, Input, notification } from "antd";
import React, { useState } from "react";
import { useBaseUrl } from "../contexts/BaseUrlContext";

const Postavke = () => {
    const { baseUrl, setBaseUrl } = useBaseUrl();
    const [inputUrl, setInputUrl] = useState(baseUrl);

    const handleInputChange = (e) => {
        setInputUrl(e.target.value);
    };

    const handleConnect = () => {
        if (!inputUrl) {
            notification.warning({
                message: "Invalid URL",
                description: "Please enter a valid URL before connecting.",
            });
            return;
        }
        
        try {
            setBaseUrl(inputUrl);
            notification.success({
                message: "Connected",
                description: `Successfully set the base URL to ${inputUrl}`,
            });
        } catch (error) {
            notification.error({
                message: "Connection Failed",
                description: `Could not connect to ${inputUrl}. Please check the URL and try again.`,
            });
        }
    };

    return (
        <div>
            <div style={{ backgroundColor: "#0063a6", height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <h1 style={{ color: "white", margin: 0 }}>Postavke</h1>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
                <p>IP Address</p>
                <Input 
                    value={inputUrl}
                    onChange={handleInputChange}
                    placeholder="Enter base URL"
                    aria-label="Base URL input"
                    style={{ width: "300px", marginBottom: "10px" }}
                />
                <Button onClick={handleConnect} disabled={!inputUrl} type="primary">
                    Connect
                </Button>
            </div>
        </div>
    );
};

export default Postavke;

