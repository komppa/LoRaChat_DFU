import React, { useState } from 'react'
import { Button } from '@mui/material'


interface FileUplaodProps {
    onFileSelected: (file: File) => void
    requestedFilename: string
}

const FileUpload: React.FC<FileUplaodProps> = ({ onFileSelected, requestedFilename }) => {

    const [file, setFile] = useState<File | null>(null)
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const f = e.target.files[0]
            setFile(f)
            onFileSelected(f)
        }
    }
  
    return (
        <div>
            <input
                accept=".bin"
                id={`contained-button-file-${requestedFilename}`}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <label htmlFor={`contained-button-file-${requestedFilename}`}>
                <Button variant="contained" component="span">
                    Choose {requestedFilename}&hellip;
                </Button>
            </label>
            {file && <p>Selected file: {file.name}</p>}
        </div>
    )
}
  
export default FileUpload
  