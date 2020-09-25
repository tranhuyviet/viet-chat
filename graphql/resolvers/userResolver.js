import User from '../../models/userModel';
import { signupValidate, loginValidate } from '../../validate/userValidate';
import { UserInputError } from 'apollo-server';
import errorParse from '../../utils/errorParse';
import checkAuth from '../../utils/checkAuth';

export default {
    Query: {
        // LOGIN
        login: async (_, args) => {
            try {
                let errors = {};

                // VALIDATE INPUT DATA: email, password
                try {
                    await loginValidate.validate(args, { abortEarly: false });
                } catch (error) {
                    errors = errorParse(error);
                    throw new UserInputError('LOGIN ERROR - VALIDATE', { errors });
                }

                const { email, password } = args;

                const user = await User.findOne({ email });

                // CHECK EMAIL AND CORRECT PASSWORD
                if (!user || !user.isValidPassword(password)) {
                    errors.global = 'Invalid credentials';
                    throw new UserInputError('LOGIN ERROR - INVALID CREDENTIALS', { errors });
                }

                return user.returnAuthUser();
            } catch (error) {
                return error;
            }
        },

        // GET USERS
        getUsers: async (_, __, context) => {
            try {
                const user = checkAuth(context);
                if (!user) {
                    throw new AuthenticationError('ERROR - UNAUTHENTICATED');
                }

                const users = await User.find({ _id: { $ne: user._id } });

                return users;
            } catch (error) {
                return error;
            }
        },
    },
    Mutation: {
        // SIGNUP
        signup: async (_, args) => {
            try {
                let errors = {};
                // VALIDATE INPUT DATA: name, email, password, confirmPassword
                try {
                    await signupValidate.validate(args, { abortEarly: false });
                } catch (error) {
                    errors = errorParse(error);
                    throw new UserInputError('SIGNUP ERROR - VALIDATE', { errors });
                }

                const { name, email, password } = args;

                // CHECK EMAIL IS EXIST
                const userExist = await User.findOne({ email });

                if (userExist) {
                    errors.email = 'This email is already taken';
                    throw new UserInputError('SIGNUP ERROR - EMAIL EXIST', { errors });
                }
                // CREATE NEW USER
                const user = new User({
                    name,
                    email,
                    createdAt: new Date().toISOString(),
                });

                // HASH PASSWORD
                user.hashPassword(password);
                await user.save();

                // RETURN USER
                return user.returnAuthUser();
            } catch (error) {
                return error;
            }
        },
    },
};
