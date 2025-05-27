import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://task-manager-node-js-graphql-api-backend.onrender.com/graphql', 
  cache: new InMemoryCache(),
});

export default client;
