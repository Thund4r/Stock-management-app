import { Flex, FileInput, Button, Text, Stack, Select } from "@mantine/core";
import { useState } from "react";
import Papa from "papaparse";
import styles from "./BulkUpload.module.css";

const DESTINATION_OPTIONS = [
  "Product Name",
  "Price",
  "Original Price",
  "Product Unit",
];

export default function BulkUpload({ onFinish }) {
  const [csvData, setCsvData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [columnMap, setColumnMap] = useState({});

  const handleFileUpload = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Only CSV files are allowed.");
      return;
    }
    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setCsvData(results.data);
        setUploading(false);
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
        setUploading(false);
      }
    });
  };

  const handleSelectChange = (header, value) => {
    setColumnMap((prev) => ({ ...prev, [header]: value }));
  };

  if (!csvData) {
    return (
      <Flex direction="column" align="center" gap="md" className={styles.container}>
        <h2>Upload a CSV File</h2>
        <FileInput
          placeholder="Choose CSV file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </Flex>
    );
  }

  const headers = Object.keys(csvData[0]);

  return (
    <Flex direction="column" align="center" className={styles.container}>
      <h2>CSV Data Preview</h2>
      
      <div className={styles.table}>
        <div className={styles.headerRow}>
          <Text className={styles.headerCell}>Your File Column</Text>
          <Text className={styles.headerCell}>Your Sample Data</Text>
          <Text className={styles.headerCell}>Destination Column</Text>
        </div>

        {headers.map((header) => {
          const samples = csvData
            .map((row) => row[header])
            .filter((value) => value !== undefined && value !== null && value !== "")
            .slice(0, 3);

          return (
            <div key={header} className={styles.dataRow}>
              <Text className={styles.fileColumn}>{header}</Text>
              <div className={styles.samplesWrapper}>
                {samples.map((sample, index) => (
                  <Text key={index} className={styles.sampleText}>
                    {sample}
                  </Text>
                ))}
              </div>
              <Select
                placeholder="- Select one -"
                data={DESTINATION_OPTIONS}
                value={columnMap[header] || null}
                onChange={(value) => handleSelectChange(header, value)}
                className={styles.select}
                withinPortal={true}
              />
            </div>
          );
        })}
      </div>

      <Button onClick={() => onFinish(columnMap)} className={styles.uploadButton}>
        Complete
      </Button>
    </Flex>
  );
}
