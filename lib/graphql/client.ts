import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

export const client = new ApolloClient({
  link: createHttpLink({
    uri: '/api/graphql',
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
  },
});
