export const DEFAULT_ELECTRICITY_PRICE = 3500;
export const DEFAULT_WATER_PRICE = 20000;
export const HIGH_ELECTRICITY_PRICE_THRESHOLD = 10000;
export const HIGH_WATER_PRICE_THRESHOLD = 100000;

export const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString('vi-VN') + ' VNĐ';
};

export const formatUnitPrice = (amount, unit) => {
  return Number(amount || 0).toLocaleString('vi-VN') + ` VNĐ/${unit}`;
};

export const calculateElectricityFixed = (oldNumber, newNumber, unitPrice) => {
  const oldValue = Number(oldNumber) || 0;
  const newValue = Number(newNumber) || 0;
  const price = Number(unitPrice) || 0;

  if (newValue < oldValue) {
    throw new Error('Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ');
  }

  const usage = newValue - oldValue;

  return {
    usage,
    unitPrice: price,
    amount: usage * price,
  };
};

export const calculateWaterByMeter = (oldNumber, newNumber, unitPrice) => {
  const oldValue = Number(oldNumber) || 0;
  const newValue = Number(newNumber) || 0;
  const price = Number(unitPrice) || 0;

  if (newValue < oldValue) {
    throw new Error('Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ');
  }

  const usage = newValue - oldValue;

  return {
    usage,
    unitPrice: price,
    amount: usage * price,
  };
};

export const calculateRoomBill = ({
  rentPrice,
  serviceFee,
  electricityOld,
  electricityNew,
  electricityPrice,
  waterOld,
  waterNew,
  waterPrice,
}) => {
  const electricity = calculateElectricityFixed(
    electricityOld,
    electricityNew,
    electricityPrice
  );

  const water = calculateWaterByMeter(
    waterOld,
    waterNew,
    waterPrice
  );

  const totalAmount =
    Number(rentPrice || 0) +
    Number(serviceFee || 0) +
    electricity.amount +
    water.amount;

  return {
    rentPrice: Number(rentPrice || 0),
    serviceFee: Number(serviceFee || 0),
    electricity,
    water,
    totalAmount,
  };
};

export const buildBillBreakdown = (bill) => {
  if (!bill) return null;

  try {
    return calculateRoomBill({
      rentPrice: bill.room?.rentPrice,
      serviceFee: bill.room?.serviceFee,
      electricityOld: bill.electricityOld,
      electricityNew: bill.electricityNew,
      electricityPrice: bill.electricityPrice,
      waterOld: bill.waterOld,
      waterNew: bill.waterNew,
      waterPrice: bill.waterPrice,
    });
  } catch {
    return null;
  }
};

export const validateBillForm = ({
  roomId,
  month,
  year,
  electricityOld,
  electricityNew,
  waterOld,
  waterNew,
  electricityPrice,
  waterPrice,
}) => {
  const errors = [];

  if (!roomId) {
    errors.push('Vui lòng chọn phòng');
  }
  if (!month) {
    errors.push('Vui lòng chọn tháng');
  }
  if (!year) {
    errors.push('Vui lòng chọn năm');
  }

  const elecOld = Number(electricityOld);
  const elecNew = Number(electricityNew);
  const wOld = Number(waterOld);
  const wNew = Number(waterNew);
  const elecPrice = Number(electricityPrice);
  const wPrice = Number(waterPrice);

  if (Number.isNaN(elecOld) || Number.isNaN(elecNew)) {
    errors.push('Chỉ số điện không hợp lệ');
  } else if (elecNew < elecOld) {
    errors.push('Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số điện cũ');
  }

  if (Number.isNaN(wOld) || Number.isNaN(wNew)) {
    errors.push('Chỉ số nước không hợp lệ');
  } else if (wNew < wOld) {
    errors.push('Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số nước cũ');
  }

  if (Number.isNaN(elecPrice) || elecPrice < 0) {
    errors.push('Đơn giá điện phải lớn hơn hoặc bằng 0');
  }

  if (Number.isNaN(wPrice) || wPrice < 0) {
    errors.push('Đơn giá nước phải lớn hơn hoặc bằng 0');
  }

  return errors;
};

export const getHighPriceWarnings = (electricityPrice, waterPrice) => {
  const warnings = [];
  const elecPrice = Number(electricityPrice);
  const wPrice = Number(waterPrice);

  if (!Number.isNaN(elecPrice) && elecPrice > HIGH_ELECTRICITY_PRICE_THRESHOLD) {
    warnings.push('Đơn giá điện có vẻ quá cao, bạn có chắc muốn dùng mức này không?');
  }

  if (!Number.isNaN(wPrice) && wPrice > HIGH_WATER_PRICE_THRESHOLD) {
    warnings.push('Đơn giá nước có vẻ quá cao, bạn có chắc muốn dùng mức này không?');
  }

  return warnings;
};

export const buildBillPayload = (formData, month, year) => ({
  roomId: Number(formData.roomId),
  month: Number(month),
  year: Number(year),
  electricityOld: Number(formData.electricityOld),
  electricityNew: Number(formData.electricityNew),
  waterOld: Number(formData.waterOld),
  waterNew: Number(formData.waterNew),
  electricityPrice: Number(formData.electricityPrice),
  waterPrice: Number(formData.waterPrice),
});

export const INITIAL_BILL_FORM = {
  roomId: '',
  electricityOld: '',
  electricityNew: '',
  waterOld: '',
  waterNew: '',
  electricityPrice: String(DEFAULT_ELECTRICITY_PRICE),
  waterPrice: String(DEFAULT_WATER_PRICE),
};
