import { gql } from 'apollo-server';
export default gql`
    type User {
        _id: ID!
        name: String!
        email: String!
        avatarUrl: String
        createdAt: String!
        token: String!
    }

    type Query {
        users: [User]!
    }

    type Mutation {
        # USER
        signup(name: String!, email: String!, password: String!, confirmPassword: String!): User!
    }
`;
