import { Flex, FileInput, Button, Text, Stack } from "@mantine/core";
import { useState } from "react";
import Papa from "papaparse";

export default function BulkUpload({ onFinish }) {
  const [csvData, setCsvData] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      </Flex>
    );
  }

  const headers = Object.keys(csvData[0]);

  return (
    <Flex direction="column" align="center" gap="md" style={{ marginTop: "2rem" }}>
      <h2>CSV Data Preview</h2>
      <Stack>
      {headers.map((header) => {
        const samples = csvData
          .map((row) => row[header])
          .filter((value) => value !== undefined && value !== null && value !== "")
          .slice(0, 3);

        return (
          <Flex
            key={header}
            direction="row"
            wrap="wrap"
            align="center"
            gap="xs"
            style={{ marginBottom: "0.75rem" }}
          >
            <Text fw={500} size="sm">
              {header}
            </Text>
            {samples.map((sample, index) => (
              <Text
                key={index}
                size="sm"
                style={{
                  backgroundColor: "#f1f3f5",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {sample}
              </Text>
            ))}
          </Flex>
        );
      })}
      </Stack>
      <Button onClick={() => onFinish()} style={{ marginTop: "1rem" }}>
        Complete
      </Button>
    </Flex>
  );
}