
import { useState, useEffect} from "react"

import { useLocation } from "react-router-dom"


export default function ShowNavbar({children}) {
  const location = useLocation()
  const [showNavbar, setShowNavbar] = useState(true)

  useEffect(() => {
    if ((location.pathname.includes("order"))||(location.pathname.includes("part"))) {
      setShowNavbar(false)
    }
    else {
        setShowNavbar(true)
    }
  }, [location.pathname])

  return (
    <div>{showNavbar && children}</div>
  )
}
