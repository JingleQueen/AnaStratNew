import axios from 'axios';
import config from '../utils/config';

const baseUrl = config.get('backend:baseUrl');

class ProxyService {
  static async initialize(queryParams) {
    const response = await axios(`${baseUrl}`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }
  static async anastratScore(queryParams) {
    const response = await axios(`${baseUrl}/anastrat_score`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async comparisons(queryParams) {
    const response = await axios(`${baseUrl}/comparisons`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async statstics(queryParams) {
    const response = await axios(`${baseUrl}/statstics`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async traits(queryParams) {
    const response = await axios(`${baseUrl}/traits`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async dayAnalysis(queryParams) {
    const response = await axios(`${baseUrl}/day_analysis`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async timeAnalysis(queryParams) {
    const response = await axios(`${baseUrl}/time_analysis`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async profitCalls(queryParams) {
    const response = await axios(`${baseUrl}/profit_calls`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async lossCalls(queryParams) {
    const response = await axios(`${baseUrl}/loss_calls`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async longCalls(queryParams) {
    const response = await axios(`${baseUrl}/long_calls`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async shortCalls(queryParams) {
    const response = await axios(`${baseUrl}/short_calls`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async returns(queryParams) {
    const response = await axios(`${baseUrl}/returns`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async insights(queryParams) {
    const response = await axios(`${baseUrl}/insights`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async getChartingData(queryParams) {
    const response = await axios(`${baseUrl}/get_charting_data`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }

  static async mergeMarketData(queryParams) {
    await axios(`${baseUrl}/merge_market_data`, {
      params: {
        ...queryParams,
      },
    });
  }

  static async getChartDataStatus(queryParams) {
    const response = await axios(`${baseUrl}/get_chart_data_status`, {
      params: {
        ...queryParams,
      },
    });
    return response;
  }
}

export default ProxyService;
