import React from 'react'
import { Box, Button, Container, Typography } from '@mui/material'

interface IsNotChromeProps {
    useDespiteOf: () => void;
}

const IsNotChrome: React.FC<IsNotChromeProps> = ({ useDespiteOf }) => {
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

                <Typography variant="h3" component="h1" gutterBottom align="center" mb={7}>
                    Unsupported browser detected
                </Typography>

                <Typography variant="body1" gutterBottom align="center" mb={5}>
                    Unfortunately, the LoRa Chat Device Firmware Upgrade Tool requires Google Chrome to function properly. For the best experience, please switch to Google Chrome and try again.
                </Typography>

                <Typography variant="body1" gutterBottom align="center" mb={5}>
                    {'If you understand the risks and would like to proceed without using Google Chrome, click the "Continue without using Chrome" button below. However, please note that this is not recommended and may lead to unexpected issues.'}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" onClick={useDespiteOf}>
                        Continue without using Chrome
                    </Button>
                </Box>
            </Container>
        </Box>
    )
}

export default IsNotChrome