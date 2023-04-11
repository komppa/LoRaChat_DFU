import React, { useState, useEffect } from 'react'
import IsNotChrome from './view/IsNotChrome'
import LRCDFU, { WebSerial } from './view/LRCDFU'
import ParametrizationView, { Parameter } from './view/ParametrizationView'



const App = () => {

    const [isChrome, setIsChrome] = useState(true)
    const [showParametrizationView, setShowParametrizationView] = useState(true)
    const [webSerial, setWebSerial] = useState<any | null>(null)

    const [currentParameters, setCurrentParameters] = useState<Parameter[]>([])

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
                        <ParametrizationView
                            parameters={currentParameters}
                            webSerial={webSerial}
                        />
                        :
                        <LRCDFU
                            setWebSerial={(s: any) => {
                                // Tell the serial device
                                setWebSerial(s)
                                // Show the parametrization view
                                setShowParametrizationView(true)
                            }}
                            setCurrentParameters={(data: Parameter[]) => setCurrentParameters(data)}
                        />
                )
            }
        </>
    )
}


export default App

