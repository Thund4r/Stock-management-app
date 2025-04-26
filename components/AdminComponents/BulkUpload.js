import { Flex, FileInput, Button, Table } from "@mantine/core";
import { useState } from "react";
import Papa from "papaparse";

export default function BulkUpload() {
  const [csvData, setCsvData] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (file) => {
    if (!file) return;

    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log("Parsed CSV:", results.data);
        setCsvData(results.data);
        setUploading(false);
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
        setUploading(false);
      }
    });
  };

  // If no data uploaded yet, show upload prompt
  if (!csvData) {
    return (
      <Flex direction="column" align="center" gap="md" style={{ marginTop: "2rem" }}>
        <h2>Upload a CSV File</h2>
        <FileInput
          placeholder="Choose CSV file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        {uploading && <p>Uploading and parsing CSV...</p>}
      </Flex>
    );
  }

  // Once CSV is uploaded, show table
  const headers = Object.keys(csvData[0]);

  return (
    <Flex direction="column" align="center" gap="md" style={{ marginTop: "2rem" }}>
      <h2>CSV Data Preview</h2>
      <Table withColumnBorders>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {csvData.map((row, idx) => (
            <tr key={idx}>
              {headers.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <Button onClick={() => setCsvData(null)} style={{ marginTop: "1rem" }}>
        Upload Another CSV
      </Button>
    </Flex>
  );
}