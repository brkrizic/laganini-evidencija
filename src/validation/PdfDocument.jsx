import React from "react";
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { formatDateForDisplay } from "../convert/dateConverter";

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
    },
    header: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    table: {
        display: "table",
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: '#000',
        borderBottomWidth: 0,
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: "row",
    },
    tableCol: {
        width: "50%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: '#000',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: 'white', // Light gray for headers
    },
    tableCell: {
        margin: "auto",
        padding: 10,
        fontSize: 12,
        fontWeight: 'normal',
    },
    tableHeaderCell: {
        margin: "auto",
        padding: 10,
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#d9d9d9', // Darker gray for header cells
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        fontSize: 10,
        textAlign: 'center',
        color: '#555',
    },
});

const PdfDocument = (props) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <Text style={styles.header}>{props.title}</Text>
                <Text style={{ textAlign: "center" }}>Datum: {formatDateForDisplay(props.date)}</Text>
                
                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableHeaderCell}>Naziv artikla</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableHeaderCell}>Kolicina</Text>
                        </View>
                    </View>
                    {props.artikli.map((artikl, index) => (
                        <View style={styles.tableRow} key={index}>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{artikl.nazivArtikla}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{artikl.kolicina}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <Text style={styles.footer}>Page {props.pageNumber} - Company Name - Address - Contact</Text>
            </Page>
        </Document>
    );
}

export default PdfDocument;

