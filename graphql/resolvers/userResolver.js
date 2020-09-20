import User from '../../models/userModel';
import { signupValidate } from '../../validate/userValidate';
import { UserInputError } from 'apollo-server';
import errorParse from '../../utils/errorParse';

export default {
    Mutation: {
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
