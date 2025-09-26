export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  job_title: string | null;
  role_in_touchpoint?: string | null;
}

export interface ActivityEvent {
  touchpoint_id: string;
  timestamp: string;
  formatted_date: string;
  activity: string;
  channel: string;
  status: string;
  direction: string;
  people: any[];
  people_details: Person[];
  involved_team_ids: string[];
  campaign_name: string | null;
  record_type: string;
}

export interface DailyActivityCount {
  date: string;
  count: number;
}

export interface FirstTouchpoint {
  person_id: string;
  person_name: string;
  timestamp: string;
  date: string;
}

export interface AllActivityData {
  activities: ActivityEvent[];
  daily_counts: DailyActivityCount[];
  first_touchpoints: FirstTouchpoint[];
  total_count: number;
}


