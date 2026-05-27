export const DEFAULT_ELECTRICITY_PRICE = 3500;
export const DEFAULT_WATER_PRICE = 20000;
export const DEFAULT_WATER_PER_PERSON_PRICE = 100000;
export const HIGH_ELECTRICITY_PRICE_THRESHOLD = 10000;
export const HIGH_WATER_PRICE_THRESHOLD = 100000;

export const WATER_BILLING_METER = 'METER';
export const WATER_BILLING_PER_PERSON = 'PER_PERSON';

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
    billingType: WATER_BILLING_METER,
    usage,
    unitPrice: price,
    amount: usage * price,
  };
};

export const calculateWaterByPerson = (peopleCount, pricePerPerson) => {
  const count = Math.max(1, Number(peopleCount) || 1);
  const price = Number(pricePerPerson) || 0;

  return {
    billingType: WATER_BILLING_PER_PERSON,
    peopleCount: count,
    unitPrice: price,
    usage: count,
    amount: count * price,
  };
};

export const calculateRoomBill = ({
  rentPrice,
  serviceFee,
  electricityOld,
  electricityNew,
  electricityPrice,
  waterBillingType = WATER_BILLING_METER,
  waterOld,
  waterNew,
  waterPrice,
  waterPeopleCount,
}) => {
  const electricity = calculateElectricityFixed(
    electricityOld,
    electricityNew,
    electricityPrice
  );

  const water =
    waterBillingType === WATER_BILLING_PER_PERSON
      ? calculateWaterByPerson(waterPeopleCount, waterPrice)
      : calculateWaterByMeter(waterOld, waterNew, waterPrice);

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
    waterBillingType,
    totalAmount,
  };
};

export const buildBillBreakdown = (bill) => {
  if (!bill) return null;

  const rentPrice = Number(bill.room?.rentPrice ?? bill.rentPrice ?? 0);
  const serviceFee = Number(bill.room?.serviceFee ?? bill.serviceFee ?? 0);
  const waterBillingType = bill.waterBillingType || WATER_BILLING_METER;

  try {
    const electricity = calculateElectricityFixed(
      bill.electricityOld,
      bill.electricityNew,
      bill.electricityPrice
    );

    let water;
    if (waterBillingType === WATER_BILLING_PER_PERSON) {
      const backendWaterAmount = Number(bill.waterAmount);
      const peopleCount = Math.max(1, Number(bill.waterPeopleCount) || 1);
      const unitPrice = Number(bill.waterPrice) || 0;
      water = {
        billingType: WATER_BILLING_PER_PERSON,
        peopleCount,
        unitPrice,
        usage: peopleCount,
        amount:
          backendWaterAmount > 0
            ? backendWaterAmount
            : calculateWaterByPerson(peopleCount, unitPrice).amount,
      };
    } else {
      const backendWaterAmount = Number(bill.waterAmount);
      const usageFromBill =
        bill.waterUsage != null && bill.waterUsage !== ''
          ? Number(bill.waterUsage)
          : null;

      if (usageFromBill != null && !Number.isNaN(usageFromBill)) {
        const unitPrice = Number(bill.waterPrice) || 0;
        water = {
          billingType: WATER_BILLING_METER,
          usage: usageFromBill,
          unitPrice,
          amount: backendWaterAmount > 0 ? backendWaterAmount : usageFromBill * unitPrice,
        };
      } else {
        water = calculateWaterByMeter(bill.waterOld, bill.waterNew, bill.waterPrice);
        if (backendWaterAmount > 0) {
          water.amount = backendWaterAmount;
        }
      }
    }

    const electricityAmount =
      Number(bill.electricityAmount) > 0
        ? Number(bill.electricityAmount)
        : electricity.amount;

    return {
      rentPrice,
      serviceFee,
      electricity: { ...electricity, amount: electricityAmount },
      water,
      waterBillingType,
      totalAmount:
        rentPrice + serviceFee + electricityAmount + water.amount,
    };
  } catch {
    const backendTotal = Number(bill.totalAmount);
    if (backendTotal > 0) {
      return {
        rentPrice,
        serviceFee,
        electricity: {
          usage: Math.max(0, Number(bill.electricityNew) - Number(bill.electricityOld)),
          unitPrice: Number(bill.electricityPrice) || 0,
          amount: Number(bill.electricityAmount) || 0,
        },
        water: {
          billingType: waterBillingType,
          usage: bill.waterUsage ?? 0,
          peopleCount: bill.waterPeopleCount ?? 1,
          unitPrice: Number(bill.waterPrice) || 0,
          amount: Number(bill.waterAmount) || 0,
        },
        waterBillingType,
        totalAmount: backendTotal,
      };
    }
    return null;
  }
};

