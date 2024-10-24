import { DownCircleOutlined, DownSquareOutlined } from "@ant-design/icons";
import { Dropdown, Input, Button, Select, message } from "antd";
import React, { useState } from "react";

const Konverzacija = () => {
    const [inputValue, setInputValue] = useState('');
    const [fromUnit, setFromUnit] = useState('liters');
    const [toUnit, setToUnit] = useState('kilograms');
    const [result, setResult] = useState(null);

    const units = {
        liters: { liters: 1, milliliters: 1000, kilograms: 1, grams: 1000 },
        milliliters: { liters: 0.001, milliliters: 1, kilograms: 0.001, grams: 1 },
        kilograms: { liters: 1, milliliters: 1000, kilograms: 1, grams: 1000 },
        grams: { liters: 0.001, milliliters: 1, kilograms: 0.001, grams: 1 },
    };

    const handleConvert = () => {
        const value = parseFloat(inputValue);
        if (isNaN(value)) {
            message.error('Please enter a valid number');
            return;
        }

        const conversionFactor = units[fromUnit][toUnit];
        const convertedValue = value * conversionFactor;
        setResult(convertedValue);
    };

    return (
        <div>
            <div style={{ backgroundColor: "#0063a6", height: "50px", width: "100%" }}>
                <div style={{ marginTop: "-10px", marginLeft: '-50px' }}>
                    <h1 style={{ textAlign: "center", color: "white", marginTop: "-10px" }}>Konverzacija</h1>
                </div>
            </div>

            <div style={{ width: '300px', textAlign: 'right', margin: '40px auto', marginTop: '150px', marginLeft: '770px'}}>
                <Input 
                    type="number" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    placeholder="Unesite količinu" 
                />

                <Select 
                    value={fromUnit} 
                    onChange={setFromUnit} 
                    style={{ width: '100%', margin: '10px 0' }}
                >
                    {Object.keys(units).map((unit) => (
                        <Select.Option key={unit} value={unit}>{unit}</Select.Option>
                    ))}
                </Select>

                <DownCircleOutlined style={{ fontSize: '24px', margin: '10px 0' }} />

                <Select 
                    value={toUnit} 
                    onChange={setToUnit} 
                    style={{ width: '100%', margin: '10px 0' }}
                >
                    {Object.keys(units).map((unit) => (
                        <Select.Option key={unit} value={unit}>{unit}</Select.Option>
                    ))}
                </Select>

                <Button type="primary" onClick={handleConvert} style={{ marginTop: '10px' }}>
                    Konvertaj
                </Button>

                {result !== null && (
                    <div style={{ marginTop: '20px', fontSize: '18px' }}>
                        Rezultat: {result} {toUnit}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Konverzacija;
