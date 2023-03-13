#!/bin/bash

export $(egrep -v '^#' .env | xargs)

CONTENTFUL_URL="https://graphql.contentful.com/content/v1/spaces/$VITE_CONTENTFUL_SPACE/environments/$VITE_CONTENTFUL_ENV?access_token=$VITE_CONTENTFUL_TOKEN"
API_URL="http://localhost:5000/api/graphql/"

rm  -f ./src/shared/services/contentful/__generated/types.ts
rm  -f ./src/shared/services/contentful/__generated/hooks.ts

rm  -f ./src/shared/services/graphqlApi/__generated/types.ts
rm  -f ./src/shared/services/graphqlApi/__generated/hooks.ts

./node_modules/.bin/rover graph introspect "$CONTENTFUL_URL" --output graphql/schema/contentful.graphql
./node_modules/.bin/rover graph introspect "$API_URL" --output graphql/schema/api.graphql

function wrap_chunk_module() {
  service_name=$1
  chunk_name=$2
  source_chunk_file="./graphql/schema/${chunk_name}.graphql"
  dest_chunk_file="./graphql/schema/${chunk_name}.graphql.chunk"

  mv "${source_chunk_file}" "${dest_chunk_file}"
  node ./scripts/wrap-graphql-chunk.js "${dest_chunk_file}" "./src/shared/services/${service_name}/${chunk_name}.graphql.chunk.ts"
}

# Merge is only for the IntelliJ
wrap_chunk_module contentful contentful
wrap_chunk_module graphqlApi api
node ./scripts/merge-schemas.js

# remove empty comments as they break IntelliJ schema parsing
sed -i '' 's/""""""//' ./graphql/schema/schema.graphql
