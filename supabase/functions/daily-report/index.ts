import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Today's date range (UAE timezone = UTC+4)
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayStartISO = todayStart.toISOString()
    const nowISO = now.toISOString()

    // Fetch today's orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, status, total, created_at, delivery_city, customer_name')
      .gte('created_at', todayStartISO)
      .lte('created_at', nowISO)

    if (error) throw error

    const totalOrders = orders?.length || 0
    const delivered = orders?.filter(o => o.status === 'delivered') || []
    const cancelled = orders?.filter(o => o.status === 'cancelled') || []
    const pending = orders?.filter(o => !['delivered', 'cancelled'].includes(o.status || '')) || []
    const totalRevenue = delivered.reduce((sum, o) => sum + (o.total || 0), 0)
    const avgOrder = delivered.length > 0 ? totalRevenue / delivered.length : 0
    const cancelRate = totalOrders > 0 ? ((cancelled.length / totalOrders) * 100).toFixed(1) : '0'

    // Peak hour
    const hourCount: Record<number, number> = {}
    orders?.forEach(o => {
      const h = new Date(o.created_at).getHours()
      hourCount[h] = (hourCount[h] || 0) + 1
    })
    const peakHour = Object.entries(hourCount).sort((a, b) => Number(b[1]) - Number(a[1]))[0]

    // Top areas
    const areaCount: Record<string, number> = {}
    orders?.forEach(o => {
      if (o.delivery_city) areaCount[o.delivery_city] = (areaCount[o.delivery_city] || 0) + 1
    })
    const topAreas = Object.entries(areaCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

    // Yesterday comparison
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const { data: yOrders } = await supabase
      .from('orders')
      .select('id, status, total')
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStartISO)

    const yTotal = yOrders?.length || 0
    const yDelivered = yOrders?.filter(o => o.status === 'delivered') || []
    const yRevenue = yDelivered.reduce((sum, o) => sum + (o.total || 0), 0)

    const orderChange = yTotal > 0 ? (((totalOrders - yTotal) / yTotal) * 100).toFixed(0) : 'N/A'
    const revenueChange = yRevenue > 0 ? (((totalRevenue - yRevenue) / yRevenue) * 100).toFixed(0) : 'N/A'

    const formatHour = (h: number) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`

    const reportTitle = 'ملخص اليوم 📋'
    const reportBody = [
      `📦 الطلبات: ${totalOrders} (${orderChange !== 'N/A' ? (Number(orderChange) >= 0 ? '↑' : '↓') + Math.abs(Number(orderChange)) + '% عن أمس' : 'أول يوم'})`,
      `✅ تم التوصيل: ${delivered.length}`,
      `❌ ملغي: ${cancelled.length} (${cancelRate}%)`,
      `⏳ قيد التنفيذ: ${pending.length}`,
      `💰 الإيرادات: ${totalRevenue.toFixed(0)} د.إ (${revenueChange !== 'N/A' ? (Number(revenueChange) >= 0 ? '↑' : '↓') + Math.abs(Number(revenueChange)) + '%' : '-'})`,
      `🧾 متوسط الطلب: ${avgOrder.toFixed(0)} د.إ`,
      peakHour ? `⏰ ساعة الذروة: ${formatHour(Number(peakHour[0]))} (${peakHour[1]} طلب)` : '',
      topAreas.length > 0 ? `🏘️ أكثر المناطق: ${topAreas.map(a => `${a[0]}(${a[1]})`).join(', ')}` : '',
    ].filter(Boolean).join('\n')

    console.log('Daily Report:\n', reportBody)

    // Send to all admins
    const { data: adminIds } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    for (const admin of adminIds || []) {
      await fetch(`${supabaseUrl}/functions/v1/push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          userId: admin.user_id,
          title: reportTitle,
          titleAr: reportTitle,
          body: reportBody,
          bodyAr: reportBody,
          data: { route: '/admin/analytics' },
        }),
      })
    }

    return new Response(JSON.stringify({ success: true, report: reportBody }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Daily report error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
