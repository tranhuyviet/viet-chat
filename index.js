import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
});

(async () => {
    const port = process.env.PORT || 4000;
    try {
        // DB SERVER
        await mongoose.connect(process.env.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
        console.log('► Database connect successfully');
        // SERVER
        const serverRes = await server.listen({ port });
        console.log(`► Server running at ${serverRes.url}`);
    } catch (error) {
        console.log(error);
    }
})();
