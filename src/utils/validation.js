export const PHONE_REGEX = /^0\d{9}$/;

export const PHONE_ERROR =
  'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số và bắt đầu bằng 0.';

export const validatePhone = (phone) => PHONE_REGEX.test(String(phone || '').replace(/\D/g, ''));

export const sanitizePhoneInput = (value) => value.replace(/\D/g, '').slice(0, 10);
