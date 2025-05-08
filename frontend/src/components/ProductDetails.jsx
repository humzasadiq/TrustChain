
import { useState, useEffect } from "react"

import { useParams } from "react-router-dom"


export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetch(`http:localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data)
      })
  }, [id])

  if (!product) {
    return <div>Loading...</div>
  }

  return (
    <div >
        product details
    </div>
    
  )
}