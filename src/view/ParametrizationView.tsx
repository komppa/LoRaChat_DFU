import React, { useState } from 'react'
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


interface Parameter {
    type: 'boolean' | 'string'
    key: string
    value: string
}

interface ParameterRowProps {
    index: number
    param: Parameter
    onValueChange: (index: number, value: string) => void
}


const ParameterRow: React.FC<ParameterRowProps> = ({ index, param, onValueChange }) => {

    const [value, setValue] = useState(param.value)
  
    const handleValueChange = (event: SelectChangeEvent<string>) => {
        const newValue = event.target.value
        setValue(newValue)
        onValueChange(index, newValue)
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
                        onChange={(event) => setValue(event.target.value)}
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
}


const ParametrizationView: React.FC<ParametrizationViewProps> = ({ parameters }) => {

    const [rows, setRows] = useState(parameters)

    const handleUpload = () => {
        const data = JSON.stringify(rows)
        console.log(data)
    }

    const handleValueChange = (index: number, value: string) => {
        const updatedRows = [...rows]
        updatedRows[index].value = value
        setRows(updatedRows)
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
                                    <ParameterRow key={index} index={index} param={param} onValueChange={handleValueChange} />
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