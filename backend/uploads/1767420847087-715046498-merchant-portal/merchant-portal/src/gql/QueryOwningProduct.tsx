import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import { getStandardHeaders } from '../util/StandardRequestHeaders';
import { ApteanProduct, GetOwningProductQuery } from '../gql-types.generated';
import { Maybe } from 'graphql/jsutils/Maybe';

// eslint-disable-next-line @typescript-eslint/naming-convention
const QUERY_OWNING_PRODUCT = gql`
  query getOwningProduct {
    account {
      owningProduct
    }
  }
`;

export const queryOwningProduct = async (client: ApolloClient<NormalizedCacheObject>): Promise<Maybe<ApteanProduct> | undefined> => {
  const headers = await getStandardHeaders();
  const { data, errors } = await client.query<GetOwningProductQuery>({
    query: QUERY_OWNING_PRODUCT,
    context: {
      headers,
    },
  });
  if (errors && errors.length > 0) {
    errors.forEach(error => {
      // Log error details in the console.
      console.error(error);
    });
    // Friendly error to the user.
    throw new Error('An error has occurred during the query.');
  }
  return data?.account?.owningProduct;
};
