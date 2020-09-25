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

    type Message {
        _id: ID!
        message: String!
        from: User!
        to: User!
        createdAt: String!
    }

    type Query {
        # USER
        login(email: String!, password: String!): User!
        getUsers: [User!]!

        # MESSAGE
        getMessages(withUser: ID!): [Message]!
    }

    type Mutation {
        # USER
        signup(name: String!, email: String!, password: String!, confirmPassword: String!): User!

        # MESSAGE
        sendMessage(to: ID!, message: String!): Message!
    }

    type Subscription {
        newMessage: Message!
    }
`;
