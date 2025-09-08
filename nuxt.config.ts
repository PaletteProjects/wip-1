export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
    devtools: {
        enabled: true,
    },
    typescript: {
        tsConfig: {
            compilerOptions: {
                noImplicitAny: false,
                lib: ["es2023"],
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                noUncheckedIndexedAccess: false,
            },
            exclude: ["**/__test__/**"]
        }
    },

    alias: {
        "@ast/*": "../app/utils/ast/*"
    },

  modules: ['@nuxt/image'],
})
