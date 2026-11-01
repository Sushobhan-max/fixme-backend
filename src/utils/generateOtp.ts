import crypto from 'crypto';

const generateOtp = () => {
    return crypto.randomInt(0, 10000).toString().padStart(4, '0'); 
}   

export default generateOtp;
