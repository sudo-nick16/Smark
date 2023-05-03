import { type CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    schema: 'http://localhost:42069/graphql',
    documents: ["./src/graphql/gql/*.graphql"],
    emitLegacyCommonJSImports: false,
    generates: {
        './src/graphql/generated.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-urql',
            ],
            config: {
                withComponent: false,
                withHooks: true,
                withHOC: false,
            }
        }
    },
}
export default config;