export const validateBillForm = ({
  roomId,
  month,
  year,
  electricityOld,
  electricityNew,
  waterBillingType = WATER_BILLING_METER,
  waterOld,
  waterNew,
  waterPeopleCount,
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
  const elecPrice = Number(electricityPrice);
  const wPrice = Number(waterPrice);

  if (Number.isNaN(elecOld) || Number.isNaN(elecNew)) {
    errors.push('Chỉ số điện không hợp lệ');
  } else if (elecNew < elecOld) {
    errors.push('Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số điện cũ');
  }

  if (waterBillingType === WATER_BILLING_PER_PERSON) {
    const people = Number(waterPeopleCount);
    if (Number.isNaN(people) || people < 1) {
      errors.push('Số người tính nước phải từ 1 trở lên');
    }
  } else {
    const wOld = Number(waterOld);
    const wNew = Number(waterNew);
    if (Number.isNaN(wOld) || Number.isNaN(wNew)) {
      errors.push('Chỉ số nước không hợp lệ');
    } else if (wNew < wOld) {
      errors.push('Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số nước cũ');
    }
  }

  if (Number.isNaN(elecPrice) || elecPrice < 0) {
    errors.push('Đơn giá điện phải lớn hơn hoặc bằng 0');
  }

  if (Number.isNaN(wPrice) || wPrice < 0) {
    errors.push('Đơn giá nước phải lớn hơn hoặc bằng 0');
  }

  return errors;
};

export const getHighPriceWarnings = (electricityPrice, waterPrice, waterBillingType) => {
  const warnings = [];
  const elecPrice = Number(electricityPrice);
  const wPrice = Number(waterPrice);

  if (!Number.isNaN(elecPrice) && elecPrice > HIGH_ELECTRICITY_PRICE_THRESHOLD) {
    warnings.push('Đơn giá điện có vẻ quá cao, bạn có chắc muốn dùng mức này không?');
  }

  const waterThreshold =
    waterBillingType === WATER_BILLING_PER_PERSON
      ? HIGH_WATER_PRICE_THRESHOLD
      : HIGH_WATER_PRICE_THRESHOLD;

  if (!Number.isNaN(wPrice) && wPrice > waterThreshold) {
    warnings.push('Đơn giá nước có vẻ quá cao, bạn có chắc muốn dùng mức này không?');
  }

  return warnings;
};

export const buildBillPayload = (formData, month, year) => {
  const base = {
    roomId: Number(formData.roomId),
    month: Number(month),
    year: Number(year),
    electricityOld: Number(formData.electricityOld),
    electricityNew: Number(formData.electricityNew),
    electricityPrice: Number(formData.electricityPrice),
    waterBillingType: formData.waterBillingType || WATER_BILLING_METER,
    waterPrice: Number(formData.waterPrice),
  };

  if (base.waterBillingType === WATER_BILLING_PER_PERSON) {
    return {
      ...base,
      waterPeopleCount: Math.max(1, Number(formData.waterPeopleCount) || 1),
    };
  }

  return {
    ...base,
    waterOld: Number(formData.waterOld),
    waterNew: Number(formData.waterNew),
  };
};

export const INITIAL_BILL_FORM = {
  roomId: '',
  electricityOld: '',
  electricityNew: '',
  waterOld: '',
  waterNew: '',
  electricityPrice: String(DEFAULT_ELECTRICITY_PRICE),
  waterPrice: String(DEFAULT_WATER_PRICE),
  waterBillingType: WATER_BILLING_METER,
  waterPeopleCount: '1',
};
