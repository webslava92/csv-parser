import React from 'react';
import { useCSVReader } from 'react-papaparse';
import iconv from 'iconv-lite';
// import dayjs from 'dayjs';
import { Box, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { UploadFileProps } from './types';
import { JsonToCSV } from './jsonToCsv';

const csvConfig = {
  quotes: false,
  // quoteChar: '"',
  // escapeChar: '"',
  delimiter: ',',
  header: true,
  // dynamicTyping: true,
  // newline: '\r\n',
  skipEmptyLines: true,
  // columns: null,
};

function convertToUtf8(data: any): any {
  if (typeof data === 'string') {
    return iconv.decode(Buffer.from(data), 'UTF-8');
  }
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map((item: any) => convertToUtf8(item));
    }
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = convertToUtf8(value);
    }
    return result;
  }
  return data;
}

export function UploadFile({ items, setItems, format, defaultData, setDefaultData, fileName, setFileName }: UploadFileProps) {
  const { CSVReader } = useCSVReader();

  const styles = {
    wrapper: {
      marginTop: 2,
      marginBottom: 2,
    },
    title: {
      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.4rem' },
      fontWeight: 700,
      marginBottom: 1,
    },
    paper: {
      padding: 2,
    },
    inner: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: { xs: 'column', md: 'row' },
    },
    fileInfoBox: {
      display: 'flex',
      gap: 1,
    },
    fileBox: {
      display: 'flex',
      alignItems: 'center',
    },
    fileName: {
      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.4rem' },
      fontWeight: 700,
      display: 'flex',
      marginLeft: 2,
      minWidth: '100px',
    },
    message: {},
    errorMessage: {
      color: 'red',
    },
    acceptedFile: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    },
    fileNameBox: {
      display: 'flex',
      gap: 1,
    },
    browseFile: {},
    remove: {
      marginLeft: 1,
    },
    progressBar: {
      display: 'flex',
      marginTop: 2,
      width: '100%',
    },
    btnBox: {
      marginTop: { xs: 2, md: 0 },
    },
  };

  const dataWithoitId = items.map((item: any) => {
    const objCopy = { ...item };
    delete objCopy.id;
    return objCopy;
  });

  const newData = dataWithoitId.map((item: any) =>
    Object.assign(
      {},
      ...Object.entries(item).map(([key, val]: any) => ({
        [key]:
          dayjs(val).isValid() && key !== 'phone' && key !== 'id'
            ? dayjs(val).format(format)
            : val,
      }))
    )
  );

  return (
    <Box sx={styles.wrapper}>
      <CSVReader
        config={csvConfig}
        onUploadAccepted={(results: any, acceptedFile: any) => {
          const resultWithId = results.data.map(
            (item: any, i: any = 0) => ({ ...item, id: i })
          );
          const name = acceptedFile.name ?? '';
          setFileName(name);
          setItems(convertToUtf8(resultWithId));
          setDefaultData(convertToUtf8(resultWithId));
        }}
      >
        {({ getRootProps, ProgressBar, getRemoveFileProps }: any) => (
          <>
            <Box sx={styles.inner}>
              <Box sx={styles.fileInfoBox}>
                <Box component='div' sx={styles.acceptedFile}>
                  <Box sx={styles.fileNameBox}>
                    <Typography variant='h5' sx={styles.title}>
                      Upload file:
                    </Typography>
                    <Typography variant='body1' sx={styles.fileName}>
                      {fileName}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      variant='contained'
                      type='button'
                      {...getRootProps()}
                      style={styles.browseFile}
                    >
                      Browse file
                    </Button>
                  </Box>
                </Box>
              </Box>
              <Box sx={styles.btnBox}>
                <JsonToCSV data={newData} fileName={fileName} />
                <Button
                  variant='contained'
                  sx={styles.remove}
                  {...getRemoveFileProps()}
                  onClick={() => setItems(defaultData)}
                >
                  Reset all
                </Button>
              </Box>
            </Box>
            <ProgressBar style={styles.progressBar} />
          </>
        )}
      </CSVReader>
    </Box>
  );
}
