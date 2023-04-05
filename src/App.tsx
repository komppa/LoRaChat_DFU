import React, { useState, useEffect } from 'react'
import IsNotChrome from './view/IsNotChrome'
import LRCDFU from './view/LRCDFU'



const App = () => {

    const [isChrome, setIsChrome] = useState(true)

    useEffect(() => {
        setIsChrome(!!window.chrome)
    }, [])

    return (
        <>
            {
                !isChrome ? (
                    <IsNotChrome useDespiteOf={ () => setIsChrome(true) }/>
                ) : (
                    <LRCDFU />
                )
            }
        </>
    )
}


export default App

