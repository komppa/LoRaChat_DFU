import React, { useEffect, useState } from 'react'
import { Box, Container, Typography, Link, Button } from '@mui/material'
import LinearProgress from '@mui/material/LinearProgress'
import Flasher from '../components/Flasher'
import JSZip from 'jszip'
import moment from 'moment'


const ProgressView = () => {

    const [flash, setFlash] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [phase, setPhase] = useState('')

    const [remainingTime, setRemainingTime] = useState(0)

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

                return true
                
            } catch (error) {
                console.error('Error fetching and unzipping file:', error)
            }
        }

        fetchAndUnzip()
    }, [])

    useEffect(() => {
        setFlash(false)
        setProgress(0)
        setPhase('')
        setRemainingTime(0)
    }, [completed])

    useEffect(() => {
        setRemainingTime(
            8 * 60
        )
        const intervalId = setInterval(() => {
            setRemainingTime((prevRemainingTime) => prevRemainingTime - 1)
        }, 1000)
        
        // Clean up function
        return () => {
            clearInterval(intervalId)
        }
    }, [])

    const formattedRemainingTime = moment.duration(remainingTime, 'seconds').humanize()

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

                <Typography variant="h4" component="h1" gutterBottom align="center" mb={7}>
                    LoRa Chat Device Firmware Upgrade Tool
                </Typography>

                <Typography variant="body1" gutterBottom align="center" mb={5}>
                    Welcome to the LoRa Chat Node Firmware Updater, specifically designed to flash your Heltec ESP32 WiFi boards with the latest LoRa Chat software. This page allows you to effortlessly update your board with the most recent release of the LoRa Chat application, sourced directly from the latest build at{' '}
                    <Link href="https://github.com/komppa/LoRaChat_v4" target="_blank" rel="noopener noreferrer">
                        github.com/komppa/LoRaChat_v4
                    </Link>
                </Typography>
                <Typography variant="body1" gutterBottom align="center" mb={5}>
                    {'To begin the flashing process, simply connect your Heltec ESP32 WiFi board to your computer, click the "Connect and Flash!" button, and sit back while our updater takes care of the rest. In just a few minutes, we\'ll notify you once the flashing process is complete. Please note that this operation will erase the current flash on your device.'}
                </Typography>


                <Flasher
                    bootloaderFile={bootloaderFile}
                    partitionTableFile={partitionTableFile}
                    firmwareFile={firmwareFile}
                    spiffsFile={spiffsFile}

                    setIsReady={(status: boolean) => setCompleted(status)}
                    setProgress={(p: number) => setProgress(p)}
                    setPhase={(p: string) => setPhase(p)}

                    connectAndFlash={flash} 
                />

                {
                    (!flash && !completed) && (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button variant="contained" onClick={() => {
                                setFlash(true)
                                setCompleted(false)
                            }}>
                                Connect and Flash!
                            </Button>
                        </Box>
                    )
                }

                

                {(completed && !flash) && (
                    <>
                        <Typography variant="h6" gutterBottom align="center">
                        Device firmware upgrade completed! You can now disconnect your device and start using it.
                        </Typography>
                        <Typography variant="h6" gutterBottom align="center">
                        Note that the device does not work if you press only reset button, you need to disconnect the power and reconnect it.
                        </Typography>
                    </>
                )}

                {
                    (flash && !completed) && (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress variant="determinate" value={progress} />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                    <Typography variant="body2">{`${Math.round(
                                        progress
                                    )}%`}</Typography>
                                </Box>
                            </Box>
                        
                            <Typography variant="subtitle2" gutterBottom align="center">
                                <b>
                                    { phase }
                                </b>
                            </Typography>
                            <Typography variant="subtitle2" gutterBottom align="center">
                                <i>
                                    { formattedRemainingTime } remaining
                                </i>
                            </Typography>
                        </>
                    )
                }

            </Container>
        </Box>
    )
}

export default ProgressView
