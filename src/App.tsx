import React, { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import Flasher from './components/Flasher'
import JSZip from 'jszip'



const App = () => {

    const [bootloaderFile, setBootloaderFile] = useState<null | Blob>(null)
    const [partitionTableFile, setPartitionTableFile] = useState<null | Blob>(null)
    const [firmwareFile, setFirmwareFile] = useState<null | Blob>(null)
    const [spiffsFile, setSpiffsFile] = useState<null | Blob>(null)

    useEffect(() => {
        const fetchAndUnzip = async () => {
            try {

                const response = await fetch('https://vxrenqk5be.execute-api.eu-north-1.amazonaws.com/prod/')

                const zipBase64 = await response.text()
                // TODO replace atob with a more secure alternative
                const zipData = Uint8Array.from(atob(zipBase64), (c) => c.charCodeAt(0)).buffer

                const jszip = new JSZip()
                const zip = await jszip.loadAsync(zipData)
        
                // Extract the contents of the .zip file
                zip.forEach(async (relativePath, zipEntry) => {
                    // Check if it's a file and not a folder
                    if (!zipEntry.dir) {

                        const fileContent = await zipEntry.async('blob')
                        // Do something with the extracted file content
                        console.log(`Extracted file: ${relativePath}`, fileContent)


                        if (relativePath == 'bootloader.bin') {
                            setBootloaderFile(fileContent)
                        } else if (relativePath == 'partitions.bin') {
                            setPartitionTableFile(fileContent)
                        } else if (relativePath == 'firmware.bin') {
                            setFirmwareFile(fileContent)
                        } else if (relativePath == 'spiffs.bin') {
                            setSpiffsFile(fileContent)
                        }
                    }
                })
            } catch (error) {
                console.error('Error fetching and unzipping file:', error)
            }
        }
        fetchAndUnzip()
    }, [])
    

    return (
        <>
            {bootloaderFile && partitionTableFile && firmwareFile && (
                <Flasher
                    bootloaderFile={bootloaderFile}
                    partitionTableFile={partitionTableFile}
                    firmwareFile={firmwareFile}
                    spiffsFile={spiffsFile}
                />
            )}
        </>
    )
}


export default App

