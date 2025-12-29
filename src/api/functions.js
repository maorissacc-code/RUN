import { base44 } from './base44Client';


export const listWaiters = base44.functions.listWaiters;

export const sendVerificationCode = base44.functions.sendVerificationCode;

export const verifyPhoneCode = base44.functions.verifyPhoneCode;

export const verifyAndLogin = base44.functions.verifyAndLogin;

export const phoneLogin = base44.functions.phoneLogin;

export const validateSession = base44.functions.validateSession;

export const updateUserProfile = base44.functions.updateUserProfile;

export const createCardcomPayment = base44.functions.createCardcomPayment;

export const cardcomWebhook = base44.functions.cardcomWebhook;

export const updateJobRequestStatus = base44.functions.updateJobRequestStatus;

export const cleanupExpiredRequests = base44.functions.cleanupExpiredRequests;

export const loginWithPassword = base44.functions.loginWithPassword;

export const requestPasswordReset = base44.functions.requestPasswordReset;

export const resetPassword = base44.functions.resetPassword;

