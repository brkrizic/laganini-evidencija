import React, { useState } from 'react';
import { processArticles } from './utils/utils';
import * as pdfjsLib from 'pdfjs-dist/webpack';

const PdfUpload = ({ setArrObjArtikl }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        console.log("Selected file: ", selectedFile); // Log the selected file
        setFile(selectedFile);
    };

    const parsePDF = async (file) => {
        const fileReader = new FileReader();

        fileReader.onloadend = async () => {
            console.log("FileReader finished loading file."); // Log when file reading finishes
            const typedArray = new Uint8Array(fileReader.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;

            console.log("PDF loaded. Number of pages: ", pdf.numPages); // Log number of pages in the PDF

            let textContent = "";
            const numPages = pdf.numPages;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                console.log(`Extracting text from page ${i}...`); // Log the current page being processed

                const content = await page.getTextContent();
                const strings = content.items.map(item => item.str);
                console.log("strings: " + strings);
                textContent += strings.join(" ") + "\n";
            }

            console.log("Extracted Text Content: ", textContent); // Log the entire extracted text content
            console.log("textContent: " + textContent);
            const extractedData = processArticles(textContent); // Call the utility function
            console.log("Extracted Data: ", extractedData); // Log the processed data

            // Check if setArrObjArtikl is a function before calling
            if (typeof setArrObjArtikl === "function") {
                setArrObjArtikl(extractedData); // Ensure this is a function
                console.log("setArrObjArtikl called with: ", extractedData); // Log the data passed to setArrObjArtikl
            } else {
                console.error("setArrObjArtikl is not a function!"); // Log if it's not a function
            }
        };

        fileReader.readAsArrayBuffer(file);
        console.log("Started reading file as ArrayBuffer."); // Log the start of file reading
    };

    const handleUpload = () => {
        if (!file) {
            alert("Please select a PDF file.");
            console.warn("No file selected!"); // Log warning if no file is selected
            return;
        }
        console.log("Uploading file: ", file.name); // Log the file name being uploaded
        parsePDF(file);
    };

    return (
        <div>
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload PDF</button>
        </div>
    );
};

export default PdfUpload;
