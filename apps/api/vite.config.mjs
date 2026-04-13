// import { defineConfig } from 'vitest/config'

// export default defineConfig({
//   plugins: true, // Adicione os parênteses () aqui
//   test: {
//     globals: true,
//   },

//   projects: [
//     {
//       test: {
//         name: 'unit',
//         include: ['src/**/*.spec.ts'],
//         environment: 'node',
//       },
//     },
//     {
//       test: {
//         name: 'e2e',
//         include: ['src/http/routes/**/*.e2e-spec.ts'],
//         environment:
//           './prisma/vitest-environment-prisma/prisma-test-environment.ts',
//       },
//     },
//   ],
// })

import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    // Ativa a resolução nativa de paths do tsconfig
    tsconfigPaths: true,
  },
  test: {
    // Configurações base para todos os projetos
    globals: true,
  },
  projects: [
    {
      test: {
        name: 'unit',
        // Usamos resolve para garantir que o caminho seja absoluto
        include: [resolve(__dirname, 'src/**/*.spec.ts')],
        environment: 'node',
      },
    },
    {
      test: {
        name: 'e2e',
        include: [resolve(__dirname, 'src/http/routes/**/*.e2e-spec.ts')],
        environment:
          './prisma/vitest-environment-prisma/prisma-test-environment.ts',
      },
    },
  ],
})
