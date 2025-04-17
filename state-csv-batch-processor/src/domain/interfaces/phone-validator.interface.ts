export interface IPhoneValidator {
  isValid(phone: string): boolean;
  getDDD(phone: string): string;
}