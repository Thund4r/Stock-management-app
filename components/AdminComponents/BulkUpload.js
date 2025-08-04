import { Flex, FileInput, Button, Text, Stack, Select } from "@mantine/core";
import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import styles from "./BulkUpload.module.css";

export default function BulkUpload({ onFinish, destinationOptions, defaultValues }) {
  const [csvData, setCsvData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [columnMap, setColumnMap] = useState({});

  const handleFileUpload = (file) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();

    setUploading(true);

    if (fileName.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          setCsvData(results.data);
          setUploading(false);
        },
        error: function (error) {
          console.error("Error parsing file:", error);
          setUploading(false);
        }
      });
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // get JSON with empty cells as ""
        setCsvData(jsonData);
        setUploading(false);
      };
      reader.onerror = (error) => {
        console.error("Error reading Excel file:", error);
        setUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Only CSV or Excel files (.xlsx, .xls) are allowed.");
      setUploading(false);
    }
  };

  const handleSelectChange = (header, value) => {
    setColumnMap((prevMap) => {
      const updatedMap = { ...prevMap, [header]: value };
      return updatedMap;
    });
  };

  const handleFinish = () => {
    if (!csvData || Object.keys(columnMap).length === 0) {
      alert("Please upload a file and complete the mapping.");
      return;
    }
  
    const activeMappings = Object.entries(columnMap)
      .filter(([, destination]) => destination && destination !== "");

    const transformedProducts = csvData.map((row) => {
      const mappedRow = Object.fromEntries(
        activeMappings.map(([source, dest]) => [dest, row[source]])
      );
    
      for (const [key, value] of Object.entries(defaultValues)) {
        if (!mappedRow[key]) {
          mappedRow[key] = value;
        }
      }
    
      return mappedRow;
    });
    onFinish(transformedProducts);

  };

  if (!csvData) {
    return (
      <Flex direction="column" align="center" gap="md" className={styles.container}>
        <h2>Upload a File</h2>
        <FileInput
          placeholder="Choose CSV file"
          accept=".csv, .xlsx, .xls"
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

          const selectedValues = Object.entries(columnMap)
            .filter(([key]) => key !== header)
            .map(([, value]) => value);

          const availableOptions = destinationOptions.filter(
            (option) => !selectedValues.includes(option) || option === columnMap[header]
          );

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
                data={availableOptions}
                value={columnMap[header] || null}
                onChange={(value) => handleSelectChange(header, value)}
                className={styles.select}
                withinPortal={true}
              />
            </div>
          );
        })}
      </div>

      <Button onClick={() => handleFinish()} className={styles.uploadButton}>
        Complete
      </Button>
    </Flex>
  );
}
