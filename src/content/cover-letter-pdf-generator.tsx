import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 60,
        fontSize: 11,
        fontFamily: 'Helvetica',
        lineHeight: 1.5,
    },
    text: {
        marginBottom: 10,
    }
});

interface CoverLetterProps {
    content: string;
}

const CoverLetterDocument: React.FC<CoverLetterProps> = ({ content }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View>
                <Text style={styles.text}>{content}</Text>
            </View>
        </Page>
    </Document>
);

export async function generateCoverLetterPDFReal(content: string): Promise<Blob> {
    const doc = <CoverLetterDocument content={content} />;
    const asPdf = pdf(doc);
    return await asPdf.toBlob();
}
