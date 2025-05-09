import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { toast } from "sonner"
import jobServices from "../services/api"

export default function Details({ type }) {
  const { id } = useParams()
  const location = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // If we have data passed through navigation state, use it
        if (location.state?.data) {
          setData(location.state.data)
          return
        }

        // Otherwise fetch from API
        let result
        if (type === 'order') {
          result = await jobServices.fetchOrderById(id)
          if (!result) {
            throw new Error(`No ${type} found with ID: ${id}`)
          }
        } else if (type === 'part') {
          result = await jobServices.fetchPartById(id)
          if (!result) {
            throw new Error(`No ${type} found with ID: ${id}`)
          }
        }

        setData(result)
      } catch (error) {
        toast.error(error.message)
        // Redirect back to dashboard after error
        setTimeout(() => navigate('/dashboard'), 2000)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, type, location.state, navigate])

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-pulse text-lg">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const renderItemDetails = (item) => (
    <div key={item.id} className="space-y-4">
      <div className="flex justify-between border-b pb-2">
        <span className="font-medium">Item ID</span>
        <span>{item.id}</span>
      </div>
      <div className="flex justify-between border-b pb-2">
        <span className="font-medium">Order ID</span>
        <span>{item.order_id}</span>
      </div>
      <div className="flex justify-between border-b pb-2">
        <span className="font-medium">RFID UID</span>
        <span>{item.item_uid}</span>
      </div>
      <div className="flex justify-between border-b pb-2">
        <span className="font-medium">Stage</span>
        <span>{item.stage}</span>
      </div>
      <div className="flex justify-between border-b pb-2">
        <span className="font-medium">Timestamp</span>
        <span>{formatTimestamp(item.timestamp)}</span>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{type === 'part' ? 'Part Details' : 'Order Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.items && data.items.length > 0 ? (
            <div className="space-y-8">
              {data.items.map(item => renderItemDetails(item))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No items found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}