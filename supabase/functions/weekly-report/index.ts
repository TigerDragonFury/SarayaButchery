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

    // Calculate date range: last 7 days
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()
    const nowISO = now.toISOString()

    // Fetch orders from last week
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('id, status, total, created_at, delivery_city, items, customer_name')
      .gte('created_at', weekAgoISO)
      .lte('created_at', nowISO)

    if (ordersErr) throw ordersErr

    const totalOrders = orders?.length || 0
    const deliveredOrders = orders?.filter(o => o.status === 'delivered') || []
    const cancelledOrders = orders?.filter(o => o.status === 'cancelled') || []
    const pendingOrders = orders?.filter(o => !['delivered', 'cancelled'].includes(o.status || '')) || []

    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const avgOrderValue = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0
    const cancelRate = totalOrders > 0 ? ((cancelledOrders.length / totalOrders) * 100).toFixed(1) : '0'

    // Busiest day
    const dayCount: Record<string, number> = {}
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    orders?.forEach(o => {
      const day = dayNames[new Date(o.created_at).getDay()]
      dayCount[day] = (dayCount[day] || 0) + 1
    })
    const busiestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]

    // Top delivery areas
    const areaCount: Record<string, number> = {}
    orders?.forEach(o => {
      if (o.delivery_city) {
        areaCount[o.delivery_city] = (areaCount[o.delivery_city] || 0) + 1
      }
    })
    const topAreas = Object.entries(areaCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

    // Previous week for comparison
    const twoWeeksAgo = new Date(weekAgo)
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7)
    const { data: prevOrders } = await supabase
      .from('orders')
      .select('id, status, total')
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', weekAgoISO)

    const prevTotal = prevOrders?.length || 0
    const prevDelivered = prevOrders?.filter(o => o.status === 'delivered') || []
    const prevRevenue = prevDelivered.reduce((sum, o) => sum + (o.total || 0), 0)

    const orderChange = prevTotal > 0 ? (((totalOrders - prevTotal) / prevTotal) * 100).toFixed(0) : 'N/A'
    const revenueChange = prevRevenue > 0 ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(0) : 'N/A'

    // Build report message
    const reportTitle = 'التقرير الأسبوعي 📊'
    const reportBody = [
      `📦 إجمالي الطلبات: ${totalOrders} (${orderChange !== 'N/A' ? (Number(orderChange) >= 0 ? '↑' : '↓') + Math.abs(Number(orderChange)) + '%' : 'أول أسبوع'})`,
      `✅ تم التوصيل: ${deliveredOrders.length}`,
      `❌ ملغي: ${cancelledOrders.length} (${cancelRate}%)`,
      `⏳ قيد التنفيذ: ${pendingOrders.length}`,
      `💰 الإيرادات: ${totalRevenue.toFixed(0)} د.إ (${revenueChange !== 'N/A' ? (Number(revenueChange) >= 0 ? '↑' : '↓') + Math.abs(Number(revenueChange)) + '%' : '-'})`,
      `🧾 متوسط الطلب: ${avgOrderValue.toFixed(0)} د.إ`,
      busiestDay ? `📅 أكثر يوم ضغط: ${busiestDay[0]} (${busiestDay[1]} طلب)` : '',
      topAreas.length > 0 ? `🏘️ أكثر المناطق: ${topAreas.map(a => `${a[0]}(${a[1]})`).join(', ')}` : '',
    ].filter(Boolean).join('\n')

    console.log('Weekly Report:\n', reportBody)

    // Send push notification to all admins
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
    console.error('Weekly report error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
