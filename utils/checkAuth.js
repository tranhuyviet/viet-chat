import jwt from 'jsonwebtoken';
import { PubSub } from 'apollo-server';
const pubsub = new PubSub();

export default (context) => {
    let token;

    // check header auth for req
    if (context.req && context.req.headers.authorization) {
        token = context.req.headers.authorization.split('Bearer ')[1];
        // check header auth for connection (subcription)
    } else if (context.connection && context.connection.context.Authorization) {
        token = context.connection.context.Authorization.split('Bearer ')[1];
    }

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            context.user = decodedToken;
        });
    }

    context.pubsub = pubsub;

    return context;
};

// import { AuthenticationError } from 'apollo-server';

// export default (context) => {
//     const authHeader = context.req.headers.authorization;
//     if (authHeader) {
//         const token = authHeader.split('Bearer ')[1];
//         if (token) {
//             try {
//                 const user = jwt.verify(token, process.env.JWT_SECRET);
//                 return user;
//             } catch (error) {
//                 throw new AuthenticationError('Invalid/Expired token');
//             }
//         }
//         throw new Error(`Authentication token must be 'Bearer [token]'`);
//     }
//     throw new Error(`Authentication header must be provided`);
// };
