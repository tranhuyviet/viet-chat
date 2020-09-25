import Message from '../../models/messageModel';
import User from '../../models/userModel';

import { AuthenticationError, UserInputError, withFilter } from 'apollo-server';
import { sendMessageValidate } from '../../validate/messageValidate';
import errorParse from '../../utils/errorParse';

export default {
    Query: {
        // GET MESSAGES
        getMessages: async (_, args, { user }) => {
            try {
                let errors = {};

                if (!user) {
                    throw new AuthenticationError('ERROR - UNAUTHENTICATED');
                }

                const { withUser } = args;
                const userIdListOnMessage = [user._id, withUser];

                const messages = await Message.find({
                    from: { $in: userIdListOnMessage },
                    to: { $in: userIdListOnMessage },
                }).sort({ createdAt: 1 });

                // console.log(messages);
                return messages;
            } catch (error) {
                // console.log(error);
                return error;
            }
        },
    },

    Mutation: {
        // SEND MESSAGE
        sendMessage: async (_, args, { user, pubsub }) => {
            try {
                let errors = {};

                if (!user) {
                    throw new AuthenticationError('ERROR - UNAUTHENTICATED');
                }

                // VALIDATE INPUT DATA: to, message
                try {
                    await sendMessageValidate.validate(args, { abortEarly: false });
                } catch (error) {
                    errors = errorParse(error);
                    throw new UserInputError('SEND MESSAGE ERROR - VALIDATE', { errors });
                }

                const { to, message } = args;

                // CHECK USER TO GET MESSAGE
                const userGetMessage = await User.findById(to);
                if (!userGetMessage) {
                    throw new UserInputError('User not found');
                }

                const newMessage = new Message({
                    message,
                    from: user._id,
                    to,
                    createdAt: new Date().toISOString(),
                });

                await newMessage.save().then((message) =>
                    message
                        .populate({
                            path: 'from',
                            select: 'name avatarUrl',
                        })
                        .populate({
                            path: 'to',
                            select: 'name avatarUrl',
                        })
                        .execPopulate()
                );

                pubsub.publish('NEW_MESSAGE', { newMessage: newMessage });

                return newMessage;
            } catch (error) {
                return error;
            }
        },
    },

    Subscription: {
        newMessage: {
            subscribe: withFilter(
                (_, __, { user, pubsub }) => {
                    if (!user) {
                        throw new AuthenticationError('ERROR - UNAUTHENTICATED');
                    }
                    return pubsub.asyncIterator(['NEW_MESSAGE']);
                },

                ({ newMessage }, _, { user }) => {
                    // only send new message to user in 'from' or 'to'
                    if (
                        newMessage.from._id.toString() === user._id.toString() ||
                        newMessage.to._id.toString() === user._id.toString()
                    ) {
                        return true;
                    }
                    return false;
                }
            ),
        },
    },
};
