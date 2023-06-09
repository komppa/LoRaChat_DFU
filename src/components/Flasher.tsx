import React, { useEffect, useRef } from 'react'


interface FlasherProps {
    bootloaderFile: Blob | null
    partitionTableFile: Blob | null
    firmwareFile: Blob | null
    spiffsFile: Blob | null
    setProgress: (progress: number) => void
    setIsReady: (isReady: boolean) => void
    setPhase: (phase: string) => void
    connectAndFlash: boolean
}

const Flasher: React.FC<FlasherProps> = ({
    bootloaderFile,
    partitionTableFile,
    firmwareFile,
    spiffsFile,
    setProgress,
    setIsReady,
    setPhase,
    connectAndFlash,
}) => {

    // Track when we should start flashing
    useEffect(() => {
        handleConnectButtonClick()
    }, [connectAndFlash])

    const espStubRef = useRef<any>(undefined)

    const bootloaderOffset = '0x1000'
    const partitionsOffset = '0x8000'
    const firmwareOffset = '0x10000'
    const spiffsOffset = '0x310000'

    const offsets = [
        bootloaderOffset,
        partitionsOffset,
        firmwareOffset,
        spiffsOffset
    ]

    // Replace `firmware` with an array of the passed file props
    const firmware = [bootloaderFile, partitionTableFile, firmwareFile, spiffsFile]

    const sleep = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    const formatMacAddr = (macAddr: number[]) => {
        return macAddr
            .map((value) => value.toString(16).toUpperCase().padStart(2, '0'))
            .join(':')
    }

    const getValidFiles = () => {
        const validFiles: number[] = []
        const offsetVals: number[] = []
        for (let i = 0; i < offsets.length; i++) {
            const offs = parseInt(offsets[i], 16)
            if (firmware[i] && !offsetVals.includes(offs)) {
                validFiles.push(i)
                offsetVals.push(offs)
            }
        }
        return validFiles
    }

    const clickErase = async () => {
        if (window.confirm('This will erase the entire flash. Click OK to continue.')) {
            try {
                console.log('Erasing flash memory. Please wait...')
                const stamp = Date.now()
                await espStubRef.current.eraseFlash()
                console.log('Finished. Took ' + (Date.now() - stamp) + 'ms to erase.')
            } catch (e) {
                console.log(e)
            } finally {
                // butProgram.disabled = getValidFiles().length == 0;
            }
        }
    }

    const clickConnect = async () => {
        if (espStubRef.current) {
            await espStubRef.current.disconnect()
            await espStubRef.current.port.close()
            espStubRef.current = undefined
            return
        }

        // const esploaderMod = await window.esptoolPackage
        const esploaderMod = await (window as any).esptoolPackage

        const esploader = await esploaderMod.connect({
            log: (...args: any[]) => console.log(...args),
            debug: (...args: any[]) => console.log(...args),
            error: (...args: any[]) => console.log(...args),
        })

        try {
            await esploader.initialize()

            console.log('Connected to ' + esploader.chipName)
            setPhase('Connected to ' + esploader.chipName)
            console.log('MAC Address: ' + formatMacAddr(esploader.macAddr()))

            espStubRef.current = await esploader.runStub()
            espStubRef.current.addEventListener('disconnect', () => {
                setPhase('Board disconnected')
                espStubRef.current = false
            })
        } catch (err) {
            await esploader.disconnect()
            throw err
        }

        setPhase('Erasing the flash of the board')
        console.log('Erasing the flash of the board')

        await clickErase()

        return esploader
    }

    const handleConnectButtonClick = async () => {
        try {
            // Connect to the board
            const esp = await clickConnect()

            // Flash the files
            await clickProgram(esp)
            // Disconnect from the board
            try {
                await espStubRef.current.disconnect()
            } catch (error) {
                console.error('Could not disconnect gracefully', error)
            }

            console.log('Flashing completed.')
            setIsReady(true)
        } catch (error) {
            console.error(error)
        }
    }

    const clickProgram = async (esp: any) => {
        const readUploadedFileAsArrayBuffer = (inputFile: Blob) => {
            const reader = new FileReader()

            return new Promise<ArrayBuffer>((resolve, reject) => {
                reader.onerror = () => {
                    reader.abort()
                    reject(new DOMException('Problem parsing input file.'))
                }

                reader.onload = () => {
                    resolve(reader.result as ArrayBuffer)
                }

                reader.readAsArrayBuffer(inputFile)
            })
        }

        let i = -1
        for (const file of getValidFiles()) {
            i = i + 1

            if (i === 0) {
                setPhase('Uploading bootloader... (1/4)')
            } else if (i === 1) {
                setPhase('Uploading partition table... (2/4)')
            } else if (i === 2) {
                setPhase('Uploading firmware... (3/4)')
            } else if (i === 3) {
                setPhase('Uploading UI... (4/4)')
            }
            
            const binfile = firmware[file]
            if (!binfile) continue
            const contents = await readUploadedFileAsArrayBuffer(binfile)
            try {
                const offset = parseInt(offsets[i], 16)
                await espStubRef.current.flashData(
                    contents,
                    (bytesWritten: number, totalBytes: number) => {
                        setProgress(Math.floor((bytesWritten / totalBytes) * 100))
                        console.log(Math.floor((bytesWritten / totalBytes) * 100) + '%')
                    },
                    offset
                )
                await sleep(100)
            } catch (e) {
                console.error(e)
            }
        }
        console.log('Resetting board...')
        await esp.hardReset(true)
    }

    return (<></>)
}

export default Flasher