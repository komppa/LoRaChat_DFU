import React, { useState } from 'react'
import FileUpload from './components/FileUpload'
import Flasher from './components/Flasher'
import { Button } from '@mui/material'



const App = () => {

    const [bootloaderFile, setBootloaderFile] = useState<File | null>(null)
    const [partitionTableFile, setPartitionTableFile] = useState<File | null>(null)
    const [firmwareFile, setFirmwareFile] = useState<File | null>(null)

    return (
        <>
            <FileUpload
                requestedFilename='Bootloader'
                onFileSelected={(file) => {
                    setBootloaderFile(file)
                }}
            />
            <FileUpload
                requestedFilename='Partition Table'
                onFileSelected={(file) => {
                    setPartitionTableFile(file)
                }}
            />
            <FileUpload
                requestedFilename='Firmware'
                onFileSelected={(file) => {
                    setFirmwareFile(file)
                }}
            />

            <Flasher
                bootloaderFile={bootloaderFile}
                partitionTableFile={partitionTableFile}
                firmwareFile={firmwareFile}
            />

        </>
    )
}


export default App

