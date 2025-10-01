import { gql } from '@apollo/client';

export const SEARCH_QUERIES = {
  PROFILES: gql`
    query SearchProfiles($searchText: String!, $first: Int = 10) {
      profileSearchV2(text: $searchText, first: $first) {
        edges {
          node {
            id
            profileId
            avatar {
              ... on GraphQLMediaImage {
                small
              }
            }
            ... on GraphQLAccountProfile {
              creatorCoin {
                address
                chainId
                name
                symbol
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `
};
