/**
 * POST /api/bills và PUT /api/bills/:id/status trả:
 * { success, message, data: bill }
 * Không dùng response.data trực tiếp làm bill.
 */
export const getBillFromApiResponse = (response) => response?.data?.data ?? null;

export const getBillApiErrorMessage = (error, fallback = 'Có lỗi khi xử lý hóa đơn') =>
  error?.response?.data?.message || error?.message || fallback;
