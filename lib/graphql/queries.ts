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
  `,
  UNIFIED: gql`
    query UnifiedSearch($searchText: String!) {
      coinResults: globalSearch(text: $searchText, entityType: COIN) {
        edges {
          node {
            __typename
            ... on GlobalSearchCoinResult {
              token {
                address
                name
                symbol
                ... on IGraphQLZora20Token {
                  totalVolume
                  volume24h
                  address
                  creatorAddress
                  marketCap
                  marketCapDelta24h
                  totalSupply
                }
                tokenPrice {
                  priceInUsdc
                }
                mediaContent {
                  previewImage {
                    small
                  }
                }
              }
            }
          }
        }
      }
      profileResults: profileSearchV2(text: $searchText, first: 3) {
        edges {
          node {
            id
            displayName: profileId
            username: profileId
            avatar {
              ... on GraphQLMediaImage {
                small
                medium
              }
            }
            ... on GraphQLAccountProfile {
              creatorCoin {
                address
                name
                symbol
                ... on IGraphQLZora20Token {
                  totalVolume
                  volume24h
                  address
                  creatorAddress
                  marketCap
                  marketCapDelta24h
                  totalSupply
                }
              }
            }
          }
        }
      }
    }
  `
};
