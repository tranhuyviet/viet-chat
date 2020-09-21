import Message from '../../models/messageModel';
import User from '../../models/userModel';
import checkAuth from '../../utils/checkAuth';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { sendMessageValidate } from '../../validate/messageValidate';
import errorParse from '../../utils/errorParse';

export default {
    Mutation: {
        sendMessage: async (_, args, context) => {
            try {
                let errors = {};
                const user = checkAuth(context);
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

                // console.log(newMessage);
                return newMessage;
            } catch (error) {
                return error;
            }
        },
    },
};
