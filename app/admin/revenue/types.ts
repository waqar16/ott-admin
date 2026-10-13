export interface TopContent {
  content_id: string | number
  title: string
  views: number
}

export interface Performer {
  creator_id?: string
  creator_name?: string
  unique_views: number
  percentage_of_total_views: number
  earning: number | string
  top_contents: TopContent[]
}

export interface Section1TotalIn {
  title?: string
  gross_revenue: number
  currency: string
  creator_share_percentage: number
  platform_costs_and_margin_percentage: number
  creator_revenue_pool: number
  platform_retained_revenue: number
  start_date?: string
  end_date?: string
  total_unique_views: number
  unassigned_views?: number
}

export interface Section2CreatorRevenue {
  title?: string
  creator_revenue_pool: number
  pool_label?: string
  currency: string
  total_creators: number
  total_unique_views: number
  avg_views_per_creator: number
  top_performer: Performer | null
  lowest_performer: Performer | null
  creators: Performer[]
}

export interface SummaryData {
  start_date?: string
  end_date?: string
  currency?: string
  total_unique_views: number
  total_revenue: number
  creator_revenue_pool?: number
  creator_share_percentage?: number
  platform_retained_revenue?: number
  total_creators: number
  avg_views_per_creator: number
}

export interface CreatorReportData {
  section_1_total_in?: Section1TotalIn
  section_2_creator_revenue?: Section2CreatorRevenue
  summary?: SummaryData
  top_performer?: Performer | null
  lowest_performer?: Performer | null
  creators?: Performer[]
}

export interface StatementContentItem {
  content_id: string | number
  title: string
  views: number
}

export interface CreatorStatement {
  creator_id: string
  creator_name: string
  email?: string
  statement_period: {
    start_date: string
    end_date: string
  }
  currency: string
  unique_views: number
  percentage_of_views: number
  payout_due: number
  contents: StatementContentItem[]
}

export interface FilterState {
  start_date: string
  end_date: string
  revenue?: string
  creator_share_percentage?: string
  currency?: string
}
