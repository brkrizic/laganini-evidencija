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
    table: {
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
        borderCollapse: 'collapse', // Ensure borders collapse properly
    },
    tableRow: {
        flexDirection: "row",
    },
    tableCol: {
        width: "16.67%", // Adjust for six columns
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: '#000',
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: 'white',
    },
    tableCell: {
        padding: 5,
        fontSize: 12,
        textAlign: 'center', // Center text in cells
    },
    tableHeaderCell: {
        padding: 5,
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#d9d9d9',
        textAlign: 'center', // Center header text
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
    summary: {
        marginTop: 10,
        fontSize: 12,
        textAlign: 'right',
        fontWeight: 'bold',
    },
});

const MainPdfDocument = (props) => {
    const totalKolicina = props.artikli.reduce((total, artikl) => total + parseFloat(artikl.kupljenaKolicina || 0), 0);
    const totalProdano = props.artikli.reduce((total, artikl) => total + parseFloat(artikl.prodajnaKolicina || 0), 0);
    
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
                            <Text style={styles.tableHeaderCell}>Naziv</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableHeaderCell}>Evidencija Stanja</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableHeaderCell}>Evidencija Robe</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableHeaderCell}>Razlika</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableHeaderCell}>Ukupno Prodano</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableHeaderCell}>Ukupno Kupljeno</Text>
                        </View>
                    </View>
                    {/* Data Rows */}
                    {props.artikli.map((artikl, index) => (
                        <View style={styles.tableRow} key={index} backgroundColor={index % 2 === 0 ? '#f8f8f8' : 'white'}>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{artikl.naziv}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{artikl.evidencijaStanja}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{artikl.evidencijaRobe}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{artikl.razlika}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{artikl.prodajnaKolicina}</Text>
                            </View>
                            <View style={styles.tableCol}>
                                <Text style={styles.tableCell}>{artikl.kupljenaKolicina}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <Text style={styles.summary}>Ukupno Kupljeno: {totalKolicina} | Ukupno Prodano: {totalProdano}</Text>

                {/* Footer */}
                <Text style={styles.footer}>Page {props.pageNumber} - Company Name - Address - Contact</Text>
            </Page>
        </Document>
    );
}

export default MainPdfDocument;
