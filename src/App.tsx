import React, { useState, useEffect } from 'react'
import IsNotChrome from './view/IsNotChrome'
import LRCDFU, { WebSerial } from './view/LRCDFU'
import ParametrizationView from './view/ParametrizationView'




const App = () => {

    const [isChrome, setIsChrome] = useState(true)
    const [showParametrizationView, setShowParametrizationView] = useState(true)
    const [webSerial, setWebSerial] = useState<WebSerial | null>(null)

    useEffect(() => {
        setIsChrome(!!window.chrome)
    }, [])

    return (
        <>
            {
                !isChrome ? (
                    <IsNotChrome useDespiteOf={ () => setIsChrome(true) }/>
                ) : (
                    (showParametrizationView && webSerial)
                        ?
                        // <ParametrizationView webSerial={webSerial} />
                        <ParametrizationView
                            parameters={[
                                { type: 'string', key: 'SSID', value: 'my_default_ssid' },
                                { type: 'string', key: 'PASSWORD', value: 'my_default_pasword' },
                                { type: 'boolean', key: 'WIFI_MODE', value: 'true' },
                            ]}
                        />
                        :
                        <LRCDFU
                            setWebSerial={(serial: WebSerial) => {
                                // Tell the serial device
                                setWebSerial(serial)
                                // Show the parametrization view
                                setShowParametrizationView(true)
                            }}
                        />
                )
            }
        </>
    )
}


export default App

