import swaggerJsdoc from 'swagger-jsdoc';

const spec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Banking Ledger API',
            version: '1.0.0',
            description: 'Accounts, transactions and auth API for the banking ledger service',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/docs/*.ts'],
});

export default spec;
