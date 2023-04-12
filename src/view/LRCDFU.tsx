import React, { useEffect, useState } from 'react'
import { Box, Container, Typography, Link, Button, decomposeColor } from '@mui/material'
import LinearProgress from '@mui/material/LinearProgress'
import Flasher from '../components/Flasher'
import JSZip from 'jszip'
import moment from 'moment'
import { Parameter } from './ParametrizationView'


interface ProgressViewProps {
    setWebSerial: (webSerialPort: any) => void
    setCurrentParameters: (currentParameters: Parameter[]) => void
}

export interface WebSerial {
    write: (data: string) => Promise<void>
    read: () => Promise<string>
}


const LRCDFU: React.FC<ProgressViewProps> = ({ setCurrentParameters, setWebSerial }) => {

    const [flash, setFlash] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [phase, setPhase] = useState('')

    const [remainingTime, setRemainingTime] = useState(0)

    const [bootloaderFile, setBootloaderFile] = useState<null | Blob>(null)
    const [partitionTableFile, setPartitionTableFile] = useState<null | Blob>(null)
    const [firmwareFile, setFirmwareFile] = useState<null | Blob>(null)
    const [spiffsFile, setSpiffsFile] = useState<null | Blob>(null)

    let intervalHandler: any | null = null


    const handleCurrentParameters = (data: string) => {
        console.log('Received:', data)
        // If this data can be parsed as JSON and it has a element of array with "type" property, it's a message from the device
        try {
            const parsedLine = JSON.parse(data)
            if (Array.isArray(parsedLine) && parsedLine.length > 0 && (parsedLine[0].type == 'string' || parsedLine[0].type == 'boolean')) {
                console.log('Received current parameters from device!')
                // Send current params to parametrizaion view
                setCurrentParameters(parsedLine)
                // We can stop the hammering the magic word to device
                clearInterval(intervalHandler)
            }
        } catch (error) {
            // Do nothing
        }
    }


    class WebSerialReader {
        private reader: ReadableStreamDefaultReader<Uint8Array> | null = null
        private lineBuffer: Uint8Array = new Uint8Array()
      
        constructor(private port: any) {

        }
        
        async startReading() {
            if (this.port.readable) {
                this.reader = this.port.readable.getReader()
                await this.readLoop()
            } else {
                console.error('Port is not readable')
            }
        }
        
        async stopReading() {
            if (this.reader) {
                await this.reader.cancel()
                this.reader.releaseLock()
                this.reader = null
            }
        }
        
        async write(data: string) {
            if (this.port.writable) {
                const writer = this.port.writable.getWriter()
                try {
                    const encoder = new TextEncoder()
                    const dataArray = encoder.encode(data)
                    await writer.write(dataArray)
                } finally {
                    writer.releaseLock()
                }
            } else {
                console.error('Port is not writable')
            }
        }
        
        private async readLoop() {
            while (this.reader) {
                const { value, done } = await this.reader.read()
                if (done) {
                    break
                }
      
                this.processData(value)
            }
        }
        
        private processData(data: Uint8Array) {
            let position = 0
            while (position < data.length) {
                const lineBreakIndex = data.indexOf(0x0A, position)
                if (lineBreakIndex === -1) {
                    this.lineBuffer = this.concatUint8Arrays(this.lineBuffer, data.slice(position))
                    break
                }

      
                const line = this.concatUint8Arrays(this.lineBuffer, data.slice(position, lineBreakIndex))
                this.lineBuffer = new Uint8Array()
      
                if (line.length > 0 && line[line.length - 1] === 0x0D) {
                    this.handleLine(line.slice(0, line.length - 1))
                } else {
                    this.handleLine(line)
                }
      
                position = lineBreakIndex + 1
            }
        }
        
        private concatUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
            const result = new Uint8Array(a.length + b.length)
            result.set(a, 0)
            result.set(b, a.length)
            return result
        }
        
        private handleLine(line: Uint8Array) {
            const textDecoder = new TextDecoder()
            const textLine = textDecoder.decode(line)
            // Check whether the received data is parameters from the device
            handleCurrentParameters(textLine)            
        }
    }
      
    async function setupWebSerial() {
        const port = await (navigator as any).serial.requestPort()
        await port.open({ baudRate: 115200 })
      
        const reader = new WebSerialReader(port)
        setWebSerial(reader)
        
        setTimeout(async () => {
            // Since we are here, we assume that we have user to tell to press the reset button on the device
            // that the device could check if the parametrization should be activated. Hammer magic string in so long
            // that the device enters the parametrization mode
            reader.startReading()
            
            intervalHandler = setInterval(() => {
                console.log('Sending magic string')
                reader.write('NOT_MY_CAT')
            }, 1000)

        }, 500)


    }


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

                            <Button variant="contained" sx={{ mr: 2 }} onClick={() => {
                                if (bootloaderFile && partitionTableFile && firmwareFile && spiffsFile) {
                                    setFlash(true)
                                    setCompleted(false)
                                }
                            }}>
                                Connect and Flash!
                            </Button>

                            <Button variant="contained" onClick={() => setupWebSerial()}>
                                Set parameters
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

export default LRCDFU
