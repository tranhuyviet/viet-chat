import * as Yup from 'yup';

const to = Yup.string().length(24, 'User Id is not correct').required('User Id cannot be empty');
const message = Yup.string().required('Message cannot be empty');

export const sendMessageValidate = Yup.object({
    to,
    message,
});
