import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function CountTransactions() {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    uniqueItems: 0,
    percentageChange: 0,
    isIncrease: true,
    loading: true,
  })

  useEffect(() => {
    fetchTransactionStats()
  }, [])

  const fetchTransactionStats = async () => {
    try {
      // Get current month's data
      const currentDate = new Date()
      const firstDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      // Get first day of last month
      const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)

      // Get total transactions for current month
      const { data: currentMonthData, error: currentError } = await supabase
        .from("order_items")
        .select("id, item_uid")
        .gte("timestamp", firstDayOfCurrentMonth.toISOString())

      if (currentError) throw new Error(`Current month query error: ${currentError.message}`)

      // Get last month's data
      const { data: lastMonthData, error: lastError } = await supabase
        .from("order_items")
        .select("id, item_uid")
        .gte("timestamp", firstDayOfLastMonth.toISOString())
        .lt("timestamp", firstDayOfCurrentMonth.toISOString())

      if (lastError) throw new Error(`Last month query error: ${lastError.message}`)

      // Calculate statistics
      const currentTotal = currentMonthData?.length || 0
      const lastTotal = lastMonthData?.length || 0

      // Get unique items count
      const uniqueItems = new Set(currentMonthData?.map((item) => item.item_uid)).size

      // Calculate percentage change
      let percentageChange = 0
      let isIncrease = true

      if (lastTotal === 0) {
        percentageChange = currentTotal > 0 ? 100 : 0
      } else {
        percentageChange = ((currentTotal - lastTotal) / lastTotal) * 100
        isIncrease = percentageChange >= 0
      }

      setStats({
        totalTransactions: currentTotal,
        uniqueItems,
        percentageChange: Math.abs(percentageChange).toFixed(1),
        isIncrease,
        loading: false,
      })
    } catch (error) {
      console.error("Error fetching transaction stats:", error)
      setStats((prev) => ({
        ...prev,
        loading: false,
        totalTransactions: 0,
        uniqueItems: 0,
        percentageChange: 0,
        isIncrease: true,
      }))
    }
  }

  return (
    <Card className={"bg-[#E7FFFE] dark:bg-primary/5"}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Part Transactions</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {stats.loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-8 w-24 bg-muted rounded"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        ) : (
          <>
            <div className="mt-15 text-5xl font-bold flex justify-center items-center">{stats.totalTransactions}</div>
            <div className="flex flex-col space-y-1">
              <p className="text-md text-muted-foreground text-center">
                <span className={`flex items-center justify-center ${stats.isIncrease ? "text-emerald-500" : "text-red-500"}`}>
                  {stats.isIncrease ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {stats.percentageChange}%
                </span>{" "}
                from last month
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
