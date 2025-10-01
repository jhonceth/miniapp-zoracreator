import { client } from '../graphql/client';
import { SEARCH_QUERIES } from '../graphql/queries';

export class SearchService {
  static async searchProfiles(searchText: string, first: number = 10) {
    try {
      const { data, error } = await client.query({
        query: SEARCH_QUERIES.PROFILES,
        variables: { searchText, first },
        fetchPolicy: 'network-only'
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: (data as any)?.profileSearchV2?.edges || [],
        error: null
      };
    } catch (error) {
      console.error('SearchService error:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
