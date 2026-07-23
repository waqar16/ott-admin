export interface TopContent {
  content_id: string | number
  title: string
  views: number
}

export interface Performer {
  creator_name?: string
  unique_views: number
  percentage_of_total_views: number
  earning: number | string
  top_contents: TopContent[]
}

export interface SummaryData {
  total_unique_views: number
  total_revenue: number
  total_creators: number
  avg_views_per_creator: number
}

export interface CreatorReportData {
  summary: SummaryData
  top_performer: Performer | null
  lowest_performer: Performer | null
  creators: Performer[]
}

export interface FilterState {
  start_date: string
  end_date: string
}
