import React, { useState, useEffect } from 'react'
import {
    Box,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    TextField,
    Typography,
    Button,
    Select,
    MenuItem,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'


export interface Parameter {
    type: 'boolean' | 'string'
    key: string
    value: string
}

interface ParameterRowProps {
    paramKey: string
    param: Parameter
    onValueChange: (key: string, value: string) => void
}


const ParameterRow: React.FC<ParameterRowProps> = ({ paramKey, param, onValueChange }) => {

    const [value, setValue] = useState(param.value)
  
    const handleValueChange = (event: SelectChangeEvent<string>) => {
        const newValue = event.target.value
        setValue(newValue)
        onValueChange(paramKey, newValue)
    }
    
  
    return (
        <TableRow>
            <TableCell component="th" scope="row" sx={{ paddingRight: 2, width: '50%' }}>
                {param.key}
            </TableCell>
            <TableCell sx={{ paddingLeft: 2, width: '50%' }}>
                {param.type === 'boolean' ? (
                    <Select
                        value={value}
                        onChange={handleValueChange}
                        fullWidth
                    >
                        <MenuItem value="true">true</MenuItem>
                        <MenuItem value="false">false</MenuItem>
                    </Select>
                ) : (
                    <TextField
                        defaultValue={param.value}
                        onChange={(event) => {
                            setValue(event.target.value)
                            onValueChange(paramKey, event.target.value)
                        }}
                        InputProps={{
                            readOnly: false,
                        }}
                        variant="outlined"
                        size="small"
                        fullWidth
                    />
                )}
            </TableCell>
        </TableRow>
    )

}


interface ParametrizationViewProps {
    parameters: Parameter[]
    webSerial: any
}


const ParametrizationView: React.FC<ParametrizationViewProps> = ({ parameters, webSerial }) => {

    const [rows, setRows] = useState(parameters)

    useEffect(() => {
        setRows(parameters)
    }, [parameters])

    const handleUpload = () => {
        const data = JSON.stringify(rows)
        console.log(data)
        webSerial.write(data)

    }

    const handleValueChange = (paramKey: string, value: string) => {
        setRows(rows.map((row: Parameter) => row.key === paramKey ? { ...row, value } : row))
    }


    return (
        <Box
            sx={{
                backgroundColor: '#282c34',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <Container maxWidth="md">
                <Typography variant="h4" component="h1" gutterBottom align="center" mb={4}>
                    Parametrization of LoRa Chat node
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableBody>
                            {
                                parameters.map((param, index) => (
                                    <ParameterRow key={index} paramKey={param.key} param={param} onValueChange={handleValueChange} />
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
                    <Button variant="contained" onClick={handleUpload}>
                        Save new parameters
                    </Button>
                </Box>
            </Container>
        </Box>
    )

}


export default ParametrizationView