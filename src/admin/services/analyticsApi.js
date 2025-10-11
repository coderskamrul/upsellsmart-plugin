/**
 * Analytics API Service
 * Handles all API calls for analytics data
 */

const API_BASE = '/wp-json/upspr/v1';

/**
 * Format date to Y-m-d format
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get API headers with nonce
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-WP-Nonce': window.wpApiSettings?.nonce || window.upsellsmartData?.nonce || '',
  };
};

export const analyticsApi = {
  /**
   * Get all campaigns
   */
  getCampaigns: async (params = {}) => {
    const queryParams = new URLSearchParams({
      per_page: params.per_page || 100,
      page: params.page || 1,
      ...params,
    });

    const response = await fetch(`${API_BASE}/campaigns?${queryParams}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch campaigns:', response.status, errorText);
      throw new Error('Failed to fetch campaigns');
    }

    const data = await response.json();
    console.log('Campaigns fetched:', data);
    return data;
  },

  /**
   * Get daily analytics data for a campaign
   */
  getAnalytics: async (campaignId, startDate, endDate) => {
    const params = new URLSearchParams({
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    });

    const response = await fetch(
      `${API_BASE}/campaigns/${campaignId}/analytics?${params}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    return response.json();
  },

  /**
   * Get performance summary for a campaign
   */
  getPerformance: async (campaignId, startDate, endDate) => {
    const params = new URLSearchParams({
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    });

    const response = await fetch(
      `${API_BASE}/campaigns/${campaignId}/performance?${params}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch performance');
    }

    return response.json();
  },

  /**
   * Get product-level performance
   */
  getProductPerformance: async (campaignId, startDate, endDate) => {
    const params = new URLSearchParams({
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    });

    const response = await fetch(
      `${API_BASE}/campaigns/${campaignId}/products-performance?${params}`,
      {
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch product performance');
    }

    return response.json();
  },

  /**
   * Get all campaigns with their performance data
   */
  getAllCampaignsPerformance: async (startDate, endDate) => {
    try {
      // Get all campaigns (don't filter by status to get all campaigns)
      const campaigns = await analyticsApi.getCampaigns({ per_page: 100 });

      console.log('Fetched campaigns for performance:', campaigns);

      // If campaigns is empty, return empty array
      if (!campaigns || campaigns.length === 0) {
        console.log('No campaigns found');
        return [];
      }

      // Get performance for each campaign
      const performancePromises = campaigns.map((campaign) =>
        analyticsApi.getPerformance(campaign.id, startDate, endDate)
          .then(result => ({
            ...campaign,
            performance: result.performance,
          }))
          .catch(error => {
            console.error(`Failed to fetch performance for campaign ${campaign.id}:`, error);
            return {
              ...campaign,
              performance: {
                impressions: 0,
                clicks: 0,
                conversions: 0,
                revenue: 0,
                ctr: 0,
                conversion_rate: 0,
                aov: 0,
              },
            };
          })
      );

      return Promise.all(performancePromises);
    } catch (error) {
      console.error('Failed to fetch campaigns performance:', error);
      throw error;
    }
  },

  /**
   * Get overview analytics (all campaigns combined)
   */
  getOverviewAnalytics: async (startDate, endDate) => {
    try {
      const campaignsWithPerformance = await analyticsApi.getAllCampaignsPerformance(startDate, endDate);

      // Calculate totals
      const totals = campaignsWithPerformance.reduce(
        (acc, campaign) => ({
          total_campaigns: acc.total_campaigns + 1,
          total_impressions: acc.total_impressions + (campaign.performance.impressions || 0),
          total_clicks: acc.total_clicks + (campaign.performance.clicks || 0),
          total_conversions: acc.total_conversions + (campaign.performance.conversions || 0),
          total_revenue: acc.total_revenue + (campaign.performance.revenue || 0),
        }),
        {
          total_campaigns: 0,
          total_impressions: 0,
          total_clicks: 0,
          total_conversions: 0,
          total_revenue: 0,
        }
      );

      // Calculate rates
      const ctr = totals.total_impressions > 0
        ? (totals.total_clicks / totals.total_impressions) * 100
        : 0;
      const conversion_rate = totals.total_clicks > 0
        ? (totals.total_conversions / totals.total_clicks) * 100
        : 0;
      const aov = totals.total_conversions > 0
        ? totals.total_revenue / totals.total_conversions
        : 0;

      return {
        overview: {
          ...totals,
          ctr: parseFloat(ctr.toFixed(2)),
          conversion_rate: parseFloat(conversion_rate.toFixed(2)),
          aov: parseFloat(aov.toFixed(2)),
        },
        campaigns: campaignsWithPerformance,
      };
    } catch (error) {
      console.error('Failed to fetch overview analytics:', error);
      throw error;
    }
  },
};

export default analyticsApi;

