export type DocumentType = "passport" | "national_id" | "drivers_license";

export type PepStatus = "" | "no" | "yes";

export type LivenessMethod = "webcam" | "phone" | null;

export type FlowStage =
  | "account"
  | "sign-in"
  | "verify-email"
  | "kyc-intro"
  | "kyc"
  | "pending"
  | "saved";

export interface UploadedDoc {
  id: string;
  name: string;
  info: string;
  previewUrl?: string;
}

export interface SignupData {
  // Phase 1: Account Creation
  fullName: string;
  email: string;
  password: string;
  otp: string;

  // Phase 2 Step 1: Personal Details & Residential Address
  firstName: string;
  lastName: string;
  dob: string; // DD/MM/YYYY
  nationality: string;
  phoneNumber: string;
  addressLine: string;
  addressLine2: string;
  city: string;
  zipCode: string;
  countryOfResidence: string;

  // Phase 2 Step 2: Identity Document
  issuingCountry: string;
  documentType: DocumentType;
  uploadedDocs: UploadedDoc[];

  // Phase 2 Step 3: Liveness Check
  selfieVerified: boolean;
  livenessMethod: LivenessMethod;

  // Phase 2 Step 4: Regulatory & Financial Profile
  employmentStatus: string;
  sourceOfFunds: string[];
  pepStatus: PepStatus;
  pepDetails: string;
}

export type ErrorKey =
  | "fullName"
  | "email"
  | "password"
  | "otp"
  | "firstName"
  | "lastName"
  | "dob"
  | "nationality"
  | "phoneNumber"
  | "addressLine"
  | "city"
  | "zipCode"
  | "countryOfResidence"
  | "issuingCountry"
  | "uploadedDocs"
  | "selfieVerified"
  | "employmentStatus"
  | "sourceOfFunds"
  | "pepStatus";

export type Errors = Partial<Record<ErrorKey, string>>;

export const initialData: SignupData = {
  fullName: "",
  email: "",
  password: "",
  otp: "",

  firstName: "",
  lastName: "",
  dob: "",
  nationality: "United States of America",
  phoneNumber: "",
  addressLine: "",
  addressLine2: "",
  city: "",
  zipCode: "",
  countryOfResidence: "United States of America",

  issuingCountry: "United States of America",
  documentType: "passport",
  uploadedDocs: [],

  selfieVerified: false,
  livenessMethod: null,

  employmentStatus: "",
  sourceOfFunds: [],
  pepStatus: "",
  pepDetails: "",
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const passwordRules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Upper & lowercase", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "1 number", test: (p: string) => /\d/.test(p) },
  { label: "1 symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function passwordScore(password: string) {
  if (!password) return 0;
  const met = passwordRules.filter((rule) => rule.test(password)).length;
  return passwordRules[0].test(password) ? met : Math.min(met, 1);
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/** Auto-formats numeric input into DD/MM/YYYY as the user types. */
export function formatDobInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function validateDobString(dobStr: string): string | null {
  const match = dobStr.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return "Enter your date of birth in DD/MM/YYYY format.";
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
    return "Enter a valid calendar date.";
  }

  const dob = new Date(year, month - 1, day);
  if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
    return "Enter a real calendar date.";
  }

  const today = new Date();
  if (dob > today) {
    return "Date of birth cannot be in the future.";
  }

  let age = today.getFullYear() - year;
  const m = today.getMonth() - (month - 1);
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }

  if (age < 18) {
    return "You must be at least 18 years old to verify an account.";
  }
  if (age > 120) {
    return "Check the birth year and try again.";
  }
  return null;
}

export function validateAccountStep(data: SignupData): Errors {
  const errors: Errors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Enter your full name.";
  }

  if (!data.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Enter a valid email address (e.g. you@company.com).";
  }

  if (!data.password) {
    errors.password = "Create a strong password.";
  } else if (passwordScore(data.password) < 3) {
    errors.password = "Use 8+ characters with a mix of letters, numbers, or symbols.";
  }

  return errors;
}

export function validateOtpStep(otp: string): Errors {
  const cleaned = otp.replace(/\D/g, "");
  if (cleaned.length < 6) {
    return { otp: "Enter the full 6-digit verification code." };
  }
  if (cleaned === "000000") {
    return { otp: "That code is invalid or expired. Try another 6-digit code." };
  }
  return {};
}

export function requiredDocCount(type: DocumentType): number {
  return type === "passport" ? 1 : 2;
}

export function validateKycStep(kycStep: number, data: SignupData): Errors {
  const errors: Errors = {};

  // Step 1 of 5: Personal Details & Residential Address
  if (kycStep === 0) {
    if (!data.firstName.trim()) errors.firstName = "Enter your legal first name.";
    if (!data.lastName.trim()) errors.lastName = "Enter your legal last name.";

    const dobErr = validateDobString(data.dob);
    if (dobErr) errors.dob = dobErr;

    if (!data.nationality) errors.nationality = "Select your nationality.";

    const digits = data.phoneNumber.replace(/\D/g, "");
    if (!digits) errors.phoneNumber = "Enter your phone number.";
    else if (digits.length < 7 || digits.length > 15) errors.phoneNumber = "Enter a valid phone number.";

    if (!data.addressLine.trim()) errors.addressLine = "Enter your street address.";
    if (!data.city.trim()) errors.city = "Select your city.";
    if (!data.zipCode.trim()) errors.zipCode = "Enter your postal or ZIP code.";
    if (!data.countryOfResidence) errors.countryOfResidence = "Select your country of residence.";
  }

  // Step 2 of 5: Identity Document
  if (kycStep === 1) {
    if (!data.issuingCountry) errors.issuingCountry = "Select the issuing country.";
    const needed = requiredDocCount(data.documentType);
    if (data.uploadedDocs.length < needed) {
      errors.uploadedDocs =
        needed === 1
          ? "Upload the photo page of your passport."
          : `Upload both the front and back of your ${formatDocType(data.documentType).toLowerCase()} (${data.uploadedDocs.length}/2 added).`;
    }
  }

  // Step 3 of 5: Liveness Check
  if (kycStep === 2) {
    if (!data.selfieVerified) {
      errors.selfieVerified = "Complete the liveness check or verify on your phone to continue.";
    }
  }

  // Step 4 of 5: Regulatory & Financial Profile
  if (kycStep === 3) {
    if (!data.employmentStatus) errors.employmentStatus = "Select your employment status.";
    if (data.sourceOfFunds.length === 0) errors.sourceOfFunds = "Select at least one source of funds.";
    if (!data.pepStatus) errors.pepStatus = "Please confirm your PEP status.";
  }

  return errors;
}

export function formatDocType(type: DocumentType): string {
  if (type === "passport") return "Passport";
  if (type === "national_id") return "National ID Card";
  return "Driver’s License";
}
