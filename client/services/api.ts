import { AllActivityData, ActivityEvent } from "@/types/activity";

const API_BASE_URL = "http://localhost:8000/api";

// Default customer and account IDs from the data
const DEFAULT_CUSTOMER_ORG_ID = "org_4m6zyrass98vvtk3xh5kcwcmaf";
const DEFAULT_ACCOUNT_ID = "account_31crr1tcp2bmcv1fk6pcm0k6ag";

/**
 * Helper function to build URL with query parameters
 */
function buildUrl(endpoint: string, params: Record<string, any>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
}

export const api = {
  /**
   * Fetch all activity data including activities, daily counts, and first touchpoints
   */
  async getAllActivityData(): Promise<AllActivityData> {
    const url = buildUrl("/activities/all-data/", {
      customer_org_id: DEFAULT_CUSTOMER_ORG_ID,
      account_id: DEFAULT_ACCOUNT_ID,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Fetch paginated activities
   */
  async getActivities(
    page: number = 1,
    pageSize: number = 100
  ): Promise<{
    results: ActivityEvent[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    const url = buildUrl("/activities/", {
      customer_org_id: DEFAULT_CUSTOMER_ORG_ID,
      account_id: DEFAULT_ACCOUNT_ID,
      page,
      page_size: pageSize,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
