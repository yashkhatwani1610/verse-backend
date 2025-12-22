// Shopify Admin API integration
const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_API_TOKEN = import.meta.env.VITE_SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = '2024-01';

export interface ShopifyProduct {
    node: {
        id: string;
        handle: string;
        title: string;
        priceRange: {
            minVariantPrice: {
                amount: string;
                currencyCode: string;
            };
        };
        images: {
            edges: Array<{
                node: {
                    url: string;
                    altText: string | null;
                };
            }>;
        };
    };
}

// GraphQL query to fetch products
const PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchProducts(limit: number = 20): Promise<ShopifyProduct[]> {
    try {
        const response = await fetch(
            `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN,
                },
                body: JSON.stringify({
                    query: PRODUCTS_QUERY,
                    variables: { first: limit },
                }),
            }
        );

        if (!response.ok) {
            console.error('Shopify API error:', response.status, response.statusText);
            return [];
        }

        const data = await response.json();

        if (data.errors) {
            console.error('GraphQL errors:', data.errors);
            return [];
        }

        // Transform the response to match our interface
        const products = data.data?.products?.edges?.map((edge: any) => ({
            node: {
                id: edge.node.id,
                handle: edge.node.handle,
                title: edge.node.title,
                priceRange: {
                    minVariantPrice: {
                        amount: edge.node.priceRangeV2.minVariantPrice.amount,
                        currencyCode: edge.node.priceRangeV2.minVariantPrice.currencyCode,
                    },
                },
                images: edge.node.images,
            },
        })) || [];

        return products;
    } catch (error) {
        console.error('Error fetching products from Shopify:', error);
        return [];
    }
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
    try {
        const query = `
          query getProduct($handle: String!) {
            productByHandle(handle: $handle) {
              id
              handle
              title
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        `;

        const response = await fetch(
            `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN,
                },
                body: JSON.stringify({
                    query,
                    variables: { handle },
                }),
            }
        );

        if (!response.ok) {
            console.error('Shopify API error:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();

        if (data.errors || !data.data?.productByHandle) {
            return null;
        }

        const product = data.data.productByHandle;

        return {
            node: {
                id: product.id,
                handle: product.handle,
                title: product.title,
                priceRange: {
                    minVariantPrice: {
                        amount: product.priceRangeV2.minVariantPrice.amount,
                        currencyCode: product.priceRangeV2.minVariantPrice.currencyCode,
                    },
                },
                images: product.images,
            },
        };
    } catch (error) {
        console.error('Error fetching product by handle:', error);
        return null;
    }
}
