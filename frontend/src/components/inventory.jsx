import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Warehouse } from "lucide-react"

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]) // Ensure this is an array by default
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/get-inventory")
                const data = await response.json()
                console.log(data) // Log the data to verify the structure
                setInventory(data.inventory || []) // Ensure inventory is always an array
            } catch (error) {
                console.error("Failed to fetch inventory:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchInventory()
    }, [])

    // Group the inventory by stage, making sure to handle empty stages as 'Unknown'
    const groupedByStage = (inventory || []).reduce((acc, item) => {
        const stage = item.stage || "Unknown" // Default to "Unknown" if no stage
        if (!acc[stage]) acc[stage] = []
        acc[stage].push(item)
        return acc
    }, {})

    const handleClick = async (uid) => {
        const response = await fetch("http://localhost:5000/api/get-order-by-uid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ uid }),
        });
        const data = await response.json();
        if (data.success && data.order) {
            window.open(`http://localhost:5173/order/${data.order.order_id}`, '_blank');
        } else {
            window.open(`http://localhost:5173/part/${encodeURIComponent(uid)}`, '_blank');
        }

    };

    const renderStageSection = (stageLabel) => {
        // Use stageLabel directly from the API data
        return (
            <Card className="bg-[#E7FFFE] dark:bg-primary/5 shadow-sm border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>{stageLabel}</CardTitle>
                    <CardDescription>Items currently in {stageLabel}</CardDescription>
                </CardHeader>
                <CardContent>
                    {groupedByStage[stageLabel]?.length > 0 ? ( // Check for this exact stage label
                        <div className="flex flex-wrap gap-3 cursor-pointer">
                            {groupedByStage[stageLabel].map((item) => (
                                <Badge
                                    key={item.id}
                                    className="px-3 py-1 text-sm font-mono bg-amber-300"
                                    // onClick={() => {
                                    //     window.location.href = `http://localhost:5173/part/${encodeURIComponent(item.uid)}`;
                                    // }}
                                    onClick={() => { handleClick(item.uid) }}
                                >
                                    {item.uid}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No items in this stage.</p>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 mt-10">
            <h1 className="text-3xl mb-4 flex items-center gap-2 font-bold"> <Warehouse />Inventory Overview</h1>
            {loading ? (
                <p className="text-muted-foreground">Loading inventory...</p>
            ) : (
                <div className="space-y-6">
                    {renderStageSection("Stage 1 (Store)")}
                    <Separator />
                    {renderStageSection("Stage 2 (Sub-Assembly)")}
                    <Separator />
                    {renderStageSection("Stage 3 (Design)")}
                    <Separator />
                    {renderStageSection("Unknown")} {/* For empty stage */}
                </div>
            )}
        </div>
    )
}
