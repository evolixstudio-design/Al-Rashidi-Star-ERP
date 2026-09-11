import { useState, useCallback } from 'react';
import api from '../services/api';

export interface SalesReturnLine {
  id: number;
  invoiceLineId: number;
  productId: number;
  returnDozen: number;
  returnPieces: number;
  returnTotalPcs: number;
  originalUnitPriceKd: number;
  returnLineAmountKd: number;
  displayBreakdown: string;
  product?: {
    id: number;
    nameEn: string;
    articleNumber: string;
  };
}

export interface CustomerRefund {
  id: number;
  refundNumber: string;
  amountKd: number;
  refundMethod: string;
  refundDate: string;
  status: string;
}

export interface SalesReturn {
  id: number;
  returnNumber: string;
  invoiceId: number;
  customerId: number;
  returnDate: string;
  totalReturnAmountKd: number;
  outstandingReductionKd: number;
  refundRequiredKd: number;
  totalReturnPcs: number;
  returnReason: string;
  notes?: string;
  status: string;
  totalReturnPcsBreakdown: { dozen: number; pieces: number; display: string };
  customer?: { id: number; name: string };
  invoice?: { id: number; invoiceNumber: string };
  lines: SalesReturnLine[];
  refunds: CustomerRefund[];
}

export const useSalesReturns = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReturns = useCallback(async (): Promise<SalesReturn[]> => {
    setLoading(true);
    try {
      const res = await api.get('/sales-returns');
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sales returns');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByInvoice = useCallback(async (invoiceId: number): Promise<SalesReturn[]> => {
    setLoading(true);
    try {
      const res = await api.get(`/sales-returns/invoice/${invoiceId}`);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch invoice returns');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReturn = async (payload: any) => {
    setLoading(true);
    try {
      const res = await api.post('/sales-returns', payload);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create sales return');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (returnId: number, payload: any) => {
    setLoading(true);
    try {
      const res = await api.post(`/sales-returns/${returnId}/refund`, payload);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process refund');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelReturn = async (returnId: number) => {
    setLoading(true);
    try {
      const res = await api.post(`/sales-returns/${returnId}/cancel`);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel sales return');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelRefund = async (refundId: number) => {
    setLoading(true);
    try {
      const res = await api.post(`/sales-returns/refunds/${refundId}/cancel`);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel refund');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchReturns,
    fetchByInvoice,
    createReturn,
    processRefund,
    cancelReturn,
    cancelRefund,
  };
};
